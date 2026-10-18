import VistaConflictos from "@/modules/perfiles/gestor-cambios/views/VistaConflictos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaConflictosCapacidad() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaConflictos />;
}
