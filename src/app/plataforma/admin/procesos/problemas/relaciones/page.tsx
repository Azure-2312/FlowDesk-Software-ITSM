import VistaRelacionesProblemas from "@/modules/problemas/config/relaciones/VistaRelacionesProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminProblemasRelaciones() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  return <VistaRelacionesProblemas />;
}
