import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemasTodosEquipos from "@/modules/problemas/views/VistaProblemasTodosEquipos";

export default async function PaginaProblemasTodosEquipos() {
  await exigirMenuPagina("/plataforma/problemas/equipos");
  return <VistaProblemasTodosEquipos />;
}
