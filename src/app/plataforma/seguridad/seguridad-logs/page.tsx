import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";
import VistaSeguridadLogs from "@/modules/plataforma/config/seguridad-logs/VistaSeguridadLogs";

export default function PaginaAdminSeguridadLogs() {
  exigirCapacidadPagina(CAPACIDADES.SEGURIDAD_LOGS);
  return <VistaSeguridadLogs />;
}
