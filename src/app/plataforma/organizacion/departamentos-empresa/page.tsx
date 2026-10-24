import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaDepartamentosEmpresa from "@/modules/organizacion/config/departamentos-empresa/VistaDepartamentosEmpresa";

export default function PaginaAdminDepartamentosEmpresa() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_ORGANIZACION);
  return <VistaDepartamentosEmpresa />;
}
