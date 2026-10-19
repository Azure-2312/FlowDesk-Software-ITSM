import { exigirMenuPagina } from "@/shared/lib/page-auth";
import VistaCatalogoServicios from "@/modules/solicitudes/views/VistaCatalogoServicios";

export default async function PaginaIncidentesCatalogo() {
  await exigirMenuPagina("/plataforma/incidentes/catalogo");
  return <VistaCatalogoServicios tipoFijo={1} rutaCrearBase="/plataforma/incidentes/crear" />;
}
