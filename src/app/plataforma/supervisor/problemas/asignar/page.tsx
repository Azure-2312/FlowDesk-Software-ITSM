import VistaAsignacionProblemas from "@/modules/supervisor/views/VistaAsignacionProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAsignacionProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaAsignacionProblemas />;
}
