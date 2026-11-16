import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaProblemasAsignados from "@/modules/problemas/views/VistaProblemasAsignados";

export default async function PaginaProblemasAsignados() {
  await exigirMenuPagina("/plataforma/problemas/asignados");
  return <VistaProblemasAsignados />;
}
