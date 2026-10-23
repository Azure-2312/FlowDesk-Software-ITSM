import VistaCabAgendaGestion from "@/modules/cambios/views/gestion/VistaCabAgendaGestion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCabAgendaGestion() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaCabAgendaGestion />;
}
