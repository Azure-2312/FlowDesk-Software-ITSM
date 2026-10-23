import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaTicketsGestionCrear from "@/modules/tickets/gestion/crear/VistaTicketsGestionCrear";

export default async function PaginaSolicitudesCrear() {
  const { idPerfil } = await exigirMenuPagina("/plataforma/solicitudes/crear");

  let rutaLista = "/plataforma/solicitudes/mios";
  if ([1, 4, 6].includes(idPerfil)) {
    rutaLista = "/plataforma/solicitudes";
  } else if (idPerfil === 2) {
    rutaLista = "/plataforma/solicitudes/asignados";
  } else if (idPerfil === 5) {
    rutaLista = "/plataforma/solicitudes/departamento";
  }

  return (
    <VistaTicketsGestionCrear
      tipoFijo={2}
      rutaDetalleBase="/plataforma/solicitudes"
      rutaLista={rutaLista}
    />
  );
}
