import { Ticket, ComentarioTicket, CatalogosTickets, SesionUsuario, ActualizarTicketPayload } from "@/types";

export type ArquetipoVistaTicket =
  | "CONSUMIDOR"           // Perfil 3: Solicitante
  | "OPERADOR_TECNICO"     // Perfil 2: Tecnico
  | "SUPERVISOR_OPERATIVO" // Perfil 4: Supervisor
  | "GESTOR_AREA"          // Perfil 5: Gestor de Area
  | "AUDITORIA_FORENSE"    // Perfil 6: Auditor de Seguridad
  | "APROBADOR_CAB"        // Perfil 7: Aprobador
  | "GESTOR_CAMBIOS"       // Perfil 8: Gestor de Cambios
  | "GESTOR_ACTIVOS"       // Perfil 9: Gestor de Activos y CMDB
  | "GESTOR_PROBLEMAS"     // Perfil 10: Gestor de Problemas
  | "ADMINISTRADOR_SISTEMA"// Perfil 1: Administrador del Sistema
  | "GOBERNANZA_NEGOCIO";  // Alias de retrocompatibilidad

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
 * Resuelve el arquetipo de experiencia visual segun el perfil activo del usuario (10 perfiles oficiales)
 */
export function resolverArquetipoVista(idPerfil?: number): ArquetipoVistaTicket {
  switch (idPerfil) {
    case 1:
      return "ADMINISTRADOR_SISTEMA";
    case 2:
      return "OPERADOR_TECNICO";
    case 3:
      return "CONSUMIDOR";
    case 4:
      return "SUPERVISOR_OPERATIVO";
    case 5:
      return "GESTOR_AREA";
    case 6:
      return "AUDITORIA_FORENSE";
    case 7:
      return "APROBADOR_CAB";
    case 8:
      return "GESTOR_CAMBIOS";
    case 9:
      return "GESTOR_ACTIVOS";
    case 10:
      return "GESTOR_PROBLEMAS";
    default:
      return "AUDITORIA_FORENSE";
  }
}
