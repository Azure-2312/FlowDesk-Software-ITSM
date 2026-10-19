import { exigirMenuPagina } from "@/shared/lib/page-auth";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

export default async function PaginaIncidentesDepartamento() {
  await exigirMenuPagina("/plataforma/incidentes/departamento");
  return (
    <TablaTickets
      vista="departamento"
      tipoInicial="1"
      tipoFijo="1"
      rutaDetalleBase="/plataforma/incidentes"
      titulo="Incidentes de mi departamento"
      descripcion="Incidentes que afectan a los colaboradores de tu unidad y su cumplimiento de SLA."
    />
  );
}
