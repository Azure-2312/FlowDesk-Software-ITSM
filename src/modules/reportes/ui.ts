// =====================================================================
// Contrato de UI del modulo reportes.
//
// Todas las pantallas de reportes, de cualquier perfil o dominio, viven
// aqui. Las rutas publicas se exponen bajo /plataforma/reportes/{pantalla}
// y las paginas legadas redirigen a ellas.
// =====================================================================

export { default as VistaReportesOperativos } from "./views/VistaReportesOperativos";
export { default as VistaInformesAuditoria } from "./views/VistaInformesAuditoria";
export { default as VistaProductividad } from "./views/VistaProductividad";
export { default as VistaReportesActivos } from "./views/VistaReportesActivos";
export { default as VistaReportesCambios } from "./views/VistaReportesCambios";
export { default as VistaReportesAprobador } from "./views/VistaReportesAprobador";
export { default as VistaReportesProblemas } from "./views/VistaReportesProblemas";
export { default as VistaReportesArea } from "./views/VistaReportesArea";
export { default as VistaReportesDisenador } from "./views/VistaReportesDisenador";
export { default as VistaReportesGerenciales } from "./views/VistaReportesGerenciales";
