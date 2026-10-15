import VistaKedb from "@/modules/problemas/views/VistaKedb";
import { exigirPerfilPagina } from "@/shared/lib/page-auth";

export default function PaginaKedb() {
  exigirPerfilPagina([1, 2, 4, 6, 7, 8, 9]);
  return <VistaKedb />;
}
