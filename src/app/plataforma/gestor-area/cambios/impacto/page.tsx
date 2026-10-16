import VistaCambiosImpactoArea from "@/modules/gestor-area/views/VistaCambiosImpactoArea";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosImpactoArea() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaCambiosImpactoArea />;
}
