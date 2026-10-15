import VistaAusenciasEquipo from "@/modules/supervisor/views/VistaAusenciasEquipo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAusenciasEquipo() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_TECNICOS);
  return <VistaAusenciasEquipo />;
}
