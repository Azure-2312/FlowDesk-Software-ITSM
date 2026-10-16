import VistaHistorialDecisiones from "@/modules/gestor-area/views/VistaHistorialDecisiones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaHistorialDecisiones() {
  exigirCapacidadPagina(CAPACIDADES.SOLICITUDES_APROBAR);
  return <VistaHistorialDecisiones />;
}
