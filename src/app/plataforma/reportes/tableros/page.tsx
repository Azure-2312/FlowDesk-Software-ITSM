import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesDisenador } from "@/modules/reportes/ui";

export default async function PaginaReportesTableros() {
  await exigirMenuPagina("/plataforma/reportes/tableros");
  return <VistaReportesDisenador />;
}
