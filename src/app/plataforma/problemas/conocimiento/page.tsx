import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaConocimientoProblemas from "@/modules/problemas/views/VistaConocimientoProblemas";

export default async function PaginaConocimientoProblemas() {
  await exigirMenuPagina("/plataforma/problemas/conocimiento");
  return <VistaConocimientoProblemas />;
}
