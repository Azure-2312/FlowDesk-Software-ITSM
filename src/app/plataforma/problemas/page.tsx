import ProblemasWorkspace from "@/modules/problemas/components/ProblemasWorkspace";
import { exigirPerfilPagina } from "@/lib/page-auth";

export default function PaginaProblemas() {
  const { idPerfil } = exigirPerfilPagina([1, 2, 4, 6, 7, 8, 9]);
  return <ProblemasWorkspace puedeCrear={[2, 4].includes(idPerfil)} />;
}
