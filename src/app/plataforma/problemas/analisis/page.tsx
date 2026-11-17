import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaAnalisisProblemas from "@/modules/problemas/views/VistaAnalisisProblemas";

export default async function PaginaAnalisisProblemas() {
  await exigirMenuPagina("/plataforma/problemas/analisis");
  return <VistaAnalisisProblemas />;
}
