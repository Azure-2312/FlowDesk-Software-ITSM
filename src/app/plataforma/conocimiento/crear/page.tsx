import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaConocimientoNuevo from "@/modules/conocimiento/views/VistaConocimientoNuevo";

export default async function PaginaConocimientoCrear() {
  await exigirMenuPagina("/plataforma/conocimiento/crear");
  return <VistaConocimientoNuevo />;
}
