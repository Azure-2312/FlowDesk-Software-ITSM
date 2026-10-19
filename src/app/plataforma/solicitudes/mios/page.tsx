import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionMios from "@/modules/tickets/gestion/mios/VistaTicketsGestionMios";

export default async function PaginaSolicitudesMios() {
  await exigirMenuPagina("/plataforma/solicitudes/mios");
  return (
    <VistaTicketsGestionMios
      tipoFijo="2"
      titulo="Mis solicitudes"
      rutaDetalleBase="/plataforma/solicitudes"
      rutaCrear="/plataforma/solicitudes/crear"
    />
  );
}
