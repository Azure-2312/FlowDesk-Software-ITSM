import { NextRequest, NextResponse } from "next/server";
import { queryRow } from "@/lib/db";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Aggregate-only reporting endpoint: it does not expose ticket content or PII. */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const perfil = sesion.perfilActivo?.id_perfil;
  if (![1, 4, 5, 6].includes(perfil || 0)) {
    return NextResponse.json({ error: "Este perfil no puede consultar indicadores globales." }, { status: 403 });
  }

  const conditions = ["t.estado_registro = true"];
  const params: unknown[] = [];
  if (perfil === 4) {
    params.push(sesion.id_usuario);
    conditions.push(`t.id_departamento IN (
      SELECT d.id_departamento FROM departamento_ti d
      WHERE d.id_supervisor = $${params.length} AND d.estado_registro = true
    )`);
  } else if (perfil === 5) {
    params.push(sesion.id_usuario);
    conditions.push(`t.id_departamento_empresa = (
      SELECT u.id_departamento_empresa FROM usuario u WHERE u.id_usuario = $${params.length}
    )`);
  }

  try {
    const stats = await queryRow<Record<string, number | string>>(`
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
    `, params);
    return NextResponse.json({ indicadores: stats });
  } catch (err) {
    console.error("Error al calcular indicadores:", err);
    return NextResponse.json({ error: "No se pudieron calcular los indicadores." }, { status: 500 });
  }
}
