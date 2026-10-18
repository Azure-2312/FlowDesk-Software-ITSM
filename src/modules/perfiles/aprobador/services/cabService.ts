import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/** CAB: agenda y actas del comité, y comité de emergencia (ECAB). */

export async function listarReuniones() {
  return query(
    `SELECT r.id_reunion, r.titulo, r.fecha_reunion, r.tipo, r.estado, r.agenda, r.acta, r.fecha_creacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS convocante_nombre
     FROM cab_reunion r
     LEFT JOIN usuario u ON u.id_usuario = r.id_convocante
     WHERE r.estado_registro = true
     ORDER BY r.fecha_reunion DESC`
  );
}

export async function listarCambiosParaAgenda() {
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.ventana_inicio, c.ventana_fin,
            it.nombre AS impacto_nombre
     FROM cambio c
     LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
     WHERE c.estado_registro = true AND c.id_estado IN (2, 3)
     ORDER BY c.ventana_inicio ASC`
  );
}

export async function crearReunion(idUsuario: number, body: any) {
  const vTitulo = validarTexto(body.titulo, 5, 200, "El título de la reunión", true);
  if (!vTitulo.valido) throw new ErrorDominio(vTitulo.mensaje!);
  if (!body.fecha_reunion) throw new ErrorDominio("Debes indicar la fecha de la reunión.");

  const tipo = String(body.tipo || "ORDINARIA").toUpperCase();
  if (!["ORDINARIA", "EXTRAORDINARIA", "EMERGENCIA"].includes(tipo)) {
    throw new ErrorDominio("El tipo de reunión no es válido.");
  }
  const agenda = Array.isArray(body.agenda) ? body.agenda : [];

  const fila = await queryRow<any>(
    `INSERT INTO cab_reunion (titulo, fecha_reunion, tipo, agenda, id_convocante)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_reunion, titulo, fecha_reunion, tipo, estado`,
    [String(body.titulo).trim(), body.fecha_reunion, tipo, JSON.stringify(agenda), idUsuario]
  );
  return { mensaje: "Reunión del CAB programada.", reunion: fila };
}

export async function actualizarReunion(idUsuario: number, idReunion: number, body: any) {
  const reunion = await queryRow<{ id_reunion: number }>(
    `SELECT id_reunion FROM cab_reunion WHERE id_reunion = $1 AND estado_registro = true`,
    [idReunion]
  );
  if (!reunion) throw new ErrorDominio("La reunión no existe.", 404);

  const estado = body.estado ? String(body.estado).toUpperCase() : null;
  if (estado && !["PROGRAMADA", "REALIZADA", "CANCELADA"].includes(estado)) {
    throw new ErrorDominio("El estado de la reunión no es válido.");
  }
  const agenda = Array.isArray(body.agenda) ? JSON.stringify(body.agenda) : null;

  const fila = await queryRow<any>(
    `UPDATE cab_reunion
     SET estado = COALESCE($1, estado),
         acta = COALESCE($2, acta),
         agenda = COALESCE($3::jsonb, agenda)
     WHERE id_reunion = $4
     RETURNING id_reunion, estado, acta`,
    [estado, body.acta ?? null, agenda, idReunion]
  );
  return { mensaje: "Reunión actualizada.", reunion: fila };
}

export async function listarEmergencias() {
  const pendientes = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.justificacion,
            c.ventana_inicio, c.ventana_fin, c.fecha_creacion,
            it.nombre AS impacto_nombre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM cambio c
     LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
     LEFT JOIN usuario u ON u.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true AND c.tipo_cambio = 'EMERGENCIA' AND c.id_estado = 2
       AND NOT EXISTS (SELECT 1 FROM ecab_decision e WHERE e.id_cambio = c.id_cambio AND e.estado_registro = true)
     ORDER BY c.fecha_creacion ASC`
  );

  const recientes = await query(
    `SELECT e.id_ecab, e.id_cambio, e.decision, e.condiciones, e.plazo_horas, e.revision_retroactiva, e.fecha_decision,
            c.codigo_cambio, c.titulo,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS aprobador_nombre
     FROM ecab_decision e
     JOIN cambio c ON c.id_cambio = e.id_cambio
     LEFT JOIN usuario u ON u.id_usuario = e.id_aprobador
     WHERE e.estado_registro = true
     ORDER BY e.fecha_decision DESC LIMIT 20`
  );

  return { pendientes, recientes };
}

export async function resolverEmergencia(
  idUsuario: number,
  idCambio: number,
  decision: string,
  condiciones?: string,
  plazoHoras?: number
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBADO o RECHAZADO.");

  const cambio = await queryRow<{ id_estado: number; tipo_cambio: string }>(
    `SELECT id_estado, tipo_cambio FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (cambio.tipo_cambio !== "EMERGENCIA") throw new ErrorDominio("Solo se dictaminan cambios de emergencia en el ECAB.", 409);

  const existente = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM ecab_decision WHERE id_cambio = $1 AND estado_registro = true) AS existe`,
    [idCambio]
  );
  if (existente?.existe) throw new ErrorDominio("Este cambio ya tiene un dictamen del ECAB.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO ecab_decision (id_cambio, decision, condiciones, plazo_horas, id_aprobador)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_ecab, decision, plazo_horas, revision_retroactiva, fecha_decision`,
    [idCambio, normalizada, condiciones ?? null, plazoHoras ?? null, idUsuario]
  );

  if (normalizada === "APROBADO") {
    await query(`UPDATE cambio SET id_estado = 3 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  } else {
    await query(`UPDATE cambio SET id_estado = 8 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  }

  return { mensaje: "Dictamen del ECAB registrado.", decision: fila };
}
