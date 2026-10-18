export {
  listarCambios,
  crearCambio,
  type FiltrosCambios,
} from "./services/cambiosService";

export {
  obtenerDetalleCambio,
  actualizarCambio,
} from "./services/cambioDetalleService";

export {
  listarCatalogosCambio,
  crearCatalogoCambio,
  actualizarCatalogoCambio,
  eliminarCatalogoCambio,
} from "./services/catalogosService";

export {
  listarCamposPersonalizadosCambio,
  crearCampoPersonalizadoCambio,
  actualizarCampoPersonalizadoCambio,
  eliminarCampoPersonalizadoCambio,
} from "./services/camposPersonalizadosService";

export {
  listarPlantillasCambio,
  crearPlantillaCambio,
  actualizarPlantillaCambio,
  eliminarPlantillaCambio,
} from "./services/plantillasService";

export {
  listarModelosEstandar,
  crearModeloEstandar,
  actualizarModeloEstandar,
  eliminarModeloEstandar,
  type FiltrosModelosEstandar,
} from "./services/modelosEstandarService";

export { evaluarCuestionarioRiesgo } from "./services/cuestionarioRiesgoService";

export {
  obtenerConfiguracionRfc,
  guardarConfiguracionRfc,
} from "./services/rfcConfigService";

export {
  exportarFeriadosCsv,
  importarFeriadosCsv,
} from "./services/notificacionesCalendarioFeriadosCsvService";

export {
  exportarCongelamientoCsv,
  importarCongelamientoCsv,
} from "./services/notificacionesCalendarioCongelamientoCsvService";

export {
  VALORES_FABRICA_1333,
  obtenerConfiguracionFlujoEvaluacion,
  procesarAccionFlujoEvaluacion,
  publicarConfiguracionFlujoEvaluacion,
  descartarBorradorFlujoEvaluacion,
} from "./services/flujoEvaluacionConfiguracionService";

export {
  VALORES_FABRICA_1332,
  obtenerConfiguracionTiposRequisitos,
  procesarAccionTiposRequisitos,
  publicarConfiguracionTiposRequisitos,
  descartarBorradorTiposRequisitos,
} from "./services/tiposRequisitosConfiguracionService";

export {
  VALORES_FABRICA_1334,
  obtenerConfiguracionNotificacionesCalendario,
  procesarAccionNotificacionesCalendario,
  publicarConfiguracionNotificacionesCalendario,
  descartarBorradorNotificacionesCalendario,
} from "./services/notificacionesCalendarioConfiguracionService";

export {
  VALORES_FABRICA_PESTANAS,
  obtenerConfiguracionFormulario,
  procesarAccionFormulario,
  publicarConfiguracionFormulario,
  descartarBorradorFormulario,
} from "./services/formularioConfiguracionService";

export { simularEscalamiento } from "./services/flujoEvaluacionSimularEscalamientoService";

export { simularMatrizAutoridad } from "./services/matrizAutoridadSimularService";

export { simularReglasClasificacion } from "./services/reglasClasificacionSimularService";

export { simularEtapasFlujo } from "./services/flujoEvaluacionSimularEtapasService";

export { simularQuorum } from "./services/flujoEvaluacionSimularQuorumService";

export { validarFlujoCambios } from "./services/flujoEvaluacionValidarFlujoService";

export { simularConflictosCalendario } from "./services/notificacionesCalendarioSimularConflictosService";

// --- Consola del Gestor de Cambios (perfil 8): lógica de dominio movida desde
// src/modules/perfiles/gestor-cambios para que el rol solo conserve su UI. ---
export {
  PLAZO_PIR_DIAS,
  obtenerPanelGestion,
  listarEvaluacion,
  listarEvaluadores,
  asignarEvaluador,
  enviarAAutorizacion,
  listarAutorizaciones,
  registrarRecordatorio,
  listarExcepciones,
  crearExcepcion,
  listarProgramacion,
  programarCambio,
  listarEjecucion,
  extenderVentana,
  resolverEjecucion,
  listarPir,
  registrarPir,
  listarModelos,
  proponerModelo,
  cambiarEstadoModelo,
  obtenerReportesCambios,
} from "./services/cambiosGestionService";

export {
  listarReuniones,
  listarCambiosParaAgenda,
  crearReunion,
  actualizarReunion,
} from "./services/cabGestionService";

export {
  detectarConflictos,
  validarProgramacion,
} from "./services/conflictosService";
