// ============================================================================
// PANTALLA OFICIAL DE BANDEJA DE INCIDENTES (N5 - FASE 4)
// ============================================================================
// Unifica las bandejas dispersas de incidentes (sin asignar, asignados a mí,
// departamento, resueltos, todos/auditoría) en una única pantalla gobernada
// por la infraestructura de vistas N1 y permisos de perfil.
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import TablaTickets from "@/modules/tickets/components/TablaTickets";

interface Props {
  searchParams?: {
    vista?: string;
    abrir?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function PaginaIncidentesBandeja({ searchParams }: Props) {
  // 1. Guard de menú institucional y resolución de vistas permitidas (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/incidentes/bandeja",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/incidentes/bandeja"
          />
        </div>
      )}

      <div>
        <TablaTickets
          vista={vistaActiva as "bandeja" | "asignados" | "departamento" | "resueltos" | "todos"}
          tipoInicial="1"
          tipoFijo="1"
          rutaDetalleBase="/plataforma/incidentes"
          titulo="Bandeja de incidentes"
          descripcion="Gestión de incidentes operativos según la vista autorizada para tu perfil."
        />
      </div>
    </div>
  );
}
