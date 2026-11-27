// ============================================================================
// PANTALLA OFICIAL DE BANDEJA DE SOLICITUDES (N5 - FASE 4)
// ============================================================================
// Unifica las bandejas dispersas de requerimientos de servicio (sin asignar,
// asignadas a mí, departamento, resueltas, todas/auditoría) en una única pantalla
// gobernada por la infraestructura de vistas N1 y permisos de perfil.
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

export default async function PaginaSolicitudesBandeja({ searchParams }: Props) {
  // 1. Guard de menú institucional y resolución de vistas permitidas (infraestructura N1)
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/solicitudes/bandeja",
    searchParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/solicitudes/bandeja"
          />
      )}

      <div>
        <TablaTickets
          vista={vistaActiva as "bandeja" | "en_atencion" | "asignados" | "departamento" | "resueltos" | "todos"}
          tipoInicial="2"
          tipoFijo="2"
          rutaDetalleBase="/plataforma/solicitudes"
          titulo="Bandeja de solicitudes"
          descripcion="Requerimientos de servicio según la vista autorizada para tu perfil."
        />
      </div>
    </div>
  );
}
