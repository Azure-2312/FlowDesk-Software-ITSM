import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";
import { calcularDiffConfig } from "@/shared/lib/configuracionModulo";

// Snapshot de fábrica referencial para submódulo 1.3.3.3
export const VALORES_FABRICA_1333: Record<string, any> = {
  estados: {
    estados: [
      { id: "solicitado", codigo: "solicitado", nombre: "Solicitado", tipo: "inicial", color: "#6366f1", reloj: "evaluacion", reloj_comportamiento: "corre", cuenta_como_abierto: true, permite_editar: "si", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 1, descripcion: "RFC registrada a la espera de evaluación inicial o autoautorización por modelo." },
      { id: "en_evaluacion", codigo: "en_evaluacion", nombre: "En evaluación", tipo: "en_evaluacion", color: "#3b82f6", reloj: "evaluacion", reloj_comportamiento: "corre", cuenta_como_abierto: true, permite_editar: "si", aparece_calendario: false, tipos_aplicables: ["normal"], es_sistema: false, activo: true, orden: 2, descripcion: "Análisis técnico, de riesgos, dependencias y conflictos por el evaluador asignado." },
      { id: "en_pausa", codigo: "en_pausa", nombre: "En pausa", tipo: "en_pausa", color: "#f59e0b", reloj: "ninguno", reloj_comportamiento: "pausa", cuenta_como_abierto: true, permite_editar: "solo_comentarios", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: false, activo: true, orden: 3, descripcion: "Flujo detenido a la espera de información complementaria solicitada." },
      { id: "en_autorizacion", codigo: "en_autorizacion", nombre: "En autorización", tipo: "en_autorizacion", color: "#8b5cf6", reloj: "autorizacion", reloj_comportamiento: "corre", cuenta_como_abierto: true, permite_editar: "solo_comentarios_y_tareas", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: false, activo: true, orden: 4, descripcion: "En circuito de aprobación de acuerdo a la matriz de autoridad y niveles de riesgo." },
      { id: "autorizado", codigo: "autorizado", nombre: "Autorizado", tipo: "autorizado", color: "#10b981", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: true, permite_editar: "solo_comentarios_y_tareas", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 5, descripcion: "Todas las etapas requeridas han emitido dictamen favorable; listo para programar." },
      { id: "programado", codigo: "programado", nombre: "Programado", tipo: "programado", color: "#06b6d4", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: true, permite_editar: "solo_comentarios_y_tareas", aparece_calendario: true, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 6, descripcion: "Ventana de mantenimiento confirmada en calendario, tareas y recursos asignados." },
      { id: "en_ejecucion", codigo: "en_ejecucion", nombre: "En ejecución", tipo: "en_ejecucion", color: "#f97316", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: true, permite_editar: "solo_comentarios_y_bitacora", aparece_calendario: true, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 7, descripcion: "Intervención técnica en progreso sobre los CI afectados, con Go/No-Go superado." },
      { id: "implementado", codigo: "implementado", nombre: "Implementado", tipo: "implementado", color: "#14b8a6", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: true, permite_editar: "solo_comentarios", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 8, descripcion: "Intervención concluida y resultado registrado formalmente." },
      { id: "en_revision_post", codigo: "en_revision_post", nombre: "En revisión post-implementación", tipo: "implementado", color: "#a855f7", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: true, permite_editar: "solo_la_revision", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: false, activo: true, orden: 9, descripcion: "Fase PIR activa para auditar cumplimiento de objetivos, incidentes y lecciones." },
      { id: "cerrado", codigo: "cerrado", nombre: "Cerrado", tipo: "final", color: "#64748b", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: false, permite_editar: "no", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 10, descripcion: "Ciclo de vida cerrado con código de cierre y actualización de CMDB asegurada." },
      { id: "rechazado", codigo: "rechazado", nombre: "Rechazado", tipo: "final", color: "#ef4444", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: false, permite_editar: "no", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 11, descripcion: "Solicitud denegada por la autoridad evaluadora con motivo justificado." },
      { id: "cancelado", codigo: "cancelado", nombre: "Cancelado", tipo: "final", color: "#94a3b8", reloj: "ninguno", reloj_comportamiento: "detiene", cuenta_como_abierto: false, permite_editar: "no", aparece_calendario: false, tipos_aplicables: ["estandar", "normal", "emergencia"], es_sistema: true, activo: true, orden: 12, descripcion: "RFC desestimada antes de su puesta en ejecución." }
    ]
  },
  transiciones: {
    transiciones: [
      { id: "trans_1", codigo: "iniciar_evaluacion", nombre: "Iniciar evaluación", origen: ["solicitado"], destino: "en_evaluacion", tipos: ["normal"], roles: ["gestor_cambios", "supervisor"], condiciones_previas: [], campos_obligatorios: [], comentario_modo: "opcional", requiere_confirmacion: false, color: "#3b82f6", icono: "Play", orden: 1, activa: true, automatizaciones: [{ tipo: "asignar_evaluador", descripcion: "Asigna evaluador técnico según grupo" }, { tipo: "iniciar_reloj_evaluacion", descripcion: "Inicia el cómputo de plazo SLA de evaluación" }] },
      { id: "trans_2", codigo: "autorizar_por_modelo", nombre: "Autorizar por modelo", origen: ["solicitado"], destino: "autorizado", tipos: ["estandar"], roles: ["sistema"], condiciones_previas: ["modelo_aprobado_y_vigente", "elegibilidad_confirmada", "riesgo_bajo", "sin_bloqueos_calendario"], campos_obligatorios: [], comentario_modo: "ninguno", requiere_confirmacion: false, color: "#10b981", icono: "CheckCircle", orden: 2, activa: true, automatizaciones: [{ tipo: "registrar_autorizacion_modelo", descripcion: "Registra 'Autorizado por modelo estándar'" }] },
      { id: "trans_3", codigo: "solicitar_emergencia", nombre: "Solicitar autorización de emergencia", origen: ["solicitado"], destino: "en_autorizacion", tipos: ["emergencia"], roles: ["sistema", "gestor_cambios"], condiciones_previas: [], campos_obligatorios: ["justificacion_emergencia", "consecuencia_no_cambio"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Confirma la convocatoria inmediata del Comité de Emergencia (ECAB)?", color: "#dc2626", icono: "AlertTriangle", orden: 3, activa: true, automatizaciones: [{ tipo: "convocar_ecab", descripcion: "Convoca al ECAB y despacha notificación inmediata" }, { tipo: "iniciar_reloj_autorizacion", descripcion: "Inicia el reloj de decisión de emergencia (2h)" }] },
      { id: "trans_4", codigo: "solicitar_informacion", nombre: "Solicitar información", origen: ["en_evaluacion", "en_autorizacion"], destino: "en_pausa", tipos: ["estandar", "normal", "emergencia"], roles: ["evaluador", "aprobador_etapa_actual", "gestor_cambios"], condiciones_previas: [], campos_obligatorios: [], comentario_modo: "obligatorio", requiere_confirmacion: false, color: "#f59e0b", icono: "HelpCircle", orden: 4, activa: true, automatizaciones: [{ tipo: "pausar_relojes", descripcion: "Pausa relojes de SLA" }, { tipo: "notificar_solicitante", descripcion: "Notifica al solicitante con la pregunta" }] },
      { id: "trans_5", codigo: "responder_informacion", nombre: "Responder información", origen: ["en_pausa"], destino: "estado_anterior", tipos: ["estandar", "normal", "emergencia"], roles: ["solicitante", "gestor_cambios"], condiciones_previas: [], campos_obligatorios: [], comentario_modo: "obligatorio", requiere_confirmacion: false, color: "#3b82f6", icono: "MessageSquare", orden: 5, activa: true, automatizaciones: [{ tipo: "reanudar_relojes", descripcion: "Reanuda los relojes de SLA" }] },
      { id: "trans_6", codigo: "enviar_a_autorizacion", nombre: "Enviar a autorización", origen: ["en_evaluacion"], destino: "en_autorizacion", tipos: ["normal"], roles: ["evaluador", "gestor_cambios"], condiciones_previas: ["riesgo_evaluado", "comentario_tecnico_completo", "conflictos_revisados"], campos_obligatorios: [], comentario_modo: "opcional", requiere_confirmacion: true, texto_confirmacion: "¿Confirma el envío de la RFC al circuito de autorizaciones?", color: "#8b5cf6", icono: "Send", orden: 6, activa: true, automatizaciones: [{ tipo: "generar_etapas_aprobacion", descripcion: "Genera etapas según matriz de autoridad" }] },
      { id: "trans_7", codigo: "aprobar_etapa", nombre: "Aprobar etapa", origen: ["en_autorizacion"], destino: "en_autorizacion", destino_final_todas_aprobadas: "autorizado", tipos: ["estandar", "normal", "emergencia"], roles: ["aprobador_etapa_actual", "presidente_comite"], condiciones_previas: ["segregacion_funciones_valida"], campos_obligatorios: [], comentario_modo: "opcional", requiere_confirmacion: false, color: "#10b981", icono: "CheckSquare", orden: 7, activa: true, automatizaciones: [{ tipo: "avanzar_etapa_o_autorizar", descripcion: "Avanza o transiciona a 'Autorizado'" }] },
      { id: "trans_8", codigo: "rechazar", nombre: "Rechazar", origen: ["en_autorizacion", "en_evaluacion"], destino: "rechazado", tipos: ["estandar", "normal", "emergencia"], roles: ["aprobador_etapa_actual", "gestor_cambios"], condiciones_previas: [], campos_obligatorios: ["motivo_rechazo_catalogo"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Está seguro de rechazar formalmente esta solicitud?", color: "#ef4444", icono: "XCircle", orden: 8, activa: true, automatizaciones: [{ tipo: "detener_relojes", descripcion: "Detiene los plazos activos" }] },
      { id: "trans_9", codigo: "reenviar_con_cambios", nombre: "Reenviar con cambios", origen: ["rechazado"], destino: "solicitado", tipos: ["normal", "estandar"], roles: ["solicitante"], condiciones_previas: ["motivo_rechazo_permite_reenvio"], campos_obligatorios: [], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Desea crear una nueva versión de la RFC y reiniciar aprobaciones?", color: "#3b82f6", icono: "RotateCcw", orden: 9, activa: true, automatizaciones: [{ tipo: "incrementar_version_rfc", descripcion: "Nueva versión y reinicia aprobaciones" }] },
      { id: "trans_10", codigo: "programar", nombre: "Programar", origen: ["autorizado"], destino: "programado", tipos: ["estandar", "normal", "emergencia"], roles: ["gestor_cambios", "supervisor", "implementador"], condiciones_previas: ["implementador_asignado", "ventana_valida_sin_bloqueos", "tareas_obligatorias_creadas", "plan_comunicacion_listo"], campos_obligatorios: ["implementador_id", "ventana_inicio", "ventana_fin"], comentario_modo: "opcional", requiere_confirmacion: false, color: "#06b6d4", icono: "Calendar", orden: 10, activa: true, automatizaciones: [{ tipo: "reservar_ventana_calendario", descripcion: "Reserva ventana en calendario" }] },
      { id: "trans_11", codigo: "reprogramar", nombre: "Reprogramar", origen: ["autorizado", "programado"], destino: "programado", tipos: ["estandar", "normal", "emergencia"], roles: ["gestor_cambios", "implementador"], condiciones_previas: ["ventana_valida_sin_bloqueos"], campos_obligatorios: ["motivo_aplazamiento_catalogo", "nueva_ventana_inicio", "nueva_ventana_fin"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "Si difiere más de 24h se invalidarán las autorizaciones. ¿Continuar?", color: "#0ea5e9", icono: "Clock", orden: 11, activa: true, automatizaciones: [{ tipo: "evaluar_reautorizacion_por_plazo", descripcion: "Invalida autorizaciones si difiere > 24h" }] },
      { id: "trans_12", codigo: "iniciar_implementacion", nombre: "Iniciar implementación", origen: ["programado"], destino: "en_ejecucion", tipos: ["estandar", "normal", "emergencia"], roles: ["implementador", "gestor_cambios"], condiciones_previas: ["checklist_go_no_go_superada", "condiciones_aprobacion_cumplidas", "sin_congelamiento_vigente", "dentro_de_tolerancia_ventana"], campos_obligatorios: [], comentario_modo: "opcional", requiere_confirmacion: true, texto_confirmacion: "¿Confirma el inicio de los trabajos técnicos en producción?", color: "#f97316", icono: "Zap", orden: 12, activa: true, automatizaciones: [{ tipo: "registrar_inicio_real", descripcion: "Registra fecha-hora real de inicio" }] },
      { id: "trans_13", codigo: "registrar_resultado", nombre: "Registrar resultado", origen: ["en_ejecucion"], destino: "implementado", tipos: ["estandar", "normal", "emergencia"], roles: ["implementador", "gestor_cambios"], condiciones_previas: [], campos_obligatorios: ["resultado_catalogo", "fecha_fin_real", "bitacora_ejecucion"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Confirma el fin de los trabajos y el registro del resultado?", color: "#14b8a6", icono: "CheckCircle2", orden: 13, activa: true, automatizaciones: [{ tipo: "disparar_acciones_por_resultado", descripcion: "Ejecuta acciones automáticas según resultado" }] },
      { id: "trans_14", codigo: "documentar_emergencia_retroactiva", nombre: "Documentar emergencia retroactiva", origen: ["solicitado"], destino: "implementado", tipos: ["emergencia"], roles: ["gestor_cambios", "supervisor", "tecnico"], condiciones_previas: ["permiso_documentar_retroactivo"], campos_obligatorios: ["medio_autorizacion_emergencia", "quien_autorizo_verbalmente", "fecha_hora_verbal", "bitacora_ejecucion"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Registrar emergencia ya ejecutada? Creará etapa de autorización retroactiva.", color: "#be185d", icono: "FileText", orden: 14, activa: true, automatizaciones: [{ tipo: "crear_etapa_autorizacion_retroactiva", descripcion: "Genera etapa de autorización retroactiva" }] },
      { id: "trans_15", codigo: "iniciar_revision", nombre: "Iniciar revisión", origen: ["implementado"], destino: "en_revision_post", tipos: ["estandar", "normal", "emergencia"], roles: ["gestor_cambios", "supervisor", "sistema"], condiciones_previas: [], campos_obligatorios: [], comentario_modo: "opcional", requiere_confirmacion: false, color: "#a855f7", icono: "FileSearch", orden: 15, activa: true, automatizaciones: [{ tipo: "iniciar_cuestionario_pir", descripcion: "Habilita la plantilla de revisión post-implementación" }] },
      { id: "trans_16", codigo: "completar_revision_cerrar", nombre: "Completar revisión y cerrar", origen: ["en_revision_post"], destino: "cerrado", tipos: ["estandar", "normal", "emergencia"], roles: ["gestor_cambios", "supervisor"], condiciones_previas: ["pir_completada_si_aplica", "actualizaciones_cmdb_confirmadas"], campos_obligatorios: ["codigo_cierre_catalogo", "resumen_cierre"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Confirma el cierre formal de la RFC y del informe PIR?", color: "#64748b", icono: "Archive", orden: 16, activa: true, automatizaciones: [{ tipo: "cerrar_rfc_definitivo", descripcion: "Cierra la RFC de forma inmutable" }] },
      { id: "trans_17", codigo: "cerrar_sin_revision", nombre: "Cerrar sin revisión", origen: ["implementado"], destino: "cerrado", tipos: ["estandar", "normal"], roles: ["gestor_cambios", "supervisor"], condiciones_previas: ["resultado_exitoso", "tipo_no_exige_pir", "actualizaciones_cmdb_confirmadas"], campos_obligatorios: ["codigo_cierre_catalogo", "resumen_cierre"], comentario_modo: "opcional", requiere_confirmacion: false, color: "#475569", icono: "CheckCheck", orden: 17, activa: true, automatizaciones: [{ tipo: "cerrar_rfc_directo", descripcion: "Cierra la RFC sin trámite PIR" }] },
      { id: "trans_18", codigo: "cancelar", nombre: "Cancelar", origen: ["solicitado", "en_evaluacion", "en_pausa", "en_autorizacion", "autorizado", "programado"], destino: "cancelado", tipos: ["estandar", "normal", "emergencia"], roles: ["solicitante", "gestor_cambios", "administrador"], condiciones_previas: ["antes_de_ejecucion"], campos_obligatorios: ["motivo_cancelacion"], comentario_modo: "obligatorio", requiere_confirmacion: true, texto_confirmacion: "¿Confirma la cancelación de la solicitud?", color: "#94a3b8", icono: "Ban", orden: 18, activa: true, automatizaciones: [{ tipo: "liberar_reserva_calendario", descripcion: "Libera ventana en el calendario" }] }
    ]
  },
  etapas_aprobacion: {
    etapas: [
      { id: "etapa_tecnica", codigo: "tecnica", nombre: "Evaluación Técnica", descripcion: "Revisión técnica de viabilidad, planes de rollback y riesgos por parte de la supervisión de soporte.", tipo_aprobador: "rol_contextual", rol_contextual: "supervisor_grupo_implementador", regla_decision: "cualquiera", plazo_horas_p1: 2, plazo_horas_p2: 8, plazo_horas_p3: 24, plazo_horas_p4: 48, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: true, abstenerse: false }, delegacion_permitida: true, duracion_max_delegacion_dias: 7, invalidar_si_cambia: ["plan_implementacion", "plan_rollback", "fechas_propuestas", "ci_ids"], modo_relativo_defecto: "secuencial", activa: true, orden: 1 },
      { id: "etapa_negocio", codigo: "negocio", nombre: "Aprobación de Negocio", descripcion: "Validación del impacto operativo y funcional por parte de los Gestores de Área de las áreas afectadas.", tipo_aprobador: "rol_contextual", rol_contextual: "gestor_area_departamento_afectado", regla_decision: "todos", plazo_horas_p1: 4, plazo_horas_p2: 12, plazo_horas_p3: 48, plazo_horas_p4: 72, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: true, abstenerse: false }, delegacion_permitida: true, duracion_max_delegacion_dias: 7, invalidar_si_cambia: ["fechas_propuestas", "requiere_interrupcion", "duracion_interrupcion", "servicio_id"], modo_relativo_defecto: "secuencial", activa: true, orden: 2 },
      { id: "etapa_gestor_cambios", codigo: "gestor_cambios", nombre: "Aprobación Gestor de Cambios", descripcion: "Autorización de gobernanza por el Change Manager para cambios de bajo y medio riesgo.", tipo_aprobador: "perfil", id_perfil_aprobador: "gestor_cambios", regla_decision: "cualquiera", plazo_horas_p1: 2, plazo_horas_p2: 8, plazo_horas_p3: 24, plazo_horas_p4: 48, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: true, abstenerse: false }, delegacion_permitida: true, duracion_max_delegacion_dias: 14, invalidar_si_cambia: ["tipo_cambio", "nivel_riesgo", "fechas_propuestas", "plan_rollback"], modo_relativo_defecto: "secuencial", activa: true, orden: 3 },
      { id: "etapa_cab", codigo: "cab", nombre: "Comité Asesor de Cambios (CAB)", descripcion: "Dictamen colegiado del Change Advisory Board para cambios de riesgo alto o crítico.", tipo_aprobador: "comite", id_comite: "cab", regla_decision: "segun_comite", plazo_horas_p1: 24, plazo_horas_p2: 72, plazo_horas_p3: 168, plazo_horas_p4: 168, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: false, abstenerse: true }, delegacion_permitida: false, duracion_max_delegacion_dias: 0, invalidar_si_cambia: ["tipo_cambio", "nivel_riesgo", "fechas_propuestas", "servicio_id", "ci_ids", "plan_rollback"], modo_relativo_defecto: "secuencial", activa: true, orden: 4 },
      { id: "etapa_ecab", codigo: "ecab", nombre: "Comité de Emergencia (ECAB)", descripcion: "Autorización expedita por el Emergency Change Advisory Board para incidentes y emergencias críticas.", tipo_aprobador: "comite", id_comite: "ecab", regla_decision: "segun_comite", plazo_horas_p1: 2, plazo_horas_p2: 4, plazo_horas_p3: 8, plazo_horas_p4: 24, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: false, abstenerse: false }, delegacion_permitida: false, duracion_max_delegacion_dias: 0, invalidar_si_cambia: ["justificacion_emergencia", "ci_ids", "servicio_id"], modo_relativo_defecto: "secuencial", activa: true, orden: 5 },
      { id: "etapa_direccion", codigo: "direccion", nombre: "Dirección Institucional / CIO", descripcion: "Aprobación ejecutiva requerida para intervenciones de riesgo Crítico con alto impacto corporativo.", tipo_aprobador: "perfil", id_perfil_aprobador: "aprobador", regla_decision: "cualquiera", plazo_horas_p1: 4, plazo_horas_p2: 12, plazo_horas_p3: 48, plazo_horas_p4: 72, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: true, abstenerse: false }, delegacion_permitida: true, duracion_max_delegacion_dias: 5, invalidar_si_cambia: ["servicio_id", "nivel_riesgo", "fechas_propuestas"], modo_relativo_defecto: "secuencial", activa: true, orden: 6 },
      { id: "etapa_excepcion_ventana", codigo: "excepcion_ventana", nombre: "Excepción de Ventana de Mantenimiento", descripcion: "Autorización complementaria cuando una RFC debe ejecutarse fuera del horario de ventana.", tipo_aprobador: "perfil", id_perfil_aprobador: "aprobador", regla_decision: "cualquiera", plazo_horas_p1: 2, plazo_horas_p2: 8, plazo_horas_p3: 24, plazo_horas_p4: 48, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: false, rechazar: true, solicitar_informacion: true, delegar: true, abstenerse: false }, delegacion_permitida: true, duracion_max_delegacion_dias: 3, invalidar_si_cambia: ["fechas_propuestas"], modo_relativo_defecto: "secuencial", activa: true, orden: 7 },
      { id: "etapa_excepcion_congelamiento", codigo: "excepcion_congelamiento", nombre: "Excepción de Período de Congelamiento", descripcion: "Autorización explícita para intervenir durante un período de congelamiento institucional.", tipo_aprobador: "perfil", id_perfil_aprobador: "aprobador", regla_decision: "cualquiera", plazo_horas_p1: 2, plazo_horas_p2: 8, plazo_horas_p3: 24, plazo_horas_p4: 48, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: true, abstenerse: false }, delegacion_permitida: true, duracion_max_delegacion_dias: 3, invalidar_si_cambia: ["fechas_propuestas"], modo_relativo_defecto: "secuencial", activa: true, orden: 8 },
      { id: "etapa_autorizacion_retroactiva", codigo: "autorizacion_retroactiva", nombre: "Autorización Retroactiva CAB", descripcion: "Revisión formal a posteriori por el CAB de cambios de emergencia implementados sin dictamen previo.", tipo_aprobador: "comite", id_comite: "cab", regla_decision: "segun_comite", plazo_horas_p1: 24, plazo_horas_p2: 24, plazo_horas_p3: 24, plazo_horas_p4: 24, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: true, rechazar: true, solicitar_informacion: true, delegar: false, abstenerse: false }, delegacion_permitida: false, duracion_max_delegacion_dias: 0, invalidar_si_cambia: [], modo_relativo_defecto: "secuencial", activa: true, orden: 9 },
      { id: "etapa_autorizacion_modelo", codigo: "autorizacion_modelo", nombre: "Autorización por Modelo Estándar", descripcion: "Aprobación automática otorgada por el sistema basada en la homologación previa del modelo estándar.", tipo_aprobador: "sistema", regla_decision: "automatica", plazo_horas_p1: 0, plazo_horas_p2: 0, plazo_horas_p3: 0, plazo_horas_p4: 0, acciones_permitidas: { aprobar: true, aprobar_con_condiciones: false, rechazar: false, solicitar_informacion: false, delegar: false, abstenerse: false }, delegacion_permitida: false, duracion_max_delegacion_dias: 0, invalidar_si_cambia: [], modo_relativo_defecto: "secuencial", activa: true, orden: 10 }
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
      plazos_decision_horas: { p1: 2, p2: 4, p3: 8, p4: 24 },
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
      { prioridad_id: "p1", prioridad_nombre: "P1 - Crítica", primera_respuesta_horas: 0.5, evaluacion_horas: 2, autorizacion_total_horas: 2, plazo_por_etapa_horas: 1 },
      { prioridad_id: "p2", prioridad_nombre: "P2 - Alta", primera_respuesta_horas: 2, evaluacion_horas: 12, autorizacion_total_horas: 24, plazo_por_etapa_horas: 8 },
      { prioridad_id: "p3", prioridad_nombre: "P3 - Media", primera_respuesta_horas: 8, evaluacion_horas: 48, autorizacion_total_horas: 72, plazo_por_etapa_horas: 24 },
      { prioridad_id: "p4", prioridad_nombre: "P4 - Baja", primera_respuesta_horas: 24, evaluacion_horas: 72, autorizacion_total_horas: 120, plazo_por_etapa_horas: 48 }
    ],
    parametros_adicionales: {
      horas_diferencia_reprogramacion_reautorizar: 24,
      tolerancia_inicio_minutos: 30,
      vigencia_autorizacion_dias: { normal: 7, estandar: 30, emergencia: 1 },
      tipo_computo_tiempo: "horas_habiles"
    },
    reglas_escalamiento: [
      { id: "esc_1", nombre: "Recordatorio preventivo al aprobador", objetivo: "autorizacion", prioridades: ["p1", "p2", "p3", "p4"], umbral_tipo: "porcentaje_plazo", umbral_valor: 75, accion: "notificar", destinatarios: ["aprobador_pendiente"], mensaje: "La aprobación de la RFC ha alcanzado el 75% del plazo establecido.", repetir_cada_horas: 0, max_repeticiones: 1, activa: true },
      { id: "esc_2", nombre: "Alerta crítica de inminencia de vencimiento", objetivo: "autorizacion", prioridades: ["p1", "p2", "p3", "p4"], umbral_tipo: "porcentaje_plazo", umbral_valor: 90, accion: "notificar_y_suplente", destinatarios: ["suplente_aprobador", "gestor_cambios"], mensaje: "La aprobación de la RFC está al 90% del tiempo límite.", repetir_cada_horas: 0, max_repeticiones: 1, activa: true },
      { id: "esc_3", nombre: "Escalamiento por vencimiento formal", objetivo: "autorizacion", prioridades: ["p1", "p2", "p3", "p4"], umbral_tipo: "vencido_horas", umbral_valor: 0, accion: "etiquetar_y_escalar_superior", destinatarios: ["superior_jerarquico", "gestor_cambios"], etiqueta: "Vencido", mensaje: "El plazo de autorización ha vencido formalmente. Se escala al superior jerárquico.", repetir_cada_horas: 12, max_repeticiones: 3, activa: true },
      { id: "esc_4", nombre: "Escalamiento de Emergencia sin respuesta ECAB", objetivo: "autorizacion", prioridades: ["p1"], umbral_tipo: "vencido_horas", umbral_valor: 0.5, accion: "notificar_direccion", destinatarios: ["direccion"], etiqueta: "Emergencia en Riesgo", mensaje: "Emergencia sin decisión del ECAB tras 30 minutos.", repetir_cada_horas: 1, max_repeticiones: 2, activa: true }
    ]
  },
  tareas_checklists: {
    catalogo_tareas: [
      { id: "tar_respaldo", codigo: "tarea_verificar_respaldo", nombre: "Verificar y validar respaldo del sistema (Backup)", descripcion: "Confirmar que existe una copia de seguridad íntegra antes de iniciar la intervención.", fase: "pre_implementacion", tipo: "verificacion", responsable_tipo: "implementador", duracion_estimada_minutos: 30, offset_horas_ventana: -2, obligatoria: true, bloquea_transicion: "iniciar_implementacion", checklist_interno: ["Verificar fecha de último snapshot", "Validar integridad del backup", "Confirmar capacidad de restauración"], dependencia_tarea_id: null, activa: true },
      { id: "tar_notificar_usuarios", codigo: "tarea_notificar_usuarios", nombre: "Notificar inicio a usuarios y partes interesadas", descripcion: "Despachar el comunicado de interrupción a las jefaturas de áreas afectadas.", fase: "pre_implementacion", tipo: "comunicacion", responsable_tipo: "gestor_cambios", duracion_estimada_minutos: 15, offset_horas_ventana: -1, obligatoria: true, bloquea_transicion: null, checklist_interno: ["Verificar lista de distribución de áreas", "Enviar plantilla de aviso"], dependencia_tarea_id: null, activa: true },
      { id: "tar_confirmar_equipo", codigo: "tarea_confirmar_equipo", nombre: "Confirmar disponibilidad del equipo técnico y soporte", descripcion: "Verificar conectividad y guardia técnica para la ventana.", fase: "pre_implementacion", tipo: "coordinacion", responsable_tipo: "supervisor", duracion_estimada_minutos: 15, offset_horas_ventana: -1, obligatoria: false, bloquea_transicion: null, checklist_interno: ["Llamada de confirmación técnica", "Comprobar credenciales"], dependencia_tarea_id: null, activa: true },
      { id: "tar_ejecutar_plan", codigo: "tarea_ejecutar_plan", nombre: "Ejecución de cambios según plan técnico", descripcion: "Aplicar la secuencia de comandos y configuraciones contempladas en el plan.", fase: "implementacion", tipo: "ejecucion", responsable_tipo: "implementador", duracion_estimada_minutos: 120, offset_horas_ventana: 0, obligatoria: true, bloquea_transicion: "registrar_resultado", checklist_interno: ["Seguir orden paso a paso", "Registrar bitácora intermedia"], dependencia_tarea_id: "tar_respaldo", activa: true },
      { id: "tar_pruebas_validacion", codigo: "tarea_pruebas_validacion", nombre: "Pruebas técnicas de validación y humo", descripcion: "Ejecución de pruebas de humo para validar el funcionamiento del servicio.", fase: "validacion", tipo: "pruebas", responsable_tipo: "implementador", duracion_estimada_minutos: 45, offset_horas_ventana: 2, obligatoria: true, bloquea_transicion: "registrar_resultado", checklist_interno: ["Probar servicios core", "Validar interfaces", "Revisar logs"], dependencia_tarea_id: "tar_ejecutar_plan", activa: true },
      { id: "tar_verificar_monitoreo", codigo: "tarea_verificar_monitoreo", nombre: "Verificar telemetría y monitoreo de alertas", descripcion: "Monitorear métricas de CPU, memoria, latencia y alarmas tras la intervención.", fase: "validacion", tipo: "monitoreo", responsable_tipo: "implementador", duracion_estimada_minutos: 30, offset_horas_ventana: 2.5, obligatoria: false, bloquea_transicion: null, checklist_interno: ["Panel Zabbix en verde", "Sin alertas disparadas"], dependencia_tarea_id: "tar_pruebas_validacion", activa: true },
      { id: "tar_actualizar_cmdb", codigo: "tarea_actualizar_cmdb", nombre: "Actualizar atributos en CMDB e inventario", descripcion: "Registrar la nueva versión o configuración de activos en la CMDB.", fase: "post_implementacion", tipo: "cmdb", responsable_tipo: "gestor_activos", duracion_estimada_minutos: 30, offset_horas_ventana: 3, obligatoria: true, bloquea_transicion: "completar_revision_cerrar", checklist_interno: ["Actualizar registro de CI", "Comprobar topología"], dependencia_tarea_id: "tar_pruebas_validacion", activa: true },
      { id: "tar_comunicar_cierre", codigo: "tarea_comunicar_cierre", nombre: "Comunicar finalización y normalidad a usuarios", descripcion: "Enviar correo de restablecimiento de operaciones normales.", fase: "post_implementacion", tipo: "comunicacion", responsable_tipo: "gestor_cambios", duracion_estimada_minutos: 15, offset_horas_ventana: 3.5, obligatoria: false, bloquea_transicion: null, checklist_interno: ["Enviar plantilla de fin de ventana"], dependencia_tarea_id: null, activa: true }
    ],
    paquetes_tareas: [
      { id: "paq_normal", nombre: "Paquete Estándar para Cambio Normal", descripcion: "Conjunto de tareas de control preventivo, ejecución técnica, validación y aseguramiento de CMDB.", aplica_cuando: { tipo_cambio: ["normal"] }, tareas_ids: ["tar_respaldo", "tar_notificar_usuarios", "tar_ejecutar_plan", "tar_pruebas_validacion", "tar_verificar_monitoreo", "tar_actualizar_cmdb", "tar_comunicar_cierre"], activo: true },
      { id: "paq_emergencia", nombre: "Paquete de Acción Rápida para Emergencia", descripcion: "Tareas ágiles centradas en mitigación rápida, validación y posterior documentación retroactiva.", aplica_cuando: { tipo_cambio: ["emergencia"] }, tareas_ids: ["tar_respaldo", "tar_ejecutar_plan", "tar_pruebas_validacion", "tar_actualizar_cmdb"], activo: true },
      { id: "paq_estandar", nombre: "Paquete para Modelo Estándar", descripcion: "Secuencia simplificada predefinida por el modelo de cambio.", aplica_cuando: { tipo_cambio: ["estandar"] }, tareas_ids: ["tar_ejecutar_plan", "tar_pruebas_validacion"], activo: true }
    ],
    checklist_go_no_go: [
      { id: "gng_1", texto: "Aprobaciones completas y condiciones de autorización cumplidas", obligatorio: true, responsable_rol: "gestor_cambios", evidencia_requerida: false, tipos_aplicables: ["estandar", "normal", "emergencia"], orden: 1 },
      { id: "gng_2", texto: "Respaldo verificado e íntegro con prueba de restauración", obligatorio: true, responsable_rol: "implementador", evidencia_requerida: true, tipos_aplicables: ["normal", "emergencia"], orden: 2 },
      { id: "gng_3", texto: "Plan de rollback revisado y recursos de reversión disponibles", obligatorio: true, responsable_rol: "implementador", evidencia_requerida: false, tipos_aplicables: ["estandar", "normal", "emergencia"], orden: 3 },
      { id: "gng_4", texto: "Ventana confirmada en calendario sin conflictos bloqueantes", obligatorio: true, responsable_rol: "gestor_cambios", evidencia_requerida: false, tipos_aplicables: ["estandar", "normal", "emergencia"], orden: 4 },
      { id: "gng_5", texto: "Implementador y equipo de soporte asignados y disponibles", obligatorio: true, responsable_rol: "supervisor", evidencia_requerida: false, tipos_aplicables: ["estandar", "normal", "emergencia"], orden: 5 },
      { id: "gng_6", texto: "Usuarios de áreas afectadas debidamente notificados de la interrupción", obligatorio: true, responsable_rol: "gestor_cambios", evidencia_requerida: false, tipos_aplicables: ["normal"], orden: 6 },
      { id: "gng_7", texto: "Pruebas previas en ambiente de pruebas o preproducción validadas", obligatorio: true, responsable_rol: "implementador", evidencia_requerida: true, tipos_aplicables: ["normal"], orden: 7 },
      { id: "gng_8", texto: "Contactos de escalamiento técnico y proveedores en guardia", obligatorio: true, responsable_rol: "supervisor", evidencia_requerida: false, tipos_aplicables: ["estandar", "normal", "emergencia"], orden: 8 },
      { id: "gng_9", texto: "Accesos, contraseñas temporales y credenciales de ejecución disponibles", obligatorio: true, responsable_rol: "implementador", evidencia_requerida: false, tipos_aplicables: ["estandar", "normal", "emergencia"], orden: 9 }
    ],
    conversion_plan_a_tareas: { convertir_pasos_en_tareas: true, fase_por_defecto: "implementacion" }
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
      { id: "pir_q1", orden: 1, texto: "¿Se lograron los objetivos propuestos del cambio?", tipo_respuesta: "lista", opciones: ["Totalmente", "Parcialmente", "No se lograron"], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q2", orden: 2, texto: "Evaluación y resultado de cada criterio de éxito verificable", tipo_respuesta: "texto", opciones: [], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q3", orden: 3, texto: "¿La implementación se completó dentro de la ventana de mantenimiento autorizada?", tipo_respuesta: "booleano", opciones: ["Sí", "No"], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q4", orden: 4, texto: "Desviaciones o imprevistos detectados respecto al plan técnico original", tipo_respuesta: "texto", opciones: [], obligatoria: false, tipos_aplicables: ["normal", "emergencia"] },
      { id: "pir_q5", orden: 5, texto: "Incidentes causados o atribuibles al cambio durante y tras la ventana", tipo_respuesta: "texto", opciones: [], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q6", orden: 6, texto: "¿Se ejecutó el plan de rollback? Indicar motivo, tiempo empleado y efectividad", tipo_respuesta: "texto", opciones: [], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q7", orden: 7, texto: "¿El nivel de riesgo calculado en la evaluación previa fue adecuado?", tipo_respuesta: "lista", opciones: ["Menor que el riesgo real", "Adecuado", "Mayor que el riesgo real"], obligatoria: true, tipos_aplicables: ["normal", "emergencia"] },
      { id: "pir_q8", orden: 8, texto: "¿Fue oportuna y clara la comunicación a los usuarios y áreas afectadas?", tipo_respuesta: "lista", opciones: ["Excelente", "Adecuada", "Deficiente", "No requirió"], obligatoria: true, tipos_aplicables: ["normal", "emergencia"] },
      { id: "pir_q9", orden: 9, texto: "Consumo de recursos, costos y horas hombre (real vs. estimado)", tipo_respuesta: "texto", opciones: [], obligatoria: false, tipos_aplicables: ["normal"] },
      { id: "pir_q10", orden: 10, texto: "¿Se actualizaron todos los atributos y relaciones en la CMDB?", tipo_respuesta: "booleano", opciones: ["Sí", "No"], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q11", orden: 11, texto: "¿Se generaron o actualizaron artículos en la Base de Conocimiento (KEDB)?", tipo_respuesta: "booleano", opciones: ["Sí", "No"], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] },
      { id: "pir_q12", orden: 12, texto: "Lecciones aprendidas principales y oportunidades de mejora identificadas", tipo_respuesta: "texto", opciones: [], obligatoria: true, tipos_aplicables: ["estandar", "normal", "emergencia"] }
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

export async function obtenerConfiguracionFlujoEvaluacion(idUsuario: number | undefined, pestana: string) {
  // Versión publicada activa
  const versionPublicada = await queryRow(`
    SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  // Borrador activo
  const borradorActual = await queryRow(`
    SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_borrador = true
    ORDER BY id_version DESC LIMIT 1
  `, [pestana]);

  // Bloqueo concurrente
  const recursoLock = `cambios:1.3.3.3:${pestana}`;
  const bloqueoActual = await queryRow(`
    SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
           CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
    FROM bloqueo_edicion_concurrente b
    LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
    WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
  `, [recursoLock]);

  const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_1333[pestana] || {};
  const snapshotActivo = borradorActual?.snapshot || snapshotBase;
  const diff = calcularDiff(snapshotBase, snapshotActivo);

  // Contar RFCs abiertas que podrían ser impactadas
  const rfcsAbiertas = await queryRow(`
    SELECT COUNT(*) as total FROM cambio 
    WHERE estado_registro = true AND (id_estado IS NULL OR id_estado NOT IN (10, 11, 12))
  `);

  // Historial de versiones
  const historialVersiones = await query(`
    SELECT cmv.id_version, cmv.numero_version, cmv.es_publicada, cmv.es_borrador, cmv.fecha_creacion, cmv.motivo, cmv.impacto_resumen, cmv.id_usuario_creacion,
           CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
    FROM configuracion_modulo_versiones cmv
    LEFT JOIN usuario u ON u.id_usuario = cmv.id_usuario_creacion
    WHERE cmv.modulo = 'gestion_de_cambios' AND cmv.pantalla = '1.3.3.3' AND cmv.pestana = $1
    ORDER BY cmv.id_version DESC LIMIT 20
  `, [pestana]);

  // Obtener catálogo de usuarios para selectores de comités y aprobadores
  const usuariosCatalogo = await query(`
    SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico,
           p.nombre as perfil, p.id_perfil
    FROM usuario u
    LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
    LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
    WHERE u.estado_registro = true
    ORDER BY u.nombres, u.apellido_paterno
  `);

  // Obtener departamentos para áreas afectadas
  const departamentosCatalogo = await query(`
    SELECT id_departamento_empresa as id_departamento, nombre
    FROM departamento_empresa
    WHERE estado_registro = true
    ORDER BY nombre
  `);

  return {
    pestana,
    version_publicada: versionPublicada ? {
      ...versionPublicada,
      snapshot: versionPublicada.snapshot || VALORES_FABRICA_1333[pestana]
    } : {
      numero_version: 1,
      snapshot: VALORES_FABRICA_1333[pestana]
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
    historial_versiones: historialVersiones || [],
    catalogo_usuarios: usuariosCatalogo || [],
    catalogo_departamentos: departamentosCatalogo || []
  };
}

export async function procesarAccionFlujoEvaluacion(idUsuario: number, body: any): Promise<ResultadoConfig> {
  const { accion, pestana, snapshot, motivo, version_id_origen } = body;

  if (!pestana) {
    throw new ErrorDominio("La pestaña es obligatoria");
  }

  const userId = idUsuario;
  const recursoLock = `cambios:1.3.3.3:${pestana}`;

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
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot || VALORES_FABRICA_1333[pestana], snapshot);

    const borradorExistente = await queryRow(`
      SELECT id_version FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_borrador = true
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
          'gestion_de_cambios', '1.3.3.3', $1, $2, false, true, $3, $4, $5, $6
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
    const fabrica = VALORES_FABRICA_1333[pestana];
    if (!fabrica) {
      throw new ErrorDominio("No existen valores de fábrica para esta pestaña");
    }

    const versionPub = await queryRow(`
      SELECT numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot, fabrica);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    await query(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'gestion_de_cambios', '1.3.3.3', $1, $2, false, true, $3, $4, 'Restauración a valores de fábrica', $5
      )
    `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(fabrica), JSON.stringify(diff), userId]);

    return { httpStatus: 200, payload: { ok: true, mensaje: "Valores de fábrica cargados en borrador", snapshot: fabrica, diff } };
  }

  if (accion === "restaurar_version") {
    if (!version_id_origen) {
      throw new ErrorDominio("version_id_origen es obligatorio");
    }

    const versionHistorica = await queryRow(`
      SELECT snapshot, numero_version FROM configuracion_modulo_versiones
      WHERE id_version = $1 AND modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3'
    `, [version_id_origen]);

    if (!versionHistorica?.snapshot) {
      throw new ErrorDominio("Versión histórica no encontrada", 404);
    }

    const versionPub = await queryRow(`
      SELECT snapshot, numero_version FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const diff = calcularDiff(versionPub?.snapshot, versionHistorica.snapshot);

    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    await query(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
      ) VALUES (
        'gestion_de_cambios', '1.3.3.3', $1, $2, false, true, $3, $4, $5, $6
      )
    `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(versionHistorica.snapshot), JSON.stringify(diff), `Restaurado desde v${versionHistorica.numero_version}`, userId]);

    return {
      httpStatus: 200,
      payload: {
        ok: true,
        mensaje: `Versión ${versionHistorica.numero_version} cargada en borrador`,
        snapshot: versionHistorica.snapshot,
        diff
      }
    };
  }

  throw new ErrorDominio("Acción no reconocida");
}

export async function publicarConfiguracionFlujoEvaluacion(idUsuario: number, body: any) {
  const { pestana, snapshot, motivo, impacto_resumen } = body;

  if (!pestana || !snapshot) {
    throw new ErrorDominio("Pestaña y snapshot son obligatorios");
  }

  if (!motivo || motivo.trim().length < 5) {
    throw new ErrorDominio("El motivo de publicación es obligatorio (mínimo 5 caracteres)");
  }

  const userId = idUsuario;
  const recursoLock = `cambios:1.3.3.3:${pestana}`;

  // Validar bloqueo concurrente
  const bloqueoActual = await queryRow(`
    SELECT id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente 
    WHERE recurso = $1 AND fecha_expiracion > NOW()
  `, [recursoLock]);

  if (bloqueoActual && bloqueoActual.id_usuario !== userId) {
    throw new ErrorDominio("No se puede publicar: la configuración está bloqueada por otro usuario", 423);
  }

  // Obtener versión publicada actual
  const versionActual = await queryRow(`
    SELECT id_version, numero_version, snapshot FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_publicada = true
    ORDER BY numero_version DESC LIMIT 1
  `, [pestana]);

  const nuevoNumeroVersion = (versionActual?.numero_version || 0) + 1;
  const diff = calcularDiff(versionActual?.snapshot || VALORES_FABRICA_1333[pestana], snapshot);

  // Marcar anteriores como no publicadas
  await query(`
    UPDATE configuracion_modulo_versiones
    SET es_publicada = false
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1
  `, [pestana]);

  // Insertar nueva versión publicada
  const nuevaVersion = await queryRow(`
    INSERT INTO configuracion_modulo_versiones (
      modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
    ) VALUES (
      'gestion_de_cambios', '1.3.3.3', $1, $2, true, false, $3, $4, $5, $6, $7
    ) RETURNING id_version, numero_version, fecha_creacion
  `, [pestana, nuevoNumeroVersion, JSON.stringify(snapshot), JSON.stringify(diff), motivo.trim(), impacto_resumen || "Publicación de cambios", userId]);

  // Eliminar borrador
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  // Liberar bloqueo concurrente
  await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

  return {
    ok: true,
    mensaje: `Versión ${nuevoNumeroVersion} publicada exitosamente`,
    version: nuevaVersion,
    diff
  };
}

export async function descartarBorradorFlujoEvaluacion(idUsuario: number, pestana: string) {
  if (!pestana) {
    throw new ErrorDominio("La pestaña es obligatoria");
  }

  const userId = idUsuario;
  const recursoLock = `cambios:1.3.3.3:${pestana}`;

  // Eliminar borrador
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.3' AND pestana = $1 AND es_borrador = true
  `, [pestana]);

  // Liberar bloqueo
  await query(`
    DELETE FROM bloqueo_edicion_concurrente 
    WHERE recurso = $1 AND id_usuario = $2
  `, [recursoLock, userId]);

  return { ok: true, mensaje: "Borrador descartado y bloqueo liberado" };
}
