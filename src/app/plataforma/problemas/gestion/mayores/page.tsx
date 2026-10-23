import VistaMayoresProblemas from "@/modules/problemas/views/VistaMayoresProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaMayoresProblemas() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_GESTIONAR);
  return <VistaMayoresProblemas />;
}
