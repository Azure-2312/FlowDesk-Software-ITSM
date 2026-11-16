import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaActivosInventario from "@/modules/activos/views/VistaActivosInventario";

export default async function PaginaActivosInventarioOperativo() {
  await exigirMenuPagina("/plataforma/activos/inventario-operativo");
  return <VistaActivosInventario />;
}
