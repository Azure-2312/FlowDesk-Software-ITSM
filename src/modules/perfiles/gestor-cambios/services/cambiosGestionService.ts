import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { validarTexto } from "@/shared/lib/validaciones";

/**
 * Servicio del portal del Gestor de Cambios (perfil 8). Cubre la evaluación de
 * RFC, el seguimiento de autorizaciones, la programación, la ejecución, la PIR,
 * los modelos estándar y los reportes del proceso de cambios.
 */

const ESTADO_CASE = `CASE c.id_estado
  WHEN 1 THEN 'Registrado' WHEN 2 THEN 'Evaluación CAB' WHEN 3 THEN 'Aprobado'
  WHEN 4 THEN 'En Planificación' WHEN 5 THEN 'En Ejecución' WHEN 6 THEN 'Exitoso'
  WHEN 7 THEN 'Fallido' WHEN 8 THEN 'Cancelado' ELSE 'Desconocido' END`;

/** Días de plazo normativo para realizar la PIR tras el cierre del cambio. */
export const PLAZO_PIR_DIAS = 5;

export async function obtenerPanelGestion() {
  const [porEvaluar, autorizaciones, cambiosHoy, pirVencidas, emergenciasAbiertas] = await Promise.all([
    queryRow<{ c: number }>(`SELECT COUNT(*)::int AS c FROM cambio WHERE estado_registro = true AND id_estado = 1`),
    queryRow<{ c: number }>(`SELECT COUNT(*)::int AS c FROM cambio WHERE estado_registro = true AND id_estado = 2`),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cambio
       WHERE estado_registro = true AND id_estado IN (4, 5) AND ventana_inicio::date = CURRENT_DATE`
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cambio
       WHERE estado_registro = true AND id_estado IN (6, 7) AND resultado_pir IS NULL
         AND COALESCE(fecha_modificacion, fecha_creacion) < now() - ($1 || ' days')::interval`,
      [PLAZO_PIR_DIAS]
    ),
    queryRow<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM cambio
       WHERE estado_registro = true AND tipo_cambio = 'EMERGENCIA' AND id_estado NOT IN (6, 7, 8)`
    ),
  ]);

  const conflictos = await queryRow<{ c: number }>(
    `SELECT COUNT(*)::int AS c FROM cambio a
     JOIN cambio b ON a.id_cambio < b.id_cambio
     WHERE a.estado_registro = true AND b.estado_registro = true
       AND a.id_estado IN (3, 4, 5) AND b.id_estado IN (3, 4, 5)
       AND a.ventana_inicio IS NOT NULL AND a.ventana_fin IS NOT NULL
       AND b.ventana_inicio IS NOT NULL AND b.ventana_fin IS NOT NULL
       AND a.ventana_inicio < b.ventana_fin AND b.ventana_inicio < a.ventana_fin`
  );

  const proximos = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, ${ESTADO_CASE} AS estado_nombre,
            c.ventana_inicio, c.ventana_fin, c.tipo_cambio,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS responsable_nombre
     FROM cambio c
     LEFT JOIN usuario u ON u.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true AND c.id_estado IN (3, 4, 5) AND c.ventana_inicio >= now()
     ORDER BY c.ventana_inicio ASC LIMIT 8`
  );

  return {
    kpis: {
      por_evaluar: porEvaluar?.c ?? 0,
      autorizaciones_pendientes: autorizaciones?.c ?? 0,
      cambios_hoy: cambiosHoy?.c ?? 0,
      conflictos: conflictos?.c ?? 0,
      pir_vencidas: pirVencidas?.c ?? 0,
      emergencias_abiertas: emergenciasAbiertas?.c ?? 0,
    },
    proximos,
  };
}

export async function listarEvaluacion() {
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.descripcion, c.tipo_cambio,
            ${ESTADO_CASE} AS estado_nombre, c.justificacion, c.fecha_creacion,
            it.nombre AS impacto_nombre, it.nivel AS impacto_nivel,
            pt.nombre AS prioridad_nombre, pt.nivel AS prioridad_nivel,
            ci.codigo_ci, ci.nombre AS ci_nombre,
            CONCAT(us.nombres, ' ', us.apellido_paterno) AS solicitante_nombre,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS evaluador_nombre,
            (SELECT COUNT(*)::int FROM cambio_aprobacion ca WHERE ca.id_cambio = c.id_cambio AND ca.estado_registro = true) AS votos
     FROM cambio c
     LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
     LEFT JOIN prioridad_ticket pt ON pt.id_prioridad = c.id_prioridad
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = c.id_ci_afectado
     LEFT JOIN usuario us ON us.id_usuario = c.id_usuario_solicitante
     LEFT JOIN usuario ur ON ur.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true AND c.id_estado = 1
     ORDER BY c.fecha_creacion ASC`
  );
}

export async function listarEvaluadores() {
  return query(
    `SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) AS nombre
     FROM usuario u
     JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario AND up.estado_registro = true
     WHERE u.estado_registro = true AND up.id_perfil IN (2, 8)
     ORDER BY u.apellido_paterno, u.nombres`
  );
}

export async function asignarEvaluador(idCambio: number, idEvaluador: number) {
  if (!idEvaluador) throw new ErrorDominio("Debes seleccionar un evaluador.");
  const cambio = await queryRow<{ id_estado: number }>(
    `SELECT id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  await query(`UPDATE cambio SET id_usuario_responsable = $1, fecha_modificacion = now() WHERE id_cambio = $2`, [idEvaluador, idCambio]);
  return { mensaje: "Evaluador asignado." };
}

export async function enviarAAutorizacion(idCambio: number) {
  const cambio = await queryRow<{ id_estado: number }>(
    `SELECT id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (cambio.id_estado !== 1) throw new ErrorDominio("Solo se envían a autorización las RFC registradas.", 409);
  await query(`UPDATE cambio SET id_estado = 2, fecha_modificacion = now() WHERE id_cambio = $1`, [idCambio]);
  return { mensaje: "RFC enviada al circuito de autorización." };
}

export async function listarAutorizaciones() {
  const cambios = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, ${ESTADO_CASE} AS estado_nombre,
            c.fecha_creacion, c.fecha_modificacion, c.ventana_inicio, c.ventana_fin,
            it.nombre AS impacto_nombre,
            EXTRACT(EPOCH FROM (now() - COALESCE(c.fecha_modificacion, c.fecha_creacion))) / 86400 AS dias_pendiente,
            (SELECT COUNT(*)::int FROM cambio_aprobacion ca WHERE ca.id_cambio = c.id_cambio AND ca.estado_registro = true AND ca.decision = 'APROBADO') AS aprobados,
            (SELECT COUNT(*)::int FROM cambio_aprobacion ca WHERE ca.id_cambio = c.id_cambio AND ca.estado_registro = true AND ca.decision = 'RECHAZADO') AS rechazados,
            (SELECT COUNT(*)::int FROM cambio_aprobacion ca WHERE ca.id_cambio = c.id_cambio AND ca.estado_registro = true AND ca.decision = 'OBSERVADO') AS observados
     FROM cambio c
     LEFT JOIN impacto_ticket it ON it.id_impacto = c.id_impacto
     WHERE c.estado_registro = true AND c.id_estado = 2
     ORDER BY c.fecha_creacion ASC`
  );

  const detalle = await query(
    `SELECT ca.id_cambio, ca.decision, ca.comentario, ca.fecha_decision,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS aprobador_nombre
     FROM cambio_aprobacion ca
     LEFT JOIN usuario u ON u.id_usuario = ca.id_usuario_aprobador
     WHERE ca.estado_registro = true
     ORDER BY ca.fecha_decision DESC`
  );

  return { cambios, detalle };
}

export async function registrarRecordatorio(idUsuario: number, idCambio: number, tipo: string) {
  const cambio = await queryRow<{ codigo_cambio: string }>(
    `SELECT codigo_cambio FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);

  const accion = String(tipo || "RECORDATORIO").toUpperCase() === "ESCALAMIENTO" ? "ESCALAMIENTO" : "RECORDATORIO";
  await query(
    `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion)
     VALUES ($1, 'cambios', $2, $3)`,
    [idUsuario, accion, `${accion} de autorización para la RFC ${cambio.codigo_cambio}`]
  );
  return { mensaje: accion === "ESCALAMIENTO" ? "Escalamiento registrado." : "Recordatorio registrado." };
}

export async function listarExcepciones() {
  return query(
    `SELECT e.id_excepcion, e.tipo, e.motivo, e.fecha_creacion,
            c.codigo_cambio, c.titulo,
            CONCAT(u.nombres, ' ', u.apellido_paterno) AS autoriza_nombre
     FROM cambio_excepcion e
     JOIN cambio c ON c.id_cambio = e.id_cambio
     LEFT JOIN usuario u ON u.id_usuario = e.id_usuario_autoriza
     WHERE e.estado_registro = true
     ORDER BY e.fecha_creacion DESC`
  );
}

export async function crearExcepcion(idUsuario: number, body: any) {
  const idCambio = Number(body.id_cambio);
  const tipo = String(body.tipo || "").toUpperCase();
  if (!idCambio) throw new ErrorDominio("Debes indicar la RFC.");
  if (!["CONFLICTO", "CONGELAMIENTO", "RECLASIFICACION"].includes(tipo)) {
    throw new ErrorDominio("El tipo de excepción no es válido.");
  }
  const vMotivo = validarTexto(body.motivo, 5, 2000, "El motivo de la excepción", true);
  if (!vMotivo.valido) throw new ErrorDominio(vMotivo.mensaje!);

  const cambio = await queryRow<{ id_cambio: number }>(
    `SELECT id_cambio FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);

  if (tipo === "RECLASIFICACION") {
    const nuevoTipo = String(body.nuevo_tipo || "").toUpperCase();
    if (!["ESTANDAR", "NORMAL", "EMERGENCIA"].includes(nuevoTipo)) {
      throw new ErrorDominio("Indica el nuevo tipo de cambio (ESTANDAR, NORMAL o EMERGENCIA).");
    }
    await query(`UPDATE cambio SET tipo_cambio = $1, fecha_modificacion = now() WHERE id_cambio = $2`, [nuevoTipo, idCambio]);
  }

  const fila = await queryRow<any>(
    `INSERT INTO cambio_excepcion (id_cambio, tipo, motivo, id_usuario_autoriza)
     VALUES ($1, $2, $3, $4)
     RETURNING id_excepcion, tipo, fecha_creacion`,
    [idCambio, tipo, String(body.motivo).trim(), idUsuario]
  );
  return { mensaje: "Excepción registrada.", excepcion: fila };
}

export async function listarProgramacion() {
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, ${ESTADO_CASE} AS estado_nombre,
            c.ventana_inicio, c.ventana_fin, c.fecha_creacion,
            ci.codigo_ci, ci.nombre AS ci_nombre,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable_nombre
     FROM cambio c
     LEFT JOIN elemento_configuracion ci ON ci.id_ci = c.id_ci_afectado
     LEFT JOIN usuario ur ON ur.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true AND c.id_estado IN (3, 4)
     ORDER BY c.ventana_inicio ASC NULLS LAST, c.fecha_creacion ASC`
  );
}

export async function programarCambio(idCambio: number, body: any) {
  const inicio = body.ventana_inicio;
  const fin = body.ventana_fin;
  if (!inicio || !fin) throw new ErrorDominio("Debes indicar la ventana de inicio y fin.");
  if (new Date(fin).getTime() <= new Date(inicio).getTime()) {
    throw new ErrorDominio("La ventana de fin debe ser posterior al inicio.");
  }
  const cambio = await queryRow<{ id_estado: number }>(
    `SELECT id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (![3, 4].includes(cambio.id_estado)) throw new ErrorDominio("Solo se programan RFC autorizadas.", 409);

  const idResponsable = body.id_usuario_responsable ? Number(body.id_usuario_responsable) : null;
  await query(
    `UPDATE cambio
     SET ventana_inicio = $1, ventana_fin = $2,
         id_usuario_responsable = COALESCE($3, id_usuario_responsable),
         id_estado = 4, fecha_modificacion = now()
     WHERE id_cambio = $4`,
    [inicio, fin, idResponsable, idCambio]
  );
  return { mensaje: "RFC programada en el calendario." };
}

export async function listarEjecucion() {
  const enEjecucion = await query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, ${ESTADO_CASE} AS estado_nombre,
            c.ventana_inicio, c.ventana_fin,
            (now() > c.ventana_fin) AS ventana_excedida,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable_nombre
     FROM cambio c
     LEFT JOIN usuario ur ON ur.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true AND c.id_estado = 5
     ORDER BY c.ventana_inicio ASC`
  );
  return { enEjecucion };
}

export async function extenderVentana(idUsuario: number, idCambio: number, nuevaFechaFin: string, motivo: string) {
  if (!nuevaFechaFin) throw new ErrorDominio("Debes indicar la nueva fecha de fin de ventana.");
  const vMotivo = validarTexto(motivo, 5, 2000, "El motivo de la extensión", true);
  if (!vMotivo.valido) throw new ErrorDominio(vMotivo.mensaje!);

  const cambio = await queryRow<{ codigo_cambio: string; id_estado: number }>(
    `SELECT codigo_cambio, id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (cambio.id_estado !== 5) throw new ErrorDominio("Solo se extienden cambios en ejecución.", 409);

  await query(`UPDATE cambio SET ventana_fin = $1, fecha_modificacion = now() WHERE id_cambio = $2`, [nuevaFechaFin, idCambio]);
  await query(
    `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion)
     VALUES ($1, 'cambios', 'EXTENSION_VENTANA', $2)`,
    [idUsuario, `Extensión de ventana de la RFC ${cambio.codigo_cambio}: ${String(motivo).trim()}`]
  );
  return { mensaje: "Ventana extendida." };
}

export async function resolverEjecucion(idUsuario: number, idCambio: number, resultado: string, motivo?: string) {
  const normalizado = String(resultado || "").toUpperCase();
  if (!["EXITOSO", "FALLIDO", "ROLLBACK"].includes(normalizado)) {
    throw new ErrorDominio("El resultado debe ser EXITOSO, FALLIDO o ROLLBACK.");
  }
  const cambio = await queryRow<{ codigo_cambio: string; id_estado: number }>(
    `SELECT codigo_cambio, id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (cambio.id_estado !== 5) throw new ErrorDominio("Solo se cierran cambios en ejecución.", 409);

  const nuevoEstado = normalizado === "EXITOSO" ? 6 : 7;
  await query(`UPDATE cambio SET id_estado = $1, fecha_modificacion = now() WHERE id_cambio = $2`, [nuevoEstado, idCambio]);

  if (normalizado !== "EXITOSO") {
    await query(
      `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion)
       VALUES ($1, 'cambios', $2, $3)`,
      [idUsuario, normalizado === "ROLLBACK" ? "ROLLBACK" : "CAMBIO_FALLIDO", `RFC ${cambio.codigo_cambio}: ${motivo ?? "sin detalle"}`]
    );
  }
  return { mensaje: "Resultado de implementación registrado." };
}

export async function listarPir() {
  return query(
    `SELECT c.id_cambio, c.codigo_cambio, c.titulo, c.tipo_cambio, ${ESTADO_CASE} AS estado_nombre,
            c.resultado_pir, c.incidentes_inducidos, c.fecha_modificacion, c.fecha_creacion,
            EXTRACT(EPOCH FROM (now() - COALESCE(c.fecha_modificacion, c.fecha_creacion))) / 86400 AS dias_desde_cierre,
            CONCAT(ur.nombres, ' ', ur.apellido_paterno) AS responsable_nombre
     FROM cambio c
     LEFT JOIN usuario ur ON ur.id_usuario = c.id_usuario_responsable
     WHERE c.estado_registro = true AND c.id_estado IN (6, 7)
     ORDER BY c.fecha_modificacion DESC NULLS LAST`
  );
}

export async function registrarPir(idCambio: number, resultado: string, incidentesInducidos: number) {
  const vResultado = validarTexto(resultado, 10, 8000, "El resultado de la PIR", true);
  if (!vResultado.valido) throw new ErrorDominio(vResultado.mensaje!);
  const cambio = await queryRow<{ id_estado: number }>(
    `SELECT id_estado FROM cambio WHERE id_cambio = $1 AND estado_registro = true`,
    [idCambio]
  );
  if (!cambio) throw new ErrorDominio("El cambio no existe.", 404);
  if (![6, 7].includes(cambio.id_estado)) throw new ErrorDominio("La PIR aplica a cambios cerrados (exitosos o fallidos).", 409);

  await query(
    `UPDATE cambio SET resultado_pir = $1, incidentes_inducidos = $2, fecha_modificacion = now() WHERE id_cambio = $3`,
    [String(resultado).trim(), Number(incidentesInducidos) || 0, idCambio]
  );
  return { mensaje: "PIR registrada." };
}

export async function listarModelos() {
  return query(
    `SELECT id_modelo, codigo, nombre, descripcion, estado, version_modelo,
            riesgo_fijo, autorizacion_automatica, veces_usado, veces_exitoso, veces_fallido,
            umbral_tasa_fallo_pct, umbral_fallos_consecutivos, ultimo_uso, fecha_creacion
     FROM cambio_modelo_estandar
     ORDER BY nombre`
  );
}

export async function proponerModelo(idUsuario: number, body: any) {
  const vCodigo = validarTexto(body.codigo, 3, 30, "El código del modelo", true);
  if (!vCodigo.valido) throw new ErrorDominio(vCodigo.mensaje!);
  const vNombre = validarTexto(body.nombre, 5, 200, "El nombre del modelo", true);
  if (!vNombre.valido) throw new ErrorDominio(vNombre.mensaje!);

  const codigo = String(body.codigo).trim().toUpperCase();
  const existe = await queryRow<{ existe: boolean }>(
    `SELECT EXISTS (SELECT 1 FROM cambio_modelo_estandar WHERE codigo = $1) AS existe`,
    [codigo]
  );
  if (existe?.existe) throw new ErrorDominio("Ya existe un modelo con ese código.", 409);

  const fila = await queryRow<any>(
    `INSERT INTO cambio_modelo_estandar (codigo, nombre, descripcion, estado, version_modelo, autorizacion_automatica, usuario_creacion)
     VALUES ($1, $2, $3, 'BORRADOR', '1.0', false, $4)
     RETURNING id_modelo, codigo, nombre, estado`,
    [codigo, String(body.nombre).trim(), body.descripcion ?? null, idUsuario]
  );
  return { mensaje: "Modelo propuesto (borrador).", modelo: fila };
}

export async function cambiarEstadoModelo(idModelo: number, estado: string) {
  const normalizado = String(estado || "").toUpperCase();
  if (!["BORRADOR", "PUBLICADO", "SUSPENDIDO", "ARCHIVADO"].includes(normalizado)) {
    throw new ErrorDominio("Estado de modelo no válido.");
  }
  const fila = await queryRow<any>(
    `UPDATE cambio_modelo_estandar SET estado = $1, fecha_modificacion = now()
     WHERE id_modelo = $2 RETURNING id_modelo, estado`,
    [normalizado, idModelo]
  );
  if (!fila) throw new ErrorDominio("El modelo no existe.", 404);
  return { mensaje: "Estado del modelo actualizado.", modelo: fila };
}

export async function obtenerReportesCambios() {
  const resumen = await queryRow<any>(
    `SELECT
       COUNT(*)::int AS total,
       COUNT(*) FILTER (WHERE id_estado = 6)::int AS exitosos,
       COUNT(*) FILTER (WHERE id_estado = 7)::int AS fallidos,
       COUNT(*) FILTER (WHERE tipo_cambio = 'EMERGENCIA')::int AS emergencias,
       COALESCE(SUM(incidentes_inducidos), 0)::int AS incidentes_inducidos,
       ROUND(AVG(EXTRACT(EPOCH FROM (COALESCE(fecha_modificacion, fecha_creacion) - fecha_creacion)) / 3600)::numeric, 1) AS horas_ciclo_promedio
     FROM cambio WHERE estado_registro = true`
  );

  const cumplimientoVentana = await queryRow<any>(
    `SELECT
       COUNT(*) FILTER (WHERE id_estado = 6 AND ventana_inicio IS NOT NULL AND ventana_fin IS NOT NULL)::int AS cerrados_con_ventana,
       COUNT(*) FILTER (WHERE id_estado = 6 AND ventana_inicio IS NOT NULL AND ventana_fin IS NOT NULL
                              AND COALESCE(fecha_modificacion, fecha_creacion) <= ventana_fin)::int AS dentro_de_ventana
     FROM cambio WHERE estado_registro = true`
  );

  const porTipo = await query(
    `SELECT tipo_cambio, COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE id_estado = 6)::int AS exitosos,
            COUNT(*) FILTER (WHERE id_estado = 7)::int AS fallidos
     FROM cambio WHERE estado_registro = true
     GROUP BY tipo_cambio ORDER BY total DESC`
  );

  const total = resumen?.total ?? 0;
  const cerrados = (resumen?.exitosos ?? 0) + (resumen?.fallidos ?? 0);
  const conVentana = cumplimientoVentana?.cerrados_con_ventana ?? 0;
  const dentro = cumplimientoVentana?.dentro_de_ventana ?? 0;

  return {
    resumen: {
      total,
      exitosos: resumen?.exitosos ?? 0,
      fallidos: resumen?.fallidos ?? 0,
      emergencias: resumen?.emergencias ?? 0,
      incidentes_inducidos: resumen?.incidentes_inducidos ?? 0,
      horas_ciclo_promedio: resumen?.horas_ciclo_promedio !== null && resumen?.horas_ciclo_promedio !== undefined ? Number(resumen.horas_ciclo_promedio) : null,
      tasa_exito: cerrados > 0 ? Math.round(((resumen?.exitosos ?? 0) / cerrados) * 100) : null,
      cumplimiento_ventana: conVentana > 0 ? Math.round((dentro / conVentana) * 100) : null,
    },
    porTipo,
  };
}
