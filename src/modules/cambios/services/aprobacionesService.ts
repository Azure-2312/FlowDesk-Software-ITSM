import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { UMBRAL_MONTO_APROBACION as UMBRAL_MONTO } from "@/shared/lib/parametros";

/**
 * Decisiones del Aprobador (perfil 7 / CAB): cambios (RFC/ECAB), delegaciones
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
       AND NOT EXISTS (SELECT 1 FROM cambio_aprobacion ca
                       WHERE ca.id_cambio = c.id_cambio AND ca.id_usuario_aprobador = $1 AND ca.estado_registro = true)
     ORDER BY c.ventana_inicio ASC`,
    [idUsuario]
  );
}

export async function resolverCambio(idUsuario: number, idCambio: number, decision: string, comentario?: string) {
  let normalizada = String(decision || "").toUpperCase();
  let comentarioFinal = String(comentario || "").trim();
  if (normalizada === "APROBADO_CON_CONDICIONES") {
    normalizada = "APROBADO";
    comentarioFinal = `Condiciones: ${comentarioFinal}`;
  }
  if (!["APROBADO", "RECHAZADO", "OBSERVADO"].includes(normalizada)) {
    throw new ErrorDominio("La decisión debe ser APROBADO, RECHAZADO, OBSERVADO o APROBADO_CON_CONDICIONES.");
  }
  if (comentarioFinal.length < 3) throw new ErrorDominio("El comentario de la decisión es obligatorio.");

  const cambio = await queryRow<{ id_estado: number }>(
    `SELECT id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);

  const existente = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM cambio_aprobacion WHERE id_cambio = $1 AND id_usuario_aprobador = $2 AND estado_registro = true) AS existe`,
    [idCambio, idUsuario]
  );
  if (existente?.existe) throw new ErrorDominio("Ya registraste una decisión para este cambio.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO cambio_aprobacion (id_cambio, id_usuario_aprobador, decision, comentario)
     VALUES ($1, $2, $3, $4)
     RETURNING id_cambio_aprobacion, decision, fecha_decision`,
    [idCambio, idUsuario, normalizada, comentarioFinal]
  );

  if (normalizada === "APROBADO") {
    await query(`UPDATE cambio SET id_estado = 3 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  } else if (normalizada === "RECHAZADO") {
    await query(`UPDATE cambio SET id_estado = 8 WHERE id_cambio = $1 AND id_estado = 2`, [idCambio]);
  }

  return { mensaje: "Decisión registrada.", aprobacion: fila };
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
    `SELECT tipo, referencia, titulo, decision, comentario, fecha_decision FROM (
       SELECT 'RFC' AS tipo, c.codigo_cambio AS referencia, c.titulo, ca.decision, ca.comentario, ca.fecha_decision
       FROM cambio_aprobacion ca JOIN cambio c ON c.id_cambio = ca.id_cambio
       WHERE ca.id_usuario_aprobador = $1 AND ca.estado_registro = true
       UNION ALL
       SELECT 'ECAB', c.codigo_cambio, c.titulo, e.decision, e.condiciones, e.fecha_decision
       FROM ecab_decision e JOIN cambio c ON c.id_cambio = e.id_cambio
       WHERE e.id_aprobador = $1 AND e.estado_registro = true
       UNION ALL
       SELECT 'MONTO',
              CASE am.tipo WHEN 'BAJA' THEN 'Baja activo #' || am.id_referencia ELSE 'Renovación licencia #' || am.id_referencia END,
              am.tipo, am.decision, am.comentario, am.fecha_decision
       FROM aprobacion_monto am
       WHERE am.id_aprobador = $1
       UNION ALL
       SELECT 'PROBLEMA', p.codigo_problema, p.titulo, pc.decision, pc.comentario, pc.fecha_decision
       FROM problema_cierre_aprobacion pc JOIN problema p ON p.id_problema = pc.id_problema
       WHERE pc.id_aprobador = $1
     ) d
     ORDER BY fecha_decision DESC`,
    [idUsuario]
  );
}

export async function listarDelegaciones(idUsuario: number) {
  return query(
    `SELECT d.id_delegacion, d.fecha_desde, d.fecha_hasta, d.motivo, d.fecha_creacion,
            d.id_usuario_delegado,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS delegado_nombre
     FROM aprobacion_delegacion d
     JOIN usuario u ON u.id_usuario = d.id_usuario_delegado
     WHERE d.id_usuario_delegante = $1 AND d.estado_registro = true
     ORDER BY d.fecha_desde DESC`,
    [idUsuario]
  );
}

export async function listarPosiblesDelegados() {
  return query(
    `SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre
     FROM usuario u
     JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
     WHERE up.id_perfil = 7 AND u.estado_registro = true
     ORDER BY u.apellido_paterno, u.nombres`
  );
}

export async function crearDelegacion(idUsuario: number, body: any) {
  const idDelegado = Number(body.id_usuario_delegado);
  const desde = body.fecha_desde;
  const hasta = body.fecha_hasta;
  if (!idDelegado || !desde || !hasta) throw new ErrorDominio("Debes indicar el suplente y el rango de fechas.");
  if (new Date(hasta).getTime() < new Date(desde).getTime()) {
    throw new ErrorDominio("La fecha de fin debe ser posterior o igual a la de inicio.");
  }
  if (idDelegado === idUsuario) throw new ErrorDominio("No puedes delegarte a ti mismo.");

  const pertenece = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM usuario_perfiles WHERE id_usuario = $1 AND id_perfil = 7 AND estado_registro = true
     ) AS existe`,
    [idDelegado]
  );
  if (!pertenece?.existe) throw new ErrorDominio("El suplente debe tener el perfil Aprobador.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO aprobacion_delegacion (id_usuario_delegante, id_usuario_delegado, fecha_desde, fecha_hasta, motivo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_delegacion, id_usuario_delegado, fecha_desde, fecha_hasta, motivo`,
    [idUsuario, idDelegado, desde, hasta, body.motivo ?? null]
  );
  return { mensaje: "Delegación registrada.", delegacion: fila };
}

export async function eliminarDelegacion(idUsuario: number, idDelegacion: number) {
  const fila = await queryRow<any>(
    `UPDATE aprobacion_delegacion SET estado_registro = false
     WHERE id_delegacion = $1 AND id_usuario_delegante = $2 AND estado_registro = true
     RETURNING id_delegacion`,
    [idDelegacion, idUsuario]
  );
  if (!fila) throw new ErrorDominio("La delegación no existe.", 404);
  return { mensaje: "Delegación eliminada." };
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
