import VistaBajasRenovaciones from "@/modules/activos/views/VistaBajasRenovaciones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaBajasRenovaciones() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaBajasRenovaciones />;
}
