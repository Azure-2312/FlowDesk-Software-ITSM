import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/** CAB presidido por el Gestor de Cambios: convocatoria, agenda y actas. */

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
  return { mensaje: "Reunión del CAB convocada.", reunion: fila };
}

export async function actualizarReunion(idReunion: number, body: any) {
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
