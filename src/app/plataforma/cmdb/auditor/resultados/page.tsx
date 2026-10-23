import VistaCmdbResultados from "@/modules/cmdb/views/auditor/VistaCmdbResultados";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCmdbResultados() {
  exigirCapacidadPagina(CAPACIDADES.CMDB_VER);
  return <VistaCmdbResultados />;
}
