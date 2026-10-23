import VistaCambiosIrregulares from "@/modules/cambios/views/auditor/VistaCambiosIrregulares";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCambiosIrregulares() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaCambiosIrregulares />;
}
