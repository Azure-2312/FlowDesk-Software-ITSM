import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaActivosMapa from "@/modules/cmdb/views/VistaActivosMapa";

export default async function PaginaTopologiaCmdb() {
  await exigirMenuPagina("/plataforma/cmdb/topologia");
  return <VistaActivosMapa />;
}
