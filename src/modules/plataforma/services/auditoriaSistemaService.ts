import { query } from "@/shared/lib/db";

export interface FiltrosAuditoriaSistema {
  modulo?: string | null;
  accion?: string | null;
  buscar?: string | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
}

export async function listarAuditoriaSistema(filtros: FiltrosAuditoriaSistema) {
  const { modulo, accion, buscar, fechaDesde, fechaHasta } = filtros;

  let sql = `
      SELECT 
        l.id_log,
        l.id_usuario,
        CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre,
        u.correo_electronico as usuario_correo,
        l.modulo,
        l.accion,
        l.descripcion,
        l.detalles,
        l.direccion_ip,
        l.fecha_creacion
      FROM log_auditoria_sistema l
      LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
      WHERE 1=1
    `;
  const params: any[] = [];
  let idx = 1;

  if (modulo) {
    sql += ` AND l.modulo = $${idx++}`;
    params.push(modulo);
  }

  if (accion) {
    sql += ` AND l.accion = $${idx++}`;
    params.push(accion);
  }

  if (fechaDesde) {
    sql += ` AND l.fecha_creacion >= $${idx++}::timestamptz`;
    params.push(fechaDesde);
  }

  if (fechaHasta) {
    sql += ` AND l.fecha_creacion <= ($${idx++}::date + interval '1 day')`;
    params.push(fechaHasta);
  }

  if (buscar && buscar.trim()) {
    sql += ` AND (l.descripcion ILIKE $${idx} OR CONCAT(u.nombres, ' ', u.apellido_paterno) ILIKE $${idx} OR l.modulo ILIKE $${idx} OR l.accion ILIKE $${idx})`;
    params.push(`%${buscar.trim()}%`);
    idx++;
  }

  sql += ` ORDER BY l.fecha_creacion DESC LIMIT 200`;

  const logs = await query(sql, params);
  return { logs };
}
