import VistaPreferenciasNotificacion from "@/modules/seguridad/views/VistaPreferenciasNotificacion";
import { obtenerSesionPagina } from "@/shared/lib/page-auth";

export default function PaginaPreferenciasNotificacion() {
  obtenerSesionPagina();
  return <VistaPreferenciasNotificacion />;
}
