import VistaProveedores from "@/modules/proveedores/views/VistaProveedores";
import { CAPACIDADES, tieneCapacidad } from "@/shared/lib/capacidades";
import { exigirCapacidadPagina } from "@/shared/lib/page-auth";

export default function PaginaProveedores() {
  const { idPerfil } = exigirCapacidadPagina(CAPACIDADES.PROVEEDORES_VER);
  return (
    <VistaProveedores
      puedeEditar={tieneCapacidad(idPerfil, CAPACIDADES.PROVEEDORES_GESTIONAR)}
    />
  );
}
