import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaSolicitudes from "@/modules/solicitudes/views/VistaSolicitudes";

export default async function PaginaSolicitudes() {
  await exigirMenuPagina("/plataforma/solicitudes");
  return <VistaSolicitudes />;
}
