import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemasCrear from "@/modules/problemas/views/VistaProblemasCrear";

export default async function PaginaProblemasCrear() {
  await exigirMenuPagina("/plataforma/problemas/crear");
  return <VistaProblemasCrear />;
}
