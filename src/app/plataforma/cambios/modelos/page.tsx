import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaModelosCambio from "@/modules/cambios/views/VistaModelosCambio";
import VistaModelosGestion from "@/modules/cambios/views/gestion/VistaModelosGestion";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCambiosModelos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cambios/modelos",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cambios/modelos"
          />
        </div>
      )}
      {vistaActiva === "consulta" && <VistaModelosCambio />}
      {vistaActiva === "administracion" && <VistaModelosGestion />}
    </div>
  );
}
