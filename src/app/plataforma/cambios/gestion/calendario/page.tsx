import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosGestionCalendario from "@/modules/cambios/gestion/calendario/VistaCambiosGestionCalendario";

export default async function PaginaCambiosGestionCalendario() {
  await exigirMenuPagina("/plataforma/cambios/gestion/calendario");
  return <VistaCambiosGestionCalendario />;
}
