import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosGestionCrear from "@/modules/cambios/gestion/crear/VistaCambiosGestionCrear";

export default async function PaginaCambiosNuevo() {
  await exigirMenuPagina("/plataforma/cambios/nuevo");
  return <VistaCambiosGestionCrear />;
}
