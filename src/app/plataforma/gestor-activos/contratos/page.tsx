import VistaContratos from "@/modules/activos/views/VistaContratos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaContratos() {
  exigirCapacidadPagina(CAPACIDADES.PROVEEDORES_GESTIONAR);
  return <VistaContratos />;
}
