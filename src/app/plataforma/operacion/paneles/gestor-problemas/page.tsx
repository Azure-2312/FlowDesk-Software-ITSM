import VistaPanelGestorProblemas from "@/modules/problemas/views/VistaPanelGestorProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelGestorProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_VER);
  return <VistaPanelGestorProblemas />;
}
