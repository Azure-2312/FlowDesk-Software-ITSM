import VistaCumplimientoLicencias from "@/modules/activos/views/VistaCumplimientoLicencias";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaCumplimientoLicencias() {
  exigirCapacidadPagina(CAPACIDADES.LICENCIAS_VER);
  return <VistaCumplimientoLicencias />;
}
