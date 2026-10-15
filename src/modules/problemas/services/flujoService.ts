import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

const MODULO = "problemas";
const PANTALLA = "1.3.4.2";

/* ------------------------------------------------------------------ */
/* Flujo (vista consolidada + versionado)                              */
/* ------------------------------------------------------------------ */

export async function obtenerFlujo(pestana: string) {
  const [
    estados,
    transiciones,
    reglasAsignacion,
    objetivosTiempo,
    reglasEscalamiento,
    configReapertura,
    tareas,
    paquetesTareas,
    criteriosMayor,
    configMayor,
    departamentosTI,
    perfiles,
    versionPublicada,
    borradorActivo,
  ] = await Promise.all([
    query<any>(`
        SELECT e.*,
          (SELECT COUNT(*) FROM problema p WHERE p.id_estado = e.id_estado) as usos_tickets
        FROM problema_estado e
        ORDER BY e.orden ASC
      `),
    query<any>(`
        SELECT t.*, 
          eo.nombre as origen_nombre, eo.codigo as origen_codigo, eo.color as origen_color,
          ed.nombre as destino_nombre, ed.codigo as destino_codigo, ed.color as destino_color
        FROM problema_transicion t
        JOIN problema_estado eo ON eo.id_estado = t.estado_origen_id
        JOIN problema_estado ed ON ed.id_estado = t.estado_destino_id
        ORDER BY t.orden ASC
      `),
    query<any>(`
        SELECT r.*, d.nombre as departamento_nombre, CONCAT(u.nombres, ' ', u.apellido_paterno) as tecnico_nombre
        FROM problema_regla_asignacion r
        LEFT JOIN departamento_ti d ON d.id_departamento = r.id_departamento_destino
        LEFT JOIN usuario u ON u.id_usuario = r.id_tecnico_fijo
        ORDER BY r.orden ASC
      `),
    query<any>(`
        SELECT ot.*, p.codigo as prioridad_codigo, p.nombre as prioridad_nombre, p.color as prioridad_color, p.nivel as prioridad_nivel
        FROM problema_objetivo_tiempo ot
        JOIN prioridad_ticket p ON p.id_prioridad = ot.id_prioridad
        ORDER BY p.nivel ASC
      `),
    query<any>(`SELECT * FROM problema_regla_escalamiento ORDER BY id_escalamiento ASC`),
    queryRow<any>(`SELECT * FROM problema_config_reapertura WHERE id = 1`),
    query<any>(`
        SELECT tc.*, d.nombre as departamento_nombre
        FROM problema_tarea_catalogo tc
        LEFT JOIN departamento_ti d ON d.id_departamento = tc.id_departamento_destino
        ORDER BY tc.id_tarea ASC
      `),
    query<any>(`SELECT * FROM problema_tarea_paquete ORDER BY id_paquete ASC`),
    query<any>(`SELECT * FROM problema_criterio_mayor ORDER BY id_criterio ASC`),
    queryRow<any>(`SELECT * FROM problema_config_mayor WHERE id = 1`),
    query<any>("SELECT id_departamento, nombre FROM departamento_ti ORDER BY nombre ASC"),
    query<any>("SELECT id_perfil, nombre FROM perfiles WHERE estado_registro = true ORDER BY id_perfil ASC"),
    queryRow<any>(
      `SELECT * FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1`,
      [pestana]
    ),
    queryRow<any>(
      `SELECT * FROM configuracion_modulo_versiones
        WHERE modulo = 'problemas' AND pantalla = '1.3.4.2' AND pestana = $1 AND es_borrador = true
        ORDER BY id_version DESC LIMIT 1`,
      [pestana]
    ),
  ]);

  return {
    ok: true,
    estados,
    transiciones,
    reglas_asignacion: reglasAsignacion,
    objetivos_tiempo: objetivosTiempo,
    reglas_escalamiento: reglasEscalamiento,
    config_reapertura: configReapertura || { permitir_reapertura: true },
    tareas,
    paquetes_tareas: paquetesTareas,
    criterios_mayor: criteriosMayor,
    config_mayor: configMayor || { exigir_revision_cierre: true },
    departamentos_ti: departamentosTI,
    perfiles,
    version_publicada: versionPublicada,
    hay_borrador: !!borradorActivo,
    borrador: borradorActivo,
  };
}

export async function guardarBorradorFlujo(pestana: string, datos: unknown, idUsuario: number) {
  const borradorExistente = await queryRow<any>(
    `SELECT id_version FROM configuracion_modulo_versiones
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3 AND es_borrador = true
         ORDER BY id_version DESC LIMIT 1`,
    [MODULO, PANTALLA, pestana]
  );

  const ultimaPublicada = await queryRow<any>(
    `SELECT numero_version FROM configuracion_modulo_versiones
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3 AND es_publicada = true
         ORDER BY numero_version DESC LIMIT 1`,
    [MODULO, PANTALLA, pestana]
  );

  const nuevoNumero = (ultimaPublicada?.numero_version || 1) + 1;

  if (borradorExistente) {
    await query(
      `UPDATE configuracion_modulo_versiones
           SET snapshot = $1, fecha_creacion = NOW(), id_usuario_creacion = $2
           WHERE id_version = $3`,
      [JSON.stringify(datos || {}), idUsuario, borradorExistente.id_version]
    );
  } else {
    await query(
      `INSERT INTO configuracion_modulo_versiones (
            modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, id_usuario_creacion, fecha_creacion
          ) VALUES ($1, $2, $3, $4, false, true, $5, $6, NOW())`,
      [MODULO, PANTALLA, pestana, nuevoNumero, JSON.stringify(datos || {}), idUsuario]
    );
  }

  return { ok: true, mensaje: "Borrador guardado exitosamente" };
}

export async function publicarFlujo(pestana: string, motivo: string | undefined, idUsuario: number) {
  if (!motivo || motivo.trim().length < 10) {
    throw new ErrorDominio(
      "El motivo del cambio es obligatorio y debe tener al menos 10 caracteres."
    );
  }

  // Validaciones del Flujo (Sección 7.2 de la spec):
  // 1. Todo estado no final tiene al menos 1 transición de salida
  const estadosNoFinales = await query<any>(
    "SELECT id_estado, nombre FROM problema_estado WHERE tipo NOT IN ('final') AND activo = true"
  );
  for (const est of estadosNoFinales) {
    const transSalida = await queryRow<any>(
      "SELECT COUNT(*)::int as count FROM problema_transicion WHERE estado_origen_id = $1 AND activa = true",
      [est.id_estado]
    );
    if ((transSalida?.count || 0) === 0) {
      throw new ErrorDominio(
        `Regla de Flujo Violada: El estado '${est.nombre}' no tiene ninguna transición de salida activa.`
      );
    }
  }

  // 2. Debe existir exactamente 1 estado Inicial
  const iniciales = await query<any>(
    "SELECT id_estado FROM problema_estado WHERE tipo = 'inicial' AND activo = true"
  );
  if (iniciales.length !== 1) {
    throw new ErrorDominio(
      `Regla de Flujo Violada: Debe existir exactamente 1 estado de tipo Inicial (actualmente hay ${iniciales.length}).`
    );
  }

  // Obtener snapshot actual
  const borrador = await queryRow<any>(
    `SELECT * FROM configuracion_modulo_versiones
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3 AND es_borrador = true
         ORDER BY id_version DESC LIMIT 1`,
    [MODULO, PANTALLA, pestana]
  );

  const ultimaPublicada = await queryRow<any>(
    `SELECT numero_version FROM configuracion_modulo_versiones
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3 AND es_publicada = true
         ORDER BY numero_version DESC LIMIT 1`,
    [MODULO, PANTALLA, pestana]
  );

  const nuevoNumero = (ultimaPublicada?.numero_version || 1) + 1;
  const snapshot = borrador?.snapshot || {};

  // Marcar versiones anteriores como no publicadas
  await query(
    `UPDATE configuracion_modulo_versiones SET es_publicada = false
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3`,
    [MODULO, PANTALLA, pestana]
  );

  // Eliminar borrador
  await query(
    `DELETE FROM configuracion_modulo_versiones
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3 AND es_borrador = true`,
    [MODULO, PANTALLA, pestana]
  );

  // Crear versión oficial publicada
  const nuevaVersion = await queryRow<any>(
    `INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, motivo, id_usuario_creacion, fecha_creacion
        ) VALUES ($1, $2, $3, $4, true, false, $5, $6, $7, NOW())
        RETURNING *`,
    [MODULO, PANTALLA, pestana, nuevoNumero, JSON.stringify(snapshot), motivo.trim(), idUsuario]
  );

  // Registrar en log de auditoría
  await query(
    `INSERT INTO log_auditoria_sistema (
          id_usuario, accion, modulo, detalles, ip, fecha
        ) VALUES ($1, 'PUBLICAR_FLUJO_PROBLEMAS', $2, $3, '127.0.0.1', NOW())`,
    [idUsuario, PANTALLA, `Publicada versión v${nuevoNumero} para pestaña ${pestana}. Motivo: ${motivo.trim()}`]
  );

  return { ok: true, version: nuevaVersion };
}

export async function descartarBorradorFlujo(pestana: string) {
  await query(
    `DELETE FROM configuracion_modulo_versiones
         WHERE modulo = $1 AND pantalla = $2 AND pestana = $3 AND es_borrador = true`,
    [MODULO, PANTALLA, pestana]
  );
  return { ok: true, mensaje: "Borrador descartado" };
}

/* ------------------------------------------------------------------ */
/* Estados                                                             */
/* ------------------------------------------------------------------ */

export async function crearEstadoProblema(body: any) {
  const {
    codigo,
    nombre,
    tipo,
    color = "#3b82f6",
    reloj_diagnostico = "corre",
    reloj_resolucion = "corre",
    cuenta_como_abierto = true,
    permite_edicion = "si",
    descripcion = "",
    orden = 1,
  } = body;

  if (!codigo || !nombre || !tipo) {
    throw new ErrorDominio("Código, nombre y tipo son obligatorios");
  }

  if (tipo === "inicial") {
    const existeInicial = await queryRow(
      "SELECT id_estado FROM problema_estado WHERE tipo = 'inicial' AND activo = true"
    );
    if (existeInicial) {
      throw new ErrorDominio("Solo puede existir exactamente 1 estado de tipo Inicial");
    }
  }

  return queryRow<any>(
    `INSERT INTO problema_estado (
        codigo, nombre, tipo, color, reloj_diagnostico, reloj_resolucion, cuenta_como_abierto, permite_edicion, descripcion, orden, es_sistema, activo
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, true)
      RETURNING *`,
    [
      codigo.trim().toLowerCase(),
      nombre.trim(),
      tipo,
      color,
      reloj_diagnostico,
      reloj_resolucion,
      cuenta_como_abierto,
      permite_edicion,
      descripcion,
      orden,
    ]
  );
}

export async function actualizarEstadoProblema(body: any) {
  const {
    id_estado,
    nombre,
    tipo,
    color,
    reloj_diagnostico,
    reloj_resolucion,
    cuenta_como_abierto,
    permite_edicion,
    descripcion,
    orden,
    activo,
  } = body;

  if (!id_estado) throw new ErrorDominio("ID requerido");

  const actual = await queryRow<any>("SELECT * FROM problema_estado WHERE id_estado = $1", [id_estado]);
  if (!actual) throw new ErrorDominio("Estado no encontrado", 404);

  if (actual.es_sistema && tipo && tipo !== actual.tipo) {
    throw new ErrorDominio("Los estados protegidos del sistema no pueden cambiar de tipo");
  }

  if (tipo === "inicial" && actual.tipo !== "inicial") {
    const otroInicial = await queryRow(
      "SELECT id_estado FROM problema_estado WHERE tipo = 'inicial' AND id_estado != $1 AND activo = true",
      [id_estado]
    );
    if (otroInicial) {
      throw new ErrorDominio("Solo puede existir exactamente 1 estado de tipo Inicial");
    }
  }

  return queryRow<any>(
    `UPDATE problema_estado
       SET nombre = COALESCE($1, nombre),
           tipo = COALESCE($2, tipo),
           color = COALESCE($3, color),
           reloj_diagnostico = COALESCE($4, reloj_diagnostico),
           reloj_resolucion = COALESCE($5, reloj_resolucion),
           cuenta_como_abierto = COALESCE($6, cuenta_como_abierto),
           permite_edicion = COALESCE($7, permite_edicion),
           descripcion = COALESCE($8, descripcion),
           orden = COALESCE($9, orden),
           activo = COALESCE($10, activo)
       WHERE id_estado = $11
       RETURNING *`,
    [
      nombre ? nombre.trim() : null,
      tipo || null,
      color || null,
      reloj_diagnostico || null,
      reloj_resolucion || null,
      cuenta_como_abierto !== undefined ? cuenta_como_abierto : null,
      permite_edicion || null,
      descripcion !== undefined ? descripcion : null,
      orden !== undefined ? orden : null,
      activo !== undefined ? activo : null,
      id_estado,
    ]
  );
}

export async function eliminarEstadoProblema(id: string) {
  const actual = await queryRow<any>("SELECT * FROM problema_estado WHERE id_estado = $1", [id]);
  if (!actual) throw new ErrorDominio("Estado no encontrado", 404);

  if (actual.es_sistema) {
    throw new ErrorDominio("Los estados requeridos por el sistema no pueden ser eliminados");
  }

  const uso = await queryRow<{ total: number }>(
    "SELECT COUNT(*)::int as total FROM problema WHERE estado_actual = $1",
    [actual.codigo]
  );
  if ((uso?.total || 0) > 0) {
    throw new ErrorDominio(
      `El estado '${actual.nombre}' tiene ${uso?.total} tickets asociados. Solo puede desactivarlo.`
    );
  }

  await query("DELETE FROM problema_transicion WHERE estado_origen_id = $1 OR estado_destino_id = $1", [id]);
  await query("DELETE FROM problema_estado WHERE id_estado = $1", [id]);

  return { ok: true, mensaje: "Estado eliminado exitosamente" };
}

/* ------------------------------------------------------------------ */
/* Transiciones                                                        */
/* ------------------------------------------------------------------ */

export async function crearTransicionProblema(body: any) {
  const {
    codigo,
    nombre,
    estado_origen_id,
    estado_destino_id,
    perfiles_autorizados = [],
    roles_contextuales = { responsable: true, grupo: true, supervisor: true },
    condiciones_previas = [],
    campos_requeridos = [],
    politica_comentario = "opcional",
    requiere_confirmacion = false,
    mensaje_confirmacion = "",
    requiere_aprobacion = false,
    aprobador_tipo = "supervisor_grupo",
    color_boton = "#2563eb",
    automatizaciones = [],
    orden = 1,
  } = body;

  if (!nombre || !estado_origen_id || !estado_destino_id) {
    throw new ErrorDominio("Nombre, estado origen y estado destino son obligatorios");
  }

  const codigoGenerado = codigo || `trn_${Date.now()}`;

  return queryRow<any>(
    `INSERT INTO problema_transicion (
        codigo, nombre, estado_origen_id, estado_destino_id, perfiles_autorizados,
        roles_contextuales, condiciones_previas, campos_requeridos, politica_comentario,
        requiere_confirmacion, mensaje_confirmacion, requiere_aprobacion, aprobador_tipo,
        color_boton, automatizaciones, activa, orden, es_sistema
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16, false)
      RETURNING *`,
    [
      codigoGenerado,
      nombre.trim(),
      estado_origen_id,
      estado_destino_id,
      JSON.stringify(perfiles_autorizados),
      JSON.stringify(roles_contextuales),
      JSON.stringify(condiciones_previas),
      JSON.stringify(campos_requeridos),
      politica_comentario,
      requiere_confirmacion,
      mensaje_confirmacion || null,
      requiere_aprobacion,
      aprobador_tipo,
      color_boton,
      JSON.stringify(automatizaciones),
      orden,
    ]
  );
}

export async function actualizarTransicionProblema(body: any) {
  const {
    id_transicion,
    nombre,
    estado_origen_id,
    estado_destino_id,
    perfiles_autorizados,
    roles_contextuales,
    condiciones_previas,
    campos_requeridos,
    politica_comentario,
    requiere_confirmacion,
    mensaje_confirmacion,
    requiere_aprobacion,
    aprobador_tipo,
    color_boton,
    automatizaciones,
    activa,
    orden,
  } = body;

  if (!id_transicion) throw new ErrorDominio("ID requerido");

  return queryRow<any>(
    `UPDATE problema_transicion
       SET nombre = COALESCE($1, nombre),
           estado_origen_id = COALESCE($2, estado_origen_id),
           estado_destino_id = COALESCE($3, estado_destino_id),
           perfiles_autorizados = COALESCE($4, perfiles_autorizados),
           roles_contextuales = COALESCE($5, roles_contextuales),
           condiciones_previas = COALESCE($6, condiciones_previas),
           campos_requeridos = COALESCE($7, campos_requeridos),
           politica_comentario = COALESCE($8, politica_comentario),
           requiere_confirmacion = COALESCE($9, requiere_confirmacion),
           mensaje_confirmacion = COALESCE($10, mensaje_confirmacion),
           requiere_aprobacion = COALESCE($11, requiere_aprobacion),
           aprobador_tipo = COALESCE($12, aprobador_tipo),
           color_boton = COALESCE($13, color_boton),
           automatizaciones = COALESCE($14, automatizaciones),
           activa = COALESCE($15, activa),
           orden = COALESCE($16, orden)
       WHERE id_transicion = $17
       RETURNING *`,
    [
      nombre ? nombre.trim() : null,
      estado_origen_id || null,
      estado_destino_id || null,
      perfiles_autorizados ? JSON.stringify(perfiles_autorizados) : null,
      roles_contextuales ? JSON.stringify(roles_contextuales) : null,
      condiciones_previas ? JSON.stringify(condiciones_previas) : null,
      campos_requeridos ? JSON.stringify(campos_requeridos) : null,
      politica_comentario || null,
      requiere_confirmacion !== undefined ? requiere_confirmacion : null,
      mensaje_confirmacion !== undefined ? mensaje_confirmacion : null,
      requiere_aprobacion !== undefined ? requiere_aprobacion : null,
      aprobador_tipo || null,
      color_boton || null,
      automatizaciones ? JSON.stringify(automatizaciones) : null,
      activa !== undefined ? activa : null,
      orden !== undefined ? orden : null,
      id_transicion,
    ]
  );
}

export async function eliminarTransicionProblema(id: string) {
  const actual = await queryRow<any>("SELECT es_sistema FROM problema_transicion WHERE id_transicion = $1", [id]);
  if (!actual) throw new ErrorDominio("Transición no encontrada", 404);

  if (actual.es_sistema) {
    throw new ErrorDominio(
      "Las transiciones institucionales no pueden eliminarse (desactívelas si es necesario)"
    );
  }

  await query("DELETE FROM problema_transicion WHERE id_transicion = $1", [id]);
  return { ok: true, mensaje: "Transición eliminada exitosamente" };
}

/* ------------------------------------------------------------------ */
/* Reglas de asignación                                                */
/* ------------------------------------------------------------------ */

export async function crearReglaAsignacion(body: any) {
  const {
    nombre,
    orden = 1,
    activa = true,
    evento_evaluacion = "al_registrar",
    condiciones = [],
    id_departamento_destino,
    estrategia = "sin_responsable",
    id_tecnico_fijo,
    considerar_disponibilidad = true,
    notificar_asignacion = true,
  } = body;

  if (!nombre) throw new ErrorDominio("El nombre de la regla es obligatorio");

  return queryRow<any>(
    `INSERT INTO problema_regla_asignacion (
        nombre, orden, activa, evento_evaluacion, condiciones,
        id_departamento_destino, estrategia, id_tecnico_fijo,
        considerar_disponibilidad, notificar_asignacion, veces_aplicada, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 0, NOW())
      RETURNING *`,
    [
      nombre.trim(),
      orden,
      activa,
      evento_evaluacion,
      JSON.stringify(condiciones),
      id_departamento_destino || null,
      estrategia,
      id_tecnico_fijo || null,
      considerar_disponibilidad,
      notificar_asignacion,
    ]
  );
}

export async function actualizarReglaAsignacion(body: any) {
  const {
    id_regla,
    nombre,
    orden,
    activa,
    evento_evaluacion,
    condiciones,
    id_departamento_destino,
    estrategia,
    id_tecnico_fijo,
    considerar_disponibilidad,
    notificar_asignacion,
  } = body;

  if (!id_regla) throw new ErrorDominio("ID requerido");

  return queryRow<any>(
    `UPDATE problema_regla_asignacion
       SET nombre = COALESCE($1, nombre),
           orden = COALESCE($2, orden),
           activa = COALESCE($3, activa),
           evento_evaluacion = COALESCE($4, evento_evaluacion),
           condiciones = COALESCE($5, condiciones),
           id_departamento_destino = $6,
           estrategia = COALESCE($7, estrategia),
           id_tecnico_fijo = $8,
           considerar_disponibilidad = COALESCE($9, considerar_disponibilidad),
           notificar_asignacion = COALESCE($10, notificar_asignacion)
       WHERE id_regla = $11
       RETURNING *`,
    [
      nombre ? nombre.trim() : null,
      orden !== undefined ? orden : null,
      activa !== undefined ? activa : null,
      evento_evaluacion || null,
      condiciones ? JSON.stringify(condiciones) : null,
      id_departamento_destino !== undefined ? id_departamento_destino : null,
      estrategia || null,
      id_tecnico_fijo !== undefined ? id_tecnico_fijo : null,
      considerar_disponibilidad !== undefined ? considerar_disponibilidad : null,
      notificar_asignacion !== undefined ? notificar_asignacion : null,
      id_regla,
    ]
  );
}

export async function eliminarReglaAsignacion(id: string) {
  await query("DELETE FROM problema_regla_asignacion WHERE id_regla = $1", [id]);
  return { ok: true, mensaje: "Regla eliminada exitosamente" };
}

/* ------------------------------------------------------------------ */
/* Reglas de escalamiento                                              */
/* ------------------------------------------------------------------ */

export async function crearReglaEscalamiento(body: any) {
  const {
    nombre,
    objetivo = "diagnostico",
    prioridades = ["P1", "P2", "P3", "P4"],
    tipo_umbral = "porcentaje",
    umbral_valor = 75,
    acciones = [],
    repetir_cada_horas = null,
    max_repeticiones = 1,
    activa = true,
  } = body;

  if (!nombre) throw new ErrorDominio("Nombre obligatorio");

  return queryRow<any>(
    `INSERT INTO problema_regla_escalamiento (
        nombre, objetivo, prioridades, tipo_umbral, umbral_valor,
        acciones, repetir_cada_horas, max_repeticiones, activa, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      RETURNING *`,
    [
      nombre.trim(),
      objetivo,
      JSON.stringify(prioridades),
      tipo_umbral,
      umbral_valor,
      JSON.stringify(acciones),
      repetir_cada_horas || null,
      max_repeticiones || 1,
      activa,
    ]
  );
}

export async function actualizarReglaEscalamiento(body: any) {
  const {
    id_escalamiento,
    nombre,
    objetivo,
    prioridades,
    tipo_umbral,
    umbral_valor,
    acciones,
    repetir_cada_horas,
    max_repeticiones,
    activa,
  } = body;

  if (!id_escalamiento) throw new ErrorDominio("ID requerido");

  return queryRow<any>(
    `UPDATE problema_regla_escalamiento
       SET nombre = COALESCE($1, nombre),
           objetivo = COALESCE($2, objetivo),
           prioridades = COALESCE($3, prioridades),
           tipo_umbral = COALESCE($4, tipo_umbral),
           umbral_valor = COALESCE($5, umbral_valor),
           acciones = COALESCE($6, acciones),
           repetir_cada_horas = $7,
           max_repeticiones = COALESCE($8, max_repeticiones),
           activa = COALESCE($9, activa)
       WHERE id_escalamiento = $10
       RETURNING *`,
    [
      nombre ? nombre.trim() : null,
      objetivo || null,
      prioridades ? JSON.stringify(prioridades) : null,
      tipo_umbral || null,
      umbral_valor !== undefined ? umbral_valor : null,
      acciones ? JSON.stringify(acciones) : null,
      repetir_cada_horas !== undefined ? repetir_cada_horas : null,
      max_repeticiones !== undefined ? max_repeticiones : null,
      activa !== undefined ? activa : null,
      id_escalamiento,
    ]
  );
}

export async function eliminarReglaEscalamiento(id: string) {
  await query("DELETE FROM problema_regla_escalamiento WHERE id_escalamiento = $1", [id]);
  return { ok: true, mensaje: "Regla eliminada exitosamente" };
}

/* ------------------------------------------------------------------ */
/* Objetivos OLA, reapertura y configuración de problema mayor         */
/* ------------------------------------------------------------------ */

export async function actualizarObjetivosOla(body: any) {
  const { objetivos = [] } = body;

  for (const obj of objetivos) {
    if (obj.id_prioridad) {
      await query(
        `UPDATE problema_objetivo_tiempo
           SET primera_respuesta_horas = $1,
               diagnostico_horas = $2,
               resolucion_total_horas = $3,
               descripcion_operativa = $4,
               umbrales_alerta = $5,
               fecha_modificacion = NOW()
           WHERE id_prioridad = $6`,
        [
          obj.primera_respuesta_horas,
          obj.diagnostico_horas,
          obj.resolucion_total_horas,
          obj.descripcion_operativa || null,
          JSON.stringify(obj.umbrales_alerta || [50, 75, 90]),
          obj.id_prioridad,
        ]
      );
    }
  }

  return { ok: true, mensaje: "Objetivos de tiempo OLA actualizados exitosamente" };
}

export async function actualizarConfigReapertura(body: any) {
  const {
    permitir_reapertura,
    ventana_dias_resuelto,
    ventana_dias_cerrado,
    perfiles_autorizados,
    estado_destino_id,
    motivo_obligatorio,
    max_reaperturas,
    reinicio_relojes,
    estrategia_asignacion,
    motivos_catalogo,
  } = body;

  return queryRow<any>(
    `UPDATE problema_config_reapertura
       SET permitir_reapertura = COALESCE($1, permitir_reapertura),
           ventana_dias_resuelto = COALESCE($2, ventana_dias_resuelto),
           ventana_dias_cerrado = COALESCE($3, ventana_dias_cerrado),
           perfiles_autorizados = COALESCE($4, perfiles_autorizados),
           estado_destino_id = $5,
           motivo_obligatorio = COALESCE($6, motivo_obligatorio),
           max_reaperturas = COALESCE($7, max_reaperturas),
           reinicio_relojes = COALESCE($8, reinicio_relojes),
           estrategia_asignacion = COALESCE($9, estrategia_asignacion),
           motivos_catalogo = COALESCE($10, motivos_catalogo),
           fecha_modificacion = NOW()
       WHERE id = 1
       RETURNING *`,
    [
      permitir_reapertura !== undefined ? permitir_reapertura : null,
      ventana_dias_resuelto !== undefined ? ventana_dias_resuelto : null,
      ventana_dias_cerrado !== undefined ? ventana_dias_cerrado : null,
      perfiles_autorizados ? JSON.stringify(perfiles_autorizados) : null,
      estado_destino_id || null,
      motivo_obligatorio !== undefined ? motivo_obligatorio : null,
      max_reaperturas !== undefined ? max_reaperturas : null,
      reinicio_relojes || null,
      estrategia_asignacion || null,
      motivos_catalogo ? JSON.stringify(motivos_catalogo) : null,
    ]
  );
}

export async function actualizarConfigMayor(body: any) {
  const {
    aplicar_paquete_tareas,
    exigir_revision_cierre,
    plazo_revision_dias,
    participantes_roles,
    aprobacion_cierre_perfil,
    notificar_direccion_al_detectar,
    notificar_direccion_al_cerrar,
    generar_informe_pdf,
    plantilla_preguntas,
  } = body;

  return queryRow<any>(
    `UPDATE problema_config_mayor
       SET aplicar_paquete_tareas = COALESCE($1, aplicar_paquete_tareas),
           exigir_revision_cierre = COALESCE($2, exigir_revision_cierre),
           plazo_revision_dias = COALESCE($3, plazo_revision_dias),
           participantes_roles = COALESCE($4, participantes_roles),
           aprobacion_cierre_perfil = $5,
           notificar_direccion_al_detectar = COALESCE($6, notificar_direccion_al_detectar),
           notificar_direccion_al_cerrar = COALESCE($7, notificar_direccion_al_cerrar),
           generar_informe_pdf = COALESCE($8, generar_informe_pdf),
           plantilla_preguntas = COALESCE($9, plantilla_preguntas),
           fecha_modificacion = NOW()
       WHERE id = 1
       RETURNING *`,
    [
      aplicar_paquete_tareas !== undefined ? aplicar_paquete_tareas : null,
      exigir_revision_cierre !== undefined ? exigir_revision_cierre : null,
      plazo_revision_dias !== undefined ? plazo_revision_dias : null,
      participantes_roles ? JSON.stringify(participantes_roles) : null,
      aprobacion_cierre_perfil || null,
      notificar_direccion_al_detectar !== undefined ? notificar_direccion_al_detectar : null,
      notificar_direccion_al_cerrar !== undefined ? notificar_direccion_al_cerrar : null,
      generar_informe_pdf !== undefined ? generar_informe_pdf : null,
      plantilla_preguntas ? JSON.stringify(plantilla_preguntas) : null,
    ]
  );
}

/* ------------------------------------------------------------------ */
/* Tareas y paquetes                                                   */
/* ------------------------------------------------------------------ */

export async function crearTareaOPaquete(body: any) {
  const {
    tipo_entidad = "tarea",
    codigo,
    titulo,
    nombre,
    descripcion,
    tipo = "investigacion",
    id_departamento_destino,
    duracion_estimada_horas = 4,
    obligatoria = false,
    checklist = [],
    tareas = [],
  } = body;

  if (tipo_entidad === "paquete") {
    const codigoGenerado = codigo || `paq_${Date.now()}`;
    const nuevoPaquete = await queryRow<any>(
      `INSERT INTO problema_tarea_paquete (codigo, nombre, descripcion, tareas, activo, fecha_creacion)
         VALUES ($1, $2, $3, $4, true, NOW()) RETURNING *`,
      [codigoGenerado, nombre.trim(), descripcion || null, JSON.stringify(tareas)]
    );
    return { ok: true, paquete: nuevoPaquete };
  }

  const codigoGenerado = codigo || `tar_${Date.now()}`;
  const nuevaTarea = await queryRow<any>(
    `INSERT INTO problema_tarea_catalogo (
        codigo, titulo, descripcion, tipo, id_departamento_destino, duracion_estimada_horas, obligatoria, checklist, activa, fecha_creacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW()) RETURNING *`,
    [
      codigoGenerado,
      (titulo || nombre).trim(),
      descripcion || null,
      tipo,
      id_departamento_destino || null,
      duracion_estimada_horas,
      obligatoria,
      JSON.stringify(checklist),
    ]
  );

  return { ok: true, tarea: nuevaTarea };
}

export async function eliminarTareaOPaquete(tipo: string, id: string) {
  if (tipo === "paquete") {
    await query("DELETE FROM problema_tarea_paquete WHERE id_paquete = $1", [id]);
  } else {
    await query("DELETE FROM problema_tarea_catalogo WHERE id_tarea = $1", [id]);
  }
  return { ok: true, mensaje: "Eliminado exitosamente" };
}
