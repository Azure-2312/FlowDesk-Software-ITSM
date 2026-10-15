"use client";

import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default function PaginaTicketsDepartamento() {
  return (
    <TablaTickets
      vista="departamento"
      titulo="Tickets de mi Departamento"
      descripcion="Supervisión gerencial del servicio: Monitorea el estado, avance y cumplimiento de acuerdos de nivel de servicio (SLA) de todos los colaboradores de tu área."
    />
  );
}

