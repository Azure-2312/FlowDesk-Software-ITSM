import VistaCambiosGestionDetalle from "@/modules/cambios/gestion/[id]/VistaCambiosGestionDetalle";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosDetalle() {
  exigirCapacidadPagina([
    CAPACIDADES.CAMBIOS_GESTIONAR,
    CAPACIDADES.CAMBIOS_APROBAR,
    CAPACIDADES.SOLICITUDES_APROBAR,
  ]);
  return <VistaCambiosGestionDetalle />;
}
