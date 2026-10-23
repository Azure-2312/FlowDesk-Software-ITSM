import VistaBajasActivos from "@/modules/activos/views/VistaSupervisorBajasActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaBajasActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaBajasActivos />;
}
