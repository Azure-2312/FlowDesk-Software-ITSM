import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaMayoresProblemas from "@/modules/problemas/views/VistaMayoresProblemas";

export default async function PaginaMayoresProblemas() {
  await exigirMenuPagina("/plataforma/problemas/mayores");
  return <VistaMayoresProblemas />;
}
