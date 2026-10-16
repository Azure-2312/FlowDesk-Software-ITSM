import VistaCmdbInexactitudes from "@/modules/activos/views/VistaCmdbInexactitudes";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCmdbInexactitudes() {
  exigirCapacidadPagina(CAPACIDADES.CMDB_GESTIONAR);
  return <VistaCmdbInexactitudes />;
}
