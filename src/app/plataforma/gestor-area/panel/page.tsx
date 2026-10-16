import VistaPanelArea from "@/modules/gestor-area/views/VistaPanelArea";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelArea() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaPanelArea />;
}
