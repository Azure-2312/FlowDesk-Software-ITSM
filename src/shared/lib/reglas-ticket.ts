/**
 * Reglas únicas sobre el estado de un ticket, para pantallas y servicios.
 * Son el equivalente en TypeScript de shared/lib/sla-sql.ts: ambas deben
 * contar lo mismo en todos los perfiles.
 *
 * - En atención: Abierto, Asignado, En proceso o En espera. Un ticket Resuelto
 *   ya fue entregado (solo espera la conformidad del usuario); Cerrado y
 *   Cancelado no requieren trabajo.
 * - Esperando aprobación: solicitud pendiente de la decisión del jefe (o ya
 *   rechazada). Todavía no es trabajo de TI.
 * - Por asignar: en atención, sin técnico y sin esperar aprobación.
 * - SLA: en "En espera" el reloj está detenido, así que el tiempo en pausa se
 *   suma al límite. Un ticket resuelto ya tiene su SLA evaluado.
 */
export interface TicketParaReglas {
  id_estado?: number | null;
  estado_codigo?: string | null;
  es_terminal?: boolean | null;
  id_usuario_asignado?: number | null;
  estado_aprobacion?: string | null;
}

export interface TicketParaSla extends TicketParaReglas {
  fecha_limite_sla: string | Date;
  fecha_ultima_pausa?: string | Date | null;
  pausa_sla?: boolean | null;
  sla_cumplido?: boolean | null;
}

const ESTADOS_EN_ATENCION = new Set([1, 2, 3, 4]);
const CODIGOS_EN_ATENCION = new Set(["ABIERTO", "ASIGNADO", "EN_PROCESO", "EN_ESPERA"]);

export function ticketEnAtencion(t: TicketParaReglas): boolean {
  if (t.id_estado !== undefined && t.id_estado !== null) return ESTADOS_EN_ATENCION.has(Number(t.id_estado));
  if (t.estado_codigo) return CODIGOS_EN_ATENCION.has(t.estado_codigo);
  return t.es_terminal === false;
}

export function ticketEsperaAprobacion(t: TicketParaReglas): boolean {
  return t.estado_aprobacion === "PENDIENTE_APROBACION" || t.estado_aprobacion === "RECHAZADO";
}

export function ticketPorAsignar(t: TicketParaReglas): boolean {
  return ticketEnAtencion(t) && !t.id_usuario_asignado && !ticketEsperaAprobacion(t);
}

export function calcularSla(t: TicketParaSla, ahora: number = Date.now()) {
  const pausaMs =
    t.pausa_sla && t.fecha_ultima_pausa ? Math.max(0, ahora - new Date(t.fecha_ultima_pausa).getTime()) : 0;
  const limiteMs = new Date(t.fecha_limite_sla).getTime() + pausaMs;
  const minutosRestantes = Math.round((limiteMs - ahora) / 60000);

  let slaVencido: boolean;
  if (t.estado_codigo === "RESUELTO" || t.id_estado === 5) {
    slaVencido = t.sla_cumplido === false;
  } else {
    slaVencido = ticketEnAtencion(t) && !ticketEsperaAprobacion(t) && minutosRestantes < 0;
  }

  return { minutos_restantes_sla: minutosRestantes, sla_vencido: slaVencido };
}
