import VistaEscalamientosSla from "@/modules/perfiles/supervisor/views/VistaEscalamientosSla";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEscalamientosSla() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaEscalamientosSla />;
}
