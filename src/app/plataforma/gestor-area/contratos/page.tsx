import VistaContratosArea from "@/modules/perfiles/gestor-area/views/VistaContratosArea";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaContratosArea() {
  exigirCapacidadPagina(CAPACIDADES.LICENCIAS_VER);
  return <VistaContratosArea />;
}
