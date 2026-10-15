import { queryRow } from "@/shared/lib/db";

/**
 * Resuelve el identificador del tipo de ticket a partir de su codigo
 * (por ejemplo "SOLICITUD" o "INCIDENTE"). Devuelve undefined si el tipo
 * no existe o esta inactivo.
 */
export async function obtenerIdTipoTicketPorCodigo(codigo: string): Promise<number | undefined> {
  const tipo = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = $1 AND estado_registro = true",
    [codigo]
  );
  return tipo?.id_tipo_ticket;
}

/**
 * Comprueba que un ticket existe y pertenece al tipo de ticket indicado.
 * Se usa para que las rutas de un modulo solo expongan sus propios tickets.
 */
export async function validarTipoTicket(
  idTicket: string | number,
  codigo: string
): Promise<boolean> {
  const tipo = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM tipo_ticket WHERE codigo = $1 AND estado_registro = true",
    [codigo]
  );
  const ticket = await queryRow<{ id_tipo_ticket: number }>(
    "SELECT id_tipo_ticket FROM ticket WHERE id_ticket = $1 AND estado_registro = true",
    [idTicket]
  );
  if (!tipo || !ticket) return false;
  return Number(tipo.id_tipo_ticket) === Number(ticket.id_tipo_ticket);
}
