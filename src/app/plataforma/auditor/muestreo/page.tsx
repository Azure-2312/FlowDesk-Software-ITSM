import VistaMuestreo from "@/modules/perfiles/auditor/views/VistaMuestreo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaMuestreo() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaMuestreo />;
}
