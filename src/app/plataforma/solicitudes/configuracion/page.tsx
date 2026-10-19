import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsFormularios from "@/modules/configuracion/config/tickets-formularios/VistaTicketsFormularios";

export default async function PaginaSolicitudesConfiguracion() {
  await exigirMenuPagina("/plataforma/solicitudes/configuracion");
  return <VistaTicketsFormularios tipoFijo="solicitud" />;
}
