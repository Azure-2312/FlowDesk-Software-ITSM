import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesOperativos } from "@/modules/reportes/ui";

export default async function PaginaReportesOperativos() {
  await exigirMenuPagina("/plataforma/reportes/operativos");
  return <VistaReportesOperativos />;
}
