import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaConocimientoMisArticulos from "@/modules/conocimiento/views/VistaConocimientoMisArticulos";

export default async function PaginaConocimientoMisArticulos() {
  await exigirMenuPagina("/plataforma/conocimiento/mis-articulos");
  return <VistaConocimientoMisArticulos />;
}
