import VistaProgramacionCambios from "@/modules/cambios/views/supervisor/VistaProgramacionCambios";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProgramacionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaProgramacionCambios />;
}
