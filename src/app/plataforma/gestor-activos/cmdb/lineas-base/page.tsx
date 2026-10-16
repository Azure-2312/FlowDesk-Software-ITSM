import VistaCmdbLineasBase from "@/modules/activos/views/VistaCmdbLineasBase";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCmdbLineasBase() {
  exigirCapacidadPagina(CAPACIDADES.CMDB_GESTIONAR);
  return <VistaCmdbLineasBase />;
}
