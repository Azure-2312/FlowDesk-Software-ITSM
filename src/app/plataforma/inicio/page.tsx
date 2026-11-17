// ============================================================================
// PANTALLA OFICIAL DE INICIO (N3 - FASE 3)
// ============================================================================
// Unifica los 10 paneles de rol y reemplaza Tableros (#21183) eliminando
// redirecciones obsoletas. Renderiza pestañas de cambio de panel si el
// usuario posee múltiples vistas concedidas según sus perfiles activos.
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";

// Importación de los 10 paneles existentes (sin reescritura)
import VistaPanelSolicitante from "@/modules/operacion/paneles/solicitante/VistaPanelSolicitante";
import VistaPanelTecnico from "@/modules/operacion/paneles/tecnico/VistaPanelTecnico";
import VistaPanelSupervisor from "@/modules/operacion/paneles/supervisor/VistaPanelSupervisor";
import VistaPanelAprobador from "@/modules/operacion/paneles/aprobador/VistaPanelAprobador";
import VistaPanelArea from "@/modules/operacion/paneles/gestor-area/VistaPanelArea";
import VistaPanelActivos from "@/modules/activos/views/VistaPanelActivos";
import VistaPanelGestion from "@/modules/operacion/paneles/gestor-cambios/VistaPanelGestion";
import VistaPanelProblemas from "@/modules/problemas/views/VistaPanelProblemas";
import VistaPanelAuditoria from "@/modules/operacion/paneles/auditor/VistaPanelAuditoria";
import VistaPanelAdministrador from "@/modules/operacion/paneles/administrador/VistaPanelAdministrador";

interface Props {
  searchParams?: { vista?: string; [key: string]: string | string[] | undefined };
}

export default async function PaginaInicio({ searchParams }: Props) {
  // 1. Guard de pantalla y resolución segura de vista activa (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/inicio",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/inicio"
          />
        </div>
      )}

      <div>
        {vistaActiva === "solicitante" && <VistaPanelSolicitante />}
        {vistaActiva === "tecnico" && <VistaPanelTecnico />}
        {vistaActiva === "supervisor" && <VistaPanelSupervisor />}
        {vistaActiva === "aprobador" && <VistaPanelAprobador />}
        {vistaActiva === "area" && <VistaPanelArea />}
        {vistaActiva === "gestion-activos" && <VistaPanelActivos />}
        {vistaActiva === "gestion-cambios" && <VistaPanelGestion />}
        {vistaActiva === "gestion-problemas" && <VistaPanelProblemas />}
        {vistaActiva === "auditor" && <VistaPanelAuditoria />}
        {vistaActiva === "administrador" && <VistaPanelAdministrador />}
      </div>
    </div>
  );
}
