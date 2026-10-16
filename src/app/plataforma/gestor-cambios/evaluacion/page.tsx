import VistaEvaluacionRfc from "@/modules/gestor-cambios/views/VistaEvaluacionRfc";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEvaluacionRfc() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaEvaluacionRfc />;
}
