import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaAsignacionProblemas from "@/modules/problemas/views/VistaAsignacionProblemas";

export default async function PaginaAsignacionProblemas() {
  await exigirMenuPagina("/plataforma/problemas/asignacion");
  return <VistaAsignacionProblemas />;
}
