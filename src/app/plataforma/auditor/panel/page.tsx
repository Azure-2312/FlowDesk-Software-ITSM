import VistaPanelAuditoria from "@/modules/auditor/views/VistaPanelAuditoria";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelAuditoria() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaPanelAuditoria />;
}
