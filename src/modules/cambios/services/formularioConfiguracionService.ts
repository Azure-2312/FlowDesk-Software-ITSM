import { query, queryRow } from "@/shared/lib/db";
import { ErrorDominio } from "@/shared/lib/errores";

// Valores de fábrica predeterminados para las pestañas de 1.3.3.1 (Sección 11 ITIL v4)
export const VALORES_FABRICA_PESTANAS: Record<string, any> = {
  campos: {
    formulario_activo: "solicitud",
    campos_bloqueados: [
      "titulo", "tipo_cambio", "motivo", "descripcion", "servicios", 
      "ci_afectados", "impacto", "urgencia", "fecha_inicio", "fecha_fin", 
      "plan_implementacion", "plan_rollback", "grupo_implementador_id"
    ],
    secciones: [
      {
        id: "sec_a",
        codigo: "identificacion",
        titulo: "Sección A — Identificación",
        color: "#2563eb",
        orden: 1,
        campos: [
          { codigo: "titulo", etiqueta: "Título del cambio", tipo: "texto", visible: true, obligatorio: "si", bloqueado: true, ancho: "completo", placeholder: "Resumen claro y conciso de la intervención técnica...", ayuda: "Mínimo 10 y máximo 150 caracteres. El sistema sugiere RFCs similares.", reglas: [] },
          { codigo: "tipo_cambio", etiqueta: "Tipo de cambio", tipo: "lista_tipo", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/2", ayuda: "Estándar (preautorizado), Normal (requiere evaluación) o Emergencia (intervención inmediata).", reglas: [] },
          { codigo: "modelo_id", etiqueta: "Modelo de cambio estándar", tipo: "selector_modelo", visible: true, obligatorio: "condicional", bloqueado: false, ancho: "1/2", ayuda: "Exigido para cambios estándar. Prellena planes y fija el riesgo.", reglas: [{ si_campo: "tipo_cambio", operador: "igual", valor: "ESTANDAR", accion: "mostrar" }] },
          { codigo: "categoria_id", etiqueta: "Categoría del cambio", tipo: "cascada_categoria", visible: true, obligatorio: "si", bloqueado: false, ancho: "1/2", ayuda: "Clasificación tecnológica del objeto de cambio.", reglas: [] },
          { codigo: "origen", etiqueta: "Origen del cambio", tipo: "lista_origen", visible: true, obligatorio: "si", bloqueado: false, ancho: "1/2", ayuda: "Problema, Incidente, Solicitud, Mejora, Proyecto, etc.", reglas: [] },
          { codigo: "ticket_origen", etiqueta: "Ticket de origen vinculado", tipo: "buscador_ticket", visible: true, obligatorio: "condicional", bloqueado: false, ancho: "completo", ayuda: "Obligatorio si el origen es Problema o Incidente.", reglas: [{ si_campo: "origen", operador: "es_uno_de", valor: "problema,incidente,solicitud_servicio", accion: "hacer_obligatorio" }] }
        ]
      },
      {
        id: "sec_b",
        codigo: "justificacion",
        titulo: "Sección B — Justificación y descripción",
        color: "#0891b2",
        orden: 2,
        campos: [
          { codigo: "motivo", etiqueta: "Motivo / Justificación de negocio", tipo: "area_enriquecida", visible: true, obligatorio: "si", bloqueado: true, ancho: "completo", placeholder: "Por qué es necesario y qué objetivo u oportunidad atiende...", ayuda: "Mínimo 30 caracteres. Sustento formal del cambio.", reglas: [] },
          { codigo: "descripcion", etiqueta: "Descripción técnica detallada", tipo: "area_enriquecida", visible: true, obligatorio: "si", bloqueado: true, ancho: "completo", placeholder: "Qué se modifica, en qué sistema o componente, y resultado esperado...", ayuda: "Mínimo 50 caracteres.", reglas: [] },
          { codigo: "beneficio", etiqueta: "Beneficio esperado", tipo: "texto", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2", placeholder: "Ganancia tangible de rendimiento, estabilidad o cumplimiento...", reglas: [] },
          { codigo: "consecuencia_no_hacer", etiqueta: "Consecuencia de no realizar el cambio", tipo: "texto", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/2", placeholder: "Riesgos de inacción o postergación...", reglas: [] }
        ]
      },
      {
        id: "sec_c",
        codigo: "alcance",
        titulo: "Sección C — Alcance y CMDB",
        color: "#16a34a",
        orden: 3,
        campos: [
          { codigo: "servicios", etiqueta: "Servicio(s) afectado(s)", tipo: "selector_servicios", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/2", ayuda: "Servicios del catálogo impactados por la intervención.", reglas: [] },
          { codigo: "ci_afectados", etiqueta: "Activos / CIs afectados", tipo: "selector_cmdb", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/2", ayuda: "Elementos de configuración sujetos a modificación técnica.", reglas: [] },
          { codigo: "entorno", etiqueta: "Entorno operativo", tipo: "lista_entorno", visible: true, obligatorio: "si", bloqueado: false, ancho: "1/3", ayuda: "Producción, Preproducción, Pruebas o Desarrollo.", reglas: [] },
          { codigo: "areas_afectadas", etiqueta: "Áreas / Departamentos afectados", tipo: "selector_departamentos", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/3", ayuda: "Unidades organizacionales usuarias del servicio.", reglas: [] },
          { codigo: "usuarios_afectados", etiqueta: "Usuarios afectados estimados", tipo: "numero", visible: true, obligatorio: "no", bloqueado: false, ancho: "1/3", placeholder: "0", ayuda: "Alimenta el cálculo automático de riesgo.", reglas: [] }
        ]
      },
      {
        id: "sec_d",
        codigo: "evaluacion",
        titulo: "Sección D — Evaluación inicial de Prioridad y Riesgo",
        color: "#d97706",
        orden: 4,
        campos: [
          { codigo: "impacto", etiqueta: "Impacto del cambio", tipo: "selector_impacto", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/3", ayuda: "Nivel de impacto técnico sobre el servicio.", reglas: [] },
          { codigo: "urgencia", etiqueta: "Urgencia técnica", tipo: "selector_urgencia", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/3", ayuda: "Premura temporal requerida.", reglas: [] },
          { codigo: "prioridad", etiqueta: "Prioridad calculada", tipo: "prioridad_insignia", visible: true, obligatorio: "no", bloqueado: true, ancho: "1/3", solo_lectura: true, ayuda: "Resuelta automáticamente según la Matriz Institucional compartida.", reglas: [] },
          { codigo: "riesgo_respuestas", etiqueta: "Cuestionario de riesgo ponderado", tipo: "cuestionario_riesgo", visible: true, obligatorio: "segun_tipo", bloqueado: false, ancho: "completo", ayuda: "Evaluación multidimensional de riesgo conforme a ITIL 4 y COBIT.", reglas: [] }
        ]
      },
      {
        id: "sec_e",
        codigo: "programacion",
        titulo: "Sección E — Programación y Calendario",
        color: "#7c3aed",
        orden: 5,
        campos: [
          { codigo: "fecha_inicio", etiqueta: "Inicio propuesto de ventana", tipo: "fechahora", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/2", ayuda: "Fecha y hora de inicio de intervención. Sujeto a anticipación mínima.", reglas: [] },
          { codigo: "fecha_fin", etiqueta: "Fin propuesto de ventana", tipo: "fechahora", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/2", ayuda: "Fecha y hora de término pactada.", reglas: [] },
          { codigo: "requiere_interrupcion", etiqueta: "¿Requiere interrupción de servicio?", tipo: "booleano", visible: true, obligatorio: "si", bloqueado: false, ancho: "1/2", ayuda: "Indica indisponibilidad para los usuarios finales.", reglas: [] },
          { codigo: "duracion_interrupcion", etiqueta: "Duración estimada de interrupción", tipo: "texto", visible: true, obligatorio: "condicional", bloqueado: false, ancho: "1/2", placeholder: "Ej. 30m, 2h", ayuda: "Obligatorio si requiere interrupción.", reglas: [{ si_campo: "requiere_interrupcion", operador: "igual", valor: true, accion: "hacer_obligatorio" }] },
          { codigo: "ventana_id", etiqueta: "Ventana de mantenimiento aplicable", tipo: "selector_ventana", visible: true, obligatorio: "no", bloqueado: false, ancho: "completo", ayuda: "Franja de mantenimiento programada institucional.", reglas: [] }
        ]
      },
      {
        id: "sec_f",
        codigo: "planes",
        titulo: "Sección F — Planes y Responsables",
        color: "#059669",
        orden: 6,
        campos: [
          { codigo: "plan_implementacion", etiqueta: "Plan detallado de implementación", tipo: "area_enriquecida", visible: true, obligatorio: "si", bloqueado: true, ancho: "completo", placeholder: "Paso a paso técnico, comandos, validaciones y responsables...", ayuda: "Obligatorio para Normal y Emergencia.", reglas: [] },
          { codigo: "plan_pruebas", etiqueta: "Plan de pruebas / QA previo", tipo: "area_enriquecida", visible: true, obligatorio: "segun_tipo", bloqueado: false, ancho: "completo", placeholder: "Pruebas unitarias, funcionales o de integración planificadas...", reglas: [] },
          { codigo: "plan_rollback", etiqueta: "Plan de rollback (Reversión)", tipo: "area_enriquecida", visible: true, obligatorio: "si", bloqueado: true, ancho: "completo", placeholder: "Procedimiento de retorno seguro ante fallas...", ayuda: "Obligatorio por gobernanza ITIL/ISO 20000.", reglas: [] },
          { codigo: "criterios_exito", etiqueta: "Criterios de éxito verificables", tipo: "lista_criterios", visible: true, obligatorio: "segun_tipo", bloqueado: false, ancho: "completo", ayuda: "Condiciones verificables para declarar el cambio Exitoso.", reglas: [] },
          { codigo: "grupo_implementador_id", etiqueta: "Grupo implementador asignado", tipo: "selector_grupo", visible: true, obligatorio: "si", bloqueado: true, ancho: "1/2", ayuda: "Equipo técnico que ejecutará los trabajos.", reglas: [] },
          { codigo: "implementador_id", etiqueta: "Especialista técnico responsable", tipo: "selector_tecnico", visible: true, obligatorio: "segun_tipo", bloqueado: false, ancho: "1/2", ayuda: "No puede ser el aprobador de esta RFC (segregación de funciones).", reglas: [] }
        ]
      },
      {
        id: "sec_g",
        codigo: "emergencia",
        titulo: "Sección G — Justificación de Emergencia (Solo Emergencia)",
        color: "#dc2626",
        orden: 7,
        es_condicional_emergencia: true,
        campos: [
          { codigo: "justificacion_emergencia", etiqueta: "Justificación de emergencia", tipo: "area_enriquecida", visible: true, obligatorio: "condicional", bloqueado: true, ancho: "completo", placeholder: "Motivo crítico por el cual no puede esperar el ciclo CAB normal...", ayuda: "Mínimo 30 caracteres.", reglas: [{ si_campo: "tipo_cambio", operador: "igual", valor: "EMERGENCIA", accion: "hacer_obligatorio" }] },
          { codigo: "ticket_emergencia", etiqueta: "Incidente crítico motivador", tipo: "buscador_ticket", visible: true, obligatorio: "condicional", bloqueado: false, ancho: "1/2", ayuda: "Incidente P1 que fuerza la intervención de emergencia.", reglas: [] },
          { codigo: "consecuencia_emergencia", etiqueta: "Consecuencia de no actuar de inmediato", tipo: "texto", visible: true, obligatorio: "condicional", bloqueado: true, ancho: "1/2", placeholder: "Impacto catastrófico evitado...", reglas: [] },
          { codigo: "retroactivo", etiqueta: "Documentación retroactiva", tipo: "booleano", visible: true, obligatorio: "no", bloqueado: false, ancho: "completo", ayuda: "Disponible solo con permiso cambios.documentar_retroactivo.", reglas: [] }
        ]
      },
      {
        id: "sec_h",
        codigo: "evidencias",
        titulo: "Sección H — Evidencias y Documentación",
        color: "#64748b",
        orden: 8,
        campos: [
          { codigo: "adjuntos", etiqueta: "Archivos adjuntos y evidencias", tipo: "adjuntos", visible: true, obligatorio: "no", bloqueado: false, ancho: "completo", ayuda: "Diagramas, scripts, manuales de proveedor (máx. 25 MB por archivo).", reglas: [] }
        ]
      }
    ]
  },
  cuestionario_riesgo: {
    activo: true,
    puntaje_maximo_posible: 44,
    niveles: [
      { id: "bajo", nombre: "Bajo", min: 0, max: 10, color: "#16a34a", bg: "#dcfce7", border: "#86efac", descripcion: "Impacto y riesgo mínimos; apto para autorización técnica delegada." },
      { id: "medio", nombre: "Medio", min: 11, max: 20, color: "#d97706", bg: "#fef3c7", border: "#fde68a", descripcion: "Riesgo moderado con afectación acotada; requiere aprobación del Gestor de Cambios." },
      { id: "alto", nombre: "Alto", min: 21, max: 32, color: "#ea580c", bg: "#ffedd5", border: "#fed7aa", descripcion: "Riesgo significativo para la continuidad del servicio; requiere dictamen del comité CAB." },
      { id: "critico", nombre: "Crítico", min: 33, max: 44, color: "#dc2626", bg: "#fee2e2", border: "#fca5a5", descripcion: "Riesgo máximo institucional; exige comité CAB pleno y aprobación de Dirección." }
    ],
    reglas: {
      aplicar_regla_elevacion: true,
      permitir_ajuste_manual: true,
      perfiles_ajuste_manual: [1, 8], // Admin y Gestor de Cambios
      riesgo_fijo_estandar: true,
      cuestionario_abreviado_emergencia: true,
      preguntas_emergencia: [1, 2, 3, 6, 8]
    },
    preguntas: [
      {
        id: 1,
        orden: 1,
        texto: "¿Afecta a servicios o CIs críticos?",
        peso: 1,
        fuente: "auto_criticidad",
        aplica_a: ["NORMAL", "EMERGENCIA"],
        activa: true,
        opciones: [
          { valor: "ninguno", texto: "Ninguno", puntaje: 0, eleva_minimo: null },
          { valor: "un_servicio", texto: "Un servicio o CI crítico", puntaje: 3, eleva_minimo: null },
          { valor: "varios", texto: "Varios servicios críticos", puntaje: 5, eleva_minimo: "alto" }
        ]
      },
      {
        id: 2,
        orden: 2,
        texto: "Usuarios afectados estimados",
        peso: 1,
        fuente: "auto_usuarios",
        aplica_a: ["NORMAL", "EMERGENCIA"],
        activa: true,
        opciones: [
          { valor: "menos_10", texto: "Menos de 10 usuarios", puntaje: 0, eleva_minimo: null },
          { valor: "10_100", texto: "10 a 100 usuarios", puntaje: 1, eleva_minimo: null },
          { valor: "101_1000", texto: "101 a 1,000 usuarios", puntaje: 3, eleva_minimo: null },
          { valor: "mas_1000", texto: "Más de 1,000 usuarios o masivo", puntaje: 5, eleva_minimo: null }
        ]
      },
      {
        id: 3,
        orden: 3,
        texto: "Interrupción de servicio",
        peso: 1,
        fuente: "auto_interrupcion",
        aplica_a: ["NORMAL", "EMERGENCIA"],
        activa: true,
        opciones: [
          { valor: "ninguna", texto: "Sin interrupción (en caliente)", puntaje: 0, eleva_minimo: null },
          { valor: "hasta_1h", texto: "Interrupción de hasta 1 hora", puntaje: 1, eleva_minimo: null },
          { valor: "1_4h", texto: "Interrupción de 1 a 4 horas", puntaje: 3, eleva_minimo: null },
          { valor: "mas_4h", texto: "Interrupción mayor a 4 horas", puntaje: 5, eleva_minimo: null }
        ]
      },
      {
        id: 4,
        orden: 4,
        texto: "Complejidad técnica de la ejecución",
        peso: 1,
        fuente: "manual",
        aplica_a: ["NORMAL"],
        activa: true,
        opciones: [
          { valor: "baja", texto: "Baja (procedimiento estándar documentado)", puntaje: 1, eleva_minimo: null },
          { valor: "media", texto: "Media (múltiples componentes involucrados)", puntaje: 3, eleva_minimo: null },
          { valor: "alta", texto: "Alta (arquitectura compleja o tecnología nueva)", puntaje: 5, eleva_minimo: null }
        ]
      },
      {
        id: 5,
        orden: 5,
        texto: "Experiencia previa del equipo",
        peso: 1,
        fuente: "manual",
        aplica_a: ["NORMAL"],
        activa: true,
        opciones: [
          { valor: "rutinario", texto: "Rutinario ejecutado exitosamente con anterioridad", puntaje: 0, eleva_minimo: null },
          { valor: "probado_qa", texto: "Probado y validado en ambiente de pruebas", puntaje: 1, eleva_minimo: null },
          { valor: "primera_vez", texto: "Primera vez que se ejecuta en la institución", puntaje: 4, eleva_minimo: null }
        ]
      },
      {
        id: 6,
        orden: 6,
        texto: "Robustez del plan de Rollback (Reversión)",
        peso: 1,
        fuente: "manual",
        aplica_a: ["NORMAL", "EMERGENCIA"],
        activa: true,
        opciones: [
          { valor: "probado", texto: "Probado y automatizado con retorno inmediato", puntaje: 0, eleva_minimo: null },
          { valor: "documentado", texto: "Documentado paso a paso sin prueba reciente", puntaje: 2, eleva_minimo: null },
          { valor: "no_existe", texto: "No existe o es técnicamente inviable revertir", puntaje: 5, eleva_minimo: "alto" }
        ]
      },
      {
        id: 7,
        orden: 7,
        texto: "Dependencias externas o de terceros",
        peso: 1,
        fuente: "manual",
        aplica_a: ["NORMAL"],
        activa: true,
        opciones: [
          { valor: "ninguna", texto: "Ninguna (ejecución 100% interna)", puntaje: 0, eleva_minimo: null },
          { valor: "internas", texto: "Depende de otras áreas internas de TI", puntaje: 2, eleva_minimo: null },
          { valor: "proveedor", texto: "Depende de soporte externo o enlace de proveedor", puntaje: 4, eleva_minimo: null }
        ]
      },
      {
        id: 8,
        orden: 8,
        texto: "Entorno destino",
        peso: 1,
        fuente: "auto_entorno",
        aplica_a: ["NORMAL", "EMERGENCIA"],
        activa: true,
        opciones: [
          { valor: "desarrollo", texto: "Desarrollo / Sandbox", puntaje: 0, eleva_minimo: null },
          { valor: "pruebas", texto: "Pruebas / QA", puntaje: 1, eleva_minimo: null },
          { valor: "preproduccion", texto: "Preproducción / Staging", puntaje: 2, eleva_minimo: null },
          { valor: "produccion", texto: "Producción", puntaje: 3, eleva_minimo: null }
        ]
      },
      {
        id: 9,
        orden: 9,
        texto: "Programación respecto a ventanas oficiales",
        peso: 1,
        fuente: "auto_calendario",
        aplica_a: ["NORMAL"],
        activa: true,
        opciones: [
          { valor: "en_ventana", texto: "Dentro de ventana de mantenimiento aprobada", puntaje: 0, eleva_minimo: null },
          { valor: "fuera_ventana", texto: "Fuera de ventana de mantenimiento", puntaje: 4, eleva_minimo: "medio" }
        ]
      },
      {
        id: 10,
        orden: 10,
        texto: "Antecedentes de fallos en los mismos CIs en 6 meses",
        peso: 1,
        fuente: "auto_historial",
        aplica_a: ["NORMAL"],
        activa: true,
        opciones: [
          { valor: "cero", texto: "Ningún fallo registrado", puntaje: 0, eleva_minimo: null },
          { valor: "un_fallo", texto: "1 fallo previo registrado", puntaje: 2, eleva_minimo: null },
          { valor: "mas_fallos", texto: "Más de 1 fallo en los últimos 6 meses", puntaje: 4, eleva_minimo: "medio" }
        ]
      }
    ]
  },
  prioridad: {
    usar_matriz_propia: false,
    permitir_prioridad_manual: false,
    perfiles_prioridad_manual: [1, 8],
    recalcular_al_cambiar: true,
    tooltips: {
      impacto: {
        alta: "Interrupción de servicios críticos institucionales o afectación generalizada a múltiples unidades de negocio.",
        media: "Degradación de rendimiento o afectación de procesos auxiliares sin pérdida total de servicio.",
        baja: "Afectación acotada o cosmética sin perjuicio operativo perceptible para los usuarios finales."
      },
      urgencia: {
        alta: "Requiere implementación urgente; amenaza inminente a la estabilidad operativa o requerimiento regulatorio improrrogable.",
        media: "Requiere atención en la siguiente ventana programada dentro del ciclo estándar.",
        baja: "Puede programarse con holgura en ventanas diferidas sin generar contingencia."
      }
    }
  },
  vista_ticket: {
    cabecera: [
      { id: "codigo", etiqueta: "Código RFC", visible: true, fijo: true, orden: 1 },
      { id: "titulo", etiqueta: "Título", visible: true, fijo: true, orden: 2 },
      { id: "tipo_cambio", etiqueta: "Tipo de cambio", visible: true, fijo: true, orden: 3 },
      { id: "id_estado", etiqueta: "Estado del ciclo de vida", visible: true, fijo: true, orden: 4 },
      { id: "prioridad", etiqueta: "Prioridad técnica", visible: true, fijo: true, orden: 5 },
      { id: "riesgo", etiqueta: "Nivel de riesgo", visible: true, fijo: false, orden: 6 },
      { id: "solicitante", etiqueta: "Solicitante", visible: true, fijo: false, orden: 7 },
      { id: "ventana", etiqueta: "Ventana programada", visible: true, fijo: false, orden: 8 },
      { id: "etapa_aprobacion", etiqueta: "Etapa de aprobación actual", visible: true, fijo: false, orden: 9 },
      { id: "plazo", etiqueta: "Indicadores de plazo", visible: true, fijo: false, orden: 10 }
    ],
    pestanas: [
      { id: "solicitud", nombre: "Solicitud", visible: true, fijo: true, orden: 1, visible_desde: "solicitado", editable_en: ["solicitado", "en_evaluacion"] },
      { id: "evaluacion", nombre: "Evaluación", visible: true, fijo: false, orden: 2, visible_desde: "en_evaluacion", editable_en: ["en_evaluacion", "en_autorizacion"] },
      { id: "aprobaciones", nombre: "Aprobaciones", visible: true, fijo: false, orden: 3, visible_desde: "en_autorizacion", editable_en: ["en_autorizacion"] },
      { id: "planificacion", nombre: "Planificación", visible: true, fijo: false, orden: 4, visible_desde: "autorizado", editable_en: ["autorizado", "programado"] },
      { id: "implementacion", nombre: "Implementación", visible: true, fijo: false, orden: 5, visible_desde: "programado", editable_en: ["en_ejecucion", "implementado"] },
      { id: "pir", nombre: "Revisión post-implementación (PIR)", visible: true, fijo: false, orden: 6, visible_desde: "implementado", editable_en: ["implementado", "en_revision_post"] },
      { id: "relacionados", nombre: "Tickets relacionados", visible: true, fijo: false, orden: 7, visible_desde: "solicitado", editable_en: ["solicitado", "en_evaluacion", "en_autorizacion", "autorizado", "programado"] },
      { id: "cmdb", nombre: "Activos / CIs afectados", visible: true, fijo: false, orden: 8, visible_desde: "solicitado", editable_en: ["solicitado", "en_evaluacion"] },
      { id: "comentarios", nombre: "Comentarios y bitácora", visible: true, fijo: true, orden: 9, visible_desde: "solicitado", editable_en: ["solicitado", "en_evaluacion", "en_autorizacion", "autorizado", "programado", "en_ejecucion", "implementado"] },
      { id: "auditoria", nombre: "Historial / Auditoría", visible: true, fijo: true, orden: 10, visible_desde: "solicitado", editable_en: [] }
    ],
    panel_lateral: [
      { id: "tipo_modelo", etiqueta: "Tipo y modelo de cambio", visible: true, orden: 1 },
      { id: "categoria", etiqueta: "Categoría tecnológica", visible: true, orden: 2 },
      { id: "servicios", etiqueta: "Servicios afectados", visible: true, orden: 3 },
      { id: "ci_afectados", etiqueta: "CIs y criticidad máxima", visible: true, orden: 4 },
      { id: "entorno", etiqueta: "Entorno operativo", visible: true, orden: 5 },
      { id: "prioridad_riesgo", etiqueta: "Prioridad y riesgo", visible: true, orden: 6 },
      { id: "origen_ticket", etiqueta: "Origen y ticket motivador", visible: true, orden: 7 },
      { id: "responsable_grupo", etiqueta: "Implementador y grupo", visible: true, orden: 8 },
      { id: "aprobadores_pendientes", etiqueta: "Aprobadores pendientes y plazo", visible: true, orden: 9 },
      { id: "reunion_cab", etiqueta: "Reunión de CAB agendada", visible: true, orden: 10 },
      { id: "interrupcion", etiqueta: "Interrupción estimada", visible: true, orden: 11 }
    ]
  }
};

export async function obtenerConfiguracionFormulario(idUsuario: number, pantalla: string, pestana: string) {
  const recurso = `cambios:${pantalla}:${pestana}`;

  // 1. Verificar bloqueo concurrente
  const bloqueoRow = await queryRow<{ id_usuario: number; nombres: string; fecha_bloqueo: string }>(`
    SELECT b.id_usuario, CONCAT(u.nombres, ' ', u.apellido_paterno) as nombres, b.fecha_bloqueo
    FROM bloqueo_edicion_concurrente b
    JOIN usuario u ON u.id_usuario = b.id_usuario
    WHERE b.recurso = $1 AND b.fecha_expiracion > NOW()
  `, [recurso]);

  let enEdicionPorOtro = false;
  let usuarioBloqueo = null;

  if (bloqueoRow) {
    if (bloqueoRow.id_usuario !== idUsuario) {
      enEdicionPorOtro = true;
      usuarioBloqueo = {
        id_usuario: bloqueoRow.id_usuario,
        nombre: bloqueoRow.nombres,
        hora: bloqueoRow.fecha_bloqueo,
      };
    } else {
      // Refrescar expiración a 15 minutos
      await query(`
        UPDATE bloqueo_edicion_concurrente
        SET fecha_expiracion = NOW() + INTERVAL '15 minutes'
        WHERE recurso = $1 AND id_usuario = $2
      `, [recurso, idUsuario]);
    }
  }

  // 2. Obtener última versión publicada
  const publicadaRow = await queryRow<any>(`
    SELECT v.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
    FROM configuracion_modulo_versiones v
    LEFT JOIN usuario u ON u.id_usuario = v.id_usuario_creacion
    WHERE v.modulo = 'gestion_de_cambios' AND v.pantalla = $1 AND v.pestana = $2 AND v.es_publicada = true
    ORDER BY v.numero_version DESC
    LIMIT 1
  `, [pantalla, pestana]);

  // 3. Obtener borrador activo si existe
  const borradorRow = await queryRow<any>(`
    SELECT v.*, CONCAT(u.nombres, ' ', u.apellido_paterno) as autor_nombre
    FROM configuracion_modulo_versiones v
    LEFT JOIN usuario u ON u.id_usuario = v.id_usuario_creacion
    WHERE v.modulo = 'gestion_de_cambios' AND v.pantalla = $1 AND v.pestana = $2 AND v.es_borrador = true
    ORDER BY v.id_version DESC
    LIMIT 1
  `, [pantalla, pestana]);

  // Snapshot base de fábrica si no hay publicado o está vacío
  const valoresFabrica = VALORES_FABRICA_PESTANAS[pestana] || {};
  const datosPublicados = (publicadaRow && publicadaRow.snapshot && Object.keys(publicadaRow.snapshot).length > 0)
    ? publicadaRow.snapshot
    : valoresFabrica;

  const datosActivos = borradorRow ? borradorRow.snapshot : datosPublicados;

  return {
    ok: true,
    pantalla,
    pestana,
    configuracion: datosActivos,
    tiene_borrador: !!borradorRow,
    version_publicada: publicadaRow?.numero_version || 1,
    fecha_publicacion: publicadaRow?.fecha_creacion || new Date().toISOString(),
    autor_publicacion: publicadaRow?.autor_nombre || "Sistema ITSM (Fábrica)",
    borrador_info: borradorRow ? {
      id_version: borradorRow.id_version,
      fecha: borradorRow.fecha_creacion,
      autor: borradorRow.autor_nombre,
      motivo: borradorRow.motivo,
    } : null,
    bloqueo: {
      en_edicion_por_otro: enEdicionPorOtro,
      usuario_bloqueo: usuarioBloqueo,
    },
  };
}

export async function procesarAccionFormulario(idUsuario: number, body: any) {
  const { pantalla = "1.3.3.1", pestana = "campos", accion, snapshot, motivo = "Guardado de borrador" } = body;
  const recurso = `cambios:${pantalla}:${pestana}`;

  if (accion === "adquirir_bloqueo") {
    await query(`
      INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
      VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
      ON CONFLICT (recurso) DO UPDATE SET
        id_usuario = EXCLUDED.id_usuario,
        fecha_bloqueo = NOW(),
        fecha_expiracion = NOW() + INTERVAL '15 minutes'
    `, [recurso, idUsuario]);
    return { ok: true, mensaje: "Bloqueo adquirido correctamente." };
  }

  if (accion === "liberar_bloqueo") {
    await query(`
      DELETE FROM bloqueo_edicion_concurrente
      WHERE recurso = $1 AND id_usuario = $2
    `, [recurso, idUsuario]);
    return { ok: true, mensaje: "Bloqueo liberado." };
  }

  if (accion === "restaurar_fabrica") {
    const valoresFabrica = VALORES_FABRICA_PESTANAS[pestana] || {};
    await query(`
      DELETE FROM configuracion_modulo_versiones
      WHERE modulo = 'gestion_de_cambios' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
    `, [pantalla, pestana]);

    await query(`
      INSERT INTO configuracion_modulo_versiones (
        modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
      ) VALUES (
        'gestion_de_cambios', $1, $2, 0, false, true, $3, '{"accion": "restaurar_fabrica"}'::jsonb, 'Restauración a valores de fábrica en borrador', 'Carga de fábrica', $4
      )
    `, [pantalla, pestana, JSON.stringify(valoresFabrica), idUsuario]);

    return { ok: true, mensaje: "Valores de fábrica cargados en borrador exitosamente.", snapshot: valoresFabrica };
  }

  // Acción por defecto: Guardar borrador
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
  `, [pantalla, pestana]);

  await query(`
    INSERT INTO configuracion_modulo_versiones (
      modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
    ) VALUES (
      'gestion_de_cambios', $1, $2, 0, false, true, $3, '{"tipo": "borrador"}'::jsonb, $4, 'Borrador activo sin publicar', $5
    )
  `, [pantalla, pestana, JSON.stringify(snapshot), motivo, idUsuario]);

  // Refrescar bloqueo
  await query(`
    INSERT INTO bloqueo_edicion_concurrente (recurso, id_usuario, fecha_bloqueo, fecha_expiracion)
    VALUES ($1, $2, NOW(), NOW() + INTERVAL '15 minutes')
    ON CONFLICT (recurso) DO UPDATE SET
      id_usuario = EXCLUDED.id_usuario,
      fecha_expiracion = NOW() + INTERVAL '15 minutes'
  `, [recurso, idUsuario]);

  return { ok: true, mensaje: "Borrador guardado exitosamente." };
}

export async function publicarConfiguracionFormulario(idUsuario: number, ip: string, body: any) {
  const { pantalla = "1.3.3.1", pestana = "campos", snapshot, motivo, diff = {} } = body;

  if (!motivo || motivo.trim().length < 10) {
    throw new ErrorDominio("El motivo de publicación es obligatorio y debe tener al menos 10 caracteres.");
  }

  // 1. Obtener última versión publicada para incrementar el número
  const ultimaPublicada = await queryRow<{ max_version: number }>(`
    SELECT COALESCE(MAX(numero_version), 0) as max_version
    FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = $1 AND pestana = $2 AND es_publicada = true
  `, [pantalla, pestana]);

  const nuevaVersion = (ultimaPublicada?.max_version || 0) + 1;

  // 2. Conteo de RFCs abiertas potencialmente impactadas
  const countRow = await queryRow<{ total: number }>(`
    SELECT COUNT(*) as total FROM cambio
    WHERE id_estado NOT IN (10, 11, 12) -- No estados finales: Cerrado, Rechazado, Cancelado
  `);
  const rfcsImpactadas = Number(countRow?.total || 0);

  // 3. Insertar la nueva versión inmutable
  await query(`
    INSERT INTO configuracion_modulo_versiones (
      modulo, pantalla, pestana, numero_version, es_publicada, es_borrador, snapshot, diff, motivo, impacto_resumen, id_usuario_creacion
    ) VALUES (
      'gestion_de_cambios', $1, $2, $3, true, false, $4, $5, $6, $7, $8
    )
  `, [
    pantalla,
    pestana,
    nuevaVersion,
    JSON.stringify(snapshot),
    JSON.stringify(diff),
    motivo,
    `Afecta a ${rfcsImpactadas} RFC(s) abiertas`,
    idUsuario,
  ]);

  // 4. Eliminar borradores previos de esta pantalla/pestaña
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
  `, [pantalla, pestana]);

  // 5. Liberar el bloqueo concurrente
  const recurso = `cambios:${pantalla}:${pestana}`;
  await query(`
    DELETE FROM bloqueo_edicion_concurrente
    WHERE recurso = $1 AND id_usuario = $2
  `, [recurso, idUsuario]);

  // 6. Registro de auditoría
  await query(`
    INSERT INTO auditoria_sistema (
      id_usuario, accion, tabla_afectada, registro_id, detalles, ip_origen
    ) VALUES (
      $1, 'PUBLICAR_CONFIGURACION_CAMBIOS', 'configuracion_modulo_versiones', $2, $3, $4
    )
  `, [
    idUsuario,
    nuevaVersion,
    JSON.stringify({ pantalla, pestana, version: nuevaVersion, motivo, rfcsImpactadas }),
    ip,
  ]);

  return {
    ok: true,
    mensaje: `Versión v${nuevaVersion} publicada exitosamente.`,
    nueva_version: nuevaVersion,
    rfcs_impactadas: rfcsImpactadas,
  };
}

export async function descartarBorradorFormulario(idUsuario: number, pantalla: string, pestana: string) {
  await query(`
    DELETE FROM configuracion_modulo_versiones
    WHERE modulo = 'gestion_de_cambios' AND pantalla = $1 AND pestana = $2 AND es_borrador = true
  `, [pantalla, pestana]);

  const recurso = `cambios:${pantalla}:${pestana}`;
  await query(`
    DELETE FROM bloqueo_edicion_concurrente
    WHERE recurso = $1 AND id_usuario = $2
  `, [recurso, idUsuario]);

  return { ok: true, mensaje: "Borrador descartado correctamente." };
}
