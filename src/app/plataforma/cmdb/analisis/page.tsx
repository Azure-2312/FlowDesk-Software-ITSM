import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCmdbAnalisis from "@/modules/cmdb/views/VistaCmdbAnalisis";

export default async function PaginaAnalisisCmdb() {
  await exigirMenuPagina("/plataforma/cmdb/analisis");
  return <VistaCmdbAnalisis />;
}
