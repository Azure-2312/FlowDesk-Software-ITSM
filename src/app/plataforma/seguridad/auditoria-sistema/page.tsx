import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaAuditoriaSistema from "@/modules/plataforma/config/auditoria-sistema/VistaAuditoriaSistema";

export default function PaginaAdminAuditoriaSistema() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaAuditoriaSistema />;
}
