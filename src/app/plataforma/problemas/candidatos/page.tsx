import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCandidatosProblemas from "@/modules/problemas/views/VistaCandidatosProblemas";

export default async function PaginaProblemasCandidatos() {
  await exigirMenuPagina("/plataforma/problemas/candidatos");
  return <VistaCandidatosProblemas />;
}
