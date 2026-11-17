import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCandidatosProblemas from "@/modules/problemas/views/VistaCandidatosProblemas";
import VistaRecurrentesProblemas from "@/modules/problemas/views/VistaRecurrentesProblemas";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaProblemasCandidatos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/problemas/candidatos",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/problemas/candidatos"
          />
        </div>
      )}
      {vistaActiva === "propuestos" && <VistaCandidatosProblemas />}
      {vistaActiva === "recurrentes" && <VistaRecurrentesProblemas />}
    </div>
  );
}
