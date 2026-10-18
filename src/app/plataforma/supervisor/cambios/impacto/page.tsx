import VistaTecnicoCambiosImpacto from "@/modules/perfiles/tecnico/cambios/impacto/VistaTecnicoCambiosImpacto";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosImpactoSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaTecnicoCambiosImpacto />;
}
