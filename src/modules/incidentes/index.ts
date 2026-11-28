export { obtenerIdTipoTicketPorCodigo, validarTipoTicket } from "./incidentesService";

// --- Incidentes mayores: bandeja, declaración y sala de crisis usan el mismo servicio. ---
export {
  listarIncidentesMayores,
  declararIncidenteMayor,
  actualizarIncidenteMayor,
} from "./services/incidentesMayoresService";
