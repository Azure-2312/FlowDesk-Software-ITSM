// ============================================================================
// PANTALLA OFICIAL DE MONITOR DE SLA (N5 - FASE 4)
// ============================================================================
// Unifica las 5 pantallas de monitoreo de SLA (escalamientos/riesgo, incumplimientos,
// objetivos vigentes, semáforo mi cola, semáforo grupo) en una única pantalla
// protegida y navegable mediante pestañas de vistas autorizadas (N1).
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaEscalamientosSla from "@/modules/servicios/views/VistaEscalamientosSla";
import VistaIncumplimientosSla from "@/modules/servicios/views/VistaIncumplimientosSla";
import VistaSlaObjetivos from "@/modules/servicios/views/VistaSlaObjetivos";
import VistaSlaSemaforo from "@/modules/servicios/views/VistaSlaSemaforo";
import VistaObjetivosProblemas from "@/modules/problemas/views/VistaObjetivosProblemas";

interface Props {
  searchParams?: {
    vista?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function PaginaMonitorSla({ searchParams }: Props) {
  // 1. Guard de menú institucional y resolución de vistas permitidas (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/servicios/sla",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/servicios/sla"
          />
        </div>
      )}

      <div>
        {vistaActiva === "riesgo" && <VistaEscalamientosSla />}
        {vistaActiva === "incumplimientos" && <VistaIncumplimientosSla />}
        {vistaActiva === "objetivos" && <VistaSlaObjetivos />}
        {vistaActiva === "mi-cola" && <VistaSlaSemaforo alcanceInicial="mios" />}
        {vistaActiva === "grupo" && <VistaSlaSemaforo alcanceInicial="area" />}
        {vistaActiva === "problemas" && <VistaObjetivosProblemas />}
      </div>
    </div>
  );
}
