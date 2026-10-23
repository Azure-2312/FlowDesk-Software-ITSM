import VistaCatalogoSoftware from "@/modules/activos/views/VistaCatalogoSoftware";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCatalogoSoftware() {
  exigirCapacidadPagina(CAPACIDADES.LICENCIAS_GESTIONAR);
  return <VistaCatalogoSoftware />;
}
