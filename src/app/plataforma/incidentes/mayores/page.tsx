import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaIncidentesMayores from "@/modules/incidentes/views/VistaIncidentesMayores";

export default async function PaginaIncidentesMayores() {
  await exigirMenuPagina("/plataforma/incidentes/mayores");
  return <VistaIncidentesMayores />;
}
