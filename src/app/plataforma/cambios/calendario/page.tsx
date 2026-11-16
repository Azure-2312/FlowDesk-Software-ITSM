import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosCalendario from "@/modules/cambios/views/VistaCambiosCalendario";

export default async function PaginaCambiosCalendario() {
  await exigirMenuPagina("/plataforma/cambios/calendario");
  return <VistaCambiosCalendario />;
}
