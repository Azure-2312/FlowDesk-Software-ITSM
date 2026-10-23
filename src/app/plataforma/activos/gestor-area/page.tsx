import VistaActivosArea from "@/modules/activos/views/VistaActivosArea";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaActivosArea() {
  exigirCapacidadPagina(CAPACIDADES.ACTIVOS_VER);
  return <VistaActivosArea />;
}
