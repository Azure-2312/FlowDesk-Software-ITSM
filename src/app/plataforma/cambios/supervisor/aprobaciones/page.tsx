import VistaAprobacionesTecnicas from "@/modules/cambios/views/supervisor/VistaAprobacionesTecnicas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAprobacionesTecnicas() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaAprobacionesTecnicas />;
}
