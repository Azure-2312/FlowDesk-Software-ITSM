import VistaPanelSolicitante from "@/modules/operacion/paneles/solicitante/VistaPanelSolicitante";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelSolicitante() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaPanelSolicitante />;
}
