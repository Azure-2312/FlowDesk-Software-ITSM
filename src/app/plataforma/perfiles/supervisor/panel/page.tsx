import VistaPanelSupervisor from "@/modules/operacion/paneles/supervisor/VistaPanelSupervisor";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaPanelSupervisor />;
}
