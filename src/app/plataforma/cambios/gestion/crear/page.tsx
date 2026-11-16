import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosGestionCrear from "@/modules/cambios/gestion/crear/VistaCambiosGestionCrear";

export default async function PaginaCambiosGestionCrear() {
  await exigirMenuPagina("/plataforma/cambios/gestion/crear");
  return <VistaCambiosGestionCrear />;
}
