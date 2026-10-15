"use client";

import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default function PaginaTodosLosTickets() {
  return (
    <TablaTickets
      vista="todos"
      titulo="Todos los Tickets del Sistema"
      descripcion="Consola centralizada de la Mesa de Servicio (Service Desk). Visión global de todas las incidencias y solicitudes de servicio en curso y cerradas."
    />
  );
}

