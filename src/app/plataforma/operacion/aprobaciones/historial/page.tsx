import VistaHistorialAprobador from "@/modules/seguridad/views/aprobador/VistaHistorialAprobador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaOperacionHistorialAprobador() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaHistorialAprobador />;
}
