import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemas from "@/modules/problemas/views/VistaProblemas";
import { CAPACIDADES, tieneCapacidad } from "@/shared/lib/capacidades";

export default async function PaginaProblemasHistorial() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/problemas/historial");
  return <VistaProblemas puedeCrear={tieneCapacidad(idPerfil, CAPACIDADES.PROBLEMAS_CREAR)} />;
}
