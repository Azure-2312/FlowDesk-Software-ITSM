import VistaEjecucion from "@/modules/perfiles/gestor-cambios/views/VistaEjecucion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEjecucionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaEjecucion />;
}
