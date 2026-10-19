import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaIncidentesResueltos() {
  await exigirMenuPagina("/plataforma/incidentes/resueltos");
  return (
    <TablaTickets
      vista="resueltos"
      tipoInicial="1"
      tipoFijo="1"
      rutaDetalleBase="/plataforma/incidentes"
      titulo="Incidentes resueltos"
      descripcion="Historial de incidentes con solución documentada o cerrados con validación del solicitante."
    />
  );
}
