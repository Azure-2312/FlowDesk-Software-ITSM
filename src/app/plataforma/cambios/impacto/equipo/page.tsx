import VistaCambiosImpacto from "@/modules/cambios/views/VistaCambiosImpacto";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosImpactoSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaCambiosImpacto />;
}
