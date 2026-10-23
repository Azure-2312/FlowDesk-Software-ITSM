// =====================================================================
// Modulo Plataforma
// Salud del sistema, mantenimiento de datos, logs, auditoria de
// sistema, menu, notificaciones y disenador de reportes.
//
// Contrato publico: importar SOLO desde "@/modules/plataforma".
// =====================================================================

export {
  listarAuditoriaSistema,
  type FiltrosAuditoriaSistema,
} from "./services/auditoriaSistemaService";

export {
  listarLogsSeguridad,
  type FiltrosLogsSeguridad,
} from "./services/logsSeguridadService";

export {
  procesarMantenimientoDatos,
  type ContextoMantenimientoDatos,
} from "./services/mantenimientoDatosService";

export {
  obtenerWidgetsDashboard,
  guardarWidgetsDashboard,
  type ContextoAuditoriaReportes,
} from "./services/reportesDisenadorService";

export {
  obtenerConfiguraciones,
  guardarConfiguracion,
  type ContextoAuditoriaConfiguracion,
} from "./services/configuracionSistemaService";

export {
  listarReglasNotificacion,
  actualizarReglaNotificacion,
  crearReglaNotificacion,
  type ContextoAuditoriaNotificacion,
} from "./services/reglasNotificacionService";

export {
  listarOpcionesMenuAdmin,
  crearOpcionMenuAdmin,
} from "./services/menuAdminService";

export {
  actualizarOpcionMenuAdmin,
  alternarEstadoOpcionMenuAdmin,
} from "./services/menuAdminDetalleService";
