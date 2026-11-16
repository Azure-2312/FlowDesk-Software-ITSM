import VistaAusenciasEquipo from "@/modules/organizacion/views/VistaAusenciasEquipo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaOperacionAusenciasEquipo() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_TECNICOS);
  return <VistaAusenciasEquipo />;
}
