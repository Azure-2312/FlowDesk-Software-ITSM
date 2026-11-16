import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosGestionTodos from "@/modules/cambios/gestion/todos/VistaCambiosGestionTodos";

export default async function PaginaCambiosGestionTodos() {
  await exigirMenuPagina("/plataforma/cambios/gestion/todos");
  return <VistaCambiosGestionTodos />;
}
