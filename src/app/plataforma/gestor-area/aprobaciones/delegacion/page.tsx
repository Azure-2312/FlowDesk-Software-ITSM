import VistaDelegacionAprobaciones from "@/modules/gestor-area/views/VistaDelegacionAprobaciones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaDelegacionAprobaciones() {
  exigirCapacidadPagina(CAPACIDADES.SOLICITUDES_APROBAR);
  return <VistaDelegacionAprobaciones />;
}
