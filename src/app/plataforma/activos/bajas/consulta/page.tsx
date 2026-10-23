import VistaBajasDisposicion from "@/modules/activos/views/VistaBajasDisposicion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaBajasDisposicion() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaBajasDisposicion />;
}
