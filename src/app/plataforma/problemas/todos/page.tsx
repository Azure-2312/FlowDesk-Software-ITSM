import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTodosProblemas from "@/modules/problemas/views/VistaTodosProblemas";

export default async function PaginaTodosProblemas() {
  await exigirMenuPagina("/plataforma/problemas/todos");
  return <VistaTodosProblemas />;
}
