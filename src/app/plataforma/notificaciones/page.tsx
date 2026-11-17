import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaNotificacionesInApp from "@/modules/plataforma/views/VistaNotificacionesInApp";

export default async function PaginaNotificaciones() {
  await exigirMenuPagina("/plataforma/notificaciones");
  return <VistaNotificacionesInApp />;
}
