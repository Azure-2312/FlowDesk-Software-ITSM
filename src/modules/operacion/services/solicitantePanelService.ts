import { query, queryRow } from "@/shared/lib/db";
import { sqlVencidoActivo } from "@/shared/lib/sla-sql";

/**
 * Servicio del panel del Solicitante (perfil 3).
 * Alcance: los tickets que el usuario registro (`ticket.id_usuario_solicitante`)
 * y los activos de los que es custodio.
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

  // Equipos en custodia y, por cada uno, si tiene un acta de entrega por aceptar
  const equipos = await query<{
    id_activo: number;
    codigo_patrimonial: string;
    tipo_activo: string;
    marca: string;
    modelo: string;
    estado_activo: string;
    fecha_fin_garantia: string | null;
    acta_pendiente: string | null;
  }>(
    `SELECT a.id_activo, a.codigo_patrimonial, a.tipo_activo, a.marca, a.modelo, a.estado_activo, a.fecha_fin_garantia,
            (SELECT ae.observaciones FROM acta_entrega ae
              WHERE ae.id_activo = a.id_activo AND ae.id_usuario = $1 AND ae.estado = 'PENDIENTE'
              ORDER BY ae.creado_en DESC LIMIT 1) AS acta_pendiente
       FROM activo a
      WHERE a.estado_registro = true AND a.id_usuario_custodio = $1
      ORDER BY a.codigo_patrimonial`,
    [idUsuario]
  );

  return {
    equipos,
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
