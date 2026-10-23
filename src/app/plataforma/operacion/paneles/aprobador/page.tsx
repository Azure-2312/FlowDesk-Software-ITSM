import VistaPanelAprobador from "@/modules/operacion/paneles/aprobador/VistaPanelAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelAprobador() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaPanelAprobador />;
}
