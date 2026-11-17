// ============================================================================
// PANTALLA OFICIAL DE INCIDENTES MAYORES (N5 - FASE 4)
// ============================================================================
// Unifica el listado de incidentes mayores con la sala de crisis colaborativa
// bajo un único recurso gobernado por vistas (listado, sala-crisis).
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaIncidentesMayores from "@/modules/incidentes/views/VistaIncidentesMayores";
import VistaMesaIncidenteMayor from "@/modules/tickets/views/VistaMesaIncidenteMayor";

interface Props {
  searchParams?: {
    vista?: string;
    abrir?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function PaginaIncidentesMayores({ searchParams }: Props) {
  // 1. Guard de menú institucional y resolución de vistas permitidas (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/incidentes/mayores",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/incidentes/mayores"
          />
        </div>
      )}

      <div>
        {vistaActiva === "listado" && <VistaIncidentesMayores />}
        {vistaActiva === "sala-crisis" && <VistaMesaIncidenteMayor />}
      </div>
    </div>
  );
}
