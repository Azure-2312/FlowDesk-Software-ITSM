import VistaMisActivos from "@/modules/activos/views/VistaMisActivos";
import { obtenerSesionPagina } from "@/shared/lib/page-auth";

export default function PaginaMisActivos() {
  obtenerSesionPagina();
  return <VistaMisActivos />;
}
