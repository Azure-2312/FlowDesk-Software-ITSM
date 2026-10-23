import VistaEvaluacionRfc from "@/modules/cambios/views/gestion/VistaEvaluacionRfc";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEvaluacionRfc() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_GESTIONAR);
  return <VistaEvaluacionRfc />;
}
