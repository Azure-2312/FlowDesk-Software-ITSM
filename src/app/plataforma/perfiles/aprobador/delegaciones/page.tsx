import VistaDelegacionesAprobador from "@/modules/seguridad/views/aprobador/VistaDelegacionesAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaDelegacionesAprobador() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_APROBAR);
  return <VistaDelegacionesAprobador />;
}
