import VistaTecnicoSlaSemaforo from "@/modules/servicios/views/tecnico/VistaTecnicoSlaSemaforo";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaSlaSemaforoSupervisor() {
  exigirCapacidadPagina(CAPACIDADES.TICKETS_VER);
  return <VistaTecnicoSlaSemaforo />;
}
