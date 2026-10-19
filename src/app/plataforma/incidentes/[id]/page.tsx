import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

export default async function PaginaIncidenteDetalle() {
  await exigirMenuPagina("/plataforma/incidentes", { prefijo: true });
  return (
    <VistaTicketsDetalle
      apiBase="/api/incidentes"
      tipoEsperado={1}
      rutaLista="/plataforma/incidentes/mios"
      etiquetaVolver="Volver a Mis incidentes"
    />
  );
}
