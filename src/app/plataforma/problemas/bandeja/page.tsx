import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaAsignacionProblemas from "@/modules/problemas/views/VistaAsignacionProblemas";
import VistaProblemasAsignados from "@/modules/problemas/views/VistaProblemasAsignados";
import VistaProblemasGrupo from "@/modules/problemas/views/VistaProblemasGrupo";
import VistaProblemas from "@/modules/problemas/views/VistaProblemas";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaProblemasBandeja({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/problemas/bandeja",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/problemas/bandeja"
          />
        </div>
      )}
      {vistaActiva === "sin-asignar" && <VistaAsignacionProblemas />}
      {vistaActiva === "asignados" && <VistaProblemasAsignados />}
      {vistaActiva === "grupo" && <VistaProblemasGrupo />}
      {vistaActiva === "historial" && <VistaProblemas puedeCrear={true} />}
    </div>
  );
}
