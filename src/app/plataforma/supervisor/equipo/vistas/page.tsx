import VistaRecursosEquipo from "@/modules/supervisor/views/VistaRecursosEquipo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaRecursosEquipo() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaRecursosEquipo />;
}
