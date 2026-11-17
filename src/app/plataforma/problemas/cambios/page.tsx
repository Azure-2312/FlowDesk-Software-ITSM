import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosProblemas from "@/modules/problemas/views/VistaCambiosProblemas";

export default async function PaginaCambiosProblemas() {
  await exigirMenuPagina("/plataforma/problemas/cambios");
  return <VistaCambiosProblemas />;
}
