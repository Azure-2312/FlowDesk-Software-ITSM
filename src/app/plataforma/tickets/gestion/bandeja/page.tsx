"use client";

import TablaTickets from "@/components/TablaTickets";

export default function PaginaBandejaTickets() {
  return (
    <TablaTickets
      vista="bandeja"
      titulo="Bandeja de Tickets Pendientes"
      descripcion="Tickets abiertos sin técnico asignado o listos para ser tomados y diagnosticados por los especialistas de soporte."
    />
  );
}
