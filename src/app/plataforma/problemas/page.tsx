import VistaProblemas from "@/modules/problemas/views/VistaProblemas";
import { CAPACIDADES, tieneCapacidad } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProblemas() {
  const { idPerfil } = exigirCapacidadPagina(CAPACIDADES.PROBLEMAS_VER);
  return <VistaProblemas puedeCrear={tieneCapacidad(idPerfil, CAPACIDADES.PROBLEMAS_CREAR)} />;
}
