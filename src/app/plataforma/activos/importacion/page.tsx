import VistaImportacionActivos from "@/modules/activos/views/VistaImportacionActivos";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaImportacionActivos() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_GESTIONAR);
  return <VistaImportacionActivos />;
}
