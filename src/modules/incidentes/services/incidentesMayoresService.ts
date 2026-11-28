import { query, queryRow, transaccion } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { sqlEnAtencion } from "@/shared/lib/sla-sql";
import {
  ESTADOS_INCIDENTE_MAYOR,
  SEVERIDADES_INCIDENTE_MAYOR,
  TRANSICIONES_INCIDENTE_MAYOR,
  sqlMayorActivo,
  type EstadoIncidenteMayor,
} from "@/shared/lib/incidente-mayor";

/**
 * Incidentes mayores: único servicio para la bandeja, la declaración y la sala
 * de crisis (módulo `incidentes`). Un incidente mayor puede vincular el ticket
 * de incidente que lo originó y el problema que investiga su causa.
 */

export interface Comunicado {
  texto: string;
  fecha: string | null;
  usuario: string | null;
}

interface SesionMayor {
  id_usuario: number;
}

/** Los comunicados antiguos se guardaron como texto plano: se presentan con el mismo formato. */
function normalizarComunicados(valor: unknown, fechaPorDefecto: string | null): Comunicado[] {
  if (!Array.isArray(valor)) return [];
  return valor
    .map((c: any) =>
      typeof c === "string"
        ? { texto: c, fecha: fechaPorDefecto, usuario: null }
        : {
            texto: String(c?.texto ?? ""),
            fecha: c?.fecha ?? fechaPorDefecto,
            usuario: typeof c?.usuario === "string" ? c.usuario : null,
          }
    )
    .filter((c) => c.texto.trim().length > 0);
}

export async function listarIncidentesMayores() {
  const filas = await query<any>(
    `SELECT im.id_incidente_mayor, im.codigo, im.titulo, im.descripcion, im.severidad,
            im.estado, im.sala_virtual, im.comunicados, COALESCE(im.involucrados, '[]'::jsonb) AS involucrados,
            im.fecha_declaracion, im.fecha_cierre,
            im.id_ticket, t.codigo_ticket, t.titulo AS ticket_titulo,
            im.id_problema, p.codigo_problema, p.titulo AS problema_titulo,
            im.id_departamento, d.nombre AS departamento_nombre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS declarado_por
     FROM incidente_mayor im
     LEFT JOIN ticket t ON t.id_ticket = im.id_ticket
     LEFT JOIN problema p ON p.id_problema = im.id_problema
     LEFT JOIN departamento_ti d ON d.id_departamento = im.id_departamento
     LEFT JOIN usuario u ON u.id_usuario = im.id_usuario_declara
     WHERE im.estado_registro = true
     ORDER BY ${sqlMayorActivo("im")} DESC, im.fecha_declaracion DESC`
  );

  // Tickets vinculados: el de origen y los incidentes asociados al problema.
  const idsProblema = filas.map((f) => f.id_problema).filter((x): x is number => typeof x === "number");
  const porProblema: Record<number, any[]> = {};
  if (idsProblema.length > 0) {
    const vinculados = await query<any>(
      `SELECT pi.id_problema, t.id_ticket, t.codigo_ticket, t.titulo, t.fecha_creacion
       FROM problema_incidente pi
       JOIN ticket t ON t.id_ticket = pi.id_ticket AND t.estado_registro = true
       WHERE pi.id_problema = ANY($1::int[])
       ORDER BY t.fecha_creacion DESC`,
      [idsProblema]
    );
    for (const v of vinculados) (porProblema[v.id_problema] ??= []).push(v);
  }

  return filas.map((f) => {
    const tickets: any[] = [];
    if (f.id_ticket) tickets.push({ id_ticket: f.id_ticket, codigo_ticket: f.codigo_ticket, titulo: f.ticket_titulo, origen: true });
    for (const t of f.id_problema ? porProblema[f.id_problema] ?? [] : []) {
      if (t.id_ticket !== f.id_ticket) tickets.push({ ...t, origen: false });
    }
    return { ...f, comunicados: normalizarComunicados(f.comunicados, f.fecha_declaracion), tickets };
  });
}

export async function listarInvolucradosDisponibles() {
  const usuarios = await query<{
    id_usuario: number;
    nombre: string;
    correo: string;
    id_perfil: number;
    perfil_nombre: string;
    departamento_nombre: string | null;
  }>(`
    SELECT u.id_usuario,
           CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre,
           u.correo_electronico AS correo,
           p.id_perfil,
           p.nombre AS perfil_nombre,
           d.nombre AS departamento_nombre
    FROM usuario u
    INNER JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
    INNER JOIN perfiles p ON p.id_perfil = up.id_perfil
    LEFT JOIN departamento_ti d ON d.id_departamento = u.id_departamento
    WHERE u.estado_registro = true
    ORDER BY p.id_perfil, u.nombres
  `);

  const tecnicos: any[] = [];
  const gestoresArea: any[] = [];
  const gestoresModulo: any[] = [];
  const otros: any[] = [];
  const vistos = new Set<number>();

  for (const u of usuarios) {
    if (vistos.has(u.id_usuario)) continue;
    vistos.add(u.id_usuario);

    const item = {
      id_usuario: u.id_usuario,
      nombre: u.nombre,
      correo: u.correo,
      cargo: u.perfil_nombre,
      departamento: u.departamento_nombre || "General",
    };

    if (u.id_perfil === 2) {
      tecnicos.push({ ...item, tipo: "tecnico" });
    } else if (u.id_perfil === 5) {
      gestoresArea.push({ ...item, tipo: "gestor_area" });
    } else if ([8, 9, 10].includes(u.id_perfil)) {
      gestoresModulo.push({ ...item, tipo: "gestor_modulo" });
    } else {
      otros.push({ ...item, tipo: "otro" });
    }
  }

  return { tecnicos, gestoresArea, gestoresModulo, otros };
}

/** Incidentes en atención y problemas abiertos que se pueden vincular al declarar. */
export async function listarVinculosDisponibles() {
  const [incidentes, problemas] = await Promise.all([
    query<any>(
      `SELECT t.id_ticket, t.codigo_ticket, t.titulo, t.id_departamento, pt.codigo AS prioridad
       FROM ticket t
       JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket AND tt.codigo = 'INCIDENTE'
       LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = t.id_prioridad
       WHERE t.estado_registro = true AND ${sqlEnAtencion("t")}
       ORDER BY pt.nivel ASC NULLS LAST, t.fecha_creacion DESC
       LIMIT 200`
    ),
    query<any>(
      `SELECT p.id_problema, p.codigo_problema, p.titulo
       FROM problema p
       WHERE p.estado_registro = true AND p.id_estado NOT IN (5, 6)
       ORDER BY p.fecha_creacion DESC
       LIMIT 200`
    ),
  ]);
  return { incidentes, problemas };
}

async function validarTicketOrigen(idTicket: number) {
  const ticket = await queryRow<{ id_departamento: number | null; es_incidente: boolean; en_atencion: boolean }>(
    `SELECT t.id_departamento, (tt.codigo = 'INCIDENTE') AS es_incidente, ${sqlEnAtencion("t")} AS en_atencion
     FROM ticket t JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
     WHERE t.id_ticket = $1 AND t.estado_registro = true`,
    [idTicket]
  );
  if (!ticket) throw new ErrorDominio("El ticket de origen no existe.", 404);
  if (!ticket.es_incidente) throw new ErrorDominio("El ticket de origen debe ser un incidente.");
  if (!ticket.en_atencion) throw new ErrorDominio("El incidente de origen ya está resuelto, cerrado o cancelado.");
  return ticket;
}

async function validarProblema(idProblema: number) {
  const problema = await queryRow<{ id_problema: number }>(
    `SELECT id_problema FROM problema WHERE id_problema = $1 AND estado_registro = true`,
    [idProblema]
  );
  if (!problema) throw new ErrorDominio("El problema vinculado no existe.", 404);
}

function idOpcional(valor: unknown, campo: string): number | null {
  if (valor === undefined || valor === null || valor === "") return null;
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new ErrorDominio(`El ${campo} no es válido.`);
  return n;
}

async function nombreUsuario(idUsuario: number): Promise<string | null> {
  const fila = await queryRow<{ nombre: string }>(
    `SELECT TRIM(CONCAT(nombres, ' ', apellido_paterno)) AS nombre FROM usuario WHERE id_usuario = $1`,
    [idUsuario]
  );
  return fila?.nombre || null;
}

export async function declararIncidenteMayor(sesion: SesionMayor, body: any) {
  const titulo = String(body?.titulo || "").trim();
  if (titulo.length < 5) throw new ErrorDominio("El título del incidente mayor debe tener al menos 5 caracteres.");
  const severidad = String(body?.severidad || "P1").toUpperCase();
  if (!(SEVERIDADES_INCIDENTE_MAYOR as readonly string[]).includes(severidad)) {
    throw new ErrorDominio("La severidad debe ser P1 o P2.");
  }

  const idTicket = idOpcional(body?.id_ticket, "ticket de origen");
  const idProblema = idOpcional(body?.id_problema, "problema vinculado");
  let idDepartamento = idOpcional(body?.id_departamento, "grupo resolutor");

  if (idTicket) {
    const ticket = await validarTicketOrigen(idTicket);
    idDepartamento = idDepartamento ?? ticket.id_departamento;
    const yaDeclarado = await queryRow<{ codigo: string }>(
      `SELECT codigo FROM incidente_mayor im
       WHERE im.id_ticket = $1 AND im.estado_registro = true AND ${sqlMayorActivo("im")}`,
      [idTicket]
    );
    if (yaDeclarado) {
      throw new ErrorDominio(`Este incidente ya forma parte del incidente mayor ${yaDeclarado.codigo}.`, 409);
    }
  }
  if (idProblema) await validarProblema(idProblema);

  const involucrados = JSON.stringify(Array.isArray(body?.involucrados) ? body.involucrados : []);
  const descripcion = body?.descripcion ? String(body.descripcion).trim() : null;
  const salaVirtual = body?.sala_virtual ? String(body.sala_virtual).trim() : null;

  const fila = await transaccion(async (cli) => {
    // Correlativo por año (IM-AAAA-NNNN) con bloqueo para evitar códigos repetidos.
    await cli.query(`SELECT pg_advisory_xact_lock(hashtext('incidente_mayor:codigo'))`);
    const anio = new Date().getFullYear();
    const sig = await cli.query(
      `SELECT COALESCE(MAX(SUBSTRING(codigo FROM '^IM-[0-9]{4}-([0-9]+)$')::int), 0) + 1 AS n
       FROM incidente_mayor WHERE codigo LIKE $1`,
      [`IM-${anio}-%`]
    );
    const codigo = `IM-${anio}-${String(sig.rows[0].n).padStart(4, "0")}`;

    const res = await cli.query(
      `INSERT INTO incidente_mayor
         (codigo, titulo, descripcion, severidad, estado, id_ticket, id_problema, id_departamento,
          sala_virtual, id_usuario_declara, involucrados)
       VALUES ($1, $2, $3, $4, 'ABIERTO', $5, $6, $7, $8, $9, $10::jsonb)
       RETURNING id_incidente_mayor, codigo, titulo, severidad, estado, fecha_declaracion`,
      [codigo, titulo, descripcion, severidad, idTicket, idProblema, idDepartamento, salaVirtual, sesion.id_usuario, involucrados]
    );

    if (idTicket) {
      await cli.query(
        `INSERT INTO ticket_incidente (id_ticket, es_incidente_mayor) VALUES ($1, true)
         ON CONFLICT (id_ticket) DO UPDATE SET es_incidente_mayor = true`,
        [idTicket]
      );
      await cli.query(
        `INSERT INTO comentario_ticket (id_ticket, id_usuario, comentario, es_interno)
         VALUES ($1, $2, $3, false)`,
        [idTicket, sesion.id_usuario, `Se declaró el incidente mayor ${codigo} (${severidad}) a partir de este incidente.`]
      );
    }
    return res.rows[0];
  });

  return { mensaje: "Incidente mayor declarado exitosamente.", incidente: fila };
}

export async function actualizarIncidenteMayor(sesion: SesionMayor, idIncidente: number, body: any) {
  const actual = await queryRow<{ estado: EstadoIncidenteMayor; codigo: string }>(
    `SELECT estado, codigo FROM incidente_mayor WHERE id_incidente_mayor = $1 AND estado_registro = true`,
    [idIncidente]
  );
  if (!actual) throw new ErrorDominio("El incidente mayor no existe.", 404);
  if (actual.estado === "CERRADO") {
    throw new ErrorDominio(`El incidente mayor ${actual.codigo} ya está cerrado y no se puede modificar.`, 409);
  }

  let estado: EstadoIncidenteMayor | null = null;
  if (body?.estado !== undefined && body?.estado !== null && body?.estado !== "") {
    const destino = String(body.estado).toUpperCase() as EstadoIncidenteMayor;
    if (!(ESTADOS_INCIDENTE_MAYOR as readonly string[]).includes(destino)) {
      throw new ErrorDominio("Estado de incidente mayor no válido.");
    }
    if (destino !== actual.estado) {
      if (!TRANSICIONES_INCIDENTE_MAYOR[actual.estado].includes(destino)) {
        throw new ErrorDominio(`No se puede pasar de ${actual.estado} a ${destino}.`, 409);
      }
      estado = destino;
    }
  }

  const texto = body?.comunicado ? String(body.comunicado).trim() : "";
  if (texto.length > 2000) throw new ErrorDominio("El comunicado no puede superar los 2000 caracteres.");
  const comunicado = texto
    ? JSON.stringify([{ texto, fecha: new Date().toISOString(), usuario: await nombreUsuario(sesion.id_usuario) }])
    : null;

  let idProblema: number | null = null;
  if (body?.id_problema !== undefined) {
    idProblema = idOpcional(body.id_problema, "problema vinculado");
    if (idProblema) await validarProblema(idProblema);
  }

  const involucrados = Array.isArray(body?.involucrados) ? JSON.stringify(body.involucrados) : null;

  const fila = await queryRow<any>(
    `UPDATE incidente_mayor
     SET estado = COALESCE($2, estado),
         descripcion = COALESCE($3, descripcion),
         sala_virtual = COALESCE($4, sala_virtual),
         involucrados = COALESCE($5::jsonb, involucrados),
         comunicados = CASE WHEN $6::jsonb IS NULL THEN comunicados
                            ELSE COALESCE(comunicados, '[]'::jsonb) || $6::jsonb END,
         id_problema = CASE WHEN $8 THEN $9 ELSE id_problema END,
         id_usuario_cierra = CASE WHEN $2 = 'CERRADO' THEN $7 ELSE id_usuario_cierra END,
         fecha_cierre = CASE WHEN $2 = 'CERRADO' THEN now() ELSE fecha_cierre END
     WHERE id_incidente_mayor = $1 AND estado_registro = true AND estado <> 'CERRADO'
     RETURNING id_incidente_mayor, codigo, estado`,
    [
      idIncidente,
      estado,
      body?.descripcion ? String(body.descripcion).trim() : null,
      body?.sala_virtual ? String(body.sala_virtual).trim() : null,
      involucrados,
      comunicado,
      sesion.id_usuario,
      body?.id_problema !== undefined,
      idProblema,
    ]
  );
  if (!fila) throw new ErrorDominio("El incidente mayor ya fue cerrado por otro usuario.", 409);
  return { mensaje: "Incidente mayor actualizado.", incidente: fila };
}
