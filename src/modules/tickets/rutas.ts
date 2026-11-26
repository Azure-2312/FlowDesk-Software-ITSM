// Ruta única al detalle de un incidente o solicitud. Reemplaza a la antigua
// ventana emergente (ModalDetalleTicket): todo el sistema abre la misma ficha.
export function rutaDetalleTicket(ticket: {
  id_ticket: number;
  id_tipo_ticket?: number | null;
  tipo_codigo?: string | null;
}): string {
  const tipo =
    Number(ticket.id_tipo_ticket) ||
    (ticket.tipo_codigo === "INCIDENTE" ? 1 : ticket.tipo_codigo === "SOLICITUD" ? 2 : 0);
  if (tipo === 1) return `/plataforma/incidentes/${ticket.id_ticket}`;
  if (tipo === 2) return `/plataforma/solicitudes/${ticket.id_ticket}`;
  return `/plataforma/tickets/${ticket.id_ticket}`;
}
