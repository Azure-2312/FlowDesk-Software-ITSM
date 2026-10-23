import VistaPir from "@/modules/cambios/views/gestion/VistaPir";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPir() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaPir />;
}
