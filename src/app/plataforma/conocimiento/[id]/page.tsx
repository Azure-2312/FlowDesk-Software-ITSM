import VistaConocimientoDetalle from "@/modules/conocimiento/views/VistaConocimientoDetalle";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaConocimientoDetalle() {
  exigirCapacidadPagina(CAPACIDADES.CONOCIMIENTO_VER);
  return <VistaConocimientoDetalle />;
}
