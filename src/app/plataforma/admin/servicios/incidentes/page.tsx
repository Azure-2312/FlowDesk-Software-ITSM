import { Suspense } from "react";
import { VistaCatalogoServicios } from "@/modules/servicios/admin/servicios/page";

export default function PaginaAdminServiciosIncidentes() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Cargando servicios de incidentes...</div>}>
      <VistaCatalogoServicios tipoForzado={1} />
    </Suspense>
  );
}
