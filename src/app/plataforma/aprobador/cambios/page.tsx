import VistaAprobacionesCambios from "@/modules/perfiles/aprobador/views/VistaAprobacionesCambios";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAprobacionesCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_APROBAR);
  return <VistaAprobacionesCambios />;
}
