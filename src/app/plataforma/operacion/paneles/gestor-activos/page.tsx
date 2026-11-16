import VistaPanelActivos from "@/modules/activos/views/VistaPanelActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelGestorActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaPanelActivos />;
}
