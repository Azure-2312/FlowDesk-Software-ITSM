import { query, queryRow } from "@/shared/lib/db";
import { sqlVencidoActivo } from "@/shared/lib/sla-sql";

/**
 * Servicio del panel del Solicitante (perfil 3).
 * Alcance: los tickets que el usuario registro (`ticket.id_usuario_solicitante`)
 * (no consulta equipos: eso lo ven Gestión de Activos, TI y su jefe de área).
 */

export async function obtenerPanelSolicitante(idUsuario: number) {
  const kpis = await queryRow<any>(
    `SELECT
       COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4))::int AS abiertos,
       COUNT(*) FILTER (WHERE t.id_estado = 4)::int AS en_espera,
       COUNT(*) FILTER (WHERE t.id_estado IN (5, 6)
         AND COALESCE(t.fecha_resolucion, t.fecha_cierre) >= now() - interval '30 days')::int AS resueltos_30d,
       COUNT(*) FILTER (WHERE ${sqlVencidoActivo()})::int AS vencidos
     FROM ticket t
     WHERE t.estado_registro = true AND t.id_usuario_solicitante = $1`,
    [idUsuario]
  );

  const ticketsRecientes = await query<{
    id_ticket: number;
    codigo_ticket: string;
    titulo: string;
    tipo: string | null;
    estado: string | null;
    color_estado: string | null;
    fecha_creacion: string;
    fecha_limite_sla: string | null;
  }>(
    `SELECT t.id_ticket, t.codigo_ticket, t.titulo,
            tt.nombre AS tipo,
            et.nombre AS estado,
            et.color AS color_estado,
            t.fecha_creacion, t.fecha_limite_sla
     FROM ticket t
     LEFT JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
     LEFT JOIN estado_ticket et ON et.id_estado = t.id_estado
     WHERE t.estado_registro = true AND t.id_usuario_solicitante = $1
     ORDER BY t.fecha_creacion DESC
     LIMIT 6`,
    [idUsuario]
  );

  const articulos = await query<{ id_articulo: number; titulo: string }>(
    `SELECT id_articulo, titulo
     FROM articulo_conocimiento
     WHERE estado_registro = true AND estado_editorial = 'PUBLICADO'
     ORDER BY visitas DESC NULLS LAST, fecha_publicacion DESC NULLS LAST
     LIMIT 4`
  );

  return {
    kpis: {
      abiertos: kpis?.abiertos ?? 0,
      en_espera: kpis?.en_espera ?? 0,
      resueltos_30d: kpis?.resueltos_30d ?? 0,
      vencidos: kpis?.vencidos ?? 0,
    },
    ticketsRecientes,
    articulos,
  };
}
