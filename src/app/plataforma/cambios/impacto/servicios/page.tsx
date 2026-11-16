import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosImpacto from "@/modules/cambios/views/VistaCambiosImpacto";

export default async function PaginaCambiosImpactoServicios() {
  await exigirMenuPagina("/plataforma/cambios/impacto/servicios");
  return <VistaCambiosImpacto />;
}
