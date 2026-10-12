"use client";

import TablaTickets from "@/components/TablaTickets";

export default function PaginaGestionTickets() {
  return (
    <TablaTickets
      vista="todos"
      titulo="Gestión Integral de Tickets"
      descripcion="Consola de operaciones de la Mesa de Servicio: filtrado avanzado, asignación de especialistas y seguimiento del ciclo de vida ITIL."
    />
  );
}
