import VistaPir from "@/modules/perfiles/gestor-cambios/views/VistaPir";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPir() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaPir />;
}
