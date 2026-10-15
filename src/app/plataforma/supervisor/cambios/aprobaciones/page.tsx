import VistaAprobacionesTecnicas from "@/modules/supervisor/views/VistaAprobacionesTecnicas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAprobacionesTecnicas() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaAprobacionesTecnicas />;
}
