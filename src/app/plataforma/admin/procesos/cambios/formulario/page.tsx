import { VistaFormularioCambio } from "@/modules/cambios/ui";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminCambiosFormulario() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_CONFIG_VER);
  return <VistaFormularioCambio />;
}
