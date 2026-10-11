import ProblemasWorkspace from "@/components/itsm/ProblemasWorkspace";
import { exigirPerfilPagina } from "@/lib/page-auth";

export default function PaginaKedb() {
  exigirPerfilPagina([1, 2, 4, 6, 7, 8, 9]);
  return <ProblemasWorkspace puedeCrear={false} soloKedb />;
}
