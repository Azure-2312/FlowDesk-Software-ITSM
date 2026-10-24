import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaDepartamentos from "@/modules/organizacion/config/departamentos/VistaDepartamentos";

export default function PaginaAdminDepartamentos() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_ORGANIZACION);
  return <VistaDepartamentos />;
}
