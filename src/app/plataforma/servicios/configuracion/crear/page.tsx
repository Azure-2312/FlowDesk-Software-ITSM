import { Suspense } from "react";
import { VistaCatalogoServicios } from "@/modules/servicios/admin/servicios/page";

export default function PaginaAdminServiciosCrear() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Cargando formulario de nuevo servicio...</div>}>
      <VistaCatalogoServicios vistaForzada="nuevo" />
    </Suspense>
  );
}
