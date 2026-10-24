import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaReportesGerenciales from "@/modules/reportes/views/VistaReportesGerenciales";

export default async function PaginaReportesGerenciales() {
  await exigirMenuPagina("/plataforma/reportes/gerenciales");
  return <VistaReportesGerenciales />;
}
