import VistaPanelGestion from "@/modules/perfiles/gestor-cambios/views/VistaPanelGestion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelGestionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaPanelGestion />;
}
