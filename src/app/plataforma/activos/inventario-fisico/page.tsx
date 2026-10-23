import VistaInventarioFisico from "@/modules/activos/views/VistaInventarioFisico";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaInventarioFisico() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_GESTIONAR);
  return <VistaInventarioFisico />;
}
