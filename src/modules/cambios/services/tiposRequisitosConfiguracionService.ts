import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { calcularDiffConfig } from "@/shared/lib/configuracionModulo";

export const VALORES_FABRICA_1332: Record<string, any> = {
  tipos: {
    tipos: {
      estandar: {
        id: "estandar",
        codigo: "estandar",
        nombre: "Estándar",
        descripcion: "Cambio recurrente de bajo riesgo, procedimiento conocido, probado y preautorizado por la autoridad competente.",
        color: "#16a34a",
        icono: "CheckCircle2",
        perfiles_solicitud: ["administrador", "tecnico", "gestor_cambios", "supervisor", "gestor_activos"],
        exigir_permiso_emergencia: false,
        anticipacion_horas: 24,
        duracion_maxima_horas: 4,
        corte_agenda_cab_horas: 0,
        caducidad_autorizacion_dias: 30,
        politica_ventana: "dentro",
        politica_congelamiento: "bloquear",
        politica_feriados: "bloquear",
        pir_politica: "solo_si_falla_o_muestreo",
        pir_muestreo_pct: 10,
        registro_retroactivo: false,
        plazo_documentacion_retroactiva_horas: 0,
        exige_autorizacion_retroactiva_cab: false,
        exigir_implementador_antes_programar: true,
        exigir_plan_comunicacion_interrupcion: true,
        exigir_checklist_go_no_go: true
      },
      normal: {
        id: "normal",
        codigo: "normal",
        nombre: "Normal",
        descripcion: "Cambio no estándar que requiere evaluación técnica, de impacto y negocio, y autorización formal por el nivel correspondiente.",
        color: "#2563eb",
        icono: "Sliders",
        perfiles_solicitud: ["administrador", "tecnico", "gestor_cambios", "supervisor", "gestor_area", "gestor_activos", "gestor_problemas"],
        exigir_permiso_emergencia: false,
        anticipacion_horas: 72,
        duracion_maxima_horas: 48,
        corte_agenda_cab_horas: 24,
        caducidad_autorizacion_dias: 7,
        politica_ventana: "fuera_con_aprobacion",
        politica_congelamiento: "excepcion",
        politica_feriados: "advertir",
        pir_politica: "siempre",
        pir_muestreo_pct: 100,
        registro_retroactivo: false,
        plazo_documentacion_retroactiva_horas: 0,
        exige_autorizacion_retroactiva_cab: false,
        exigir_implementador_antes_programar: true,
        exigir_plan_comunicacion_interrupcion: true,
        exigir_checklist_go_no_go: true
      },
      emergencia: {
        id: "emergencia",
        codigo: "emergencia",
        nombre: "Emergencia",
        descripcion: "Cambio urgente requerido para restaurar un servicio crítico interrumpido o mitigar una vulnerabilidad crítica de seguridad.",
        color: "#dc2626",
        icono: "AlertTriangle",
        perfiles_solicitud: ["administrador", "tecnico", "gestor_cambios", "supervisor", "gestor_problemas"],
        exigir_permiso_emergencia: true,
        anticipacion_horas: 0,
        duracion_maxima_horas: 12,
        corte_agenda_cab_horas: 0,
        caducidad_autorizacion_dias: 1,
        politica_ventana: "libre",
        politica_congelamiento: "excepcion_ecab",
        politica_feriados: "ignorar",
        pir_politica: "siempre",
        pir_muestreo_pct: 100,
        registro_retroactivo: true,
        plazo_documentacion_retroactiva_horas: 24,
        exige_autorizacion_retroactiva_cab: true,
        exigir_implementador_antes_programar: true,
        exigir_plan_comunicacion_interrupcion: false,
        exigir_checklist_go_no_go: true
      }
    },
    matriz_requisitos: [
      { campo_key: "titulo", label: "Título del cambio", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "descripcion", label: "Descripción técnica detallada", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "motivo", label: "Motivo / Justificación", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "servicio_id", label: "Servicio(s) afectado(s)", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "ci_ids", label: "Activos / CI afectados", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "impacto", label: "Impacto", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "urgencia", label: "Urgencia", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "fechas_propuestas", label: "Inicio y fin propuestos", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "plan_implementacion", label: "Plan de implementación", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "plan_rollback", label: "Plan de rollback", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "grupo_implementador_id", label: "Grupo implementador", estandar: "obligatorio", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "justificacion_emergencia", label: "Justificación de emergencia", estandar: "oculto", normal: "oculto", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "consecuencia_no_cambio", label: "Consecuencia de no realizar el cambio", estandar: "oculto", normal: "oculto", emergencia: "obligatorio", bloqueado_normativo: true },
      { campo_key: "plan_pruebas", label: "Plan de pruebas", estandar: "obligatorio", normal: "obligatorio", emergencia: "opcional", bloqueado_normativo: false },
      { campo_key: "criterios_exito", label: "Criterios de éxito verificables", estandar: "obligatorio", normal: "obligatorio", emergencia: "opcional", bloqueado_normativo: false },
      { campo_key: "usuarios_afectados", label: "Número estimado de usuarios afectados", estandar: "opcional", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: false },
      { campo_key: "requiere_interrupcion", label: "¿Requiere interrupción de servicio?", estandar: "opcional", normal: "obligatorio", emergencia: "obligatorio", bloqueado_normativo: false },
      { campo_key: "duracion_interrupcion", label: "Duración estimada de interrupción", estandar: "opcional", normal: "opcional", emergencia: "opcional", bloqueado_normativo: false },
      { campo_key: "ticket_origen", label: "Ticket de origen vinculado", estandar: "opcional", normal: "opcional", emergencia: "obligatorio", bloqueado_normativo: false },
      { campo_key: "beneficio", label: "Beneficio esperado", estandar: "opcional", normal: "opcional", emergencia: "oculto", bloqueado_normativo: false }
    ]
  },
  matriz_autoridad: {
    reglas: [
      {
        id: "regla_1",
        orden: 1,
        nombre: "Estándar: Preautorizado con modelo aprobado y riesgo bajo",
        activa: true,
        condiciones: {
          tipo_cambio: "estandar",
          nivel_riesgo: ["bajo"],
          modelo_aprobado: true
        },
        sin_aprobacion: true,
        etapas: []
      },
      {
        id: "regla_2",
        orden: 2,
        nombre: "Estándar con riesgo no bajo: Reclasificación a Normal",
        activa: true,
        condiciones: {
          tipo_cambio: "estandar",
          nivel_riesgo: ["medio", "alto", "critico"]
        },
        accion_especial: "reclasificar_a_normal",
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "tecnica", nombre: "Evaluación Técnica", modo: "secuencial" },
          { etapa_id: "gestor_cambios", nombre: "Aprobación Gestor de Cambios", modo: "secuencial" }
        ]
      },
      {
        id: "regla_3",
        orden: 3,
        nombre: "Emergencia: Comité de Emergencia (ECAB) y revisión retroactiva",
        activa: true,
        condiciones: {
          tipo_cambio: "emergencia"
        },
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "ecab", nombre: "Comité de Emergencia (ECAB)", modo: "secuencial" },
          { etapa_id: "cab_retroactivo", nombre: "Revisión Retroactiva por CAB", modo: "secuencial" }
        ]
      },
      {
        id: "regla_4",
        orden: 4,
        nombre: "Normal - Riesgo Bajo",
        activa: true,
        condiciones: {
          tipo_cambio: "normal",
          nivel_riesgo: ["bajo"]
        },
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "tecnica", nombre: "Evaluación Técnica (Supervisor)", modo: "secuencial" },
          { etapa_id: "gestor_cambios", nombre: "Gestor de Cambios", modo: "secuencial" }
        ]
      },
      {
        id: "regla_5",
        orden: 5,
        nombre: "Normal - Riesgo Medio",
        activa: true,
        condiciones: {
          tipo_cambio: "normal",
          nivel_riesgo: ["medio"]
        },
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "tecnica", nombre: "Evaluación Técnica (Supervisor)", modo: "secuencial" },
          { etapa_id: "negocio", nombre: "Aprobación de Negocio (Gestor de Área)", modo: "secuencial" },
          { etapa_id: "gestor_cambios", nombre: "Gestor de Cambios", modo: "secuencial" }
        ]
      },
      {
        id: "regla_6",
        orden: 6,
        nombre: "Normal - Riesgo Alto",
        activa: true,
        condiciones: {
          tipo_cambio: "normal",
          nivel_riesgo: ["alto"]
        },
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "tecnica", nombre: "Evaluación Técnica (Supervisor)", modo: "secuencial" },
          { etapa_id: "negocio", nombre: "Aprobación de Negocio (Gestor de Área)", modo: "secuencial" },
          { etapa_id: "cab", nombre: "Comité de Cambios (CAB)", modo: "secuencial" }
        ]
      },
      {
        id: "regla_7",
        orden: 7,
        nombre: "Normal - Riesgo Crítico",
        activa: true,
        condiciones: {
          tipo_cambio: "normal",
          nivel_riesgo: ["critico"]
        },
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "tecnica", nombre: "Evaluación Técnica (Supervisor)", modo: "secuencial" },
          { etapa_id: "negocio", nombre: "Aprobación de Negocio (Gestor de Área)", modo: "secuencial" },
          { etapa_id: "cab", nombre: "Comité de Cambios (CAB)", modo: "secuencial" },
          { etapa_id: "direccion", nombre: "Dirección Institucional", modo: "secuencial" }
        ]
      },
      {
        id: "regla_8",
        orden: 8,
        nombre: "Regla Comodín por defecto",
        activa: true,
        condiciones: {},
        sin_aprobacion: false,
        etapas: [
          { etapa_id: "cab", nombre: "Comité de Cambios (CAB)", modo: "secuencial" }
        ]
      }
    ]
  },
  modelos_estandar: {
    riesgo_maximo_permitido: "bajo",
    requiere_aprobacion_cab: true,
    notificar_propietario_suspension: true,
    frecuencia_revision_meses: 6,
    umbral_defecto_fallo_pct: 10.0,
    umbral_defecto_fallos_consecutivos: 2,
    dias_observacion_calidad: 90
  },
  reglas_clasificacion: {
    estrategia_evaluacion: "todas",
    riesgo_maximo_modelo_estandar: "bajo",
    reglas: [
      {
        id: "regla_clasif_1",
        orden: 1,
        nombre: "Estándar con riesgo mayor a Bajo reclasifica a Normal",
        activa: true,
        cuando: "al_cambiar_riesgo",
        condiciones: {
          tipo_cambio: "estandar",
          riesgo_mayor_que: "bajo"
        },
        accion: "reclasificar_tipo",
        tipo_destino: "normal",
        mensaje: "Los cambios estándar no pueden tener un riesgo mayor a Bajo según directriz ITIL 4. Se ha reclasificado automáticamente a cambio Normal.",
        veces_aplicada: 0
      },
      {
        id: "regla_clasif_2",
        orden: 2,
        nombre: "Estándar sobre CI de criticidad Alta o Crítica reclasifica a Normal",
        activa: true,
        cuando: "al_agregar_ci",
        condiciones: {
          tipo_cambio: "estandar",
          criticidad_ci_en: ["alta", "critica"]
        },
        accion: "reclasificar_tipo",
        tipo_destino: "normal",
        mensaje: "Los activos y CIs de criticidad Alta o Crítica exigen análisis técnico formal y no califican para procedimiento estándar.",
        veces_aplicada: 0
      },
      {
        id: "regla_clasif_3",
        orden: 3,
        nombre: "Normal con inicio antes de la anticipación mínima",
        activa: true,
        cuando: "al_cambiar_fechas",
        condiciones: {
          tipo_cambio: "normal",
          fuera_anticipacion_minima: true
        },
        accion: "bloquear_con_mensaje",
        mensaje: "La fecha de inicio no cumple la anticipación mínima requerida (72 horas). Solicita el cambio como Emergencia o reprograma la fecha.",
        veces_aplicada: 0
      },
      {
        id: "regla_clasif_4",
        orden: 4,
        nombre: "Normal sobre CI productivo de criticidad alta fuera de ventana",
        activa: true,
        cuando: "al_enviar",
        condiciones: {
          tipo_cambio: "normal",
          entorno: "produccion",
          criticidad_ci_en: ["alta", "critica"],
          fuera_de_ventana: true
        },
        accion: "agregar_etapa_aprobacion",
        etapa_a_agregar: "excepcion_ventana",
        mensaje: "Intervención fuera de ventana en activo productivo crítico: se incorpora obligatoriamente la etapa de Aprobación de Excepción de Ventana.",
        veces_aplicada: 0
      },
      {
        id: "regla_clasif_5",
        orden: 5,
        nombre: "Cualquier tipo dentro de período de congelamiento",
        activa: true,
        cuando: "al_enviar",
        condiciones: {
          dentro_congelamiento: true
        },
        accion: "agregar_etapa_aprobacion",
        etapa_a_agregar: "excepcion_congelamiento",
        mensaje: "La ventana coincide con un período de congelamiento institucional activo. Se requiere autorización de Excepción de Congelamiento.",
        veces_aplicada: 0
      },
      {
        id: "regla_clasif_6",
        orden: 6,
        nombre: "Etiquetado y alerta inmediata de Emergencia",
        activa: true,
        cuando: "al_enviar",
        condiciones: {
          tipo_cambio: "emergencia"
        },
        accion: "etiquetar_y_notificar",
        etiqueta: "Emergencia",
        notificar_roles: ["gestor_cambios", "supervisor"],
        mensaje: "Cambio clasificado como Emergencia. Se convoca automáticamente al Comité de Emergencia (ECAB).",
        veces_aplicada: 0
      }
    ]
  }
};

export interface ResultadoConfig {
  httpStatus: number;
  payload: any;
}

// Wrapper local para conservar el texto exacto del diff mostrado en la UI.
const calcularDiff = (original: any, modificado: any) =>
  calcularDiffConfig(original, modificado, {
    mensajeInicial: "Configuración inicial creada",
    etiquetaCambio: "clave",
    mensajeEstructura: "Estructura global actualizada",
  });

export async function obtenerConfiguracionTiposRequisitos(idUsuario: number | undefined, pestana: string) {
  const versionPublicada = await queryRow(`
    SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  const borradorActual = await queryRow(`
    SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_borrador = true
    ORDER BY id_version DESC LIMIT 1
  `, [pestana]);

  const recursoLock = `cambios:1.3.3.2:${pestana}`;
  const bloqueoActual = await queryRow(`
    SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
           CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
    FROM bloqueo_edicion_concurrente b
    LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
    WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
  `, [recursoLock]);

  const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_1332[pestana] || {};
  const snapshotActivo = borradorActual?.snapshot || snapshotBase;
  const diff = calcularDiff(snapshotBase, snapshotActivo);

  const rfcsAbiertas = await queryRow(`
    SELECT COUNT(*) as total FROM cambio 
    WHERE estado_registro = true AND (id_estado IS NULL OR id_estado NOT IN (10, 11, 12))
  `);

  const historialVersiones = await query(`
    SELECT id_version, numero_version, es_publicada, es_borrador, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion,
           (SELECT CONCAT(nombres, ' ', apellido_paterno) FROM usuario WHERE id_usuario = configuracion_modulo_versiones.id_usuario_creacion) as autor_nombre
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1
    ORDER BY id_version DESC LIMIT 20
  `, [pestana]);

  return {
    pestana,
    version_publicada: versionPublicada ? {
      ...versionPublicada,
      snapshot: versionPublicada.snapshot || VALORES_FABRICA_1332[pestana]
    } : {
      numero_version: 1,
      snapshot: VALORES_FABRICA_1332[pestana]
    },
    borrador: borradorActual ? {
      ...borradorActual,
      snapshot: borradorActual.snapshot
    } : null,
    tiene_borrador: !!borradorActual,
    bloqueo: bloqueoActual ? {
      bloqueado_por_mi: idUsuario === bloqueoActual.id_usuario,
      usuario_nombre: bloqueoActual.nombre_completo || "Otro usuario",
      expira_en: bloqueoActual.fecha_expiracion
    } : null,
    diff_preview: diff,
    rfcs_abiertas_impactadas: parseInt(rfcsAbiertas?.total || "0", 10),
    historial_versiones: historialVersiones || []
  };
}

export async function procesarAccionTiposRequisitos(idUsuario: number, body: any): Promise<ResultadoConfig> {
  const { accion, pestana, snapshot, motivo, version_id_origen } = body;

  if (!pestana) {
    throw new ErrorDominio("La pestaña es obligatoria");
  }

  const userId = idUsuario;
  const recursoLock = `cambios:1.3.3.2:${pestana}`;

  if (accion === "adquirir_bloqueo") {
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND fecha_expiracion <= NOW()`, [recursoLock]);
    const existente = await queryRow(`
      SELECT id_bloqueo, id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente WHERE recurso = $1
    `, [recursoLock]);

    if (existente && existente.id_usuario !== userId && new Date(existente.fecha_expiracion) > new Date()) {
      return {
        httpStatus: 423,
        payload: {
          bloqueado: true,
          mensaje: "La pestaña está siendo editada por otro usuario"
        }
      };
    }

    await query(`
      INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
      ON CONFLICT (recurso) DO UPDATE SET 
        id_usuario = EXCLUDED.id_usuario,
        fecha_bloqueo = NOW(),
        fecha_expiracion = NOW() + INTERVAL '15 minutes'
    `, [recursoLock, userId]);

    return { httpStatus: 200, payload: { ok: true, mensaje: "Bloqueo adquirido" } };
  }

  if (accion === "liberar_bloqueo") {
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2`, [recursoLock, userId]);
    return { httpStatus: 200, payload: { ok: true, mensaje: "Bloqueo liberado" } };
  }

  if (accion === "guardar_borrador") {
    const versionPub = await queryRow(`
      SELECT snapshot, numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot || VALORES_FABRICA_1332[pestana], snapshot);

    const borradorExistente = await queryRow(`
      SELECT id_version FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    if (borradorExistente) {
      await query(`
        UPDATE configuracion_modulo_versiones
        SET snapshot = $1, diff = $2, fecha_creacion = NOW(), id_usuario_creacion = $3, motivo = $4
        WHERE id_version = $5
      `, [JSON.stringify(snapshot), JSON.stringify(diff), userId, motivo || "Borrador en edición", borradorExistente.id_version]);
    } else {
      await query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'gestion_de_cambios', '1.3.3.2', $1, $2, false, true, $3, $4, $5, $6
        )
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(snapshot), JSON.stringify(diff), motivo || "Borrador de trabajo", userId]);
    }

    await query(`
      INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
      ON CONFLICT (recurso) DO UPDATE SET fecha_expiracion = NOW() + INTERVAL '15 minutes'
    `, [recursoLock, userId]);

    return { httpStatus: 200, payload: { ok: true, mensaje: "Borrador guardado exitosamente", diff } };
  }

  if (accion === "restaurar_fabrica") {
    const fabrica = VALORES_FABRICA_1332[pestana];
    if (!fabrica) {
      throw new ErrorDominio("No existen valores de fábrica para esta pestaña");
    }

    const versionPub = await queryRow(`
      SELECT numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot, fabrica);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    await query(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'gestion_de_cambios', '1.3.3.2', $1, $2, false, true, $3, $4, 'Restauración a valores de fábrica ITIL v4', $5
      )
    `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(fabrica), JSON.stringify(diff), userId]);

    return { httpStatus: 200, payload: { ok: true, mensaje: "Valores de fábrica cargados en borrador", snapshot: fabrica } };
  }

  if (accion === "restaurar_version") {
    if (!version_id_origen) {
      throw new ErrorDominio("Debe indicar la versión a restaurar");
    }

    const versionOrigen = await queryRow(`
      SELECT snapshot, numero_version FROM configuracion_modulo_versiones
      WHERE id_version = $1
    `, [version_id_origen]);

    if (!versionOrigen?.snapshot) {
      throw new ErrorDominio("Versión no encontrada", 404);
    }

    const diff = calcularDiff(null, versionOrigen.snapshot);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    await query(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'gestion_de_cambios', '1.3.3.2', $1, $2, false, true, $3, $4, $5, $6
      )
    `, [
      pestana,
      versionOrigen.numero_version,
      JSON.stringify(versionOrigen.snapshot),
      JSON.stringify(diff),
      `Restaurado desde versión v${versionOrigen.numero_version}`,
      userId
    ]);

    return { httpStatus: 200, payload: { ok: true, mensaje: `Versión v${versionOrigen.numero_version} cargada en borrador`, snapshot: versionOrigen.snapshot } };
  }

  throw new ErrorDominio("Acción no reconocida");
}

export async function publicarConfiguracionTiposRequisitos(idUsuario: number, body: any) {
  const { pestana, motivo, impacto_resumen } = body;

  if (!pestana) {
    throw new ErrorDominio("Pestaña requerida");
  }

  const userId = idUsuario;

  const borrador = await queryRow(`
    SELECT id_version, snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  if (!borrador) {
    throw new ErrorDominio("No hay un borrador pendiente de publicación");
  }

  const versionPubPrevia = await queryRow(`
    SELECT id_version, numero_version, snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  const nuevoNumero = (versionPubPrevia?.numero_version || 0) + 1;
  const diff = calcularDiff(versionPubPrevia?.snapshot, borrador.snapshot);

  if (versionPubPrevia) {
    await query(`
      UPDATE configuracion_modulo_versiones
      SET es_publicada = false
      WHERE id_version = $1
    `, [versionPubPrevia.id_version]);
  }

  const nuevaPublicada = await queryRow(`
    INSERT INTO configuracion_modulo_versiones (
      modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
    ) VALUES (
      'gestion_de_cambios', '1.3.3.2', $1, $2, true, false, $3, $4, $5, $6, $7
    ) RETURNING id_version, numero_version
  `, [
    pestana,
    nuevoNumero,
    JSON.stringify(borrador.snapshot),
    JSON.stringify(diff),
    motivo || `Publicación formal versión v${nuevoNumero}`,
    impacto_resumen || "Publicación de reglas y requisitos de tipos de cambio",
    userId
  ]);

  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE id_version = $1
  `, [borrador.id_version]);

  const recursoLock = `cambios:1.3.3.2:${pestana}`;
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

  return {
    ok: true,
    mensaje: `Versión v${nuevoNumero} publicada exitosamente`,
    id_version: nuevaPublicada?.id_version,
    numero_version: nuevoNumero
  };
}

export async function descartarBorradorTiposRequisitos(idUsuario: number, pestana: string) {
  if (!pestana) {
    throw new ErrorDominio("Pestaña requerida");
  }

  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.2' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  const recursoLock = `cambios:1.3.3.2:${pestana}`;
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2`, [recursoLock, idUsuario]);

  return { ok: true, mensaje: "Borrador descartado correctamente" };
}
