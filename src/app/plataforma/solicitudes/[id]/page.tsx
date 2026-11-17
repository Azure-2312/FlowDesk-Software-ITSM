import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

export default async function PaginaSolicitudDetalle() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/solicitudes", { prefijo: true });

  let rutaLista = "/plataforma/solicitudes/bandeja";
  let etiquetaVolver = "Volver a Solicitudes";

  if (idPerfil === 3) {
    rutaLista = "/plataforma/solicitudes/mios";
    etiquetaVolver = "Volver a Mis solicitudes";
  } else if ([1, 4, 6].includes(idPerfil)) {
    rutaLista = "/plataforma/solicitudes/bandeja?vista=todos";
    etiquetaVolver = "Volver a Todas las solicitudes";
  } else if (idPerfil === 2) {
    rutaLista = "/plataforma/solicitudes/bandeja?vista=asignados";
    etiquetaVolver = "Volver a Solicitudes asignadas";
  } else if (idPerfil === 5) {
    rutaLista = "/plataforma/solicitudes/bandeja?vista=departamento";
    etiquetaVolver = "Volver a Solicitudes del departamento";
  } else if (idPerfil === 7) {
    rutaLista = "/plataforma/aprobaciones";
    etiquetaVolver = "Volver a Mis aprobaciones";
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
