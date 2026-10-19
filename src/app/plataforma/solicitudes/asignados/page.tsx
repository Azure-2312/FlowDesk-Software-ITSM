import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaSolicitudesAsignadas() {
  await exigirMenuPagina("/plataforma/solicitudes/asignados");
  return (
    <TablaTickets
      vista="asignados"
      tipoInicial="2"
      tipoFijo="2"
      rutaDetalleBase="/plataforma/solicitudes"
      titulo="Solicitudes asignadas a mí"
      descripcion="Requerimientos de servicio bajo tu responsabilidad técnica directa."
    />
  );
}
