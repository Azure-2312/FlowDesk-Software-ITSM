import VistaModelosGestion from "@/modules/cambios/views/gestion/VistaModelosGestion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaModelosGestion() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_CONFIG_VER);
  return <VistaModelosGestion />;
}
