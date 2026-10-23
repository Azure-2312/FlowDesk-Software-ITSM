import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaPerfiles from "@/modules/identidades/config/perfiles/VistaPerfiles";

export default function PaginaAdminPerfiles() {
  exigirCapacidadPagina(CAPACIDADES.ADMIN_PERFILES);
  return <VistaPerfiles />;
}
