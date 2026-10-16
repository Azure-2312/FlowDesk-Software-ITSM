import VistaProblemaDetalle from "@/modules/problemas/views/VistaProblemaDetalle";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProblemaDetalle() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_VER);
  return <VistaProblemaDetalle />;
}
