import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import ConfiguracionObjetivosSla from "@/modules/servicios/config/servicios/ConfiguracionObjetivosSla";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaAdminServiciosSla({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/servicios/configuracion/sla",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/servicios/configuracion/sla"
          />
        </div>
      )}
      <ConfiguracionObjetivosSla pestanaFija={vistaActiva as "tiempos" | "matriz"} />
    </div>
  );
}
