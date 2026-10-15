export interface TicketMock {
  id: number;
  titulo: string;
  categoria: string;
  prioridad: string;
  estado: string;
  solicitante: string;
  tecnico: string | null;
  fecha: string;
}

export const TICKETS_MOCK: TicketMock[] = [];
