import VistaIncidentesMayores from "@/modules/incidentes/views/VistaIncidentesMayores";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaIncidentesMayores() {
  exigirCapacidadPagina(CAPACIDADES.INCIDENTES_GESTIONAR);
  return <VistaIncidentesMayores />;
}
