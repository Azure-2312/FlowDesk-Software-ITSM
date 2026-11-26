// ============================================================================
// PANTALLA OFICIAL DE INCIDENTES MAYORES (N5 - FASE 4 / ITIL v4)
// ============================================================================
// Bandeja de incidentes mayores separada del formulario de declaración y sala de crisis.
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaIncidentesMayores from "@/modules/incidentes/views/VistaIncidentesMayores";
import VistaDeclararIncidenteMayor from "@/modules/incidentes/views/VistaDeclararIncidenteMayor";
import VistaMesaIncidenteMayor from "@/modules/tickets/views/VistaMesaIncidenteMayor";

interface Props {
  searchParams?: Promise<{ vista?: string; abrir?: string; [key: string]: string | string[] | undefined }> | {
    vista?: string;
    abrir?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function PaginaIncidentesMayores({ searchParams }: Props) {
  const resolvedParams = searchParams ? await searchParams : undefined;

  // 1. Guard de menú institucional y resolución de vistas permitidas (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/incidentes/mayores",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/incidentes/mayores"
          />
      )}

      <div>
        {vistaActiva === "listado" && <VistaIncidentesMayores />}
        {vistaActiva === "declarar" && <VistaDeclararIncidenteMayor />}
        {vistaActiva === "sala-crisis" && <VistaMesaIncidenteMayor />}
      </div>
    </div>
  );
}
