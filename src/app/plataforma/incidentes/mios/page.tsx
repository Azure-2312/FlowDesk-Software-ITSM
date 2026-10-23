import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionMios from "@/modules/tickets/gestion/mios/VistaTicketsGestionMios";

export default async function PaginaIncidentesMios() {
  await exigirMenuPagina("/plataforma/incidentes/mios");
  return (
    <VistaTicketsGestionMios
      tipoFijo="1"
      titulo="Mis incidentes"
      rutaDetalleBase="/plataforma/incidentes"
      rutaCrear="/plataforma/incidentes/crear"
    />
  );
}
