import VistaPanelArea from "@/modules/operacion/paneles/gestor-area/VistaPanelArea";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelArea() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaPanelArea />;
}
