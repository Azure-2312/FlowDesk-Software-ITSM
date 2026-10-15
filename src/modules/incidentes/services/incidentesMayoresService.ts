import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

/**
 * Incidentes mayores (sala de crisis) declarados por el Supervisor.
 * Módulo `incidentes`.
 */

export async function listarIncidentesMayores() {
  return query(
    `SELECT im.id_incidente_mayor, im.codigo, im.titulo, im.descripcion, im.severidad,
            im.estado, im.sala_virtual, im.comunicados,
            im.fecha_declaracion, im.fecha_cierre,
            im.id_ticket, t.codigo_ticket,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS declarado_por
     FROM incidente_mayor im
     LEFT JOIN ticket t ON t.id_ticket = im.id_ticket
     LEFT JOIN usuario u ON u.id_usuario = im.id_usuario_declara
     WHERE im.estado_registro = true
     ORDER BY (im.estado = 'ABIERTO') DESC, im.fecha_declaracion DESC`
  );
}

export async function declararIncidenteMayor(sesion: { id_usuario: number }, body: any) {
  const titulo = String(body.titulo || "").trim();
  if (titulo.length < 5) throw new ErrorDominio("El título del incidente mayor es obligatorio.");
  const severidad = String(body.severidad || "P1").toUpperCase();
  if (!["P1", "P2"].includes(severidad)) throw new ErrorDominio("La severidad debe ser P1 o P2.");

  const year = new Date().getFullYear();
  const countRow = await queryRow<{ c: string }>(
    "SELECT COUNT(*) AS c FROM incidente_mayor WHERE EXTRACT(YEAR FROM fecha_declaracion) = $1",
    [year]
  );
  const correlativo = String(parseInt(countRow?.c || "0", 10) + 1).padStart(4, "0");
  const codigo = `IM-${year}-${correlativo}`;

  const fila = await queryRow<any>(
    `INSERT INTO incidente_mayor
       (codigo, titulo, descripcion, severidad, id_ticket, id_departamento, sala_virtual, id_usuario_declara)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_incidente_mayor, codigo, titulo, severidad, estado, fecha_declaracion`,
    [
      codigo,
      titulo,
      body.descripcion ?? null,
      severidad,
      body.id_ticket ?? null,
      body.id_departamento ?? null,
      body.sala_virtual ?? null,
      sesion.id_usuario,
    ]
  );
  return { mensaje: "Incidente mayor declarado.", incidente: fila };
}

export async function actualizarIncidenteMayor(
  sesion: { id_usuario: number },
  idIncidente: number,
  body: any
) {
  const estado = body.estado ? String(body.estado).toUpperCase() : null;
  if (estado && !["ABIERTO", "MITIGADO", "CERRADO"].includes(estado)) {
    throw new ErrorDominio("Estado de incidente mayor no válido.");
  }

  const comunicado = body.comunicado ? String(body.comunicado).trim() : null;

  const fila = await queryRow<any>(
    `UPDATE incidente_mayor
     SET estado = COALESCE($2, estado),
         descripcion = COALESCE($3, descripcion),
         comunicados = CASE WHEN $4::text IS NULL THEN comunicados
           ELSE comunicados || jsonb_build_array(jsonb_build_object('texto', $4, 'fecha', now(), 'usuario', $5)) END,
         id_usuario_cierra = CASE WHEN $2 = 'CERRADO' THEN $5 ELSE id_usuario_cierra END,
         fecha_cierre = CASE WHEN $2 = 'CERRADO' THEN now() ELSE fecha_cierre END
     WHERE id_incidente_mayor = $1 AND estado_registro = true
     RETURNING id_incidente_mayor, codigo, estado, comunicados`,
    [idIncidente, estado, body.descripcion ?? null, comunicado, sesion.id_usuario]
  );
  if (!fila) throw new ErrorDominio("El incidente mayor no existe.", 404);
  return { mensaje: "Incidente mayor actualizado.", incidente: fila };
}
