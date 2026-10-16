import VistaProgramacion from "@/modules/gestor-cambios/views/VistaProgramacion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProgramacionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaProgramacion />;
}
