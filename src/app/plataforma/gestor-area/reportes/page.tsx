import VistaReportesArea from "@/modules/gestor-area/views/VistaReportesArea";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaReportesArea() {
  exigirCapacidadPagina(CAPACIDADES.REPORTES_VER);
  return <VistaReportesArea />;
}
