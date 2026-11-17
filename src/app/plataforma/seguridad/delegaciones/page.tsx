import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaDelegaciones from "@/modules/seguridad/views/VistaDelegaciones";

export default async function PaginaDelegacionesAprobador() {
  await exigirMenuPagina("/plataforma/seguridad/delegaciones");
  return <VistaDelegaciones />;
}
