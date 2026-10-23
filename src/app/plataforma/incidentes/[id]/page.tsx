import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsDetalle from "@/modules/tickets/[id]/VistaTicketsDetalle";

export default async function PaginaIncidenteDetalle() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/incidentes", { prefijo: true });

  let rutaLista = "/plataforma/incidentes/todos";
  let etiquetaVolver = "Volver a Incidentes";

  if (idPerfil === 3) {
    rutaLista = "/plataforma/incidentes/mios";
    etiquetaVolver = "Volver a Mis incidentes";
  } else if ([1, 4, 6].includes(idPerfil)) {
    rutaLista = "/plataforma/incidentes/todos";
    etiquetaVolver = "Volver a Todos los incidentes";
  } else if (idPerfil === 2) {
    rutaLista = "/plataforma/incidentes/asignados";
    etiquetaVolver = "Volver a Incidentes asignados";
  } else if (idPerfil === 5) {
    rutaLista = "/plataforma/incidentes/departamento";
    etiquetaVolver = "Volver a Incidentes del departamento";
  }

  return (
    <VistaTicketsDetalle
      apiBase="/api/incidentes"
      tipoEsperado={1}
      rutaLista={rutaLista}
      etiquetaVolver={etiquetaVolver}
    />
  );
}
