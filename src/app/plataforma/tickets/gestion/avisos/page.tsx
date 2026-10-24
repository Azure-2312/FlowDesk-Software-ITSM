import VistaAvisosMantenimiento from "@/modules/cambios/views/VistaAvisosMantenimiento";
import { obtenerSesionPagina } from "@/shared/lib/page-auth";

export default function PaginaTicketsGestionAvisos() {
  obtenerSesionPagina();
  return <VistaAvisosMantenimiento />;
}
