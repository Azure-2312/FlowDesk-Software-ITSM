import VistaHistorialDecisiones from "@/modules/solicitudes/views/VistaHistorialDecisiones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaHistorialDecisiones() {
  exigirCapacidadPagina(CAPACIDADES.SOLICITUDES_APROBAR);
  return <VistaHistorialDecisiones />;
}
