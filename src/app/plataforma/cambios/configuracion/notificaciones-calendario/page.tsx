import { VistaNotificacionesCalendario } from "@/modules/cambios/ui";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaAdminCambiosNotificacionesCalendario() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_CONFIG_VER);
  return <VistaNotificacionesCalendario />;
}
