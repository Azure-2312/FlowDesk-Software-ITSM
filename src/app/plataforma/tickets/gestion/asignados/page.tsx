"use client";

import TablaTickets from "@/components/TablaTickets";

export default function PaginaTicketsAsignados() {
  return (
    <TablaTickets
      vista="asignados"
      titulo="Tickets Asignados a Mí"
      descripcion="Incidencias y solicitudes bajo tu responsabilidad técnica directa. Monitorea el reloj de SLA y documenta tus avances."
    />
  );
}
