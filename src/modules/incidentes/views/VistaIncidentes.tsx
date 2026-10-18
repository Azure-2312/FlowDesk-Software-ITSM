"use client";

import { TablaTickets } from "@/modules/tickets/ui";

export default function VistaIncidentes() {
  return (
    <TablaTickets
      vista="todos"
      tipoInicial="1"
      tipoFijo="1"
      titulo="Incidentes"
      descripcion="Registra y gestiona interrupciones o degradaciones no planificadas de los servicios de TI."
    />
  );
}
