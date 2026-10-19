import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaSolicitudesBandeja() {
  await exigirMenuPagina("/plataforma/solicitudes/bandeja");
  return (
    <TablaTickets
      vista="bandeja"
      tipoInicial="2"
      tipoFijo="2"
      rutaDetalleBase="/plataforma/solicitudes"
      titulo="Bandeja de solicitudes"
      descripcion="Requerimientos de servicio pendientes de atención o asignación."
    />
  );
}
