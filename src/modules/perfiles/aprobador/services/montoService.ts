import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { UMBRAL_MONTO } from "@/modules/perfiles/aprobador/services/aprobacionesService";

/** Aprobaciones por monto (bajas y renovaciones) y cierre de problemas mayores. */

export async function listarBajasPorMonto() {
  return query(
    `SELECT s.id_solicitud, s.id_activo, s.motivo, s.fecha_solicitud,
            a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo,
            COALESCE(a.costo_compra, 0) AS costo_compra,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM solicitud_baja_activo s
     JOIN activo a ON a.id_activo = s.id_activo
     LEFT JOIN usuario u ON u.id_usuario = s.id_usuario_solicita
     WHERE s.estado_registro = true AND s.estado = 'PENDIENTE'
       AND COALESCE(a.costo_compra, 0) >= $1
     ORDER BY a.costo_compra DESC NULLS LAST`,
    [UMBRAL_MONTO]
  );
}

export async function resolverBaja(idUsuario: number, idSolicitud: number, decision: string, comentario?: string) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBADO o RECHAZADO.");
  if (!comentario || String(comentario).trim().length < 3) throw new ErrorDominio("El comentario de la decisión es obligatorio.");

  const solicitud = await queryRow<any>(
    `SELECT s.id_solicitud, s.id_activo, s.estado, COALESCE(a.costo_compra, 0) AS costo_compra
     FROM solicitud_baja_activo s
     JOIN activo a ON a.id_activo = s.id_activo
     WHERE s.id_solicitud = $1 AND s.estado_registro = true`,
    [idSolicitud]
  );
  if (!solicitud) throw new ErrorDominio("La solicitud de baja no existe.", 404);
  if (solicitud.estado !== "PENDIENTE") throw new ErrorDominio("La solicitud ya fue resuelta.", 409);
  if (Number(solicitud.costo_compra) < UMBRAL_MONTO) {
    throw new ErrorDominio(`El monto no alcanza el umbral de autorización (${UMBRAL_MONTO}).`, 409);
  }

  await query(
    `INSERT INTO aprobacion_monto (tipo, id_referencia, monto, decision, comentario, id_aprobador)
     VALUES ('BAJA', $1, $2, $3, $4, $5)`,
    [idSolicitud, solicitud.costo_compra, normalizada, String(comentario).trim(), idUsuario]
  );

  await query(
    `UPDATE solicitud_baja_activo
     SET estado = $1, id_usuario_resuelve = $2, comentario_resolucion = $3, fecha_resolucion = now()
     WHERE id_solicitud = $4`,
    [normalizada === "APROBADO" ? "APROBADA" : "RECHAZADA", idUsuario, String(comentario).trim(), idSolicitud]
  );

  if (normalizada === "APROBADO") {
    await query(
      `UPDATE activo
       SET estado_activo = 'BAJA', motivo_inactivacion = COALESCE(motivo_inactivacion, $1),
           fecha_inactivacion = now(), usuario_inactivacion = $2
       WHERE id_activo = $3 AND estado_activo <> 'BAJA'`,
      ["Baja autorizada por monto", idUsuario, solicitud.id_activo]
    );
  }

  return { mensaje: "Decisión registrada." };
}

export async function listarRenovaciones() {
  return query(
    `SELECT ls.id_licencia, ls.nombre_software, ls.fabricante, ls.tipo_licencia,
            ls.cantidad_adquirida, ls.cantidad_en_uso, ls.fecha_vencimiento,
            COALESCE(ls.costo_anual, 0) AS costo_anual,
            (ls.fecha_vencimiento - CURRENT_DATE) AS dias_restantes
     FROM licencia_software ls
     WHERE ls.estado_registro = true
       AND COALESCE(ls.costo_anual, 0) >= $1
       AND ls.fecha_vencimiento IS NOT NULL
       AND ls.fecha_vencimiento <= CURRENT_DATE + INTERVAL '90 days'
       AND NOT EXISTS (
         SELECT 1 FROM aprobacion_monto am
         WHERE am.tipo = 'RENOVACION' AND am.id_referencia = ls.id_licencia
       )
     ORDER BY ls.fecha_vencimiento ASC`,
    [UMBRAL_MONTO]
  );
}

export async function resolverRenovacion(idUsuario: number, idLicencia: number, decision: string, comentario?: string) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBADO o RECHAZADO.");
  if (!comentario || String(comentario).trim().length < 3) throw new ErrorDominio("El comentario de la decisión es obligatorio.");

  const licencia = await queryRow<any>(
    `SELECT id_licencia, COALESCE(costo_anual, 0) AS costo_anual FROM licencia_software
     WHERE id_licencia = $1 AND estado_registro = true`,
    [idLicencia]
  );
  if (!licencia) throw new ErrorDominio("La licencia no existe.", 404);
  if (Number(licencia.costo_anual) < UMBRAL_MONTO) {
    throw new ErrorDominio(`El monto no alcanza el umbral de autorización (${UMBRAL_MONTO}).`, 409);
  }

  await query(
    `INSERT INTO aprobacion_monto (tipo, id_referencia, monto, decision, comentario, id_aprobador)
     VALUES ('RENOVACION', $1, $2, $3, $4, $5)`,
    [idLicencia, licencia.costo_anual, normalizada, String(comentario).trim(), idUsuario]
  );

  if (normalizada === "APROBADO") {
    await query(
      `UPDATE licencia_software SET fecha_vencimiento = fecha_vencimiento + INTERVAL '1 year'
       WHERE id_licencia = $1`,
      [idLicencia]
    );
  }

  return { mensaje: "Decisión registrada." };
}

export async function listarProblemasMayores() {
  return query(
    `SELECT p.id_problema, p.codigo_problema, p.titulo, p.descripcion, p.causa_raiz,
            p.workaround, p.solucion_definitiva, p.fecha_creacion,
            it.nombre AS impacto_nombre, pt.nombre AS prioridad_nombre,
            pe.nombre AS estado_nombre,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS asignado_nombre
     FROM problema p
     LEFT JOIN impacto_ticket it ON it.id_impacto = p.id_impacto
     LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
     LEFT JOIN problema_estado pe ON pe.id_estado = p.id_estado
     LEFT JOIN usuario u ON u.id_usuario = p.id_usuario_asignado
     WHERE p.estado_registro = true
       AND (it.nivel = 3 OR pt.nivel = 1)
       AND NOT EXISTS (SELECT 1 FROM problema_cierre_aprobacion pc WHERE pc.id_problema = p.id_problema)
     ORDER BY p.fecha_creacion DESC`
  );
}

export async function resolverProblema(
  idUsuario: number,
  idProblema: number,
  decision: string,
  riesgoAceptado?: string,
  comentario?: string
) {
  const normalizada = String(decision || "").toUpperCase();
  if (!["APROBADO", "RECHAZADO"].includes(normalizada)) throw new ErrorDominio("La decisión debe ser APROBADO o RECHAZADO.");
  if (normalizada === "APROBADO" && (!riesgoAceptado || String(riesgoAceptado).trim().length < 3)) {
    throw new ErrorDominio("Debes describir el riesgo aceptado al autorizar el cierre.");
  }

  const problema = await queryRow<{ id_problema: number }>(
    `SELECT id_problema FROM problema WHERE id_problema = $1 AND estado_registro = true`,
    [idProblema]
  );
  if (!problema) throw new ErrorDominio("El problema no existe.", 404);

  await query(
    `INSERT INTO problema_cierre_aprobacion (id_problema, decision, riesgo_aceptado, comentario, id_aprobador)
     VALUES ($1, $2, $3, $4, $5)`,
    [idProblema, normalizada, riesgoAceptado ?? null, comentario ?? null, idUsuario]
  );

  if (normalizada === "APROBADO") {
    const estado = await queryRow<{ id_estado: number }>(
      `SELECT id_estado FROM problema_estado
       WHERE activo = true AND tipo IN ('final', 'resuelto')
       ORDER BY (tipo = 'final') DESC, orden DESC LIMIT 1`
    );
    if (estado?.id_estado) {
      await query(`UPDATE problema SET id_estado = $1 WHERE id_problema = $2`, [estado.id_estado, idProblema]);
    }
  }

  return { mensaje: "Decisión registrada." };
}
