import VistaTecnicoCambiosImpacto from "@/modules/cambios/views/tecnico/VistaTecnicoCambiosImpacto";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosImpactoSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaTecnicoCambiosImpacto />;
}
