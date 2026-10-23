import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

export default async function PaginaSolicitudDetalle() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/solicitudes", { prefijo: true });

  let rutaLista = "/plataforma/solicitudes/mios";
  let etiquetaVolver = "Volver a Mis solicitudes";

  if ([1, 4, 6].includes(idPerfil)) {
    rutaLista = "/plataforma/solicitudes";
    etiquetaVolver = "Volver a Todas las solicitudes";
  } else if (idPerfil === 2) {
    rutaLista = "/plataforma/solicitudes/asignados";
    etiquetaVolver = "Volver a Solicitudes asignadas";
  } else if (idPerfil === 5) {
    rutaLista = "/plataforma/solicitudes/departamento";
    etiquetaVolver = "Volver a Solicitudes del departamento";
  }

  return (
    <VistaTicketsDetalle
      apiBase="/api/solicitudes"
      tipoEsperado={2}
      rutaLista={rutaLista}
      etiquetaVolver={etiquetaVolver}
    />
  );
}
