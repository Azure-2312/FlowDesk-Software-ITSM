import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaUsuarios from "@/modules/identidades/config/usuarios/VistaUsuarios";

export default function PaginaAdminUsuarios() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_USUARIOS);
  return <VistaUsuarios />;
}
