"use client";

import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default function PaginaAuditoriaTickets() {
  return (
    <TablaTickets
      vista="auditoria"
      titulo="Auditoría Integral de Tickets"
      descripcion="Control normativo ISO/IEC 20000 e ISO 27001: Inspección de solo lectura de la cola completa de requerimientos, bitácoras de auditoría, trazabilidad temporal y cumplimiento de acuerdos de nivel de servicio (SLA)."
    />
  );
}

