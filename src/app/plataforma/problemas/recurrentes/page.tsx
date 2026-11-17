import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaRecurrentesProblemas from "@/modules/problemas/views/VistaRecurrentesProblemas";

export default async function PaginaRecurrentesProblemas() {
  await exigirMenuPagina("/plataforma/problemas/recurrentes");
  return <VistaRecurrentesProblemas />;
}
