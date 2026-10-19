import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

export default async function PaginaSolicitudDetalle() {
  await exigirMenuPagina("/plataforma/solicitudes", { prefijo: true });
  return (
    <VistaTicketsDetalle
      apiBase="/api/solicitudes"
      tipoEsperado={2}
      rutaLista="/plataforma/solicitudes/mios"
      etiquetaVolver="Volver a Mis solicitudes"
    />
  );
}
