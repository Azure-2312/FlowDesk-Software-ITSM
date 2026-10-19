import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaSolicitudesDepartamento() {
  await exigirMenuPagina("/plataforma/solicitudes/departamento");
  return (
    <TablaTickets
      vista="departamento"
      tipoInicial="2"
      tipoFijo="2"
      rutaDetalleBase="/plataforma/solicitudes"
      titulo="Solicitudes de mi departamento"
      descripcion="Requerimientos de los colaboradores de tu unidad y su cumplimiento de SLA."
    />
  );
}
