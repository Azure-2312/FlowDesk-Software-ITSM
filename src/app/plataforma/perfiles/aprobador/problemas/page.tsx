import VistaProblemasMayores from "@/modules/problemas/views/aprobador/VistaProblemasMayores";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProblemasMayores() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_VER);
  return <VistaProblemasMayores />;
}
