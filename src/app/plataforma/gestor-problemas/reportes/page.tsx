import VistaReportesProblemas from "@/modules/problemas/views/VistaReportesProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaReportesProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_VER);
  return <VistaReportesProblemas />;
}
