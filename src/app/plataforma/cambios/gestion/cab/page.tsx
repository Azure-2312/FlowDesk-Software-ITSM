import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosGestionCab from "@/modules/cambios/gestion/cab/VistaCambiosGestionCab";

export default async function PaginaCambiosGestionCab() {
  await exigirMenuPagina("/plataforma/cambios/gestion/cab");
  return <VistaCambiosGestionCab />;
}
