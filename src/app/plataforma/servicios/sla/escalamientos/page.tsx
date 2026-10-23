import VistaEscalamientosSla from "@/modules/servicios/views/supervisor/VistaEscalamientosSla";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEscalamientosSla() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaEscalamientosSla />;
}
