import VistaReportesCambios from "@/modules/gestor-cambios/views/VistaReportesCambios";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaReportesCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaReportesCambios />;
}
