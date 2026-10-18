import VistaProductividad from "@/modules/perfiles/supervisor/views/VistaProductividad";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProductividad() {
  exigirCapacidadPagina(CAPACIDADES.REPORTES_VER);
  return <VistaProductividad />;
}
