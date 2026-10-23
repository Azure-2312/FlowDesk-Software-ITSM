import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaProductividad } from "@/modules/reportes/ui";

export default async function PaginaReportesProductividad() {
  await exigirMenuPagina("/plataforma/reportes/productividad");
  return <VistaProductividad />;
}
