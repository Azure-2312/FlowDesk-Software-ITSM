import VistaPanelSolicitante from "@/modules/perfiles/solicitante/views/VistaPanelSolicitante";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelSolicitante() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaPanelSolicitante />;
}
