import VistaInformesAuditoria from "@/modules/auditor/views/VistaInformesAuditoria";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaInformesAuditoria() {
  exigirCapacidadPagina(CAPACIDADES.REPORTES_VER);
  return <VistaInformesAuditoria />;
}
