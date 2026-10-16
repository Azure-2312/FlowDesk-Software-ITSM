import VistaPanelAprobador from "@/modules/aprobador/views/VistaPanelAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelAprobador() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaPanelAprobador />;
}
