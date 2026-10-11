import { Ticket, ComentarioTicket, CatalogosTickets, SesionUsuario, ActualizarTicketPayload } from "@/types";

export type ArquetipoVistaTicket =
  | "CONSUMIDOR"           // Perfil 3: Solicitante
  | "OPERADOR_TECNICO"     // Perfil 2: Técnico
  | "SUPERVISOR_OPERATIVO" // Perfil 4: Supervisor
  | "GOBERNANZA_NEGOCIO"   // Perfil 5: Gestor de Área
  | "AUDITORIA_FORENSE"   // Perfil 6: Auditor de Seguridad
  | "ADMINISTRADOR_SISTEMA"; // Perfil 1: Administrador del Sistema

export interface PropsVistaPresentadorTicket {
  ticket: Ticket;
  comentarios: ComentarioTicket[];
  catalogos: CatalogosTickets | null;
  sesion: SesionUsuario;
  onEjecutarAccion: (payload: Partial<ActualizarTicketPayload> & Record<string, any>) => Promise<void>;
  onEnviarComentario: (comentario: string, esInterno: boolean) => Promise<void>;
  onElevarAProblema?: () => Promise<void>;
  ejecutandoAccion: boolean;
  enviandoComentario: boolean;
  elevandoProblema?: boolean;
  onCerrarModal: () => void;
  onActualizado: () => void;
}

/**
 * Resuelve el arquetipo de experiencia visual segun el perfil activo del usuario
 */
export function resolverArquetipoVista(idPerfil?: number): ArquetipoVistaTicket {
  switch (idPerfil) {
    case 1: // Administrador
      return "ADMINISTRADOR_SISTEMA";
    case 3: // Solicitante
      return "CONSUMIDOR";
    case 2: // Tecnico de Soporte
      return "OPERADOR_TECNICO";
    case 4: // Supervisor
      return "SUPERVISOR_OPERATIVO";
    case 5: // Gestor de Area
      return "GOBERNANZA_NEGOCIO";
    case 6: // Auditor de Seguridad
      return "AUDITORIA_FORENSE";
    default:
      // Fallar al arquetipo de solo lectura; no otorgar la interfaz del solicitante
      // a perfiles nuevos o fuera de la matriz explícita.
      return "AUDITORIA_FORENSE";
  }
}
