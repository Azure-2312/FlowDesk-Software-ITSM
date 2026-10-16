import VistaSod from "@/modules/auditor/views/VistaSod";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaSod() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaSod />;
}
