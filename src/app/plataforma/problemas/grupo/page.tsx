import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemasGrupo from "@/modules/problemas/views/VistaProblemasGrupo";

export default async function PaginaProblemasGrupo() {
  await exigirMenuPagina("/plataforma/problemas/grupo");
  return <VistaProblemasGrupo />;
}
