import { exigirPerfilPagina } from "@/shared/lib/page-auth";
import { PERFILES } from "@/shared/lib/capacidades";
import VistaGuiaEstilo from "@/modules/plataforma/views/VistaGuiaEstilo";

// Guía del sistema de diseño: catálogo único de componentes visuales.
// Solo administración (no aparece en el menú; se abre por URL).
export default function PaginaGuiaEstilo() {
  exigirPerfilPagina([PERFILES.ADMINISTRADOR]);
  return <VistaGuiaEstilo />;
}
