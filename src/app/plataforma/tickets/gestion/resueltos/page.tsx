"use client";

import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default function PaginaTicketsResueltos() {
  return (
    <TablaTickets
      vista="resueltos"
      titulo="Tickets Resueltos y Cerrados"
      descripcion="Historial de incidentes y requerimientos con solución documentada o cerrados con validación del solicitante."
    />
  );
}

