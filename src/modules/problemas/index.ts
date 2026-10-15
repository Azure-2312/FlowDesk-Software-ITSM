export {
  listarProblemas,
  crearProblema,
  obtenerProblema,
  actualizarProblema,
  type SesionProblema,
  type FiltrosProblemas,
  type DatosProblema,
  type ActualizacionProblema,
} from "./services/problemaService";

export {
  obtenerFlujo,
  guardarBorradorFlujo,
  publicarFlujo,
  descartarBorradorFlujo,
  crearEstadoProblema,
  actualizarEstadoProblema,
  eliminarEstadoProblema,
  crearTransicionProblema,
  actualizarTransicionProblema,
  eliminarTransicionProblema,
  crearReglaAsignacion,
  actualizarReglaAsignacion,
  eliminarReglaAsignacion,
  crearReglaEscalamiento,
  actualizarReglaEscalamiento,
  eliminarReglaEscalamiento,
  actualizarObjetivosOla,
  actualizarConfigReapertura,
  actualizarConfigMayor,
  crearTareaOPaquete,
  eliminarTareaOPaquete,
} from "./services/flujoService";

export {
  listarPlantillas,
  crearPlantilla,
  actualizarPlantilla,
  eliminarPlantilla,
} from "./services/plantillasService";

export {
  listarCamposPersonalizados,
  crearCampoPersonalizado,
  actualizarCampoPersonalizado,
  eliminarCampoPersonalizado,
} from "./services/camposPersonalizadosService";

export {
  listarReglasUmbral,
  simularReglaUmbral,
  crearReglaUmbral,
  duplicarReglaUmbral,
  actualizarReglaUmbral,
  eliminarReglaUmbral,
} from "./services/relacionesUmbralService";

export {
  listarCatalogosProblemas,
  fusionarValorCatalogo,
  crearValorCatalogo,
  actualizarValorCatalogo,
  eliminarValorCatalogo,
} from "./services/catalogosService";

export {
  obtenerMatrizPrioridad,
  actualizarMatrizPrioridad,
  CONFIG_MATRIZ_PROBLEMAS_DEFECTO,
  type ConfigMatrizProblemas,
} from "./services/matrizPrioridadService";

export { probarCoincidenciaKedb, type PruebaCoincidenciaKedb } from "./services/relacionesKedbService";

export {
  obtenerConfiguracionProblemas,
  guardarConfiguracionProblemas,
  VALORES_FABRICA_PESTANAS,
} from "./services/configuracionProblemasService";

export {
  obtenerRelacionesProblemas,
  guardarBorradorRelaciones,
  publicarRelaciones,
  descartarRelaciones,
  restaurarFabricaRelaciones,
} from "./services/relacionesService";
