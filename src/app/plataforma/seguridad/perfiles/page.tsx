import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaPerfiles from "@/modules/identidades/config/perfiles/VistaPerfiles";

export default function PaginaAdminPerfiles() {
  const { sesion } = exigirCapacidadPagina([
    CAPACIDADES.ADMIN_PERFILES,
    CAPACIDADES.AUDITORIA_VER,
  ]);
  const soloLectura = !sesionTieneCapacidad(sesion, CAPACIDADES.ADMIN_PERFILES);
  return <VistaPerfiles soloLectura={soloLectura} />;
}
