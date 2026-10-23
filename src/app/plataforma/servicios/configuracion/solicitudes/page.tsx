import { Suspense } from "react";
import { VistaCatalogoServicios } from "@/modules/servicios/admin/servicios/page";

export default function PaginaAdminServiciosSolicitudes() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-500">Cargando servicios de solicitudes...</div>}>
      <VistaCatalogoServicios tipoForzado={2} />
    </Suspense>
  );
}
