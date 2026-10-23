import VistaCambiosProblemas from "@/modules/problemas/views/VistaCambiosProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaCambiosProblemas />;
}
