import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionCrear from "@/modules/tickets/gestion/crear/VistaTicketsGestionCrear";

export default async function PaginaSolicitudesCrear() {
  await exigirMenuPagina("/plataforma/solicitudes/crear");
  return (
    <VistaTicketsGestionCrear
      tipoFijo={2}
      rutaDetalleBase="/plataforma/solicitudes"
      rutaLista="/plataforma/solicitudes/mios"
    />
  );
}
