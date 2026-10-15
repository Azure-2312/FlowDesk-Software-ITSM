import { queryRow } from "@/shared/lib/db";

export interface ContextoIndicadores {
  idPerfil?: number;
  idUsuario: number;
}

/**
 * Indicadores agregados globales. El alcance depende del perfil:
 * - Supervisor (4): solo los departamentos que supervisa.
 * - Gestor de Área (5): solo su departamento de empresa.
 * No expone contenido de tickets ni PII.
 */
export async function obtenerIndicadores(contexto: ContextoIndicadores) {
  const conditions = ["t.estado_registro = true"];
  const params: unknown[] = [];

  if (contexto.idPerfil === 4) {
    params.push(contexto.idUsuario);
    conditions.push(`t.id_departamento IN (
      SELECT d.id_departamento FROM departamento_ti d
      WHERE d.id_supervisor = $${params.length} AND d.estado_registro = true
    )`);
  } else if (contexto.idPerfil === 5) {
    params.push(contexto.idUsuario);
    conditions.push(`t.id_departamento_empresa = (
      SELECT u.id_departamento_empresa FROM usuario u WHERE u.id_usuario = $${params.length}
    )`);
  }

  return queryRow<Record<string, number | string>>(
    `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE tt.codigo = 'INCIDENTE')::int AS incidentes,
        COUNT(*) FILTER (WHERE tt.codigo = 'SOLICITUD')::int AS solicitudes,
        COUNT(*) FILTER (WHERE t.id_estado IN (5, 6))::int AS resueltos_total,
        COUNT(*) FILTER (WHERE t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS a_tiempo,
        COUNT(*) FILTER (WHERE prio.codigo = 'P1')::int AS p1,
        COUNT(*) FILTER (WHERE prio.codigo = 'P2')::int AS p2,
        COUNT(*) FILTER (WHERE prio.codigo = 'P3')::int AS p3,
        COUNT(*) FILTER (WHERE prio.codigo = 'P4')::int AS p4,
        COUNT(*) FILTER (WHERE t.id_estado = 1)::int AS abiertos,
        COUNT(*) FILTER (WHERE t.id_estado = 2)::int AS asignados,
        COUNT(*) FILTER (WHERE t.id_estado = 3)::int AS en_proceso,
        COUNT(*) FILTER (WHERE t.id_estado = 4)::int AS en_espera,
        COUNT(*) FILTER (WHERE t.id_estado = 5)::int AS resueltos,
        COUNT(*) FILTER (WHERE t.id_estado = 6)::int AS cerrados,
        COUNT(*) FILTER (WHERE tt.codigo = 'INCIDENTE' AND t.id_estado IN (5, 6))::int AS inc_resueltos,
        COUNT(*) FILTER (WHERE tt.codigo = 'INCIDENTE' AND t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS inc_a_tiempo,
        COUNT(*) FILTER (WHERE tt.codigo = 'SOLICITUD' AND t.id_estado IN (5, 6))::int AS sol_resueltos,
        COUNT(*) FILTER (WHERE tt.codigo = 'SOLICITUD' AND t.id_estado IN (5, 6) AND t.sla_cumplido = true)::int AS sol_a_tiempo,
        COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND prio.codigo = 'P1')::int AS activos_p1,
        COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND prio.codigo = 'P2')::int AS activos_p2,
        COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND prio.codigo = 'P3')::int AS activos_p3,
        COUNT(*) FILTER (WHERE t.id_estado IN (1, 2, 3, 4) AND prio.codigo = 'P4')::int AS activos_p4
      FROM ticket t
      LEFT JOIN tipo_ticket tt ON tt.id_tipo_ticket = t.id_tipo_ticket
      LEFT JOIN prioridad_ticket prio ON prio.id_prioridad = t.id_prioridad
      WHERE ${conditions.join(" AND ")}
    `,
    params
  );
}
