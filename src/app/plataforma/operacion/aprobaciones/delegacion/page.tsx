import VistaDelegacionAprobaciones from "@/modules/solicitudes/views/gestor-area/VistaDelegacionAprobaciones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaOperacionDelegacionAprobaciones() {
  exigirCapacidadPagina(CAPACIDADES.SOLICITUDES_APROBAR);
  return <VistaDelegacionAprobaciones />;
}
