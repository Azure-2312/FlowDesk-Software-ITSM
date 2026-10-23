// =====================================================================
// Contrato de UI del módulo de Gestión de Problemas.
//
// Los módulos externos deben importar componentes de UI compartidos
// SOLO desde aquí:
//
//   import { ProblemasWorkspace, VistaProblemas, VistaKedb } from "@/modules/problemas/ui";
//
// Este archivo es de cliente: no debe importar lógica de servidor
// (controladores, acceso a base de datos, etc.).
// =====================================================================

export { default as ProblemasWorkspace } from "./components/ProblemasWorkspace";
export { default as VistaProblemas } from "./views/VistaProblemas";
export { default as VistaKedb } from "./views/VistaKedb";
export { default as VistaProblemaDetalle } from "./views/VistaProblemaDetalle";
export { default as VistaPanelGestorProblemas } from "./views/VistaPanelGestorProblemas";
export { default as VistaAnalisisProblemas } from "./views/VistaAnalisisProblemas";
export { default as VistaAsignacionProblemas } from "./views/VistaAsignacionProblemas";
export { default as VistaCambiosProblemas } from "./views/VistaCambiosProblemas";
export { default as VistaCandidatosProblemas } from "./views/VistaCandidatosProblemas";
export { default as VistaConocimientoProblemas } from "./views/VistaConocimientoProblemas";
export { default as VistaMayoresProblemas } from "./views/VistaMayoresProblemas";
export { default as VistaObjetivosProblemas } from "./views/VistaObjetivosProblemas";
export { default as VistaRecurrentesProblemas } from "./views/VistaRecurrentesProblemas";
export { default as VistaHubProblemas } from "./config/hub/VistaHubProblemas";
export { default as VistaFormularioProblemas } from "./config/formulario/VistaFormularioProblemas";
export { default as VistaFlujoProblemas } from "./config/flujo/VistaFlujoProblemas";
export { default as VistaRelacionesProblemas } from "./config/relaciones/VistaRelacionesProblemas";
