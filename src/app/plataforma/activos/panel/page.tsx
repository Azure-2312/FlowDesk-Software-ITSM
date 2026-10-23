import VistaPanelGestorActivos from "@/modules/activos/views/VistaPanelGestorActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelGestorActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaPanelGestorActivos />;
}
