import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosTodosEquipos from "@/modules/cambios/views/VistaCambiosTodosEquipos";

export default async function PaginaCambiosTodosEquipos() {
  await exigirMenuPagina("/plataforma/cambios/equipos");
  return <VistaCambiosTodosEquipos />;
}
