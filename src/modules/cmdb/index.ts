// =====================================================================
// Modulo CMDB - Gestion de Configuracion del Servicio (ITIL 4)
//
// Contrato publico del modulo. Los demas modulos deben importar SOLO
// desde aqui; nunca por rutas profundas.
//
// Responsabilidades:
//   - Elementos de configuracion (CI) y sus tipos.
//   - Relaciones / topologia entre CIs (grafo de dependencias).
//   - Gobierno de la CMDB: lineas base, inexactitudes y actualizaciones
//     derivadas de cambios.
//   - Auditoria de exactitud de la CMDB.
//
// La CMDB se apoya en los activos (ITAM) mediante el vinculo
// elemento_configuracion.id_activo -> activo, pero es un modulo
// independiente del modulo `activos`.
// =====================================================================

export {
  listarCmdb,
  crearCi,
  actualizarCi,
  type FiltrosCmdb,
} from "./services/cmdbService";

export { crearRelacionCmdb, eliminarRelacionCmdb } from "./services/cmdbRelacionesService";

export { listarTiposCi, crearTipoCi } from "./services/cmdbTiposService";

export {
  listarActualizaciones,
  generarDesdeCambios,
  resolverActualizacion,
  listarInexactitudes,
  crearInexactitud,
  resolverInexactitud,
  listarLineasBase,
  crearLineaBase,
  listarAuditoriaCmdb,
} from "./services/cmdbGestionService";

export {
  VALORES_FABRICA_154,
  obtenerConfiguracionCmdbRelaciones,
  procesarAccionCmdbRelaciones,
  publicarConfiguracionCmdbRelaciones,
  descartarBorradorCmdbRelaciones,
} from "./services/cmdbRelacionesConfiguracionService";
