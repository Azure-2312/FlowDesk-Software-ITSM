import VistaAprobacionesCambios from "@/modules/cambios/views/aprobador/VistaAprobacionesCambios";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAprobacionesCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_APROBAR);
  return <VistaAprobacionesCambios />;
}
