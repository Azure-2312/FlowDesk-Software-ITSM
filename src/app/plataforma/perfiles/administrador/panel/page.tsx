import VistaPanelAdministrador from "@/modules/perfiles/administrador/views/VistaPanelAdministrador";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaPanelAdministrador() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_USUARIOS);
  return <VistaPanelAdministrador />;
}
