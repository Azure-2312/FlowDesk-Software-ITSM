import VistaAutorizaciones from "@/modules/gestor-cambios/views/VistaAutorizaciones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAutorizaciones() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaAutorizaciones />;
}
