import VistaMuestreo from "@/modules/seguridad/views/auditor/VistaMuestreo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaMuestreo() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaMuestreo />;
}
