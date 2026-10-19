import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesActivos } from "@/modules/reportes/ui";

export default async function PaginaReportesActivos() {
  await exigirMenuPagina("/plataforma/reportes/activos");
  return <VistaReportesActivos />;
}
