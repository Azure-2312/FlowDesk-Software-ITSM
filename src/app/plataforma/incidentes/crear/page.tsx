import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionCrear from "@/modules/tickets/gestion/crear/VistaTicketsGestionCrear";

export default async function PaginaIncidentesCrear() {
  await exigirMenuPagina("/plataforma/incidentes/crear");
  return (
    <VistaTicketsGestionCrear
      tipoFijo={1}
      rutaDetalleBase="/plataforma/incidentes"
      rutaLista="/plataforma/incidentes/mios"
    />
  );
}
