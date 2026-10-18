import { query } from "@/shared/lib/db";
import type { LogAccesoItem } from "@/modules/seguridad/logsTypes";

export interface FiltrosLogsSeguridad {
  buscar?: string | null;
  resultado?: string | null;
}

export async function listarLogsSeguridad(filtros: FiltrosLogsSeguridad) {
  const { buscar, resultado: filtroResultado } = filtros;

  const condiciones: string[] = ["1=1"];
  const params: any[] = [];
  let paramIdx = 1;

  if (filtroResultado === "exitoso") {
    condiciones.push("l.exitoso = true");
  } else if (filtroResultado === "fallido") {
    condiciones.push("l.exitoso = false");
  }

  if (buscar && buscar.trim().length > 0) {
    condiciones.push(
      `(l.correo_intento ILIKE $${paramIdx} OR l.ip ILIKE $${paramIdx} OR CONCAT(u.nombres, ' ', u.apellido_paterno) ILIKE $${paramIdx})`
    );
    params.push(`%${buscar.trim()}%`);
    paramIdx++;
  }

  const sql = `
    SELECT 
      l.id_log,
      l.id_usuario,
      CONCAT(u.nombres, ' ', u.apellido_paterno) as usuario_nombre,
      l.correo_intento,
      l.exitoso,
      l.ip,
      l.fecha
    FROM log_acceso l
    LEFT JOIN usuario u ON u.id_usuario = l.id_usuario
    WHERE ${condiciones.join(" AND ")}
    ORDER BY l.fecha DESC
    LIMIT 100
  `;

  const logs = await query<LogAccesoItem>(sql, params);
  return { logs };
}
