import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCambiosHistorial from "@/modules/cambios/views/VistaCambiosHistorial";

export default async function PaginaCambiosHistorial() {
  await exigirMenuPagina("/plataforma/cambios/historial");
  return <VistaCambiosHistorial />;
}
