import VistaRecursosEquipo from "@/modules/organizacion/views/supervisor/VistaRecursosEquipo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaOperacionRecursosEquipo() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaRecursosEquipo />;
}
