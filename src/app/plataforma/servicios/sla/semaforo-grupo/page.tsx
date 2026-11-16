import VistaSlaSemaforo from "@/modules/servicios/views/VistaSlaSemaforo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaSlaSemaforoSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaSlaSemaforo />;
}
