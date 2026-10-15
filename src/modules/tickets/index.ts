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
