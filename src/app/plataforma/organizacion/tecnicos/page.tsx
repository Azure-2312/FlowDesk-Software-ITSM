import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaTecnicos from "@/modules/organizacion/config/tecnicos/VistaTecnicos";

export default function PaginaAdminTecnicos() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_ORGANIZACION);
  return <VistaTecnicos />;
}
