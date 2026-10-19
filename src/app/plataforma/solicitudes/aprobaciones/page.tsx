import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionAprobaciones from "@/modules/tickets/gestion/aprobaciones/VistaTicketsGestionAprobaciones";

export default async function PaginaSolicitudesAprobaciones() {
  await exigirMenuPagina("/plataforma/solicitudes/aprobaciones");
  return <VistaTicketsGestionAprobaciones apiBase="/api/solicitudes" />;
}
