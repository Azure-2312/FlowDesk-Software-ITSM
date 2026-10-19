import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { VistaReportesCambios } from "@/modules/reportes/ui";

export default async function PaginaReportesCambios() {
  await exigirMenuPagina("/plataforma/reportes/cambios");
  return <VistaReportesCambios />;
}
