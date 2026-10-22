import VistaModelosCambio from "@/modules/cambios/views/aprobador/VistaModelosCambio";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaModelosCambio() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaModelosCambio />;
}
