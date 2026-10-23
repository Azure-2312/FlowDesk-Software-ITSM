import VistaObjetivosProblemas from "@/modules/problemas/views/VistaObjetivosProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaObjetivosProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  return <VistaObjetivosProblemas />;
}
