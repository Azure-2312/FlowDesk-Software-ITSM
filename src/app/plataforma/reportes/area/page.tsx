import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesArea } from "@/modules/reportes/ui";

export default async function PaginaReportesArea() {
  await exigirMenuPagina("/plataforma/reportes/area");
  return <VistaReportesArea />;
}
