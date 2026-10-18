export {
  listarActivos,
  crearActivo,
  actualizarActivo,
  type FiltrosActivos,
} from "./services/activosService";

export { listarHistorialActivo } from "./services/activoHistorialService";

export { listarTiposActivo, crearTipoActivo } from "./services/tiposActivoService";

export { listarModelosActivo, crearModeloActivo } from "./services/modelosService";

export { listarLicencias, crearLicencia, actualizarLicencia } from "./services/licenciasService";

export {
  listarAsignacionesLicencia,
  crearAsignacionLicencia,
  revocarAsignacionLicencia,
  type FiltrosAsignacionesLicencia,
} from "./services/licenciasAsignacionesService";

export {
  VALORES_FABRICA_153,
  obtenerConfiguracionLicenciasContratos,
  procesarAccionLicenciasContratos,
  publicarConfiguracionLicenciasContratos,
  descartarBorradorLicenciasContratos,
} from "./services/licenciasContratosConfiguracionService";

export {
  VALORES_FABRICA_151,
  obtenerConfiguracionTiposModelosAtributos,
  procesarAccionTiposModelosAtributos,
  publicarConfiguracionTiposModelosAtributos,
  descartarBorradorTiposModelosAtributos,
} from "./services/tiposModelosAtributosConfiguracionService";

export {
  VALORES_FABRICA_152,
  obtenerConfiguracionCiclosVidaTransiciones,
  procesarAccionCiclosVidaTransiciones,
  publicarConfiguracionCiclosVidaTransiciones,
  descartarBorradorCiclosVidaTransiciones,
} from "./services/ciclosVidaTransicionesConfiguracionService";

// --- Aprobaciones por monto (bajas y renovaciones), movidas desde
// src/modules/perfiles/aprobador para que el rol solo conserve su UI. ---
export {
  listarBajasPorMonto,
  resolverBaja,
  listarRenovaciones,
  resolverRenovacion,
} from "./services/aprobacionesMontoService";
