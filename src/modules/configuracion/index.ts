// =====================================================================
// Modulo Configuracion
// Menu, categorias, formularios/vistas de tickets, parametros del
// sistema y reglas de notificacion.
//
// Contrato publico: importar SOLO desde "@/modules/configuracion".
// =====================================================================

export {
  listarCategorias,
  crearCategoria,
  type CategoriaConStats,
  type FiltrosCategorias,
  type ContextoAuditoriaCategoria,
} from "./services/categoriaService";

export {
  obtenerCategoriaDetalle,
  actualizarCategoria,
  eliminarCategoria,
} from "./services/categoriaDetalleService";

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
