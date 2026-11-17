import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCmdb from "@/modules/cmdb/views/VistaCmdb";

export default async function PaginaCis() {
  await exigirMenuPagina("/plataforma/cmdb/cis");
  return <VistaCmdb />;
}
