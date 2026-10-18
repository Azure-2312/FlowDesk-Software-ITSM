import VistaReportesAprobador from "@/modules/perfiles/aprobador/views/VistaReportesAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaReportesAprobador() {
  exigirCapacidadPagina(CAPACIDADES.REPORTES_VER);
  return <VistaReportesAprobador />;
}
