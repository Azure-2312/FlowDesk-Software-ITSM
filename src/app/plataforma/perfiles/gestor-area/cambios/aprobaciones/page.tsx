import VistaAprobacionesNegocio from "@/modules/solicitudes/views/gestor-area/VistaAprobacionesNegocio";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAprobacionesNegocio() {
  exigirCapacidadPagina(CAPACIDADES.SOLICITUDES_APROBAR);
  return <VistaAprobacionesNegocio />;
}
