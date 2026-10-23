import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaSolicitudesResueltas() {
  await exigirMenuPagina("/plataforma/solicitudes/resueltos");
  return (
    <TablaTickets
      vista="resueltos"
      tipoInicial="2"
      tipoFijo="2"
      rutaDetalleBase="/plataforma/solicitudes"
      titulo="Solicitudes resueltas"
      descripcion="Historial de requerimientos atendidos o cerrados con validación del solicitante."
    />
  );
}
