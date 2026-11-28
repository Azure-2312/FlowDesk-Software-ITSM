import { obtenerSesionPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

// Ficha única de incidente/solicitud cuando el tipo no se conoce de antemano
// (p. ej. "Mis últimos tickets" del panel). Basta la sesión: el acceso a cada
// ticket lo decide la API por perfil y jurisdicción (cualquier perfil abre los
// tickets que él mismo registró); si no corresponde, la ficha lo indica.
export default async function PaginaTicketsRoute() {
  obtenerSesionPagina();
  return <VistaTicketsDetalle />;
}
