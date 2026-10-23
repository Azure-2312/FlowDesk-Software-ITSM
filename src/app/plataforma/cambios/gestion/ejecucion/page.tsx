import VistaEjecucion from "@/modules/cambios/views/gestion/VistaEjecucion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEjecucionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaEjecucion />;
}
