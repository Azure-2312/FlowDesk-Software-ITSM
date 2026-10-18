// =====================================================================
// Modulo Plataforma
// Salud del sistema, mantenimiento de datos, logs, auditoria de
// sistema y disenador de reportes.
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
