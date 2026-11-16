import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesAprobaciones } from "@/modules/reportes/ui";

export default async function PaginaReportesDecisiones() {
  await exigirMenuPagina("/plataforma/reportes/decisiones");
  return <VistaReportesAprobaciones />;
}
