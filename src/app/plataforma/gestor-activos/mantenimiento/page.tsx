import VistaMantenimientoActivos from "@/modules/activos/views/VistaMantenimientoActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaMantenimientoActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_GESTIONAR);
  return <VistaMantenimientoActivos />;
}
