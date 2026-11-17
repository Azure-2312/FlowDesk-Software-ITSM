import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaAprobacionesProblemas from "@/modules/problemas/views/VistaAprobacionesProblemas";

export default async function PaginaAprobacionesProblemas() {
  await exigirMenuPagina("/plataforma/problemas/aprobaciones");
  return <VistaAprobacionesProblemas />;
}
