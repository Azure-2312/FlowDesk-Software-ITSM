import VistaPanelGestion from "@/modules/operacion/paneles/gestor-cambios/VistaPanelGestion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelGestionCambios() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaPanelGestion />;
}
