import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCierreProblemasMayores from "@/modules/problemas/views/VistaCierreProblemasMayores";

export default async function PaginaCierreProblemasMayores() {
  await exigirMenuPagina("/plataforma/problemas/mayores");
  return <VistaCierreProblemasMayores />;
}
