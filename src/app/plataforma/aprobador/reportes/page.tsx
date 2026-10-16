import VistaReportesAprobador from "@/modules/aprobador/views/VistaReportesAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaReportesAprobador() {
  exigirCapacidadPagina(CAPACIDADES.REPORTES_VER);
  return <VistaReportesAprobador />;
}
