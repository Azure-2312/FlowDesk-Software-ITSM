import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCentroAprobacionesSolicitudes from "@/modules/solicitudes/views/VistaCentroAprobacionesSolicitudes";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCentroAprobacionesSolicitudes({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/solicitudes/aprobaciones",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/solicitudes/aprobaciones"
          />
        </div>
      )}

      <VistaCentroAprobacionesSolicitudes
        vistaInicial={vistaActiva as "pendientes" | "historial"}
      />
    </div>
  );
}
