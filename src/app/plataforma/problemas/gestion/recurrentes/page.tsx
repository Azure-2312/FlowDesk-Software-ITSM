import VistaRecurrentesProblemas from "@/modules/problemas/views/VistaRecurrentesProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaRecurrentesProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaRecurrentesProblemas />;
}
