import VistaConocimientoProblemas from "@/modules/problemas/views/VistaConocimientoProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaConocimientoProblemas() {
  exigirCapacidadPagina(CAPACIDADES.CONOCIMIENTO_VER);
  return <VistaConocimientoProblemas />;
}
