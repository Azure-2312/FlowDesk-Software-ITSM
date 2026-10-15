import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const idUsuario = sesion.id_usuario;

  try {
    // 1. Grupos resolutores del técnico
    const tecnicoDetalle = await queryRow<{ id_departamento: number }>(
      "SELECT id_departamento FROM tecnico_detalle WHERE id_usuario = $1 AND estado_registro = true",
      [idUsuario]
    );
    const deptoUsuario = tecnicoDetalle?.id_departamento;

    // 2. Mis tickets asignados
    const resAsignados = await queryRow<{ total: string; vencidos: string }>(`
      SELECT 
        COUNT(*)::text as total,
        COUNT(CASE WHEN fecha_limite_sla < NOW() THEN 1 END)::text as vencidos
      FROM ticket
      WHERE id_usuario_asignado = $1
        AND id_estado NOT IN (5, 6, 7)
        AND estado_registro = true
    `, [idUsuario]);

    const totalAsignados = parseInt(resAsignados?.total || "0", 10);
    const vencidosAsignados = parseInt(resAsignados?.vencidos || "0", 10);

    // 3. Bandeja de pendientes de mis grupos
    const resPendientes = await queryRow<{ total: string; criticos: string }>(`
      SELECT 
        COUNT(*)::text as total,
        COUNT(CASE WHEN id_prioridad IN (1, 2) THEN 1 END)::text as criticos
      FROM ticket
      WHERE id_usuario_asignado IS NULL
        AND id_estado NOT IN (5, 6, 7)
        AND estado_registro = true
        AND ($1::int IS NULL OR id_departamento = $1)
    `, [deptoUsuario || null]);

    const totalPendientes = parseInt(resPendientes?.total || "0", 10);
    const criticosPendientes = parseInt(resPendientes?.criticos || "0", 10);

    // 4. Semáforo SLA en riesgo o vencidos
    const totalSlaRiesgo = vencidosAsignados;

    // 5. Mis tareas
    const totalTareas = 0; // Tareas unificadas

    // 6. Problemas asignados
    const resProblemas = await queryRow<{ total: string }>(`
      SELECT COUNT(*)::text as total
      FROM problema
      WHERE id_usuario_asignado = $1
        AND id_estado NOT IN (5, 6)
        AND estado_registro = true
    `, [idUsuario]).catch(() => ({ total: "0" }));
    const totalProblemas = parseInt(resProblemas?.total || "0", 10);

    // 7. Candidatos a problema
    const resCandidatos = await queryRow<{ total: string }>(`
      SELECT COUNT(DISTINCT id_servicio)::text as total
      FROM ticket
      WHERE id_tipo_ticket = 1
        AND fecha_creacion >= NOW() - INTERVAL '7 days'
        AND estado_registro = true
      GROUP BY id_servicio
      HAVING COUNT(*) >= 3
      LIMIT 5
    `).catch(() => ({ total: "0" }));
    const totalCandidatos = parseInt(resCandidatos?.total || "0", 10);

    // 8. Cambios por implementar
    const resCambios = await queryRow<{ total: string; en_ejecucion: string }>(`
      SELECT 
        COUNT(*)::text as total,
        COUNT(CASE WHEN id_estado = 5 THEN 1 END)::text as en_ejecucion
      FROM cambio
      WHERE id_usuario_responsable = $1
        AND id_estado IN (3, 4, 5)
        AND estado_registro = true
    `, [idUsuario]).catch(() => ({ total: "0", en_ejecucion: "0" }));
    const totalCambiosImp = parseInt(resCambios?.total || "0", 10);
    const cambiosEnEjecucion = parseInt(resCambios?.en_ejecucion || "0", 10);

    // 9. Mis cambios (solicitados por mí)
    const resMisCambios = await queryRow<{ total: string }>(`
      SELECT COUNT(*)::text as total
      FROM cambio
      WHERE id_usuario_solicitante = $1
        AND id_estado NOT IN (6, 7, 8)
        AND estado_registro = true
    `, [idUsuario]).catch(() => ({ total: "0" }));
    const totalMisCambios = parseInt(resMisCambios?.total || "0", 10);

    // 10. Cambios que afectan mis servicios
    const totalCambiosAfectan = 0;

    // 11. Mantenimientos
    const totalMantenimientos = 0;

    // 12. Conteos en campo
    const totalConteos = 0;

    // 13. Mis artículos devueltos o en revisión
    const resArticulos = await queryRow<{ total: string }>(`
      SELECT COUNT(*)::text as total
      FROM articulo_conocimiento
      WHERE id_autor = $1
        AND estado_editorial = 'EN_REVISION'
        AND estado_registro = true
    `, [idUsuario]).catch(() => ({ total: "0" }));
    const totalArticulos = parseInt(resArticulos?.total || "0", 10);

    // 14. Revisiones de artículos pendientes
    const totalRevisiones = 0;

    const contadores: Record<string, { total: number; color: "gris" | "ambar" | "rojo" }> = {
      mis_asignados: {
        total: totalAsignados,
        color: vencidosAsignados > 0 ? "rojo" : "gris",
      },
      pendientes_grupo: {
        total: totalPendientes,
        color: criticosPendientes > 0 ? "rojo" : "ambar",
      },
      sla_riesgo: {
        total: totalSlaRiesgo,
        color: totalSlaRiesgo > 0 ? "rojo" : "ambar",
      },
      mis_tareas: {
        total: totalTareas,
        color: "ambar",
      },
      mis_problemas: {
        total: totalProblemas,
        color: "gris",
      },
      candidatos_problema: {
        total: totalCandidatos,
        color: "ambar",
      },
      cambios_implementar: {
        total: totalCambiosImp,
        color: cambiosEnEjecucion > 0 ? "rojo" : "ambar",
      },
      mis_cambios: {
        total: totalMisCambios,
        color: "ambar",
      },
      cambios_afectan: {
        total: totalCambiosAfectan,
        color: "ambar",
      },
      mantenimientos: {
        total: totalMantenimientos,
        color: "ambar",
      },
      conteos: {
        total: totalConteos,
        color: "ambar",
      },
      mis_articulos: {
        total: totalArticulos,
        color: "ambar",
      },
      revisiones_articulos: {
        total: totalRevisiones,
        color: "ambar",
      },
    };

    return NextResponse.json(contadores);
  } catch (error) {
    console.error("Error al calcular contadores del técnico:", error);
    return NextResponse.json({}, { status: 200 });
  }
}
