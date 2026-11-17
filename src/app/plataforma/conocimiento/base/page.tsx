import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaConocimientoBase from "@/modules/conocimiento/views/VistaConocimientoBase";

export default async function PaginaConocimientoBase() {
  await exigirMenuPagina("/plataforma/conocimiento/base");
  return <VistaConocimientoBase />;
}
