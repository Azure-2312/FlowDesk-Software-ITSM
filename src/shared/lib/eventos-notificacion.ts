// ============================================================================
// CATÁLOGO FIJO DE EVENTOS DE NOTIFICACIÓN IN-APP (N2 - FASE 2)
// ============================================================================
// Define los 15 eventos ITIL 4 oficiales, sus plantillas de texto constantes
// y los generadores de url_destino que cumplen estrictamente con el Anexo B.
// ============================================================================

export type CodigoEventoNotificacion =
  | "TICKET_ASIGNADO"
  | "TICKET_ESTADO_CAMBIADO"
  | "TICKET_COMENTARIO_PUBLICO"
  | "TICKET_RESUELTO"
  | "SLA_RIESGO"
  | "SLA_VENCIDO"
  | "APROBACION_PENDIENTE"
  | "APROBACION_RESUELTA"
  | "CAMBIO_AUTORIZADO"
  | "CAB_CONVOCATORIA"
  | "INCIDENTE_MAYOR_DECLARADO"
  | "PROBLEMA_ASIGNADO"
  | "ARTICULO_REVISION"
  | "CONTRATO_VENCIMIENTO";

export interface EventoDefinicion {
  codigo: CodigoEventoNotificacion;
  nombre: string;
  destinatariosDescripcion: string;
  construirMensaje: (params: Record<string, any>) => { titulo: string; mensaje: string; urlDestino: string };
}

export const CATALOGO_EVENTOS_NOTIFICACION: Record<CodigoEventoNotificacion, EventoDefinicion> = {
  // 1. Ticket asignado
  TICKET_ASIGNADO: {
    codigo: "TICKET_ASIGNADO",
    nombre: "Ticket asignado",
    destinatariosDescripcion: "Técnico asignado",
    construirMensaje: (p) => ({
      titulo: `Ticket #${p.ticketId || ""} asignado`,
      mensaje: `Se le ha asignado la atención del ticket: ${p.tituloTicket || ""}.`,
      urlDestino: `/plataforma/incidentes/bandeja?abrir=${p.ticketId || ""}`,
    }),
  },

  // 2. Cambio de estado de ticket
  TICKET_ESTADO_CAMBIADO: {
    codigo: "TICKET_ESTADO_CAMBIADO",
    nombre: "Cambio de estado de ticket",
    destinatariosDescripcion: "Solicitante y técnico asignado",
    construirMensaje: (p) => ({
      titulo: `Ticket #${p.ticketId || ""} cambió a ${p.nuevoEstado || ""}`,
      mensaje: `El ticket "${p.tituloTicket || ""}" se encuentra ahora en estado ${p.nuevoEstado || ""}.`,
      urlDestino: `/plataforma/incidentes/mios?abrir=${p.ticketId || ""}`,
    }),
  },

  // 3. Comentario público en ticket
  TICKET_COMENTARIO_PUBLICO: {
    codigo: "TICKET_COMENTARIO_PUBLICO",
    nombre: "Comentario público en ticket",
    destinatariosDescripcion: "La contraparte (solicitante <-> técnico)",
    construirMensaje: (p) => ({
      titulo: `Nuevo comentario en Ticket #${p.ticketId || ""}`,
      mensaje: `${p.autor || "Un usuario"} comentó: ${p.resumenComentario || "Nuevo comentario disponible"}.`,
      urlDestino: `/plataforma/incidentes/mios?abrir=${p.ticketId || ""}`,
    }),
  },

  // 4. Ticket resuelto: confirmar
  TICKET_RESUELTO: {
    codigo: "TICKET_RESUELTO",
    nombre: "Ticket resuelto: confirmar",
    destinatariosDescripcion: "Solicitante",
    construirMensaje: (p) => ({
      titulo: `Ticket #${p.ticketId || ""} resuelto: confirme conformidad`,
      mensaje: `El ticket ha sido marcado como RESUELTO. Por favor valide la solución y califique la atención.`,
      urlDestino: `/plataforma/incidentes/mios?abrir=${p.ticketId || ""}`,
    }),
  },

  // 5. SLA en riesgo (75 %)
  SLA_RIESGO: {
    codigo: "SLA_RIESGO",
    nombre: "SLA en riesgo (75 %)",
    destinatariosDescripcion: "Técnico y supervisor del grupo",
    construirMensaje: (p) => ({
      titulo: `¡Alerta! SLA en riesgo en Ticket #${p.ticketId || ""}`,
      mensaje: `El ticket ha consumido el 75% del tiempo acordado de atención SLA.`,
      urlDestino: `/plataforma/servicios/sla`,
    }),
  },

  // 6. SLA vencido
  SLA_VENCIDO: {
    codigo: "SLA_VENCIDO",
    nombre: "SLA vencido",
    destinatariosDescripcion: "Técnico, supervisor y jefe de TI",
    construirMensaje: (p) => ({
      titulo: `¡Crítico! SLA vencido en Ticket #${p.ticketId || ""}`,
      mensaje: `El ticket ha superado el tiempo máximo permitido de SLA sin cierre operativo.`,
      urlDestino: `/plataforma/servicios/sla`,
    }),
  },

  // 7. Aprobación pendiente
  APROBACION_PENDIENTE: {
    codigo: "APROBACION_PENDIENTE",
    nombre: "Aprobación pendiente",
    destinatariosDescripcion: "Aprobador (incluye delegado vigente)",
    construirMensaje: (p) => ({
      titulo: `Aprobación requerida: ${p.tipoTramite || "Trámite"} #${p.entidadId || ""}`,
      mensaje: `Se requiere su dictamen formal para: ${p.resumen || "Revisión pendiente"}.`,
      urlDestino: p.tipoTramite === "RFC" ? `/plataforma/cambios/aprobaciones?vista=pendientes` : `/plataforma/solicitudes/aprobaciones?vista=pendientes`,
    }),
  },

  // 8. Aprobación resuelta (aprobada/rechazada)
  APROBACION_RESUELTA: {
    codigo: "APROBACION_RESUELTA",
    nombre: "Aprobación resuelta",
    destinatariosDescripcion: "Solicitante del trámite",
    construirMensaje: (p) => ({
      titulo: `Trámite #${p.entidadId || ""} ${p.resultado || "resuelto"}`,
      mensaje: `Su trámite ha sido dictaminado como ${p.resultado || "procesado"}.`,
      urlDestino: p.tipoTramite === "RFC" ? `/plataforma/cambios/aprobaciones?vista=historial` : `/plataforma/solicitudes/aprobaciones?vista=historial`,
    }),
  },

  // 9. Cambio autorizado / programado
  CAMBIO_AUTORIZADO: {
    codigo: "CAMBIO_AUTORIZADO",
    nombre: "Cambio autorizado / programado",
    destinatariosDescripcion: "Solicitante, implementador, dueños de servicios afectados",
    construirMensaje: (p) => ({
      titulo: `RFC #${p.rfcId || ""} autorizada y programada`,
      mensaje: `El cambio "${p.tituloRfc || ""}" ha sido autorizado para ejecución en la ventana programada.`,
      urlDestino: `/plataforma/cambios/gestion/calendario`,
    }),
  },

  // 10. Convocatoria / acta de CAB
  CAB_CONVOCATORIA: {
    codigo: "CAB_CONVOCATORIA",
    nombre: "Convocatoria / acta de CAB",
    destinatariosDescripcion: "Miembros del CAB",
    construirMensaje: (p) => ({
      titulo: `Convocatoria a sesión de Comité CAB`,
      mensaje: `Se ha convocado sesión formal para evaluar los cambios programados en agenda.`,
      urlDestino: `/plataforma/cambios/cab`,
    }),
  },

  // 11. Incidente mayor declarado
  INCIDENTE_MAYOR_DECLARADO: {
    codigo: "INCIDENTE_MAYOR_DECLARADO",
    nombre: "Incidente mayor declarado",
    destinatariosDescripcion: "Gestor de incidentes, jefe de TI, equipo de crisis",
    construirMensaje: (p) => ({
      titulo: `¡INCIDENTE MAYOR DECLARADO! #${p.incidenteId || ""}`,
      mensaje: `Se ha abierto la Sala de Crisis para atender la degradación crítica del servicio.`,
      urlDestino: `/plataforma/incidentes/mayores?vista=sala-crisis&abrir=${p.incidenteId || ""}`,
    }),
  },

  // 12. Problema asignado / error conocido publicado
  PROBLEMA_ASIGNADO: {
    codigo: "PROBLEMA_ASIGNADO",
    nombre: "Problema asignado / error conocido publicado",
    destinatariosDescripcion: "Responsable / soporte",
    construirMensaje: (p) => ({
      titulo: `Problema #${p.problemaId || ""} registrado en investigación`,
      mensaje: `Se ha registrado el problema "${p.tituloProblema || ""}" para análisis de causa raíz.`,
      urlDestino: `/plataforma/problemas/${p.problemaId || ""}`,
    }),
  },

  // 13. Artículo enviado a revisión / publicado / devuelto
  ARTICULO_REVISION: {
    codigo: "ARTICULO_REVISION",
    nombre: "Artículo enviado a revisión / publicado / devuelto",
    destinatariosDescripcion: "Revisores / autor",
    construirMensaje: (p) => ({
      titulo: `Artículo KCS: ${p.accion || "actualizado"}`,
      mensaje: `El artículo "${p.tituloArticulo || ""}" requiere revisión o ha cambiado de estado.`,
      urlDestino: `/plataforma/conocimiento/publicacion?vista=pendientes`,
    }),
  },

  // 14. Vencimiento de contrato, licencia o garantía (90/60/30 días)
  CONTRATO_VENCIMIENTO: {
    codigo: "CONTRATO_VENCIMIENTO",
    nombre: "Vencimiento de contrato, licencia o garantía",
    destinatariosDescripcion: "Gestor de activos",
    construirMensaje: (p) => ({
      titulo: `Vigencia por expirar: ${p.itemNombre || "Contrato"} (${p.diasRestantes || "30"} días)`,
      mensaje: `El contrato/licencia "${p.itemNombre || ""}" expira el ${p.fechaVencimiento || "próximamente"}.`,
      urlDestino: `/plataforma/activos/contratos?vista=renovaciones`,
    }),
  },
};
