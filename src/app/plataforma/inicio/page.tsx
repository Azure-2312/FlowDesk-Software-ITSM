// ============================================================================
// PANTALLA OFICIAL DE INICIO (DASHBOARD 1 A 1 POR PERFIL ACTIVO)
// ============================================================================
// Carga directamente el panel operacional correspondiente al perfil activo del
// usuario (sin pestañas de rol). Para alternar de perspectiva operacional, el
// usuario utiliza el conmutador de perfil ("Cambiar perfil") en el menú.
// ============================================================================

import { exigirMenuPagina } from "@/shared/lib/page-auth";
import { obtenerVistaPorDefecto } from "@/shared/lib/vistas";

// Importación de los 10 paneles existentes
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

export default async function PaginaInicio() {
  // 1. Guard de pantalla por catálogo de menú
  const { idPerfil } = await exigirMenuPagina("/plataforma/inicio");

  // 2. Resolver el panel 1 a 1 según el perfil activo (sin pestañas superiores)
  const vistaActiva = obtenerVistaPorDefecto("/plataforma/inicio", idPerfil);

  return (
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
  );
}
