import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaDepartamentosEmpresa from "@/modules/organizacion/config/departamentos-empresa/VistaDepartamentosEmpresa";

export default async function PaginaAdminDepartamentosEmpresa() {
  await exigirMenuPagina("/plataforma/organizacion/departamentos-empresa");
  return <VistaDepartamentosEmpresa />;
}
