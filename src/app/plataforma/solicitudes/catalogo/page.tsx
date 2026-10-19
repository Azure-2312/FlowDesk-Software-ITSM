import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCatalogoServicios from "@/modules/solicitudes/views/VistaCatalogoServicios";

export default async function PaginaSolicitudesCatalogo() {
  await exigirMenuPagina("/plataforma/solicitudes/catalogo");
  return <VistaCatalogoServicios tipoFijo={2} rutaCrearBase="/plataforma/solicitudes/crear" />;
}
