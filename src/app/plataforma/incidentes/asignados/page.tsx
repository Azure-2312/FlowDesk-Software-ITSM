import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaIncidentesAsignados() {
  await exigirMenuPagina("/plataforma/incidentes/asignados");
  return (
    <TablaTickets
      vista="asignados"
      tipoInicial="1"
      tipoFijo="1"
      rutaDetalleBase="/plataforma/incidentes"
      titulo="Incidentes asignados a mí"
      descripcion="Interrupciones bajo tu responsabilidad técnica directa. Monitorea el SLA y documenta tus avances."
    />
  );
}
