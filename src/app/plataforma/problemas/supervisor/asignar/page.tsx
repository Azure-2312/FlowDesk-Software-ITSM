import VistaAsignacionProblemas from "@/modules/problemas/views/supervisor/VistaAsignacionProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAsignacionProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaAsignacionProblemas />;
}
