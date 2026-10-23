import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionCrear from "@/modules/tickets/gestion/crear/VistaTicketsGestionCrear";

export default async function PaginaIncidentesCrear() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/incidentes/crear");

  let rutaLista = "/plataforma/incidentes/mios";
  if ([1, 4, 6].includes(idPerfil)) {
    rutaLista = "/plataforma/incidentes";
  } else if (idPerfil === 2) {
    rutaLista = "/plataforma/incidentes/asignados";
  } else if (idPerfil === 5) {
    rutaLista = "/plataforma/incidentes/departamento";
  }

  return (
    <VistaTicketsGestionCrear
      tipoFijo={1}
      rutaDetalleBase="/plataforma/incidentes"
      rutaLista={rutaLista}
    />
  );
}
