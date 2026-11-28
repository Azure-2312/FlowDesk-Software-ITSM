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

// --- Autorización del cierre de problemas mayores, movida desde
// src/modules/perfiles/aprobador para que el rol solo conserve su UI. ---
export {
  listarProblemasMayores,
  resolverProblema,
} from "./services/cierreProblemaService";
