import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaConfigTurnosAusencias from "@/modules/organizacion/config/turnos-ausencias/VistaConfigTurnosAusencias";

export default function PaginaConfigTurnosAusencias() {
  exigirCapacidadPagina([CAPACIDADES.ADMIN_ORGANIZACION, CAPACIDADES.ADMIN_TECNICOS]);
  return <VistaConfigTurnosAusencias />;
}
