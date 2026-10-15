import VistaConocimientoBase from "@/modules/conocimiento/views/VistaConocimientoBase";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaConocimiento() {
  exigirCapacidadPagina(CAPACIDADES.CONOCIMIENTO_VER);
  return <VistaConocimientoBase />;
}
