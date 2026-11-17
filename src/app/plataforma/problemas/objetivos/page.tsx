import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaObjetivosProblemas from "@/modules/problemas/views/VistaObjetivosProblemas";

export default async function PaginaObjetivosProblemas() {
  await exigirMenuPagina("/plataforma/problemas/objetivos");
  return <VistaObjetivosProblemas />;
}
