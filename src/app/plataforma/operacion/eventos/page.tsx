import VistaEventosOperacion from "@/modules/operacion/views/VistaEventosOperacion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaEventos() {
  const { idPerfil } = exigirCapacidadPagina(CAPACIDADES.OPERACION_EVENTOS);
  return <VistaEventosOperacion perfil={idPerfil} />;
}
