import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemasCandidatos from "@/modules/problemas/views/VistaProblemasCandidatos";

export default async function PaginaProblemasCandidatos() {
  await exigirMenuPagina("/plataforma/problemas/candidatos");
  return <VistaProblemasCandidatos />;
}
