import VistaIncumplimientosSla from "@/modules/servicios/views/supervisor/VistaIncumplimientosSla";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaIncumplimientosSla() {
  exigirCapacidadPagina(CAPACIDADES.REPORTES_VER);
  return <VistaIncumplimientosSla />;
}
