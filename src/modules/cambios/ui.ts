// =====================================================================
// Contrato de UI del módulo de Gestión de Cambios (RFC).
//
// Los módulos externos y cascarones deben importar componentes de UI
// compartidos SOLO desde aquí:
//
//   import { VistaFormularioCambio, VistaTiposRequisitos } from "@/modules/cambios/ui";
//
// Este archivo es de cliente: no debe importar lógica de servidor
// (controladores, acceso a base de datos, etc.).
// =====================================================================

export { default as VistaFormularioCambio } from "./config/formulario/VistaFormularioCambio";
export { default as VistaTiposRequisitos } from "./config/tipos-requisitos/VistaTiposRequisitos";
export { default as VistaFlujoEvaluacion } from "./config/flujo-evaluacion/VistaFlujoEvaluacion";
export { default as VistaNotificacionesCalendario } from "./config/notificaciones-calendario/VistaNotificacionesCalendario";

export { default as VistaCambios } from "./views/VistaCambios";
export { default as VistaAvisosMantenimiento } from "./views/VistaAvisosMantenimiento";
export { default as VistaCambiosGestionCab } from "./gestion/cab/VistaCambiosGestionCab";
export { default as VistaCambiosGestionCalendario } from "./gestion/calendario/VistaCambiosGestionCalendario";
export { default as VistaCambiosGestionCrear } from "./gestion/crear/VistaCambiosGestionCrear";
export { default as VistaCambiosGestionTodos } from "./gestion/todos/VistaCambiosGestionTodos";
export { default as VistaCambiosGestionDetalle } from "./gestion/[id]/VistaCambiosGestionDetalle";
