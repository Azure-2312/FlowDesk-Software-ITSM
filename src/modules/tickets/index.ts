export {
  listarTickets,
  crearTicket,
  calcularPrioridadITIL,
  type ContextoTickets,
  type FiltrosTickets,
} from "./services/ticketsService";

export {
  obtenerDetalleTicket,
  actualizarTicket,
} from "./services/ticketDetalleService";

export { listarCatalogosTickets } from "./services/catalogosService";

export { crearComentarioTicket } from "./services/ticketComentariosService";

// =====================================================================
// Contrato de servidor del modulo tickets.
//
// Los modulos incidentes y solicitudes reutilizan los mismos handlers
// de tickets (con su propia validacion de tipo). Importar SOLO desde
// "@/modules/tickets"; nunca rutas profundas.
// =====================================================================

export {
  GET as ticketsGet,
  POST as ticketsPost,
} from "./api/ticketsController";

export {
  GET as ticketDetalleGet,
  PATCH as ticketDetallePatch,
} from "./api/ticketDetalleController";

export { POST as ticketComentariosPost } from "./api/ticketComentariosController";
