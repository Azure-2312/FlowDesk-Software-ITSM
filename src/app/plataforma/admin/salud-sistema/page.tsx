import VistaSaludSistema from "@/modules/administracion/config/salud/VistaSaludSistema";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaSaludSistema() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_CONFIGURACION);
  return <VistaSaludSistema />;
}
