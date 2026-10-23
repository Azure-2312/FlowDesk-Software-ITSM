import VistaCabEmergencia from "@/modules/cambios/views/aprobador/VistaCabEmergencia";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCabEmergencia() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_APROBAR);
  return <VistaCabEmergencia />;
}
