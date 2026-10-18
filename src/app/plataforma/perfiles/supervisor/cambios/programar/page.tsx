import VistaProgramacionCambios from "@/modules/perfiles/supervisor/views/VistaProgramacionCambios";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProgramacionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaProgramacionCambios />;
}
