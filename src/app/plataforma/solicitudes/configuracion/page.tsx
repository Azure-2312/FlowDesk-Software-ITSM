// ============================================================================
// PANTALLA OFICIAL DE CONFIGURACIÓN DE SOLICITUDES (N5 - FASE 4)
// ============================================================================
// Unifica la configuración de campos del formulario con las reglas y parámetros
// operativos de solicitudes bajo la infraestructura de vistas (campos, reglas).
// ============================================================================

import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaConfiguracionFormularioMesa from "@/modules/tickets/config/VistaConfiguracionFormularioMesa";
import VistaTicketsVistas from "@/modules/tickets/config/vistas/VistaTicketsVistas";

interface Props {
  searchParams?: {
    vista?: string;
    [key: string]: string | string[] | undefined;
  };
}

export default async function PaginaSolicitudesConfiguracion({ searchParams }: Props) {
  // 1. Guard de menú institucional y resolución de vistas permitidas (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/solicitudes/configuracion",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/solicitudes/configuracion"
          />
        </div>
      )}

      <div>
        {vistaActiva === "campos" && (
          <VistaConfiguracionFormularioMesa tipo="solicitud" />
        )}
        {vistaActiva === "reglas" && (
          <VistaTicketsVistas
            seccionInicial="estados"
            tipoFijo="solicitud"
            ocultarTabsSuperiores={true}
            ocultarCabecera={true}
          />
        )}
      </div>
    </div>
  );
}
