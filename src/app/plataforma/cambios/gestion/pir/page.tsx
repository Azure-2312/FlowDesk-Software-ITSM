import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaPir from "@/modules/cambios/views/gestion/VistaPir";

export default async function PaginaPir() {
  await exigirMenuPagina("/plataforma/cambios/gestion/pir");
  return <VistaPir />;
}
