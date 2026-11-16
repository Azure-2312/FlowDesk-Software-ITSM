import VistaPanelProblemas from "@/modules/problemas/views/VistaPanelProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProblemasDashboard() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaPanelProblemas />;
}
