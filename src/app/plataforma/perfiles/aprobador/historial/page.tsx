import VistaHistorialAprobador from "@/modules/perfiles/aprobador/views/VistaHistorialAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaHistorialAprobador() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaHistorialAprobador />;
}
