// ============================================================================
// PANTALLA OFICIAL DE MIS APROBACIONES (N4 - FASE 3)
// ============================================================================
// Unifica las 8 bandejas de aprobación dispersas y los 2 historiales en una
// única pantalla con pestañas de vistas autorizadas (pendientes, historial,
// historial-area). La vista pendientes soporta filtro por tipo (?tipo=).
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";

import VistaAprobacionesUnificadas from "@/modules/plataforma/views/VistaAprobacionesUnificadas";
import VistaHistorialAprobaciones from "@/modules/seguridad/views/VistaHistorialAprobaciones";
import VistaHistorialDecisiones from "@/modules/solicitudes/views/VistaHistorialDecisiones";

interface Props {
  searchParams?: {
    vista?: string;
    tipo?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function PaginaMisAprobaciones({ searchParams }: Props) {
  // 1. Guard de menú institucional y resolución segura de vista activa (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/aprobaciones",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/aprobaciones"
          />
        </div>
      )}

      <div>
        {vistaActiva === "pendientes" && (
          <VistaAprobacionesUnificadas tipoInicial={searchParams?.tipo} />
        )}
        {vistaActiva === "historial" && <VistaHistorialAprobaciones />}
        {vistaActiva === "historial-area" && <VistaHistorialDecisiones />}
      </div>
    </div>
  );
}
