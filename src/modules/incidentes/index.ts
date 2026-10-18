export { listarIncidentes } from "./incidentesService";
export * from "./types";
export { sanitizarDatosIncidente } from "./incidentesValidaciones";
export { obtenerIdTipoTicketPorCodigo, validarTipoTicket } from "./incidentesService";

// --- Sala de crisis del incidente mayor, movida desde
// src/modules/perfiles/tecnico para que el rol solo conserve su UI. ---
export { listarSalaDeCrisis, agregarComunicado } from "./services/salaDeCrisisService";