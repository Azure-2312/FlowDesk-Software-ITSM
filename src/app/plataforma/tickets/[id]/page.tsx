import { exigirAlgunPrefijoMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

// Ficha única de incidente/solicitud cuando el tipo no se conoce de antemano.
// El acceso a cada ticket lo controla además la API por perfil y jurisdicción.
export default async function PaginaTicketsRoute() {
  await exigirAlgunPrefijoMenuPagina(["/plataforma/incidentes", "/plataforma/solicitudes"]);
  return <VistaTicketsDetalle />;
}
