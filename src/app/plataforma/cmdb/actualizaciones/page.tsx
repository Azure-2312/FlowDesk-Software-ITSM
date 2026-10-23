import VistaCmdbActualizaciones from "@/modules/cmdb/views/VistaCmdbActualizaciones";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCmdbActualizaciones() {
  exigirCapacidadPagina(CAPACIDADES.CMDB_GESTIONAR);
  return <VistaCmdbActualizaciones />;
}
