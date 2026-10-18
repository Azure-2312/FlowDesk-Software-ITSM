import VistaEvaluacionRfc from "@/modules/perfiles/gestor-cambios/views/VistaEvaluacionRfc";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEvaluacionRfc() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaEvaluacionRfc />;
}
