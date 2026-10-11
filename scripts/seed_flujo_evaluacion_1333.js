const fs = require('fs');
const { Pool } = require('pg');

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl && fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  for (const line of env.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.replace('DATABASE_URL=', '').trim().replace(/^['"]|['"]$/g, '');
      break;
    }
  }
}

const pool = new Pool({ connectionString: dbUrl });

const FACTORY_SNAPSHOTS = {
  estados: {
    estados: [
      {
        id: "solicitado",
        codigo: "solicitado",
        nombre: "Solicitado",
        tipo: "inicial",
        color: "#6366f1",
        reloj: "evaluacion",
        reloj_comportamiento: "corre",
        cuenta_como_abierto: true,
        permite_editar: "si",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 1,
        descripcion: "RFC registrada en el sistema a la espera de evaluación inicial o autoautorización por modelo."
      },
      {
        id: "en_evaluacion",
        codigo: "en_evaluacion",
        nombre: "En evaluación",
        tipo: "en_evaluacion",
        color: "#3b82f6",
        reloj: "evaluacion",
        reloj_comportamiento: "corre",
        cuenta_como_abierto: true,
        permite_editar: "si",
        aparece_calendario: false,
        tipos_aplicables: ["normal"],
        es_sistema: false,
        activo: true,
        orden: 2,
        descripcion: "Análisis técnico, de riesgos, dependencias y conflictos por parte del evaluador asignado."
      },
      {
        id: "en_pausa",
        codigo: "en_pausa",
        nombre: "En pausa",
        tipo: "en_pausa",
        color: "#f59e0b",
        reloj: "ninguno",
        reloj_comportamiento: "pausa",
        cuenta_como_abierto: true,
        permite_editar: "solo_comentarios",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: false,
        activo: true,
        orden: 3,
        descripcion: "Flujo detenido a la espera de aclaraciones o información complementaria solicitada al solicitante."
      },
      {
        id: "en_autorizacion",
        codigo: "en_autorizacion",
        nombre: "En autorización",
        tipo: "en_autorizacion",
        color: "#8b5cf6",
        reloj: "autorizacion",
        reloj_comportamiento: "corre",
        cuenta_como_abierto: true,
        permite_editar: "solo_comentarios_y_tareas",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: false,
        activo: true,
        orden: 4,
        descripcion: "Sometido al circuito de aprobación de acuerdo a la matriz de autoridad y niveles de riesgo."
      },
      {
        id: "autorizado",
        codigo: "autorizado",
        nombre: "Autorizado",
        tipo: "autorizado",
        color: "#10b981",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: true,
        permite_editar: "solo_comentarios_y_tareas",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 5,
        descripcion: "Todas las etapas requeridas han emitido dictamen favorable; listo para asignar ventana y recursos."
      },
      {
        id: "programado",
        codigo: "programado",
        nombre: "Programado",
        tipo: "programado",
        color: "#06b6d4",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: true,
        permite_editar: "solo_comentarios_y_tareas",
        aparece_calendario: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 6,
        descripcion: "Ventana de mantenimiento confirmada en calendario, tareas generadas y recursos asignados."
      },
      {
        id: "en_ejecucion",
        codigo: "en_ejecucion",
        nombre: "En ejecución",
        tipo: "en_ejecucion",
        color: "#f97316",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: true,
        permite_editar: "solo_comentarios_y_bitacora",
        aparece_calendario: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 7,
        descripcion: "Intervención técnica en progreso sobre los CI afectados, con Go/No-Go superado."
      },
      {
        id: "implementado",
        codigo: "implementado",
        nombre: "Implementado",
        tipo: "implementado",
        color: "#14b8a6",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: true,
        permite_editar: "solo_comentarios",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 8,
        descripcion: "Intervención concluida y resultado registrado (exitoso, parcial, fallido o rollback)."
      },
      {
        id: "en_revision_post",
        codigo: "en_revision_post",
        nombre: "En revisión post-implementación",
        tipo: "implementado",
        color: "#a855f7",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: true,
        permite_editar: "solo_la_revision",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: false,
        activo: true,
        orden: 9,
        descripcion: "Fase PIR activa para auditar cumplimiento de objetivos, incidentes asociados y lecciones aprendidas."
      },
      {
        id: "cerrado",
        codigo: "cerrado",
        nombre: "Cerrado",
        tipo: "final",
        color: "#64748b",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: false,
        permite_editar: "no",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 10,
        descripcion: "Ciclo de vida completado formalmente con código de cierre y actualización de CMDB asegurada."
      },
      {
        id: "rechazado",
        codigo: "rechazado",
        nombre: "Rechazado",
        tipo: "final",
        color: "#ef4444",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: false,
        permite_editar: "no",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 11,
        descripcion: "Solicitud denegada por la autoridad evaluadora o comité competente por motivo justificado."
      },
      {
        id: "cancelado",
        codigo: "cancelado",
        nombre: "Cancelado",
        tipo: "final",
        color: "#94a3b8",
        reloj: "ninguno",
        reloj_comportamiento: "detiene",
        cuenta_como_abierto: false,
        permite_editar: "no",
        aparece_calendario: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        es_sistema: true,
        activo: true,
        orden: 12,
        descripcion: "RFC desestimada por el solicitante o gestor antes de su puesta en ejecución."
      }
    ]
  },

  transiciones: {
    transiciones: [
      {
        id: "trans_1",
        codigo: "iniciar_evaluacion",
        nombre: "Iniciar evaluación",
        origen: ["solicitado"],
        destino: "en_evaluacion",
        tipos: ["normal"],
        roles: ["gestor_cambios", "supervisor"],
        condiciones_previas: [],
        campos_obligatorios: [],
        comentario_modo: "opcional",
        requiere_confirmacion: false,
        color: "#3b82f6",
        icono: "Play",
        orden: 1,
        activa: true,
        automatizaciones: [
          { tipo: "asignar_evaluador", descripcion: "Asigna evaluador técnico según grupo implementador" },
          { tipo: "iniciar_reloj_evaluacion", descripcion: "Inicia el cómputo de plazo SLA de evaluación" }
        ]
      },
      {
        id: "trans_2",
        codigo: "autorizar_por_modelo",
        nombre: "Autorizar por modelo",
        origen: ["solicitado"],
        destino: "autorizado",
        tipos: ["estandar"],
        roles: ["sistema"],
        condiciones_previas: [
          "modelo_aprobado_y_vigente",
          "elegibilidad_confirmada",
          "riesgo_bajo",
          "sin_bloqueos_calendario"
        ],
        campos_obligatorios: [],
        comentario_modo: "ninguno",
        requiere_confirmacion: false,
        color: "#10b981",
        icono: "CheckCircle",
        orden: 2,
        activa: true,
        automatizaciones: [
          { tipo: "registrar_autorizacion_modelo", descripcion: "Registra 'Autorizado por modelo estándar' en auditoría" }
        ]
      },
      {
        id: "trans_3",
        codigo: "solicitar_emergencia",
        nombre: "Solicitar autorización de emergencia",
        origen: ["solicitado"],
        destino: "en_autorizacion",
        tipos: ["emergencia"],
        roles: ["sistema", "gestor_cambios"],
        condiciones_previas: [],
        campos_obligatorios: ["justificacion_emergencia", "consecuencia_no_cambio"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Confirma la convocatoria inmediata del Comité de Emergencia (ECAB)?",
        color: "#dc2626",
        icono: "AlertTriangle",
        orden: 3,
        activa: true,
        automatizaciones: [
          { tipo: "convocar_ecab", descripcion: "Convoca al ECAB y despacha notificación inmediata a sus miembros" },
          { tipo: "iniciar_reloj_autorizacion", descripcion: "Inicia el reloj estricto de decisión de emergencia (2h)" }
        ]
      },
      {
        id: "trans_4",
        codigo: "solicitar_informacion",
        nombre: "Solicitar información",
        origen: ["en_evaluacion", "en_autorizacion"],
        destino: "en_pausa",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["evaluador", "aprobador_etapa_actual", "gestor_cambios"],
        condiciones_previas: [],
        campos_obligatorios: [],
        comentario_modo: "obligatorio",
        requiere_confirmacion: false,
        color: "#f59e0b",
        icono: "HelpCircle",
        orden: 4,
        activa: true,
        automatizaciones: [
          { tipo: "pausar_relojes", descripcion: "Pausa relojes de evaluación y autorización" },
          { tipo: "notificar_solicitante", descripcion: "Notifica al solicitante con la pregunta requerida" }
        ]
      },
      {
        id: "trans_5",
        codigo: "responder_informacion",
        nombre: "Responder información",
        origen: ["en_pausa"],
        destino: "estado_anterior",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["solicitante", "gestor_cambios"],
        condiciones_previas: [],
        campos_obligatorios: [],
        comentario_modo: "obligatorio",
        requiere_confirmacion: false,
        color: "#3b82f6",
        icono: "MessageSquare",
        orden: 5,
        activa: true,
        automatizaciones: [
          { tipo: "reanudar_relojes", descripcion: "Reanuda los relojes de SLA correspondientes" },
          { tipo: "notificar_evaluador_aprobador", descripcion: "Notifica al actor que formuló la consulta" }
        ]
      },
      {
        id: "trans_6",
        codigo: "enviar_a_autorizacion",
        nombre: "Enviar a autorización",
        origen: ["en_evaluacion"],
        destino: "en_autorizacion",
        tipos: ["normal"],
        roles: ["evaluador", "gestor_cambios"],
        condiciones_previas: [
          "riesgo_evaluado",
          "comentario_tecnico_completo",
          "conflictos_revisados"
        ],
        campos_obligatorios: [],
        comentario_modo: "opcional",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Confirma el envío de la RFC al circuito de autorizaciones configurado?",
        color: "#8b5cf6",
        icono: "Send",
        orden: 6,
        activa: true,
        automatizaciones: [
          { tipo: "generar_etapas_aprobacion", descripcion: "Resuelve y genera las etapas de aprobación según matriz de autoridad" },
          { tipo: "notificar_aprobadores_primera_etapa", descripcion: "Notifica a los aprobadores de la primera etapa pendiente" }
        ]
      },
      {
        id: "trans_7",
        codigo: "aprobar_etapa",
        nombre: "Aprobar etapa",
        origen: ["en_autorizacion"],
        destino: "en_autorizacion",
        destino_final_todas_aprobadas: "autorizado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["aprobador_etapa_actual", "presidente_comite"],
        condiciones_previas: ["segregacion_funciones_valida"],
        campos_obligatorios: [],
        comentario_modo: "opcional",
        requiere_confirmacion: false,
        color: "#10b981",
        icono: "CheckSquare",
        orden: 7,
        activa: true,
        automatizaciones: [
          { tipo: "avanzar_etapa_o_autorizar", descripcion: "Avanza a la siguiente etapa o transiciona automáticamente a 'Autorizado'" }
        ]
      },
      {
        id: "trans_8",
        codigo: "rechazar",
        nombre: "Rechazar",
        origen: ["en_autorizacion", "en_evaluacion"],
        destino: "rechazado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["aprobador_etapa_actual", "gestor_cambios"],
        condiciones_previas: [],
        campos_obligatorios: ["motivo_rechazo_catalogo"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Está seguro de rechazar formalmente esta solicitud de cambio?",
        color: "#ef4444",
        icono: "XCircle",
        orden: 8,
        activa: true,
        automatizaciones: [
          { tipo: "detener_relojes", descripcion: "Detiene todos los plazos activos" },
          { tipo: "notificar_rechazo", descripcion: "Notifica al solicitante con el motivo y comentarios de rechazo" }
        ]
      },
      {
        id: "trans_9",
        codigo: "reenviar_con_cambios",
        nombre: "Reenviar con cambios",
        origen: ["rechazado"],
        destino: "solicitado",
        tipos: ["normal", "estandar"],
        roles: ["solicitante"],
        condiciones_previas: ["motivo_rechazo_permite_reenvio"],
        campos_obligatorios: [],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Desea crear una nueva versión de la RFC y reiniciar las autorizaciones?",
        color: "#3b82f6",
        icono: "RotateCcw",
        orden: 9,
        activa: true,
        automatizaciones: [
          { tipo: "incrementar_version_rfc", descripcion: "Incrementa versión de la RFC y reinicia circuito de aprobación" }
        ]
      },
      {
        id: "trans_10",
        codigo: "programar",
        nombre: "Programar",
        origen: ["autorizado"],
        destino: "programado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["gestor_cambios", "supervisor", "implementador"],
        condiciones_previas: [
          "implementador_asignado",
          "ventana_valida_sin_bloqueos",
          "tareas_obligatorias_creadas",
          "plan_comunicacion_listo"
        ],
        campos_obligatorios: ["implementador_id", "ventana_inicio", "ventana_fin"],
        comentario_modo: "opcional",
        requiere_confirmacion: false,
        color: "#06b6d4",
        icono: "Calendar",
        orden: 10,
        activa: true,
        automatizaciones: [
          { tipo: "reservar_ventana_calendario", descripcion: "Reserva la ventana de mantenimiento en el calendario global" },
          { tipo: "programar_notificaciones_previas", descripcion: "Programa avisos T-48h, T-24h y T-1h a involucrados" }
        ]
      },
      {
        id: "trans_11",
        codigo: "reprogramar",
        nombre: "Reprogramar",
        origen: ["autorizado", "programado"],
        destino: "programado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["gestor_cambios", "implementador"],
        condiciones_previas: ["ventana_valida_sin_bloqueos"],
        campos_obligatorios: ["motivo_aplazamiento_catalogo", "nueva_ventana_inicio", "nueva_ventana_fin"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "Si la nueva fecha difiere más de 24h se invalidarán y reiniciarán las autorizaciones. ¿Desea continuar?",
        color: "#0ea5e9",
        icono: "Clock",
        orden: 11,
        activa: true,
        automatizaciones: [
          { tipo: "evaluar_reautorizacion_por_plazo", descripcion: "Invalida autorizaciones si difiere más del umbral configurado (24h)" },
          { tipo: "actualizar_reserva_calendario", descripcion: "Actualiza el slot de mantenimiento en el calendario" }
        ]
      },
      {
        id: "trans_12",
        codigo: "iniciar_implementacion",
        nombre: "Iniciar implementación",
        origen: ["programado"],
        destino: "en_ejecucion",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["implementador", "gestor_cambios"],
        condiciones_previas: [
          "checklist_go_no_go_superada",
          "condiciones_aprobacion_cumplidas",
          "sin_congelamiento_vigente",
          "dentro_de_tolerancia_ventana"
        ],
        campos_obligatorios: [],
        comentario_modo: "opcional",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Confirma el inicio de los trabajos técnicos sobre el entorno de producción?",
        color: "#f97316",
        icono: "Zap",
        orden: 12,
        activa: true,
        automatizaciones: [
          { tipo: "registrar_inicio_real", descripcion: "Registra fecha-hora real de inicio de los trabajos" },
          { tipo: "notificar_inicio_a_partes_interesadas", descripcion: "Despacha aviso de inicio de ventana técnica" }
        ]
      },
      {
        id: "trans_13",
        codigo: "registrar_resultado",
        nombre: "Registrar resultado",
        origen: ["en_ejecucion"],
        destino: "implementado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["implementador", "gestor_cambios"],
        condiciones_previas: [],
        campos_obligatorios: ["resultado_catalogo", "fecha_fin_real", "bitacora_ejecucion"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Confirma el fin de los trabajos y el registro del resultado obtenido?",
        color: "#14b8a6",
        icono: "CheckCircle2",
        orden: 13,
        activa: true,
        automatizaciones: [
          { tipo: "disparar_acciones_por_resultado", descripcion: "Ejecuta acciones automáticas según resultado (crear incidente en fallo, etc.)" }
        ]
      },
      {
        id: "trans_14",
        codigo: "documentar_emergencia_retroactiva",
        nombre: "Documentar emergencia retroactiva",
        origen: ["solicitado"],
        destino: "implementado",
        tipos: ["emergencia"],
        roles: ["gestor_cambios", "supervisor", "tecnico"],
        condiciones_previas: ["permiso_documentar_retroactivo"],
        campos_obligatorios: ["medio_autorizacion_emergencia", "quien_autorizo_verbalmente", "fecha_hora_verbal", "bitacora_ejecucion"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Registrar formalmente esta emergencia ya ejecutada? Creará etapa de autorización retroactiva obligatoria.",
        color: "#be185d",
        icono: "FileText",
        orden: 14,
        activa: true,
        automatizaciones: [
          { tipo: "crear_etapa_autorizacion_retroactiva", descripcion: "Genera etapa de autorización retroactiva asignada al CAB" }
        ]
      },
      {
        id: "trans_15",
        codigo: "iniciar_revision",
        nombre: "Iniciar revisión",
        origen: ["implementado"],
        destino: "en_revision_post",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["gestor_cambios", "supervisor", "sistema"],
        condiciones_previas: [],
        campos_obligatorios: [],
        comentario_modo: "opcional",
        requiere_confirmacion: false,
        color: "#a855f7",
        icono: "FileSearch",
        orden: 15,
        activa: true,
        automatizaciones: [
          { tipo: "iniciar_cuestionario_pir", descripcion: "Habilita la plantilla de revisión post-implementación (PIR)" },
          { tipo: "analizar_incidentes_ventana_observacion", descripcion: "Detecta incidentes creados en los CIs dentro de las 72h posteriores" }
        ]
      },
      {
        id: "trans_16",
        codigo: "completar_revision_cerrar",
        nombre: "Completar revisión y cerrar",
        origen: ["en_revision_post"],
        destino: "cerrado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["gestor_cambios", "supervisor"],
        condiciones_previas: [
          "pir_completada_si_aplica",
          "actualizaciones_cmdb_confirmadas"
        ],
        campos_obligatorios: ["codigo_cierre_catalogo", "resumen_cierre"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Confirma el cierre definitivo de la RFC y la aprobación del reporte PIR?",
        color: "#64748b",
        icono: "Archive",
        orden: 16,
        activa: true,
        automatizaciones: [
          { tipo: "cerrar_rfc_definitivo", descripcion: "Marca la RFC como cerrada y bloquea modificaciones posteriores" }
        ]
      },
      {
        id: "trans_17",
        codigo: "cerrar_sin_revision",
        nombre: "Cerrar sin revisión",
        origen: ["implementado"],
        destino: "cerrado",
        tipos: ["estandar", "normal"],
        roles: ["gestor_cambios", "supervisor"],
        condiciones_previas: [
          "resultado_exitoso",
          "tipo_no_exige_pir",
          "actualizaciones_cmdb_confirmadas"
        ],
        campos_obligatorios: ["codigo_cierre_catalogo", "resumen_cierre"],
        comentario_modo: "opcional",
        requiere_confirmacion: false,
        color: "#475569",
        icono: "CheckCheck",
        orden: 17,
        activa: true,
        automatizaciones: [
          { tipo: "cerrar_rfc_directo", descripcion: "Cierra la RFC para cambios sin exigencia normativa de PIR" }
        ]
      },
      {
        id: "trans_18",
        codigo: "cancelar",
        nombre: "Cancelar",
        origen: ["solicitado", "en_evaluacion", "en_pausa", "en_autorizacion", "autorizado", "programado"],
        destino: "cancelado",
        tipos: ["estandar", "normal", "emergencia"],
        roles: ["solicitante", "gestor_cambios", "administrador"],
        condiciones_previas: ["antes_de_ejecucion"],
        campos_obligatorios: ["motivo_cancelacion"],
        comentario_modo: "obligatorio",
        requiere_confirmacion: true,
        texto_confirmacion: "¿Confirma la cancelación de la solicitud? Se liberará la ventana en el calendario.",
        color: "#94a3b8",
        icono: "Ban",
        orden: 18,
        activa: true,
        automatizaciones: [
          { tipo: "liberar_reserva_calendario", descripcion: "Libera la ventana reservada en el calendario de cambios" },
          { tipo: "notificar_cancelacion", descripcion: "Notifica a todos los participantes involucrados" }
        ]
      }
    ]
  },

  etapas_aprobacion: {
    etapas: [
      {
        id: "etapa_tecnica",
        codigo: "tecnica",
        nombre: "Evaluación Técnica",
        descripcion: "Revisión técnica de viabilidad, planes de rollback y riesgos por parte de la supervisión de soporte.",
        tipo_aprobador: "rol_contextual",
        rol_contextual: "supervisor_grupo_implementador",
        regla_decision: "cualquiera",
        plazo_horas_p1: 2,
        plazo_horas_p2: 8,
        plazo_horas_p3: 24,
        plazo_horas_p4: 48,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: true,
          abstenerse: false
        },
        delegacion_permitida: true,
        duracion_max_delegacion_dias: 7,
        invalidar_si_cambia: ["plan_implementacion", "plan_rollback", "fechas_propuestas", "ci_ids"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 1
      },
      {
        id: "etapa_negocio",
        codigo: "negocio",
        nombre: "Aprobación de Negocio",
        descripcion: "Validación del impacto operativo y funcional por parte de los Gestores de Área de las áreas afectadas.",
        tipo_aprobador: "rol_contextual",
        rol_contextual: "gestor_area_departamento_afectado",
        regla_decision: "todos",
        plazo_horas_p1: 4,
        plazo_horas_p2: 12,
        plazo_horas_p3: 48,
        plazo_horas_p4: 72,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: true,
          abstenerse: false
        },
        delegacion_permitida: true,
        duracion_max_delegacion_dias: 7,
        invalidar_si_cambia: ["fechas_propuestas", "requiere_interrupcion", "duracion_interrupcion", "servicio_id"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 2
      },
      {
        id: "etapa_gestor_cambios",
        codigo: "gestor_cambios",
        nombre: "Aprobación Gestor de Cambios",
        descripcion: "Autorización de gobernanza por el Change Manager para cambios de bajo y medio riesgo.",
        tipo_aprobador: "perfil",
        id_perfil_aprobador: "gestor_cambios",
        regla_decision: "cualquiera",
        plazo_horas_p1: 2,
        plazo_horas_p2: 8,
        plazo_horas_p3: 24,
        plazo_horas_p4: 48,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: true,
          abstenerse: false
        },
        delegacion_permitida: true,
        duracion_max_delegacion_dias: 14,
        invalidar_si_cambia: ["tipo_cambio", "nivel_riesgo", "fechas_propuestas", "plan_rollback"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 3
      },
      {
        id: "etapa_cab",
        codigo: "cab",
        nombre: "Comité Asesor de Cambios (CAB)",
        descripcion: "Dictamen colegiado del Change Advisory Board para cambios de riesgo alto o crítico.",
        tipo_aprobador: "comite",
        id_comite: "cab",
        regla_decision: "segun_comite",
        plazo_horas_p1: 24,
        plazo_horas_p2: 72,
        plazo_horas_p3: 168,
        plazo_horas_p4: 168,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: false,
          abstenerse: true
        },
        delegacion_permitida: false,
        duracion_max_delegacion_dias: 0,
        invalidar_si_cambia: ["tipo_cambio", "nivel_riesgo", "fechas_propuestas", "servicio_id", "ci_ids", "plan_rollback"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 4
      },
      {
        id: "etapa_ecab",
        codigo: "ecab",
        nombre: "Comité de Emergencia (ECAB)",
        descripcion: "Autorización expedita por el Emergency Change Advisory Board para incidentes y emergencias críticas.",
        tipo_aprobador: "comite",
        id_comite: "ecab",
        regla_decision: "segun_comite",
        plazo_horas_p1: 2,
        plazo_horas_p2: 4,
        plazo_horas_p3: 8,
        plazo_horas_p4: 24,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: false,
          abstenerse: false
        },
        delegacion_permitida: false,
        duracion_max_delegacion_dias: 0,
        invalidar_si_cambia: ["justificacion_emergencia", "ci_ids", "servicio_id"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 5
      },
      {
        id: "etapa_direccion",
        codigo: "direccion",
        nombre: "Dirección Institucional / CIO",
        descripcion: "Aprobación ejecutiva requerida para intervenciones de riesgo Crítico con alto impacto corporativo.",
        tipo_aprobador: "perfil",
        id_perfil_aprobador: "aprobador",
        regla_decision: "cualquiera",
        plazo_horas_p1: 4,
        plazo_horas_p2: 12,
        plazo_horas_p3: 48,
        plazo_horas_p4: 72,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: true,
          abstenerse: false
        },
        delegacion_permitida: true,
        duracion_max_delegacion_dias: 5,
        invalidar_si_cambia: ["servicio_id", "nivel_riesgo", "fechas_propuestas"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 6
      },
      {
        id: "etapa_excepcion_ventana",
        codigo: "excepcion_ventana",
        nombre: "Excepción de Ventana de Mantenimiento",
        descripcion: "Autorización complementaria cuando una RFC debe ejecutarse fuera del horario de ventana permitido.",
        tipo_aprobador: "perfil",
        id_perfil_aprobador: "aprobador",
        regla_decision: "cualquiera",
        plazo_horas_p1: 2,
        plazo_horas_p2: 8,
        plazo_horas_p3: 24,
        plazo_horas_p4: 48,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: false,
          rechazar: true,
          solicitar_informacion: true,
          delegar: true,
          abstenerse: false
        },
        delegacion_permitida: true,
        duracion_max_delegacion_dias: 3,
        invalidar_si_cambia: ["fechas_propuestas"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 7
      },
      {
        id: "etapa_excepcion_congelamiento",
        codigo: "excepcion_congelamiento",
        nombre: "Excepción de Período de Congelamiento",
        descripcion: "Autorización explícita para intervenir durante un período de congelamiento institucional (ej. cierre contable).",
        tipo_aprobador: "perfil",
        id_perfil_aprobador: "aprobador",
        regla_decision: "cualquiera",
        plazo_horas_p1: 2,
        plazo_horas_p2: 8,
        plazo_horas_p3: 24,
        plazo_horas_p4: 48,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: true,
          abstenerse: false
        },
        delegacion_permitida: true,
        duracion_max_delegacion_dias: 3,
        invalidar_si_cambia: ["fechas_propuestas"],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 8
      },
      {
        id: "etapa_autorizacion_retroactiva",
        codigo: "autorizacion_retroactiva",
        nombre: "Autorización Retroactiva CAB",
        descripcion: "Revisión formal a posteriori por el CAB de cambios de emergencia implementados sin dictamen previo.",
        tipo_aprobador: "comite",
        id_comite: "cab",
        regla_decision: "segun_comite",
        plazo_horas_p1: 24,
        plazo_horas_p2: 24,
        plazo_horas_p3: 24,
        plazo_horas_p4: 24,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: true,
          rechazar: true,
          solicitar_informacion: true,
          delegar: false,
          abstenerse: false
        },
        delegacion_permitida: false,
        duracion_max_delegacion_dias: 0,
        invalidar_si_cambia: [],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 9
      },
      {
        id: "etapa_autorizacion_modelo",
        codigo: "autorizacion_modelo",
        nombre: "Autorización por Modelo Estándar",
        descripcion: "Aprobación automática otorgada por el sistema basada en la homologación previa del modelo estándar.",
        tipo_aprobador: "sistema",
        regla_decision: "automatica",
        plazo_horas_p1: 0,
        plazo_horas_p2: 0,
        plazo_horas_p3: 0,
        plazo_horas_p4: 0,
        acciones_permitidas: {
          aprobar: true,
          aprobar_con_condiciones: false,
          rechazar: false,
          solicitar_informacion: false,
          delegar: false,
          abstenerse: false
        },
        delegacion_permitida: false,
        duracion_max_delegacion_dias: 0,
        invalidar_si_cambia: [],
        modo_relativo_defecto: "secuencial",
        activa: true,
        orden: 10
      }
    ],
    segregacion_funciones: {
      solicitante_no_aprueba: true,
      implementador_no_aprueba: true,
      no_dos_etapas_misma_persona: true,
      retroactivo_no_autoaprueba: true,
      aprobador_respaldo_activo: true,
      perfil_respaldo: "gestor_cambios"
    }
  },

  comites: {
    cab: {
      nombre: "Comité Asesor de Cambios (CAB)",
      descripcion: "Órgano colegiado multidisciplinario encargado de evaluar la conveniencia técnica, de impacto y continuidad de los cambios significativos.",
      quorum_minimo: 3,
      presencia_presidente_obligatoria: true,
      regla_aprobacion: "mayoria_simple",
      desempate: "voto_calidad_presidente",
      voto_asincrono_permitido: true,
      plazo_voto_asincrono_horas: 48,
      dictamenes_permitidos: ["aprobar", "aprobar_con_condiciones", "rechazar", "aplazar", "solicitar_informacion"],
      abstenciones_cuentan_para_quorum: false,
      exclusion_conflicto_interes: true,
      reunion: {
        frecuencia: "semanal",
        dia_semana: "miercoles",
        hora_inicio: "10:00",
        duracion_minutos: 60,
        ubicacion_enlace: "Sala de Coordinación TI / Teams",
        corte_agenda_horas: 24,
        generacion_agenda_automatica: true,
        recordatorio_horas_antes: 24,
        plantilla_acta: "ACTA DE REUNIÓN CAB\nFecha: {{fecha}}\nAsistentes: {{asistentes}}\nQuórum: {{quorum}}\nRFCs Tratadas: {{rfcs}}\nVotación y Dictamen: {{dictamen}}\nObservaciones y Acuerdos: {{observaciones}}"
      },
      miembros: [
        { id_usuario: 11, nombre: "Diego Mendoza", correo: "diego.cambios@empresa.com", rol_comite: "presidente", perfil_origen: "Gestor de Cambios", suplente_id: 7, suplente_nombre: "Roberto Flores", activo: true },
        { id_usuario: 10, nombre: "Elena Vargas", correo: "elena.cab@empresa.com", rol_comite: "secretario", perfil_origen: "Aprobador", suplente_id: 8, suplente_nombre: "Patricia Salazar", activo: true },
        { id_usuario: 7, nombre: "Roberto Flores", correo: "roberto.supervisor@empresa.com", rol_comite: "miembro_voto", perfil_origen: "Supervisor", suplente_id: 5, suplente_nombre: "Carlos Quispe", activo: true },
        { id_usuario: 12, nombre: "Andres Benitez", correo: "andres.activos@empresa.com", rol_comite: "miembro_voto", perfil_origen: "Gestor de Activos y Configuracion", suplente_id: null, suplente_nombre: "Sin asignar", activo: true },
        { id_usuario: 9, nombre: "Fernando Castro", correo: "fernando.auditor@empresa.com", rol_comite: "observador", perfil_origen: "Auditor", suplente_id: null, suplente_nombre: "Sin asignar", activo: true }
      ]
    },
    ecab: {
      nombre: "Comité de Cambios de Emergencia (ECAB)",
      descripcion: "Grupo reducido con autoridad delegada para la deliberación y toma de decisiones inmediata sobre cambios críticos y de emergencia.",
      quorum_minimo: 2,
      presencia_presidente_obligatoria: true,
      regla_aprobacion: "dos_de_tres",
      desempate: "voto_calidad_presidente",
      voto_asincrono_permitido: true,
      plazo_voto_asincrono_horas: 2,
      dictamenes_permitidos: ["aprobar", "aprobar_con_condiciones", "rechazar"],
      abstenciones_cuentan_para_quorum: false,
      exclusion_conflicto_interes: true,
      plazos_decision_horas: {
        p1: 2,
        p2: 4,
        p3: 8,
        p4: 24
      },
      canal_convocatoria_inmediata: "notificacion_y_correo",
      permitir_decision_verbal: true,
      campos_decision_verbal: ["quien_autorizo", "medio_comunicacion", "fecha_hora"],
      revision_retroactiva_cab_obligatoria: true,
      miembros: [
        { id_usuario: 11, nombre: "Diego Mendoza", correo: "diego.cambios@empresa.com", rol_comite: "presidente", perfil_origen: "Gestor de Cambios", suplente_id: 7, suplente_nombre: "Roberto Flores", activo: true },
        { id_usuario: 10, nombre: "Elena Vargas", correo: "elena.cab@empresa.com", rol_comite: "miembro_voto", perfil_origen: "Aprobador", suplente_id: 8, suplente_nombre: "Patricia Salazar", activo: true },
        { id_usuario: 7, nombre: "Roberto Flores", correo: "roberto.supervisor@empresa.com", rol_comite: "miembro_voto", perfil_origen: "Supervisor", suplente_id: 5, suplente_nombre: "Carlos Quispe", activo: true }
      ]
    }
  },

  plazos_escalamiento: {
    plazos_por_prioridad: [
      {
        prioridad_id: "p1",
        prioridad_nombre: "P1 - Crítica",
        primera_respuesta_horas: 0.5,
        evaluacion_horas: 2,
        autorizacion_total_horas: 2,
        plazo_por_etapa_horas: 1
      },
      {
        prioridad_id: "p2",
        prioridad_nombre: "P2 - Alta",
        primera_respuesta_horas: 2,
        evaluacion_horas: 12,
        autorizacion_total_horas: 24,
        plazo_por_etapa_horas: 8
      },
      {
        prioridad_id: "p3",
        prioridad_nombre: "P3 - Media",
        primera_respuesta_horas: 8,
        evaluacion_horas: 48,
        autorizacion_total_horas: 72,
        plazo_por_etapa_horas: 24
      },
      {
        prioridad_id: "p4",
        prioridad_nombre: "P4 - Baja",
        primera_respuesta_horas: 24,
        evaluacion_horas: 72,
        autorizacion_total_horas: 120,
        plazo_por_etapa_horas: 48
      }
    ],
    parametros_adicionales: {
      horas_diferencia_reprogramacion_reautorizar: 24,
      tolerancia_inicio_minutos: 30,
      vigencia_autorizacion_dias: {
        normal: 7,
        estandar: 30,
        emergencia: 1
      },
      tipo_computo_tiempo: "horas_habiles"
    },
    reglas_escalamiento: [
      {
        id: "esc_1",
        nombre: "Recordatorio preventivo al aprobador",
        objetivo: "autorizacion",
        prioridades: ["p1", "p2", "p3", "p4"],
        umbral_tipo: "porcentaje_plazo",
        umbral_valor: 75,
        accion: "notificar",
        destinatarios: ["aprobador_pendiente"],
        mensaje: "La aprobación de la RFC ha alcanzado el 75% del plazo establecido. Por favor revise el caso a la brevedad.",
        repetir_cada_horas: 0,
        max_repeticiones: 1,
        activa: true
      },
      {
        id: "esc_2",
        nombre: "Alerta crítica de inminencia de vencimiento",
        objetivo: "autorizacion",
        prioridades: ["p1", "p2", "p3", "p4"],
        umbral_tipo: "porcentaje_plazo",
        umbral_valor: 90,
        accion: "notificar_y_suplente",
        destinatarios: ["suplente_aprobador", "gestor_cambios"],
        mensaje: "La aprobación de la RFC está al 90% del tiempo límite. Se alerta al suplente formal y al Gestor de Cambios.",
        repetir_cada_horas: 0,
        max_repeticiones: 1,
        activa: true
      },
      {
        id: "esc_3",
        nombre: "Escalamiento por vencimiento formal",
        objetivo: "autorizacion",
        prioridades: ["p1", "p2", "p3", "p4"],
        umbral_tipo: "vencido_horas",
        umbral_valor: 0,
        accion: "etiquetar_y_escalar_superior",
        destinatarios: ["superior_jerarquico", "gestor_cambios"],
        etiqueta: "Vencido",
        mensaje: "El plazo de autorización ha vencido formalmente. Se escala al superior jerárquico. Nunca se aprueba de forma automática.",
        repetir_cada_horas: 12,
        max_repeticiones: 3,
        activa: true
      },
      {
        id: "esc_4",
        nombre: "Escalamiento de Emergencia sin respuesta ECAB",
        objetivo: "autorizacion",
        prioridades: ["p1"],
        umbral_tipo: "vencido_horas",
        umbral_valor: 0.5,
        accion: "notificar_direccion",
        destinatarios: ["direccion"],
        etiqueta: "Emergencia en Riesgo",
        mensaje: "Emergencia sin decisión del ECAB tras 30 minutos de su convocatoria. Se notifica de urgencia a Dirección Institucional.",
        repetir_cada_horas: 1,
        max_repeticiones: 2,
        activa: true
      }
    ]
  },

  tareas_checklists: {
    catalogo_tareas: [
      {
        id: "tar_respaldo",
        codigo: "tarea_verificar_respaldo",
        nombre: "Verificar y validar respaldo del sistema (Backup)",
        descripcion: "Confirmar que existe una copia de seguridad íntegra y verificada antes de iniciar la intervención técnica.",
        fase: "pre_implementacion",
        tipo: "verificacion",
        responsable_tipo: "implementador",
        duracion_estimada_minutos: 30,
        offset_horas_ventana: -2,
        obligatoria: true,
        bloquea_transicion: "iniciar_implementacion",
        checklist_interno: ["Verificar fecha de último snapshot", "Validar integridad del backup", "Confirmar capacidad de restauración"],
        dependencia_tarea_id: null,
        activa: true
      },
      {
        id: "tar_notificar_usuarios",
        codigo: "tarea_notificar_usuarios",
        nombre: "Notificar inicio a usuarios y partes interesadas",
        descripcion: "Despachar el comunicado de interrupción a las jefaturas de áreas afectadas.",
        fase: "pre_implementacion",
        tipo: "comunicacion",
        responsable_tipo: "gestor_cambios",
        duracion_estimada_minutos: 15,
        offset_horas_ventana: -1,
        obligatoria: true,
        bloquea_transicion: null,
        checklist_interno: ["Verificar lista de distribución de áreas", "Enviar plantilla de aviso"],
        dependencia_tarea_id: null,
        activa: true
      },
      {
        id: "tar_confirmar_equipo",
        codigo: "tarea_confirmar_equipo",
        nombre: "Confirmar disponibilidad del equipo técnico y soporte",
        descripcion: "Verificar conectividad y disponibilidad de guardia técnica para la ventana.",
        fase: "pre_implementacion",
        tipo: "coordinacion",
        responsable_tipo: "supervisor",
        duracion_estimada_minutos: 15,
        offset_horas_ventana: -1,
        obligatoria: false,
        bloquea_transicion: null,
        checklist_interno: ["Llamada de confirmación técnica", "Comprobar credenciales administrativas"],
        dependencia_tarea_id: null,
        activa: true
      },
      {
        id: "tar_ejecutar_plan",
        codigo: "tarea_ejecutar_plan",
        nombre: "Ejecución de cambios según plan técnico",
        descripcion: "Aplicar la secuencia de comandos, scripts o configuraciones contempladas en el plan de implementación.",
        fase: "implementacion",
        tipo: "ejecucion",
        responsable_tipo: "implementador",
        duracion_estimada_minutos: 120,
        offset_horas_ventana: 0,
        obligatoria: true,
        bloquea_transicion: "registrar_resultado",
        checklist_interno: ["Seguir orden paso a paso", "Registrar bitácora intermedia"],
        dependencia_tarea_id: "tar_respaldo",
        activa: true
      },
      {
        id: "tar_pruebas_validacion",
        codigo: "tarea_pruebas_validacion",
        nombre: "Pruebas técnicas de validación y humo",
        descripcion: "Ejecución de pruebas unitarias y de humo para validar el correcto funcionamiento del servicio.",
        fase: "validacion",
        tipo: "pruebas",
        responsable_tipo: "implementador",
        duracion_estimada_minutos: 45,
        offset_horas_ventana: 2,
        obligatoria: true,
        bloquea_transicion: "registrar_resultado",
        checklist_interno: ["Probar servicios core", "Validar interfaces y puertos", "Revisar logs de error"],
        dependencia_tarea_id: "tar_ejecutar_plan",
        activa: true
      },
      {
        id: "tar_verificar_monitoreo",
        codigo: "tarea_verificar_monitoreo",
        nombre: "Verificar telemetría y monitoreo de alertas",
        descripcion: "Monitorear métricas de CPU, memoria, latencia y alarmas tras la intervención.",
        fase: "validacion",
        tipo: "monitoreo",
        responsable_tipo: "implementador",
        duracion_estimada_minutos: 30,
        offset_horas_ventana: 2.5,
        obligatoria: false,
        bloquea_transicion: null,
        checklist_interno: ["Panel Zabbix/Prometheus en verde", "Sin alertas de umbral disparadas"],
        dependencia_tarea_id: "tar_pruebas_validacion",
        activa: true
      },
      {
        id: "tar_actualizar_cmdb",
        codigo: "tarea_actualizar_cmdb",
        nombre: "Actualizar atributos en CMDB e inventario",
        descripcion: "Registrar la nueva versión de software, IP o configuración de activos en la base de datos de configuración.",
        fase: "post_implementacion",
        tipo: "cmdb",
        responsable_tipo: "gestor_activos",
        duracion_estimada_minutos: 30,
        offset_horas_ventana: 3,
        obligatoria: true,
        bloquea_transicion: "completar_revision_cerrar",
        checklist_interno: ["Actualizar registro de CI", "Comprobar relaciones en topología"],
        dependencia_tarea_id: "tar_pruebas_validacion",
        activa: true
      },
      {
        id: "tar_comunicar_cierre",
        codigo: "tarea_comunicar_cierre",
        nombre: "Comunicar finalización y normalidad a usuarios",
        descripcion: "Enviar correo de restablecimiento de operaciones normales a la organización.",
        fase: "post_implementacion",
        tipo: "comunicacion",
        responsable_tipo: "gestor_cambios",
        duracion_estimada_minutos: 15,
        offset_horas_ventana: 3.5,
        obligatoria: false,
        bloquea_transicion: null,
        checklist_interno: ["Enviar plantilla de fin de ventana"],
        dependencia_tarea_id: null,
        activa: true
      }
    ],
    paquetes_tareas: [
      {
        id: "paq_normal",
        nombre: "Paquete Estándar para Cambio Normal",
        descripcion: "Conjunto de tareas de control preventivo, ejecución técnica, validación y aseguramiento de CMDB.",
        aplica_cuando: { tipo_cambio: ["normal"] },
        tareas_ids: ["tar_respaldo", "tar_notificar_usuarios", "tar_ejecutar_plan", "tar_pruebas_validacion", "tar_verificar_monitoreo", "tar_actualizar_cmdb", "tar_comunicar_cierre"],
        activo: true
      },
      {
        id: "paq_emergencia",
        nombre: "Paquete de Acción Rápida para Emergencia",
        descripcion: "Tareas ágiles centradas en mitigación rápida, validación y posterior documentación retroactiva.",
        aplica_cuando: { tipo_cambio: ["emergencia"] },
        tareas_ids: ["tar_respaldo", "tar_ejecutar_plan", "tar_pruebas_validacion", "tar_actualizar_cmdb"],
        activo: true
      },
      {
        id: "paq_estandar",
        nombre: "Paquete para Modelo Estándar",
        descripcion: "Secuencia simplificada predefinida por el modelo de cambio.",
        aplica_cuando: { tipo_cambio: ["estandar"] },
        tareas_ids: ["tar_ejecutar_plan", "tar_pruebas_validacion"],
        activo: true
      }
    ],
    checklist_go_no_go: [
      {
        id: "gng_1",
        texto: "Aprobaciones completas y condiciones de autorización cumplidas",
        obligatorio: true,
        responsable_rol: "gestor_cambios",
        evidencia_requerida: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        orden: 1
      },
      {
        id: "gng_2",
        texto: "Respaldo verificado e íntegro con prueba de restauración",
        obligatorio: true,
        responsable_rol: "implementador",
        evidencia_requerida: true,
        tipos_aplicables: ["normal", "emergencia"],
        orden: 2
      },
      {
        id: "gng_3",
        texto: "Plan de rollback revisado y recursos de reversión disponibles",
        obligatorio: true,
        responsable_rol: "implementador",
        evidencia_requerida: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        orden: 3
      },
      {
        id: "gng_4",
        texto: "Ventana confirmada en calendario sin conflictos bloqueantes",
        obligatorio: true,
        responsable_rol: "gestor_cambios",
        evidencia_requerida: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        orden: 4
      },
      {
        id: "gng_5",
        texto: "Implementador y equipo de soporte asignados y disponibles",
        obligatorio: true,
        responsable_rol: "supervisor",
        evidencia_requerida: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        orden: 5
      },
      {
        id: "gng_6",
        texto: "Usuarios de áreas afectadas debidamente notificados de la interrupción",
        obligatorio: true,
        responsable_rol: "gestor_cambios",
        evidencia_requerida: false,
        tipos_aplicables: ["normal"],
        orden: 6
      },
      {
        id: "gng_7",
        texto: "Pruebas previas en ambiente de pruebas o preproducción validadas",
        obligatorio: true,
        responsable_rol: "implementador",
        evidencia_requerida: true,
        tipos_aplicables: ["normal"],
        orden: 7
      },
      {
        id: "gng_8",
        texto: "Contactos de escalamiento técnico y proveedores en guardia",
        obligatorio: true,
        responsable_rol: "supervisor",
        evidencia_requerida: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        orden: 8
      },
      {
        id: "gng_9",
        texto: "Accesos, contraseñas temporales y credenciales de ejecución disponibles",
        obligatorio: true,
        responsable_rol: "implementador",
        evidencia_requerida: false,
        tipos_aplicables: ["estandar", "normal", "emergencia"],
        orden: 9
      }
    ],
    conversion_plan_a_tareas: {
      convertir_pasos_en_tareas: true,
      fase_por_defecto: "implementacion"
    }
  },

  implementacion_cierre: {
    resultado_bitacora: {
      campos_exigidos: ["resultado", "fecha_inicio_real", "fecha_fin_real", "duracion_interrupcion_real", "bitacora_detallada"],
      bitacora_obligatoria: true,
      tolerancia_inicio_minutos: 30,
      tolerancia_fin_minutos: 30,
      exigir_motivo_exceso_ventana: true
    },
    acciones_por_resultado: {
      fallido_o_rollback: {
        exigir_causa_fallo: true,
        crear_incidente_vinculado: true,
        plantilla_incidente: "Incidente mayor por cambio fallido",
        heredar_prioridad: true,
        crear_problema_si_sugiere: true,
        plantilla_problema: "Investigación de causa raíz por fallo de RFC",
        notificar_roles: ["gestor_cambios", "supervisor", "responsables_servicio"],
        etiquetar_rfc: ["Fallido", "Rollback"],
        etiquetar_ci: true,
        suspender_modelo_estandar_si_aplica: true,
        forzar_pir_obligatoria: true
      },
      parcial: {
        exigir_descripcion_pendiente: true,
        crear_rfc_seguimiento_opcional: true,
        forzar_pir: true
      },
      exitoso: {
        programar_pir_segun_tipo: true
      }
    },
    actualizacion_cmdb: {
      exigir_plan_actualizacion_cmdb_antes_programar: true,
      aplicar_automaticamente_en_exitoso: false,
      bloquear_cierre_si_hay_actualizaciones_cmdb_pendientes: true,
      notificar_gestor_activos: true
    },
    cierre: {
      exigir_codigo_cierre: true,
      exigir_resumen_cierre: true,
      cierre_automatico_dias_sin_pir: 5,
      permitir_reapertura: false,
      excepcion_reapertura_gestor_dias: 3,
      exigir_motivo_reapertura: true
    }
  },

  pir: {
    obligatoriedad_consolidada: [
      { tipo_cambio: "normal", resultado: "exitoso", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "normal", resultado: "parcial", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "normal", resultado: "fallido", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "normal", resultado: "rollback", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "emergencia", resultado: "exitoso", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "emergencia", resultado: "parcial", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "emergencia", resultado: "fallido", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "emergencia", resultado: "rollback", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "estandar", resultado: "exitoso", riesgo: "bajo", obligatoria: false, muestreo_pct: 10 },
      { tipo_cambio: "estandar", resultado: "parcial", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "estandar", resultado: "fallido", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 },
      { tipo_cambio: "estandar", resultado: "rollback", riesgo: "cualquiera", obligatoria: true, muestreo_pct: 100 }
    ],
    parametros: {
      plazo_completar_dias: 5,
      revisor_permitido: "gestor_cambios_o_supervisor",
      prohibir_implementador_revisor: true,
      ventana_observacion_incidentes_horas: 72,
      calificaciones_disponibles: ["exitoso", "con_observaciones", "fallido"],
      bloquear_cierre_hasta_completar: true,
      habilitar_acciones_mejora: true
    },
    preguntas: [
      {
        id: "pir_q1",
        orden: 1,
        texto: "¿Se lograron los objetivos propuestos del cambio?",
        tipo_respuesta: "lista",
        opciones: ["Totalmente", "Parcialmente", "No se lograron"],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q2",
        orden: 2,
        texto: "Evaluación y resultado de cada criterio de éxito verificable",
        tipo_respuesta: "texto",
        opciones: [],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q3",
        orden: 3,
        texto: "¿La implementación se completó dentro de la ventana de mantenimiento autorizada?",
        tipo_respuesta: "booleano",
        opciones: ["Sí", "No"],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q4",
        orden: 4,
        texto: "Desviaciones o imprevistos detectados respecto al plan técnico original",
        tipo_respuesta: "texto",
        opciones: [],
        obligatoria: false,
        tipos_aplicables: ["normal", "emergencia"]
      },
      {
        id: "pir_q5",
        orden: 5,
        texto: "Incidentes causados o atribuibles al cambio durante y tras la ventana",
        tipo_respuesta: "texto",
        opciones: [],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q6",
        orden: 6,
        texto: "¿Se ejecutó el plan de rollback? Indicar motivo, tiempo empleado y efectividad",
        tipo_respuesta: "texto",
        opciones: [],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q7",
        orden: 7,
        texto: "¿El nivel de riesgo calculado en la evaluación previa fue adecuado?",
        tipo_respuesta: "lista",
        opciones: ["Menor que el riesgo real", "Adecuado", "Mayor que el riesgo real"],
        obligatoria: true,
        tipos_aplicables: ["normal", "emergencia"]
      },
      {
        id: "pir_q8",
        orden: 8,
        texto: "¿Fue oportuna y clara la comunicación a los usuarios y áreas afectadas?",
        tipo_respuesta: "lista",
        opciones: ["Excelente", "Adecuada", "Deficiente", "No requirió"],
        obligatoria: true,
        tipos_aplicables: ["normal", "emergencia"]
      },
      {
        id: "pir_q9",
        orden: 9,
        texto: "Consumo de recursos, costos y horas hombre (real vs. estimado)",
        tipo_respuesta: "texto",
        opciones: [],
        obligatoria: false,
        tipos_aplicables: ["normal"]
      },
      {
        id: "pir_q10",
        orden: 10,
        texto: "¿Se actualizaron todos los atributos y relaciones en la CMDB?",
        tipo_respuesta: "booleano",
        opciones: ["Sí", "No"],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q11",
        orden: 11,
        texto: "¿Se generaron o actualizaron artículos en la Base de Conocimiento (KEDB)?",
        tipo_respuesta: "booleano",
        opciones: ["Sí", "No"],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      },
      {
        id: "pir_q12",
        orden: 12,
        texto: "Lecciones aprendidas principales y oportunidades de mejora identificadas",
        tipo_respuesta: "texto",
        opciones: [],
        obligatoria: true,
        tipos_aplicables: ["estandar", "normal", "emergencia"]
      }
    ]
  }
};

async function main() {
  console.log("Iniciando siembra de configuración de fábrica para 1.3.3.3...");
  const pestañas = Object.keys(FACTORY_SNAPSHOTS);
  
  for (const pestana of pestañas) {
    const snapshot = FACTORY_SNAPSHOTS[pestana];
    
    // Check if published v1 already exists
    const check = await pool.query(
      "SELECT id_version FROM configuracion_modulo_versiones WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true",
      [pestana]
    );

    if (check.rows.length === 0) {
      await pool.query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'gestion_de_cambios', '1.3.3.3', $1, 1, true, false, $2, '{"cambios": ["Configuración inicial de fábrica v1"]}', 'Versión inicial de fábrica ITIL 4 / COBIT BAI06', 1
        )
      `, [pestana, JSON.stringify(snapshot)]);
      console.log(`Pestaña '${pestana}' sembrada con v1 publicada.`);
    } else {
      console.log(`Pestaña '${pestana}' ya existe en versión publicada.`);
    }
  }

  console.log("Siembra completada con éxito.");
  await pool.end();
}

main().catch(err => {
  console.error("Error en siembra:", err);
  pool.end();
  process.exit(1);
});
