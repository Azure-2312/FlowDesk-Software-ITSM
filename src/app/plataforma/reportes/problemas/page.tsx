import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesProblemas } from "@/modules/reportes/ui";

export default async function PaginaReportesProblemas() {
  await exigirMenuPagina("/plataforma/reportes/problemas");
  return <VistaReportesProblemas />;
}
