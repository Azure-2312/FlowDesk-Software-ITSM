import { query } from "@/shared/lib/db";

/** Cumplimiento de procesos: segregación de funciones y cambios irregulares. */

export async function detectarSod() {
  const autoaprobacionTickets = await query(
    `SELECT ta.id_ticket_aprobacion, ta.id_ticket, t.codigo_ticket, t.titulo,
            ta.estado_decision, ta.fecha_decision,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
     FROM ticket_aprobacion ta
     JOIN ticket t ON t.id_ticket = ta.id_ticket
     JOIN usuario u ON u.id_usuario = ta.id_usuario_aprobador
     WHERE ta.estado_registro = true
       AND ta.id_usuario_aprobador = t.id_usuario_solicitante
     ORDER BY ta.fecha_decision DESC`
  );

  const autoaprobacionCambios = await query(
    `SELECT ca.id_cambio_aprobacion, ca.id_cambio, c.codigo_cambio, c.titulo,
            ca.decision, ca.fecha_decision,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
     FROM cambio_aprobacion ca
     JOIN cambio c ON c.id_cambio = ca.id_cambio
     JOIN usuario u ON u.id_usuario = ca.id_usuario_aprobador
     WHERE ca.estado_registro = true
       AND ca.id_usuario_aprobador = c.id_usuario_solicitante
     ORDER BY ca.fecha_decision DESC`
  );

  const aprobadorResolutor = await query(
    `SELECT ta.id_ticket_aprobacion, t.codigo_ticket, t.titulo, ta.estado_decision, ta.fecha_decision,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre
     FROM ticket_aprobacion ta
     JOIN ticket t ON t.id_ticket = ta.id_ticket
     JOIN usuario u ON u.id_usuario = ta.id_usuario_aprobador
     WHERE ta.estado_registro = true
       AND t.id_usuario_asignado IS NOT NULL
       AND ta.id_usuario_aprobador = t.id_usuario_asignado
     ORDER BY ta.fecha_decision DESC`
  );

  const perfilesIncompatibles = await query(
    `SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) AS usuario_nombre,
            array_agg(p.nombre ORDER BY p.nombre) AS perfiles
     FROM usuario u
     JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
     JOIN perfiles p ON p.id_perfil = up.id_perfil
     WHERE u.estado_registro = true
     GROUP BY u.id_usuario, u.nombres, u.apellido_paterno
     HAVING COUNT(*) FILTER (WHERE up.id_perfil IN (2, 7)) > 1
         OR COUNT(*) >= 4
     ORDER BY usuario_nombre`
  );

  return {
    autoaprobacionTickets,
    autoaprobacionCambios,
    aprobadorResolutor,
    perfilesIncompatibles,
  };
}

export async function listarCambiosIrregulares() {
  const sinAutorizacion = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado,
            CASE c.id_estado WHEN 5 THEN 'En Ejecución' WHEN 6 THEN 'Exitoso' ELSE 'Otro' END AS estado_nombre,
            c.ventana_inicio, c.ventana_fin, c.fecha_creacion,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM cambio c
     LEFT JOIN usuario u ON u.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true AND c.id_estado IN (5, 6)
       AND NOT EXISTS (
         SELECT 1 FROM cambio_aprobacion ca
         WHERE ca.id_cambio = c.id_cambio AND ca.decision = 'APROBADO' AND ca.estado_registro = true
       )
     ORDER BY c.id_cambio DESC`
  );

  const fueraDeVentana = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, c.id_estado,
            CASE c.id_estado WHEN 3 THEN 'Aprobado' WHEN 4 THEN 'En Planificación' WHEN 6 THEN 'Exitoso' ELSE 'Otro' END AS estado_nombre,
            c.ventana_inicio, c.ventana_fin, c.fecha_modificacion,
            CASE
              WHEN c.id_estado IN (3, 4) AND c.ventana_fin < now() THEN 'Ventana vencida sin ejecutar'
              WHEN c.id_estado = 6 AND c.fecha_modificacion < c.ventana_inicio THEN 'Cerrado antes de la ventana'
              WHEN c.id_estado = 6 AND c.fecha_modificacion > c.ventana_fin + interval '1 day' THEN 'Cerrado fuera de la ventana'
              ELSE 'Irregular'
            END AS motivo,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS solicitante_nombre
     FROM cambio c
     LEFT JOIN usuario u ON u.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true
       AND (
         (c.id_estado IN (3, 4) AND c.ventana_fin < now())
         OR (c.id_estado = 6 AND (c.fecha_modificacion < c.ventana_inicio OR c.fecha_modificacion > c.ventana_fin + interval '1 day'))
       )
     ORDER BY c.ventana_inicio DESC`
  );

  return { sinAutorizacion, fueraDeVentana };
}
