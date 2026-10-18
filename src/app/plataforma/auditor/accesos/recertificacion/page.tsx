import VistaRecertificacion from "@/modules/perfiles/auditor/views/VistaRecertificacion";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaRecertificacion() {
  exigirCapacidadPagina(CAPACIDADES.AUDITORIA_VER);
  return <VistaRecertificacion />;
}
