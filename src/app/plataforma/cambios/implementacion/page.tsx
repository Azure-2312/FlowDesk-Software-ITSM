import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosImplementacion from "@/modules/cambios/views/VistaCambiosImplementacion";

export default async function PaginaCambiosImplementacion() {
  await exigirMenuPagina("/plataforma/cambios/implementacion");
  return <VistaCambiosImplementacion />;
}
