import VistaSod from "@/modules/seguridad/views/auditor/VistaSod";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaSod() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaSod />;
}
