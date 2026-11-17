import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionCrear from "@/modules/tickets/gestion/crear/VistaTicketsGestionCrear";

export default async function PaginaSolicitudesCrear() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/solicitudes/crear");

  let rutaLista = "/plataforma/solicitudes/mios";
  if ([1, 4, 6].includes(idPerfil)) {
    rutaLista = "/plataforma/solicitudes/bandeja?vista=todos";
  } else if (idPerfil === 2) {
    rutaLista = "/plataforma/solicitudes/bandeja?vista=asignados";
  } else if (idPerfil === 5) {
    rutaLista = "/plataforma/solicitudes/bandeja?vista=departamento";
  }

  return (
    <VistaTicketsGestionCrear
      tipoFijo={2}
      rutaDetalleBase="/plataforma/solicitudes"
      rutaLista={rutaLista}
    />
  );
}
