import VistaConocimientoRevisiones from "@/modules/conocimiento/views/VistaConocimientoRevisiones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaConocimientoRevisionesSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.CONOCIMIENTO_GESTIONAR);
  return <VistaConocimientoRevisiones />;
}
