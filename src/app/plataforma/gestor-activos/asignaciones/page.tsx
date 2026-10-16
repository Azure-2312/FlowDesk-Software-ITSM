import VistaAsignacionesActivos from "@/modules/activos/views/VistaAsignacionesActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAsignacionesActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_GESTIONAR);
  return <VistaAsignacionesActivos />;
}
