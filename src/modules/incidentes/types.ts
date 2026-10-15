export interface IncidenteRegistro {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  descripcion: string;
  id_servicio: number;
  nombre_servicio?: string;
  id_categoria?: number;
  nombre_categoria?: string;
  id_prioridad: number;
  nombre_prioridad?: string;
  id_impacto: number;
  id_urgencia: number;
  id_estado: number;
  nombre_estado?: string;
  id_solicitante: number;
  nombre_solicitante?: string;
  id_tecnico_asignado?: number | null;
  nombre_tecnico?: string | null;
  fecha_creacion: string;
  fecha_limite_resolucion?: string | null;
}

export interface CrearIncidenteInput {
  titulo: string;
  descripcion: string;
  id_servicio: number;
  id_impacto: number;
  id_urgencia: number;
  id_solicitante: number;
}
