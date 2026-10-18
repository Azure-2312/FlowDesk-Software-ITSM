import VistaCmdbResultados from "@/modules/perfiles/auditor/views/VistaCmdbResultados";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCmdbResultados() {
  exigirCapacidadPagina(CAPACIDADES.CMDB_VER);
  return <VistaCmdbResultados />;
}
