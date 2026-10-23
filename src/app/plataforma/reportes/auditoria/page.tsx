import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaInformesAuditoria } from "@/modules/reportes/ui";

export default async function PaginaReportesAuditoria() {
  await exigirMenuPagina("/plataforma/reportes/auditoria");
  return <VistaInformesAuditoria />;
}
