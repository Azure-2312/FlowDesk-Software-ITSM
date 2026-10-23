import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaIncidentes from "@/modules/incidentes/views/VistaIncidentes";

export default async function PaginaIncidentes() {
  await exigirMenuPagina("/plataforma/incidentes");
  return <VistaIncidentes />;
}
