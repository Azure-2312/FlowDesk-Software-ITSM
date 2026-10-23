import VistaFlujoProblemas from "@/modules/problemas/config/flujo/VistaFlujoProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminProblemasFlujo() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  return <VistaFlujoProblemas />;
}
