import VistaPanelAuditoria from "@/modules/operacion/paneles/auditor/VistaPanelAuditoria";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelAuditoria() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaPanelAuditoria />;
}
