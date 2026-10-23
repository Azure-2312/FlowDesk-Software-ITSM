import VistaBajasActivos from "@/modules/activos/views/VistaBajasActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaBajasActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_GESTIONAR);
  return <VistaBajasActivos />;
}
