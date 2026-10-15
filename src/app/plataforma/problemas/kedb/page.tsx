import VistaKedb from "@/modules/problemas/views/VistaKedb";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaKedb() {
  exigirCapacidadPagina(CAPACIDADES.KEDB_VER);
  return <VistaKedb />;
}
