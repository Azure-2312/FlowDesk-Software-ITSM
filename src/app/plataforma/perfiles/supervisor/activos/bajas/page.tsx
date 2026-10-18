import VistaBajasActivos from "@/modules/perfiles/supervisor/views/VistaBajasActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaBajasActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaBajasActivos />;
}
