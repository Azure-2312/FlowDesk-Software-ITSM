import VistaFormularioProblemas from "@/modules/problemas/config/formulario/VistaFormularioProblemas";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminProblemasFormulario() {
  exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  return <VistaFormularioProblemas />;
}
