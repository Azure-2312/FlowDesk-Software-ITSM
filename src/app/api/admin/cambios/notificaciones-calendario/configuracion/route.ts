import { NextRequest, NextResponse } from "next/server";
import { query, queryRow } from "@/shared/lib/db";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { COOKIE_SESION } from "@/shared/lib/constants";

export const dynamic = "force-dynamic";

// Snapshot de fábrica referencial para submódulo 1.3.3.4
const VALORES_FABRICA_1334: Record<string, any> = {
  notificaciones: {
    comunicado_interrupcion: {
      activo: true,
      momentos_envio: ["T-48h", "T-2h"],
      plantilla: "Aviso de mantenimiento programado con posible interrupción de servicio para las áreas afectadas por la RFC {{codigo_rfc}}: '{{titulo}}'. Ventana prevista: {{ventana_inicio}} a {{ventana_fin}}.",
      audiencia: "areas_afectadas",
      condicion_activacion: "requiere_interrupcion = true AND estado = 'programado'"
    },
    agrupar_resumen_diario: false,
    horas_silencio: {
      activa: false,
      inicio: "22:00",
      fin: "07:00",
      excepto_emergencias: true
    },
    no_notificar_al_autor: true,
    eventos: [
      { evento: "rfc.solicitada", nombre: "RFC Solicitada", descripcion: "Se ha registrado formalmente una nueva solicitud de cambio.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "gestor_cambios"], plantilla: "rfc_solicitada_confirmacion", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.evaluacion_iniciada", nombre: "Evaluación Técnica Iniciada", descripcion: "El evaluador asignado ha tomado la RFC para análisis.", activo: true, canales: ["sistema"], destinatarios: ["solicitante", "evaluador"], plantilla: "rfc_evaluacion_iniciada", condiciones: { tipos: ["normal"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.informacion_solicitada", nombre: "Información Complementaria Solicitada", descripcion: "Se requieren aclaraciones o datos adicionales del solicitante.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante"], plantilla: "rfc_solicitud_informacion", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.informacion_respondida", nombre: "Información Complementaria Respondida", descripcion: "El solicitante ha respondido los requerimientos pendientes.", activo: true, canales: ["sistema"], destinatarios: ["evaluador", "aprobadores_etapa_actual"], plantilla: "rfc_respuesta_informacion", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.enviada_a_autorizacion", nombre: "Enviada a Circuito de Autorización", descripcion: "La evaluación concluyó favorablemente y se abre el flujo de decisión.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "gestor_cambios", "aprobadores_etapa_actual"], plantilla: "rfc_enviada_autorizacion", condiciones: { tipos: ["normal"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.etapa_pendiente", nombre: "Etapa de Aprobación Pendiente", descripcion: "Notificación dirigida al aprobador responsable de la etapa activa.", activo: true, canales: ["correo", "sistema"], destinatarios: ["aprobadores_etapa_actual"], plantilla: "rfc_etapa_pendiente", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.etapa_aprobada", nombre: "Etapa de Aprobación Dictaminada Favorable", descripcion: "Una de las etapas intermedias ha sido aprobada.", activo: true, canales: ["sistema"], destinatarios: ["solicitante", "gestor_cambios"], plantilla: "rfc_etapa_aprobada", condiciones: { tipos: ["normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.aprobada", nombre: "RFC Totalmente Autorizada", descripcion: "Todas las instancias de control han autorizado la intervención.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "implementador", "gestor_cambios", "supervisor_grupo"], plantilla: "rfc_autorizada_total", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.aprobada_con_condiciones", nombre: "RFC Autorizada con Condiciones", descripcion: "Se concedió autorización sujeta al cumplimiento de condiciones previas.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "implementador", "gestor_cambios"], plantilla: "rfc_aprobada_condiciones", condiciones: { tipos: ["normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.rechazada", nombre: "RFC Rechazada Formalmente", descripcion: "La solicitud fue denegada por una de las autoridades resolutivas.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "gestor_cambios"], plantilla: "rfc_rechazada", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.reenviada", nombre: "RFC Reenviada con Ajustes", descripcion: "El solicitante subsanó observaciones y reinicia el circuito.", activo: true, canales: ["sistema"], destinatarios: ["gestor_cambios", "evaluador"], plantilla: "rfc_reenviada", condiciones: { tipos: ["normal", "estandar"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "cab.convocado", nombre: "Reunión de CAB Convocada", descripcion: "Envío formal de orden del día y agenda de RFCs a tratar en el comité.", activo: true, canales: ["correo", "sistema"], destinatarios: ["miembros_comite", "gestor_cambios"], plantilla: "cab_convocatoria_agenda", condiciones: { tipos: ["normal"], riesgos: ["alto", "critico"], prioridades: ["todas"] }, anticipacion: "T-24h", inmutable: false },
      { evento: "cab.dictamen_emitido", nombre: "Dictamen Colegiado del CAB Emitido", descripcion: "El pleno del CAB emitió acuerdo final sobre la solicitud.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "implementador", "gestor_cambios", "miembros_comite"], plantilla: "cab_dictamen_emitido", condiciones: { tipos: ["normal"], riesgos: ["alto", "critico"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "ecab.convocado", nombre: "Convocatoria Inmediata Comité de Emergencia (ECAB)", descripcion: "Convocatoria urgente por RFC de emergencia o incidente crítico.", activo: true, canales: ["correo", "sistema", "sms"], destinatarios: ["miembros_comite", "gestor_cambios", "direccion"], plantilla: "ecab_convocatoria_urgente", condiciones: { tipos: ["emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: true },
      { evento: "rfc.programada", nombre: "RFC Programada en Calendario", descripcion: "Ventana de mantenimiento confirmada y recursos técnicos asignados.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "implementador", "gestor_cambios", "responsables_servicios"], plantilla: "rfc_programada", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.reprogramada", nombre: "RFC Reprogramada", descripcion: "Cambio de ventana de ejecución por aplazamiento justificado.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "implementador", "gestor_cambios", "responsables_servicios"], plantilla: "rfc_reprogramada", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.recordatorio_previo", nombre: "Recordatorio Previo al Inicio de Ventana", descripcion: "Aviso anticipado al equipo implementador previo a la hora fijada.", activo: true, canales: ["correo", "sistema"], destinatarios: ["implementador", "equipo_implementador", "gestor_cambios"], plantilla: "rfc_recordatorio_ventana", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "T-2h", inmutable: false },
      { evento: "rfc.implementacion_iniciada", nombre: "Inicio de Trabajos de Implementación", descripcion: "El implementador formalizó el inicio real de la intervención.", activo: true, canales: ["sistema"], destinatarios: ["gestor_cambios", "supervisor_grupo", "responsables_servicios"], plantilla: "rfc_inicio_implementacion", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.resultado_registrado", nombre: "Resultado de Implementación Registrado", descripcion: "El técnico registró el estado técnico final de los trabajos.", activo: true, canales: ["sistema"], destinatarios: ["solicitante", "gestor_cambios", "supervisor_grupo"], plantilla: "rfc_resultado_registrado", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.fallida", nombre: "Intervención de Cambio Fallida", descripcion: "El cambio no logró el objetivo previsto o causó anomalías no resueltas.", activo: true, canales: ["correo", "sistema"], destinatarios: ["gestor_cambios", "supervisor_grupo", "responsables_servicios", "direccion"], plantilla: "rfc_fallida_alerta", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: true },
      { evento: "rfc.rollback_ejecutado", nombre: "Plan de Retirada (Rollback) Ejecutado", descripcion: "Se ejecutó el procedimiento de reversión al estado previo.", activo: true, canales: ["correo", "sistema"], destinatarios: ["gestor_cambios", "supervisor_grupo", "responsables_servicios"], plantilla: "rfc_rollback_alerta", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: true },
      { evento: "rfc.pir_pendiente", nombre: "Revisión Post-Implementación (PIR) Pendiente", descripcion: "Se ha abierto el plazo normativo para la evaluación de resultados.", activo: true, canales: ["sistema"], destinatarios: ["gestor_cambios", "supervisor_grupo"], plantilla: "rfc_pir_pendiente", condiciones: { tipos: ["normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.cerrada", nombre: "RFC Cerrada Definitivamente", descripcion: "Proceso completado formalmente con confirmación de CMDB.", activo: true, canales: ["sistema"], destinatarios: ["solicitante", "gestor_cambios"], plantilla: "rfc_cerrada", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.cancelada", nombre: "RFC Cancelada", descripcion: "La solicitud fue desestimada y la ventana en calendario liberada.", activo: true, canales: ["sistema"], destinatarios: ["solicitante", "gestor_cambios", "implementador"], plantilla: "rfc_cancelada", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.conflicto_detectado", nombre: "Conflicto de Calendario o Capacidad Detectado", descripcion: "Alerta de solapamiento con otra RFC, período de congelamiento o sobrecupo.", activo: true, canales: ["correo", "sistema"], destinatarios: ["gestor_cambios", "implementador"], plantilla: "rfc_conflicto_detectado", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "rfc.emergencia_registrada", nombre: "Emergencia Registrada en Sistema", descripcion: "Alerta prioritaria ante la creación de un cambio de tipo Emergencia.", activo: true, canales: ["correo", "sistema", "sms"], destinatarios: ["gestor_cambios", "supervisor_grupo", "direccion"], plantilla: "rfc_emergencia_alerta_inmediata", condiciones: { tipos: ["emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: true },
      { evento: "rfc.aprobacion_proxima_a_vencer", nombre: "Plazo de Aprobación Próximo a Vencer (75%)", descripcion: "Recordatorio preventivo al aprobador responsable para evitar retrasos.", activo: true, canales: ["correo", "sistema"], destinatarios: ["aprobadores_etapa_actual"], plantilla: "rfc_aprobacion_preventiva", condiciones: { tipos: ["normal"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "75% del plazo", inmutable: false },
      { evento: "rfc.aprobacion_vencida", nombre: "Plazo de Aprobación Vencido (Escalamiento 100%)", descripcion: "Aviso de escalamiento al superior jerárquico por vencimiento de plazo.", activo: true, canales: ["correo", "sistema"], destinatarios: ["aprobadores_etapa_actual", "gestor_cambios", "supervisor_grupo"], plantilla: "rfc_aprobacion_vencida_escalada", condiciones: { tipos: ["normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "100% del plazo", inmutable: false },
      { evento: "rfc.autorizacion_caducada", nombre: "Autorización Caducada por Inacción", descripcion: "La autorización concedida expiró sin haber iniciado la ejecución.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "gestor_cambios", "implementador"], plantilla: "rfc_autorizacion_caducada", condiciones: { tipos: ["estandar", "normal"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "modelo_estandar.suspendido", nombre: "Modelo de Cambio Estándar Suspendido", descripcion: "Un modelo estándar superó el umbral de fallos y ha sido suspendido automáticamente.", activo: true, canales: ["correo", "sistema"], destinatarios: ["gestor_cambios", "supervisor_grupo"], plantilla: "modelo_estandar_suspendido_alerta", condiciones: { tipos: ["estandar"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "", inmutable: false },
      { evento: "congelamiento.proximo", nombre: "Aviso Preventivo de Período de Congelamiento", descripcion: "Aviso general sobre la próxima entrada en vigor de una ventana de congelamiento.", activo: true, canales: ["correo", "sistema"], destinatarios: ["solicitante", "implementador", "gestor_cambios"], plantilla: "congelamiento_proximo_aviso", condiciones: { tipos: ["estandar", "normal", "emergencia"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "7 días antes", inmutable: false },
      { evento: "ventana.proxima", nombre: "Aviso de Apertura de Ventana de Mantenimiento", descripcion: "Aviso operativo a técnicos con RFCs autorizadas sobre la proximidad de la ventana.", activo: true, canales: ["sistema"], destinatarios: ["implementador", "equipo_implementador"], plantilla: "ventana_proxima_aviso", condiciones: { tipos: ["estandar", "normal"], riesgos: ["todos"], prioridades: ["todas"] }, anticipacion: "T-24h", inmutable: false }
    ]
  },
  ventanas_mantenimiento: {
    zona_horaria: "America/Lima",
    ventanas: [
      {
        id: 1,
        codigo: "VENT-SEM",
        nombre: "Noche entre semana",
        descripcion: "Ventana nocturna de lunes a jueves para cambios estándar y normales sin interrupción prolongada.",
        recurrencia: "semanal",
        dias_semana: [1, 2, 3, 4],
        regla_mensual: {},
        hora_inicio: "22:00:00",
        hora_fin: "05:00:00",
        cruce_medianoche: true,
        fecha_vigencia_desde: null,
        fecha_vigencia_hasta: null,
        excepciones_fechas: [],
        alcance_tipo: "toda_la_organizacion",
        id_servicios: [],
        clases_ci: [],
        entornos: ["produccion", "preproduccion"],
        id_departamentos: [],
        tipos_cambio_permitidos: ["estandar", "normal"],
        capacidad_simultanea: 3,
        capacidad_acumulada: 12,
        permite_interrupcion: false,
        permite_en_feriados: false,
        color: "#3b82f6",
        activo: false
      },
      {
        id: 2,
        codigo: "VENT-FDS",
        nombre: "Fin de semana",
        descripcion: "Ventana extendida para intervenciones mayores con ventana de interrupción autorizada.",
        recurrencia: "semanal",
        dias_semana: [6, 0],
        regla_mensual: {},
        hora_inicio: "22:00:00",
        hora_fin: "06:00:00",
        cruce_medianoche: true,
        fecha_vigencia_desde: null,
        fecha_vigencia_hasta: null,
        excepciones_fechas: [],
        alcance_tipo: "toda_la_organizacion",
        id_servicios: [],
        clases_ci: [],
        entornos: ["produccion", "preproduccion", "pruebas"],
        id_departamentos: [],
        tipos_cambio_permitidos: ["estandar", "normal", "emergencia"],
        capacidad_simultanea: 5,
        capacidad_acumulada: 20,
        permite_interrupcion: true,
        permite_en_feriados: false,
        color: "#10b981",
        activo: false
      },
      {
        id: 3,
        codigo: "VENT-PARCHES",
        nombre: "Ventana mensual de parches",
        descripcion: "Segundo sábado del mes para mantenimiento acumulativo y despliegue de parches de seguridad.",
        recurrencia: "mensual",
        dias_semana: [],
        regla_mensual: { tipo: "posicion", orden: 2, dia_semana: 6 },
        hora_inicio: "22:00:00",
        hora_fin: "06:00:00",
        cruce_medianoche: true,
        fecha_vigencia_desde: null,
        fecha_vigencia_hasta: null,
        excepciones_fechas: [],
        alcance_tipo: "servicios",
        id_servicios: [],
        clases_ci: [],
        entornos: ["produccion"],
        id_departamentos: [],
        tipos_cambio_permitidos: ["estandar", "normal"],
        capacidad_simultanea: 4,
        capacidad_acumulada: 10,
        permite_interrupcion: true,
        permite_en_feriados: false,
        color: "#8b5cf6",
        activo: false
      }
    ]
  },
  periodos_congelamiento: {
    zona_horaria: "America/Lima",
    motivos_catalogo: [
      { codigo: "cierre_contable", nombre: "Cierre contable / fiscal" },
      { codigo: "campana", nombre: "Campaña comercial o institucional" },
      { codigo: "fin_de_ano", nombre: "Festividades de fin de año" },
      { codigo: "evento_institucional", nombre: "Evento corporativo de alta exposición" },
      { codigo: "auditoria", nombre: "Auditoría de cumplimiento o regulatoria" },
      { codigo: "otro", nombre: "Otro motivo justificado" }
    ],
    periodos: [
      {
        id: 1,
        nombre: "Cierre Anual y Balance Contable",
        motivo: "cierre_contable",
        descripcion: "Período crítico de facturación, balance contable anual y consolidación financiera institucional.",
        fecha_inicio: "2026-12-20T00:00:00Z",
        fecha_fin: "2027-01-05T23:59:59Z",
        recurrente_anual: true,
        mes_dia_inicio: "12-20",
        mes_dia_fin: "01-05",
        alcance_tipo: "toda_la_organizacion",
        id_servicios: [],
        id_ci: [],
        id_departamentos: [],
        severidad: "bloqueo_total",
        tipos_exentos: ["emergencia"],
        dias_aviso_anticipado: 15,
        color: "#ef4444",
        activo: true
      },
      {
        id: 2,
        nombre: "Cierre Contable Semestral",
        motivo: "cierre_contable",
        descripcion: "Restricción de cambios de alto impacto durante el cierre contable de mitad de año.",
        fecha_inicio: "2026-06-25T00:00:00Z",
        fecha_fin: "2026-07-02T23:59:59Z",
        recurrente_anual: true,
        mes_dia_inicio: "06-25",
        mes_dia_fin: "07-02",
        alcance_tipo: "toda_la_organizacion",
        id_servicios: [],
        id_ci: [],
        id_departamentos: [],
        severidad: "bloqueo_con_excepcion",
        tipos_exentos: ["emergencia"],
        dias_aviso_anticipado: 10,
        color: "#f97316",
        activo: true
      },
      {
        id: 3,
        nombre: "Campaña Institucional Alta Demanda",
        motivo: "campana",
        descripcion: "Período de auditoría e inscripciones de alta concurrencia de usuarios.",
        fecha_inicio: "2026-03-01T00:00:00Z",
        fecha_fin: "2026-03-15T23:59:59Z",
        recurrente_anual: false,
        mes_dia_inicio: null,
        mes_dia_fin: null,
        alcance_tipo: "servicios",
        id_servicios: [],
        id_ci: [],
        id_departamentos: [],
        severidad: "advertencia",
        tipos_exentos: ["estandar", "emergencia"],
        dias_aviso_anticipado: 7,
        color: "#f59e0b",
        activo: true
      }
    ]
  },
  feriados: {
    zona_horaria: "America/Lima",
    politicas: {
      estandar: "bloquear",
      normal: "advertir",
      emergencia: "ignorar",
      fin_de_semana_estandar: "bloquear",
      fin_de_semana_normal: "advertir",
      fin_de_semana_emergencia: "ignorar",
      dias_no_laborables_semana: [6, 0]
    },
    feriados: [
      { id: 1, fecha_inicio: "2026-01-01", fecha_fin: "2026-01-01", nombre: "Año Nuevo", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 2, fecha_inicio: "2026-04-02", fecha_fin: "2026-04-02", nombre: "Jueves Santo", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: false, activo: true },
      { id: 3, fecha_inicio: "2026-04-03", fecha_fin: "2026-04-03", nombre: "Viernes Santo", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: false, activo: true },
      { id: 4, fecha_inicio: "2026-05-01", fecha_fin: "2026-05-01", nombre: "Día del Trabajo", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 5, fecha_inicio: "2026-06-07", fecha_fin: "2026-06-07", nombre: "Batalla de Arica y Día de la Bandera", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 6, fecha_inicio: "2026-06-29", fecha_fin: "2026-06-29", nombre: "San Pedro y San Pablo", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 7, fecha_inicio: "2026-07-23", fecha_fin: "2026-07-23", nombre: "Día de la Fuerza Aérea del Perú", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 8, fecha_inicio: "2026-07-28", fecha_fin: "2026-07-28", nombre: "Fiestas Patrias - Día 1", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 9, fecha_inicio: "2026-07-29", fecha_fin: "2026-07-29", nombre: "Fiestas Patrias - Día 2", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 10, fecha_inicio: "2026-08-06", fecha_fin: "2026-08-06", nombre: "Batalla de Junín", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 11, fecha_inicio: "2026-08-30", fecha_fin: "2026-08-30", nombre: "Santa Rosa de Lima", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 12, fecha_inicio: "2026-10-08", fecha_fin: "2026-10-08", nombre: "Combate de Angamos", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 13, fecha_inicio: "2026-11-01", fecha_fin: "2026-11-01", nombre: "Día de Todos los Santos", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 14, fecha_inicio: "2026-12-08", fecha_fin: "2026-12-08", nombre: "Inmaculada Concepción", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 15, fecha_inicio: "2026-12-09", fecha_fin: "2026-12-09", nombre: "Batalla de Ayacucho", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true },
      { id: 16, fecha_inicio: "2026-12-25", fecha_fin: "2026-12-25", nombre: "Navidad del Señor", tipo: "nacional", alcance: "toda_la_organizacion", recurrente_anual: true, activo: true }
    ]
  },
  conflictos_capacidad: {
    duracion_maxima_rfc_horas: 12,
    tolerancia_inicio_minutos: 30,
    perfil_excepcion_conflicto: "gestor_cambios",
    frecuencia_evaluacion_periodica_minutos: 60,
    reglas: [
      { id: "mismo_ci", codigo: "mismo_ci", nombre: "Mismo elemento de configuración (CI)", descripcion: "Otra RFC programada sobre el mismo CI con ventanas solapadas o dentro del tiempo de colchón de seguridad.", severidad: { estandar: "bloquear", normal: "bloquear", emergencia: "advertir" }, colchon_minutos: 60, activa: true },
      { id: "mismo_servicio", codigo: "mismo_servicio", nombre: "Mismo servicio tecnológico o de negocio", descripcion: "Otra RFC interviniendo simultáneamente sobre el mismo servicio.", severidad: { estandar: "bloquear", normal: "advertir", emergencia: "ignorar" }, solo_servicios_criticos: true, activa: true },
      { id: "ci_relacionados", codigo: "ci_relacionados", nombre: "Elementos de configuración relacionados (CMDB)", descripcion: "RFC programada sobre CI dependientes según topología de relaciones de la CMDB.", severidad: { estandar: "advertir", normal: "advertir", emergencia: "ignorar" }, profundidad_relaciones: 1, tipos_relacion: ["depende_de", "conecta_con", "aloja_a"], activa: true },
      { id: "mismo_implementador", codigo: "mismo_implementador", nombre: "Mismo implementador técnico asignado", descripcion: "El técnico especialista implementador tiene otra RFC asignada en horario solapado.", severidad: { estandar: "bloquear", normal: "bloquear", emergencia: "advertir" }, activa: true },
      { id: "fuera_de_ventana", codigo: "fuera_de_ventana", nombre: "Programación fuera de ventana de mantenimiento", descripcion: "El horario propuesto está fuera de las ventanas de mantenimiento autorizadas y vigentes.", severidad: { estandar: "bloquear", normal: "advertir", emergencia: "ignorar" }, activa: true },
      { id: "congelamiento", codigo: "congelamiento", nombre: "Intervención en período de congelamiento", descripcion: "La programación coincide con un período de congelamiento institucional activo.", severidad: { estandar: "bloquear", normal: "bloquear", emergencia: "advertir" }, activa: true },
      { id: "feriado_no_laborable", codigo: "feriado_no_laborable", nombre: "Intervención en feriado o día no laborable", descripcion: "La intervención coincide con días feriados o no laborables del calendario.", severidad: { estandar: "bloquear", normal: "advertir", emergencia: "ignorar" }, activa: true },
      { id: "capacidad_concurrencia", codigo: "capacidad_concurrencia", nombre: "Límite de capacidad y concurrencia máxima", descripcion: "Supera el límite de intervenciones concurrentes permitidas en paralelo.", severidad: { estandar: "bloquear", normal: "bloquear", emergencia: "advertir" }, max_global_simultaneo: 5, max_por_servicio_critico: 2, max_por_ci: 1, max_por_dia: 10, activa: true }
    ]
  },
  presentacion_calendario: {
    criterio_color: "tipo_cambio",
    paleta_colores: {
      tipos: { estandar: "#10b981", normal: "#3b82f6", emergencia: "#ef4444" },
      estados: { programado: "#06b6d4", en_ejecucion: "#f97316", implementado: "#14b8a6", cancelado: "#94a3b8" },
      riesgos: { bajo: "#10b981", medio: "#f59e0b", alto: "#f97316", critico: "#dc2626" }
    },
    vistas_disponibles: ["mes", "semana", "dia", "agenda", "linea_tiempo_servicio"],
    vista_por_defecto: "mes",
    capas_visibles_defecto: {
      rfcs_programadas: true,
      ventanas_mantenimiento: true,
      periodos_congelamiento: true,
      feriados: true,
      reuniones_cab: true
    },
    filtros_defecto: { tipo: "todos", riesgo: "todos", estado: "activos" },
    campos_tooltip_tarjeta: {
      codigo_rfc: true,
      titulo: true,
      tipo_cambio: true,
      estado: true,
      nivel_riesgo: true,
      horario_ventana: true,
      implementador: true,
      servicios_afectados: true
    },
    visibilidad_por_perfil: {
      usuario_estandar_ver_solo_mantenimiento: true,
      mostrar_detalles_tecnicos_solo_con_permiso: true
    },
    recordatorios_previos: ["T-48h", "T-24h", "T-1h"],
    exportacion_ics: {
      permitir_suscripcion: true,
      caducidad_token_dias: 90,
      capas_incluidas: ["rfcs_programadas", "ventanas_mantenimiento", "periodos_congelamiento"]
    },
    densidad: "comoda",
    primer_dia_semana: 1,
    zona_horaria: "America/Lima"
  }
};

// Función auxiliar para obtener usuario autenticado
async function getUsuarioSesion(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE_SESION)?.value;
    if (!token) return null;
    return await verificarTokenSesion(token);
  } catch {
    return null;
  }
}

// Algoritmo de cálculo de diferencias semánticas (Pattern 3.1)
function calcularDiff(base: any, nuevo: any): { agregados: string[]; modificados: string[]; eliminados: string[] } {
  const agregados: string[] = [];
  const modificados: string[] = [];
  const eliminados: string[] = [];

  if (!base || typeof base !== "object") {
    return { agregados: ["Configuración inicial completa"], modificados: [], eliminados: [] };
  }

  // Comparar llaves principales
  const llavesBase = Object.keys(base);
  const llavesNuevo = Object.keys(nuevo);

  for (const k of llavesNuevo) {
    if (!llavesBase.includes(k)) {
      agregados.push(`Parámetro agregado: ${k}`);
    } else if (JSON.stringify(base[k]) !== JSON.stringify(nuevo[k])) {
      if (Array.isArray(base[k]) && Array.isArray(nuevo[k])) {
        const idKey = base[k][0]?.id ? "id" : base[k][0]?.codigo ? "codigo" : base[k][0]?.evento ? "evento" : null;
        if (idKey) {
          const mapBase = new Map(base[k].map((item: any) => [item[idKey], item]));
          const mapNuevo = new Map(nuevo[k].map((item: any) => [item[idKey], item]));

          for (const [id, item] of mapNuevo.entries()) {
            if (!mapBase.has(id)) {
              agregados.push(`Nuevo elemento en ${k}: ${(item as any).nombre || (item as any).evento || id}`);
            } else if (JSON.stringify(mapBase.get(id)) !== JSON.stringify(item)) {
              modificados.push(`Modificado en ${k}: ${(item as any).nombre || (item as any).evento || id}`);
            }
          }
          for (const [id, item] of mapBase.entries()) {
            if (!mapNuevo.has(id)) {
              eliminados.push(`Eliminado de ${k}: ${(item as any).nombre || (item as any).evento || id}`);
            }
          }
        } else {
          modificados.push(`Lista modificada: ${k} (elementos: ${base[k].length} -> ${nuevo[k].length})`);
        }
      } else {
        modificados.push(`Parámetro modificado: ${k}`);
      }
    }
  }

  for (const k of llavesBase) {
    if (!llavesNuevo.includes(k)) {
      eliminados.push(`Parámetro eliminado: ${k}`);
    }
  }

  return { agregados, modificados, eliminados };
}

export async function GET(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana") || "notificaciones";

    // Versión publicada activa
    const versionPublicada = await queryRow(`
      SELECT id_version, numero_version, snapshot, fecha_creacion, motivo, impacto_resumen, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    // Borrador activo
    const borradorActual = await queryRow(`
      SELECT id_version, numero_version, snapshot, diff, fecha_creacion, motivo, id_usuario_creacion
      FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_borrador = true
      ORDER BY id_version DESC LIMIT 1
    `, [pestana]);

    // Bloqueo concurrente (15 min)
    const recursoLock = `cambios:1.3.3.4:${pestana}`;
    const bloqueoActual = await queryRow(`
      SELECT b.id_bloqueo, b.id_usuario, b.fecha_bloqueo, b.fecha_expiracion, 
             CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico as correo
      FROM bloqueo_edicion_concurrente b
      LEFT JOIN usuario u ON b.id_usuario = u.id_usuario
      WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
    `, [recursoLock]);

    const snapshotBase = versionPublicada?.snapshot || VALORES_FABRICA_1334[pestana] || {};
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
      WHERE cmv.modulo = 'gestion_de_cambios' AND cmv.pantalla = '1.3.3.4' AND cmv.pestana = $1
      ORDER BY cmv.id_version DESC LIMIT 20
    `, [pestana]);

    // Catálogos auxiliares para selectores y simulador
    const usuariosCatalogo = await query(`
      SELECT u.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombre_completo, u.correo_electronico,
             p.nombre as perfil, p.id_perfil
      FROM usuario u
      LEFT JOIN usuario_perfiles up ON up.id_usuario = u.id_usuario
      LEFT JOIN perfiles p ON p.id_perfil = up.id_perfil
      WHERE u.estado_registro = true
      ORDER BY u.nombres, u.apellido_paterno
    `);

    const departamentosCatalogo = await query(`
      SELECT id_departamento_empresa as id_departamento, nombre
      FROM departamento_empresa
      WHERE estado_registro = true
      ORDER BY nombre
    `);

    const serviciosCatalogo = await query(`
      SELECT id_servicio, nombre, es_critico
      FROM servicio_catalogo
      WHERE estado_registro = true
      ORDER BY nombre
    `);

    const ciCatalogo = await query(`
      SELECT id_ci, codigo_ci, nombre, criticidad, ambiente
      FROM elemento_configuracion
      WHERE estado_registro = true
      ORDER BY nombre
    `);

    return NextResponse.json({
      pestana,
      version_publicada: versionPublicada ? {
        ...versionPublicada,
        snapshot: versionPublicada.snapshot || VALORES_FABRICA_1334[pestana]
      } : {
        numero_version: 1,
        snapshot: VALORES_FABRICA_1334[pestana]
      },
      borrador: borradorActual ? {
        ...borradorActual,
        snapshot: borradorActual.snapshot
      } : null,
      tiene_borrador: !!borradorActual,
      bloqueo: bloqueoActual ? {
        bloqueado_por_mi: usuario?.id_usuario === bloqueoActual.id_usuario,
        usuario_nombre: bloqueoActual.nombre_completo || "Otro usuario",
        expira_en: bloqueoActual.fecha_expiracion
      } : null,
      diff_preview: diff,
      rfcs_abiertas_impactadas: parseInt(rfcsAbiertas?.total || "0", 10),
      historial_versiones: historialVersiones || [],
      catalogo_usuarios: usuariosCatalogo || [],
      catalogo_departamentos: departamentosCatalogo || [],
      catalogo_servicios: serviciosCatalogo || [],
      catalogo_ci: ciCatalogo || []
    });
  } catch (error: any) {
    console.error("Error en GET /api/admin/cambios/notificaciones-calendario/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al cargar configuración" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const { accion, pestana, snapshot, motivo, version_id_origen } = body;

    if (!pestana) {
      return NextResponse.json({ error: "La pestaña es obligatoria" }, { status: 400 });
    }

    const userId = usuario?.id_usuario || 1;
    const recursoLock = `cambios:1.3.3.4:${pestana}`;

    if (accion === "adquirir_bloqueo") {
      await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND fecha_expiracion <= NOW()`, [recursoLock]);
      const existente = await queryRow(`
        SELECT id_bloqueo, id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente WHERE recurso = $1
      `, [recursoLock]);

      if (existente && existente.id_usuario !== userId && new Date(existente.fecha_expiracion) > new Date()) {
        return NextResponse.json({ 
          bloqueado: true, 
          mensaje: "La pestaña está siendo editada por otro usuario" 
        }, { status: 423 });
      }

      await query(`
        INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
        VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
        ON CONFLICT (recurso) DO UPDATE SET 
          id_usuario = EXCLUDED.id_usuario,
          fecha_bloqueo = NOW(),
          fecha_expiracion = NOW() + INTERVAL '15 minutes'
      `, [recursoLock, userId]);

      return NextResponse.json({ ok: true, mensaje: "Bloqueo adquirido" });
    }

    if (accion === "liberar_bloqueo") {
      await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1 AND id_usuario = $2`, [recursoLock, userId]);
      return NextResponse.json({ ok: true, mensaje: "Bloqueo liberado" });
    }

    if (accion === "guardar_borrador") {
      const versionPub = await queryRow(`
        SELECT snapshot, numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]);

      const diff = calcularDiff(versionPub?.snapshot || VALORES_FABRICA_1334[pestana], snapshot);

      // Eliminar borrador anterior si existiese
      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_borrador = true
      `, [pestana]);

      // Insertar nuevo borrador
      const nuevoBorrador = await queryRow(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'gestion_de_cambios', '1.3.3.4', $1, $2, false, true, $3, $4, $5, $6
        ) RETURNING id_version, fecha_creacion
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(snapshot), JSON.stringify(diff), motivo || "Borrador de trabajo", userId]);

      return NextResponse.json({ 
        ok: true, 
        mensaje: "Borrador guardado exitosamente",
        borrador: {
          id_version: nuevoBorrador?.id_version,
          snapshot,
          diff,
          fecha_creacion: nuevoBorrador?.fecha_creacion
        }
      });
    }

    if (accion === "restaurar_fabrica") {
      const fabrica = VALORES_FABRICA_1334[pestana];
      if (!fabrica) {
        return NextResponse.json({ error: "No existen valores de fábrica para esta pestaña" }, { status: 404 });
      }

      const versionPub = await queryRow(`
        SELECT numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]);

      const diff = calcularDiff(versionPub?.snapshot, fabrica);

      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_borrador = true
      `, [pestana]);

      await query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'gestion_de_cambios', '1.3.3.4', $1, $2, false, true, $3, $4, 'Restauración a valores de fábrica', $5
        )
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(fabrica), JSON.stringify(diff), userId]);

      return NextResponse.json({ ok: true, mensaje: "Valores de fábrica cargados en borrador", snapshot: fabrica, diff });
    }

    if (accion === "restaurar_version") {
      if (!version_id_origen) {
        return NextResponse.json({ error: "version_id_origen es obligatorio" }, { status: 400 });
      }

      const versionHistorica = await queryRow(`
        SELECT snapshot, numero_version FROM configuracion_modulo_versiones
        WHERE id_version = $1 AND modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4'
      `, [version_id_origen]);

      if (!versionHistorica?.snapshot) {
        return NextResponse.json({ error: "Versión histórica no encontrada" }, { status: 404 });
      }

      const versionPub = await queryRow(`
        SELECT snapshot, numero_version FROM configuracion_modulo_versiones
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_publicada = true
        ORDER BY numero_version DESC LIMIT 1
      `, [pestana]);

      const diff = calcularDiff(versionPub?.snapshot, versionHistorica.snapshot);

      await query(`
        DELETE FROM configuracion_modulo_versiones
        WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_borrador = true
      `, [pestana]);

      await query(`
        INSERT INTO configuracion_modulo_versiones (
          modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, id_usuario_creacion
        ) VALUES (
          'gestion_de_cambios', '1.3.3.4', $1, $2, false, true, $3, $4, $5, $6
        )
      `, [pestana, (versionPub?.numero_version || 1), JSON.stringify(versionHistorica.snapshot), JSON.stringify(diff), `Restaurado desde v${versionHistorica.numero_version}`, userId]);

      return NextResponse.json({ 
        ok: true, 
        mensaje: `Versión ${versionHistorica.numero_version} cargada en borrador`, 
        snapshot: versionHistorica.snapshot, 
        diff 
      });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en POST /api/admin/cambios/notificaciones-calendario/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al procesar acción" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const body = await req.json();
    const { pestana, snapshot, motivo, impacto_resumen } = body;

    if (!pestana || !snapshot) {
      return NextResponse.json({ error: "Pestaña y snapshot son obligatorios" }, { status: 400 });
    }

    if (!motivo || motivo.trim().length < 5) {
      return NextResponse.json({ error: "El motivo de publicación es obligatorio (mínimo 5 caracteres)" }, { status: 400 });
    }

    const userId = usuario?.id_usuario || 1;
    const recursoLock = `cambios:1.3.3.4:${pestana}`;

    // Validar bloqueo concurrente
    const bloqueoActual = await queryRow(`
      SELECT id_usuario, fecha_expiracion FROM bloqueo_edicion_concurrente 
      WHERE recurso = $1 AND fecha_expiracion > NOW()
    `, [recursoLock]);

    if (bloqueoActual && bloqueoActual.id_usuario !== userId) {
      return NextResponse.json({ error: "No puede publicar: la pestaña está bloqueada por otro usuario" }, { status: 423 });
    }

    // Obtener versión publicada actual
    const versionActual = await queryRow(`
      SELECT id_version, numero_version, snapshot FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_publicada = true
      ORDER BY numero_version DESC LIMIT 1
    `, [pestana]);

    const nuevoNumeroVersion = (versionActual?.numero_version || 0) + 1;
    const diff = calcularDiff(versionActual?.snapshot || VALORES_FABRICA_1334[pestana], snapshot);

    // Marcar anteriores como no publicadas
    await query(`
      UPDATE configuracion_modulo_versiones
      SET es_publicada = false
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1
    `, [pestana]);

    // Insertar nueva versión publicada
    const nuevaVersion = await queryRow(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
      ) VALUES (
        'gestion_de_cambios', '1.3.3.4', $1, $2, true, false, $3, $4, $5, $6, $7
      ) RETURNING id_version, numero_version, fecha_creacion
    `, [pestana, nuevoNumeroVersion, JSON.stringify(snapshot), JSON.stringify(diff), motivo.trim(), impacto_resumen || "Publicación de configuración", userId]);

    // Eliminar borrador
    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    // Sincronización con tablas físicas compartidas
    if (pestana === "ventanas_mantenimiento" && Array.isArray(snapshot.ventanas)) {
      for (const v of snapshot.ventanas) {
        if (!v.codigo) continue;
        await query(`
          INSERT INTO ventanas_mantenimiento (
            codigo, nombre, descripcion, recurrencia, dias_semana, regla_mensual,
            hora_inicio, hora_fin, cruce_medianoche, fecha_vigencia_desde, fecha_vigencia_hasta,
            excepciones_fechas, alcance_tipo, id_servicios, clases_ci, entornos, id_departamentos,
            tipos_cambio_permitidos, capacidad_simultanea, capacidad_acumulada,
            permite_interrupcion, permite_en_feriados, color, activo, fecha_modificacion
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW()
          )
          ON CONFLICT (codigo) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            descripcion = EXCLUDED.descripcion,
            recurrencia = EXCLUDED.recurrencia,
            dias_semana = EXCLUDED.dias_semana,
            regla_mensual = EXCLUDED.regla_mensual,
            hora_inicio = EXCLUDED.hora_inicio,
            hora_fin = EXCLUDED.hora_fin,
            cruce_medianoche = EXCLUDED.cruce_medianoche,
            fecha_vigencia_desde = EXCLUDED.fecha_vigencia_desde,
            fecha_vigencia_hasta = EXCLUDED.fecha_vigencia_hasta,
            excepciones_fechas = EXCLUDED.excepciones_fechas,
            alcance_tipo = EXCLUDED.alcance_tipo,
            id_servicios = EXCLUDED.id_servicios,
            clases_ci = EXCLUDED.clases_ci,
            entornos = EXCLUDED.entornos,
            id_departamentos = EXCLUDED.id_departamentos,
            tipos_cambio_permitidos = EXCLUDED.tipos_cambio_permitidos,
            capacidad_simultanea = EXCLUDED.capacidad_simultanea,
            capacidad_acumulada = EXCLUDED.capacidad_acumulada,
            permite_interrupcion = EXCLUDED.permite_interrupcion,
            permite_en_feriados = EXCLUDED.permite_en_feriados,
            color = EXCLUDED.color,
            activo = EXCLUDED.activo,
            fecha_modificacion = NOW();
        `, [
          v.codigo, v.nombre, v.descripcion || "", v.recurrencia || "semanal",
          JSON.stringify(v.dias_semana || []), JSON.stringify(v.regla_mensual || {}),
          v.hora_inicio, v.hora_fin, !!v.cruce_medianoche,
          v.fecha_vigencia_desde || null, v.fecha_vigencia_hasta || null,
          JSON.stringify(v.excepciones_fechas || []), v.alcance_tipo || "toda_la_organizacion",
          JSON.stringify(v.id_servicios || []), JSON.stringify(v.clases_ci || []),
          JSON.stringify(v.entornos || []), JSON.stringify(v.id_departamentos || []),
          JSON.stringify(v.tipos_cambio_permitidos || ["estandar", "normal"]),
          parseInt(v.capacidad_simultanea || 5, 10), parseInt(v.capacidad_acumulada || 20, 10),
          !!v.permite_interrupcion, !!v.permite_en_feriados,
          v.color || "#2563eb", !!v.activo
        ]);
      }
    } else if (pestana === "periodos_congelamiento" && Array.isArray(snapshot.periodos)) {
      for (const p of snapshot.periodos) {
        if (!p.nombre) continue;
        if (p.id && typeof p.id === "number") {
          await query(`
            UPDATE periodos_congelamiento SET
              nombre = $1, motivo = $2, descripcion = $3, fecha_inicio = $4, fecha_fin = $5,
              recurrente_anual = $6, mes_dia_inicio = $7, mes_dia_fin = $8, alcance_tipo = $9,
              id_servicios = $10, id_ci = $11, id_departamentos = $12, severidad = $13,
              tipos_exentos = $14, dias_aviso_anticipado = $15, color = $16, activo = $17, fecha_modificacion = NOW()
            WHERE id = $18
          `, [
            p.nombre, p.motivo || "cierre_contable", p.descripcion || "",
            p.fecha_inicio, p.fecha_fin, !!p.recurrente_anual,
            p.mes_dia_inicio || null, p.mes_dia_fin || null, p.alcance_tipo || "toda_la_organizacion",
            JSON.stringify(p.id_servicios || []), JSON.stringify(p.id_ci || []), JSON.stringify(p.id_departamentos || []),
            p.severidad || "bloqueo_total", JSON.stringify(p.tipos_exentos || ["emergencia"]),
            parseInt(p.dias_aviso_anticipado || 7, 10), p.color || "#dc2626", !!p.activo, p.id
          ]);
        } else {
          await query(`
            INSERT INTO periodos_congelamiento (
              nombre, motivo, descripcion, fecha_inicio, fecha_fin,
              recurrente_anual, mes_dia_inicio, mes_dia_fin, alcance_tipo,
              id_servicios, id_ci, id_departamentos, severidad,
              tipos_exentos, dias_aviso_anticipado, color, activo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
          `, [
            p.nombre, p.motivo || "cierre_contable", p.descripcion || "",
            p.fecha_inicio, p.fecha_fin, !!p.recurrente_anual,
            p.mes_dia_inicio || null, p.mes_dia_fin || null, p.alcance_tipo || "toda_la_organizacion",
            JSON.stringify(p.id_servicios || []), JSON.stringify(p.id_ci || []), JSON.stringify(p.id_departamentos || []),
            p.severidad || "bloqueo_total", JSON.stringify(p.tipos_exentos || ["emergencia"]),
            parseInt(p.dias_aviso_anticipado || 7, 10), p.color || "#dc2626", !!p.activo
          ]);
        }
      }
    } else if (pestana === "feriados" && Array.isArray(snapshot.feriados)) {
      for (const f of snapshot.feriados) {
        if (!f.nombre || !f.fecha_inicio) continue;
        if (f.id && typeof f.id === "number") {
          await query(`
            UPDATE calendario_feriados SET
              fecha_inicio = $1, fecha_fin = $2, nombre = $3, tipo = $4, alcance = $5,
              recurrente_anual = $6, activo = $7, fecha_modificacion = NOW()
            WHERE id = $8
          `, [f.fecha_inicio, f.fecha_fin || f.fecha_inicio, f.nombre, f.tipo || "nacional", f.alcance || "toda_la_organizacion", !!f.recurrente_anual, !!f.activo, f.id]);
        } else {
          await query(`
            INSERT INTO calendario_feriados (
              fecha_inicio, fecha_fin, nombre, tipo, alcance, recurrente_anual, activo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [f.fecha_inicio, f.fecha_fin || f.fecha_inicio, f.nombre, f.tipo || "nacional", f.alcance || "toda_la_organizacion", !!f.recurrente_anual, !!f.activo]);
        }
      }
    }

    // Liberar bloqueo concurrente
    await query(`DELETE FROM bloqueo_edicion_concurrente WHERE recurso = $1`, [recursoLock]);

    return NextResponse.json({
      ok: true,
      mensaje: `Versión ${nuevoNumeroVersion} publicada exitosamente`,
      version: nuevaVersion,
      diff
    });
  } catch (error: any) {
    console.error("Error en PUT /api/admin/cambios/notificaciones-calendario/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al publicar versión" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const usuario = await getUsuarioSesion(req);
    const { searchParams } = new URL(req.url);
    const pestana = searchParams.get("pestana");

    if (!pestana) {
      return NextResponse.json({ error: "La pestaña es obligatoria" }, { status: 400 });
    }

    const userId = usuario?.id_usuario || 1;
    const recursoLock = `cambios:1.3.3.4:${pestana}`;

    // Eliminar borrador
    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = '1.3.3.4' AND pestana = $1 AND es_borrador = true
    `, [pestana]);

    // Liberar bloqueo
    await query(`
      DELETE FROM bloqueo_edicion_concurrente 
      WHERE recurso = $1 AND id_usuario = $2
    `, [recursoLock, userId]);

    return NextResponse.json({ ok: true, mensaje: "Borrador descartado y bloqueo liberado" });
  } catch (error: any) {
    console.error("Error en DELETE /api/admin/cambios/notificaciones-calendario/configuracion:", error);
    return NextResponse.json({ error: error.message || "Error al descartar borrador" }, { status: 500 });
  }
}
