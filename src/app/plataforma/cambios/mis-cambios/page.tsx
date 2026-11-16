import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosMisCambios from "@/modules/cambios/views/VistaCambiosMisCambios";

export default async function PaginaCambiosMisCambios() {
  await exigirMenuPagina("/plataforma/cambios/mis-cambios");
  return <VistaCambiosMisCambios />;
}
