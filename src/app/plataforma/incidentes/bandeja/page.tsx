import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaIncidentesBandeja() {
  await exigirMenuPagina("/plataforma/incidentes/bandeja");
  return (
    <TablaTickets
      vista="bandeja"
      tipoInicial="1"
      tipoFijo="1"
      rutaDetalleBase="/plataforma/incidentes"
      titulo="Bandeja de incidentes"
      descripcion="Incidentes abiertos sin técnico asignado o listos para ser diagnosticados por soporte."
    />
  );
}
