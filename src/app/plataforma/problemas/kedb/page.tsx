import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaKedb from "@/modules/problemas/views/VistaKedb";

export default async function PaginaKedb() {
  await exigirMenuPagina("/plataforma/problemas/kedb");
  return <VistaKedb />;
}
