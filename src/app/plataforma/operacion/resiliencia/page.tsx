import VistaResilienciaOperacion from "@/modules/operacion/views/VistaResilienciaOperacion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaResiliencia() {
  const { idPerfil } = exigirCapacidadPagina(CAPACIDADES.OPERACION_RESILIENCIA);
  return <VistaResilienciaOperacion perfil={idPerfil} />;
}
