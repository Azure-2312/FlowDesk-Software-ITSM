import VistaRecepcionActivos from "@/modules/activos/views/VistaRecepcionActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaRecepcionActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_GESTIONAR);
  return <VistaRecepcionActivos />;
}
