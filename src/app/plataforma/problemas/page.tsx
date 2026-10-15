import VistaProblemas from "@/modules/problemas/views/VistaProblemas";
import { exigirPerfilPagina } from "@/shared/lib/page-auth";

export default function PaginaProblemas() {
  const { idPerfil } = exigirPerfilPagina([1, 2, 4, 6, 7, 8, 9]);
  return <VistaProblemas puedeCrear={[2, 4].includes(idPerfil)} />;
}
