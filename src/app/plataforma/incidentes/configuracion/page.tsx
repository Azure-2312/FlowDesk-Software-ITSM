import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsFormularios from "@/modules/tickets/config/formulario/VistaTicketsFormularios";

export default async function PaginaIncidentesConfiguracion() {
  await exigirMenuPagina("/plataforma/incidentes/configuracion");
  return <VistaTicketsFormularios tipoFijo="incidente" />;
}
