import VistaModelosCambio from "@/modules/aprobador/views/VistaModelosCambio";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaModelosCambio() {
  exigirCapacidadPagina(CAPACIDADES.CAMBIOS_VER);
  return <VistaModelosCambio />;
}
