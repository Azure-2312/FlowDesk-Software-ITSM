import VistaRenovaciones from "@/modules/activos/views/VistaRenovaciones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaRenovaciones() {
  exigirCapacidadPagina(CAPACIDADES.PROVEEDORES_GESTIONAR);
  return <VistaRenovaciones />;
}
