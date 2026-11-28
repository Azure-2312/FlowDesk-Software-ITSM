import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { registrarVotoCab } from "./votacionCabService";
import { UMBRAL_MONTO_APROBACION as UMBRAL_MONTO } from "@/shared/lib/parametros";

/**
 * Decisiones del Aprobador (perfil 7 / CAB): cambios (RFC/ECAB)
 * y panel/historial de decisiones. Lógica de dominio movida desde el portal del
 * Aprobador (`src/modules/perfiles/aprobador`) para que el rol solo conserve su UI.
 */

const ESTADO_CAMBIO_CASE = `CASE c.id_estado
  WHEN 1 THEN 'Registrado' WHEN 2 THEN 'Evaluación CAB' WHEN 3 THEN 'Aprobado'
  WHEN 4 THEN 'En Planificación' WHEN 5 THEN 'En Ejecución' WHEN 6 THEN 'Exitoso'
  WHEN 7 THEN 'Fallido' WHEN 8 THEN 'Cancelado' ELSE 'Desconocido' END`;

export async function obtenerPanelAprobador(idUsuario: number) {
  const [pendientes, porVencer, bajasPendientes, problemasPendientes, proximaReunion, recientes] = await Promise.all([
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cambio c
       WHERE c.estado_registro = true AND c.id_estado = 2
         AND NOT EXISTS (SELECT 1 FROM cambio_aprobacion ca
                         WHERE ca.id_cambio = c.id_cambio AND ca.id_usuario_aprobador = $1 AND ca.estado_registro = true)`,
      [idUsuario]
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cambio c
       WHERE c.estado_registro = true AND c.id_estado = 2
         AND c.ventana_inicio <= now() + interval '48 hours'
         AND NOT EXISTS (SELECT 1 FROM cambio_aprobacion ca
                         WHERE ca.id_cambio = c.id_cambio AND ca.id_usuario_aprobador = $1 AND ca.estado_registro = true)`,
      [idUsuario]
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM solicitud_baja_activo s
       JOIN activo a ON a.id_activo = s.id_activo
       WHERE s.estado_registro = true AND s.estado = 'PENDIENTE' AND COALESCE(a.costo_compra, 0) >= $1`,
      [UMBRAL_MONTO]
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM problema p
       LEFT JOIN impacto_ticket it ON it.id_impacto = p.id_impacto
       LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = p.id_prioridad
       WHERE p.estado_registro = true AND (it.nivel = 3 OR pt.nivel = 1)
         AND NOT EXISTS (SELECT 1 FROM problema_cierre_aprobacion pc WHERE pc.id_problema = p.id_problema)`
    ),
    queryRow<any>(
      `SELECT id_reunion, titulo, fecha_reunion, tipo FROM cab_reunion
       WHERE estado_registro = true AND estado = 'PROGRAMADA' AND fecha_reunion >= now()
       ORDER BY fecha_reunion ASC LIMIT 1`
    ),
    query(
      `SELECT ca.id_cambio_aprobacion, ca.decision, ca.fecha_decision,
              c.codigo_cambio, c.titulo
       FROM cambio_aprobacion ca
       JOIN cambio c ON c.id_cambio = ca.id_cambio
       WHERE ca.id_usuario_aprobador = $1 AND ca.estado_registro = true
       ORDER BY ca.fecha_decision DESC LIMIT 5`,
      [idUsuario]
    ),
  ]);

  return {
    kpis: {
      pendientes: pendientes?.c ?? 0,
      por_vencer: porVencer?.c ?? 0,
      bajas_pendientes: bajasPendientes?.c ?? 0,
      problemas_pendientes: problemasPendientes?.c ?? 0,
    },
    proximaReunion: proximaReunion ?? null,
    decisionesRecientes: recientes,
  };
}

export async function listarCambiosPendientes(idUsuario: number) {
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio,
            ${ESTADO_CAMBIO_CASE} AS estado_nombre,
            c.justificacion, c.plan_implementacion, c.plan_rollback,
            c.ventana_inicio, c.ventana_fin, c.fecha_creacion,
            it.nombre AS impacto_nombre, it.nivel AS impacto_nivel,
            pt.nombre AS prioridad_nombre, pt.nivel AS prioridad_nivel,
            ci.codigo_ci AS ci_codigo, ci.nombre AS ci_nombre,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
            (c.tipo_cambio = 'NORMAL' AND it.nivel = 3) AS es_excepcion
     FROM cambio c
     LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
     LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = c.id_prioridad
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = c.id_ci_afectado
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     WHERE c.estado_registro = true AND c.id_estado = 2
       AND c.id_usuario_solicitante <> $1
       AND NOT EXISTS (SELECT 1 FROM cambio_aprobacion ca
                       WHERE ca.id_cambio = c.id_cambio AND ca.id_usuario_aprobador = $1 AND ca.estado_registro = true)
     ORDER BY c.ventana_inicio ASC`,
    [idUsuario]
  );
}

/** Voto del Aprobador CAB desde su bandeja: misma regla de quórum que el detalle. */
export async function resolverCambio(idUsuario: number, idCambio: number, decision: string, comentario?: string) {
  return registrarVotoCab(idUsuario, idCambio, decision, comentario);
}

export async function listarModelosCambio() {
  return query(
    `SELECT id_modelo, codigo, nombre, descripcion, estado, version_modelo,
            riesgo_fijo, autorizacion_automatica, veces_usado, veces_exitoso, veces_fallido,
            ultimo_uso, fecha_creacion
     FROM cambio_modelo_estandar
     WHERE estado <> 'ARCHIVADO'
     ORDER BY nombre`
  );
}

export async function listarHistorialDecisiones(idUsuario: number) {
  return query(
    `SELECT tipo, referencia, codigo_cambio, id_cambio, tipo_cambio, titulo, decision, comentario, fecha_decision FROM (
       SELECT 'RFC' AS tipo, c.codigo_cambio AS referencia, c.codigo_cambio, c.id_cambio, c.tipo_cambio, c.titulo, ca.decision, ca.comentario, ca.fecha_decision
       FROM cambio_aprobacion ca JOIN cambio c ON c.id_cambio = ca.id_cambio
       WHERE ca.id_usuario_aprobador = $1 AND ca.estado_registro = true
       UNION ALL
       SELECT 'ECAB' AS tipo, c.codigo_cambio AS referencia, c.codigo_cambio, c.id_cambio, c.tipo_cambio, c.titulo, e.decision, e.condiciones AS comentario, e.fecha_decision
       FROM ecab_decision e JOIN cambio c ON c.id_cambio = e.id_cambio
       WHERE e.id_aprobador = $1 AND e.estado_registro = true
       UNION ALL
       SELECT 'MONTO' AS tipo,
              CASE am.tipo WHEN 'BAJA' THEN 'Baja activo #' || am.id_referencia ELSE 'Renovación licencia #' || am.id_referencia END AS referencia,
              NULL AS codigo_cambio, NULL::int AS id_cambio, NULL AS tipo_cambio,
              am.tipo AS titulo, am.decision, am.comentario, am.fecha_decision
       FROM aprobacion_monto am
       WHERE am.id_aprobador = $1
       UNION ALL
       SELECT 'PROBLEMA' AS tipo, p.codigo_problema AS referencia,
              p.codigo_problema AS codigo_cambio, NULL::int AS id_cambio, NULL AS tipo_cambio,
              p.titulo, pc.decision, pc.comentario, pc.fecha_decision
       FROM problema_cierre_aprobacion pc JOIN problema p ON p.id_problema = pc.id_problema
       WHERE pc.id_aprobador = $1
     ) d
     ORDER BY fecha_decision DESC`,
    [idUsuario]
  );
}

export async function obtenerReportesDecisiones(idUsuario: number) {
  const resumen = await queryRow<any>(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE ca.decision = 'APROBADO')::int AS aprobadas,
            COUNT(*) FILTER (WHERE ca.decision = 'RECHAZADO')::int AS rechazadas,
            COUNT(*) FILTER (WHERE ca.decision = 'OBSERVADO')::int AS observadas,
            ROUND(AVG(EXTRACT(EPOCH FROM (ca.fecha_decision - c.fecha_creacion)) / 3600)::numeric, 1) AS horas_promedio
     FROM cambio_aprobacion ca
     JOIN cambio c ON c.id_cambio = ca.id_cambio
     WHERE ca.id_usuario_aprobador = $1 AND ca.estado_registro = true`,
    [idUsuario]
  );

  const porMes = await query(
    `SELECT to_char(date_trunc('month', ca.fecha_decision), 'YYYY-MM') AS mes,
            COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE ca.decision = 'APROBADO')::int AS aprobadas,
            COUNT(*) FILTER (WHERE ca.decision = 'RECHAZADO')::int AS rechazadas
     FROM cambio_aprobacion ca
     WHERE ca.id_usuario_aprobador = $1 AND ca.estado_registro = true
       AND ca.fecha_decision >= now() - interval '6 months'
     GROUP BY 1 ORDER BY 1`,
    [idUsuario]
  );

  const total = resumen?.total ?? 0;
  const aprobadas = resumen?.aprobadas ?? 0;
  return {
    resumen: {
      total,
      aprobadas,
      rechazadas: resumen?.rechazadas ?? 0,
      observadas: resumen?.observadas ?? 0,
      tasa_aprobacion: total > 0 ? Math.round((aprobadas / total) * 100) : null,
      horas_promedio: resumen?.horas_promedio !== null && resumen?.horas_promedio !== undefined ? Number(resumen.horas_promedio) : null,
    },
    porMes,
  };
}
