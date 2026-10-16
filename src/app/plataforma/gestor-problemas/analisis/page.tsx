import VistaAnalisisProblemas from "@/modules/problemas/views/VistaAnalisisProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAnalisisProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaAnalisisProblemas />;
}
