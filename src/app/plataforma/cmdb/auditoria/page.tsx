import VistaCmdbAuditoria from "@/modules/cmdb/views/VistaCmdbAuditoria";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCmdbAuditoria() {
  exigirCapacidadPagina(CAPACIDADES.CMDB_GESTIONAR);
  return <VistaCmdbAuditoria />;
}
