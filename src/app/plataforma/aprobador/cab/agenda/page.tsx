import VistaCabAgenda from "@/modules/aprobador/views/VistaCabAgenda";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCabAgenda() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaCabAgenda />;
}
