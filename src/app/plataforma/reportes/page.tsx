import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesDisenador } from "@/modules/reportes/ui";

export default async function PaginaReportesRoot() {
  await exigirMenuPagina("/plataforma/reportes", { prefijo: true });
  return <VistaReportesDisenador />;
}
