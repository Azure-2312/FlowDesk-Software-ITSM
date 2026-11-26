import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaEvaluacionRfc from "@/modules/cambios/views/gestion/VistaEvaluacionRfc";
import VistaAutorizaciones from "@/modules/cambios/views/gestion/VistaAutorizaciones";
import VistaEjecucion from "@/modules/cambios/views/gestion/VistaEjecucion";
import VistaCambiosGestionTodos from "@/modules/cambios/gestion/todos/VistaCambiosGestionTodos";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCambiosGestion({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cambios/gestion",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cambios/gestion"
          />
      )}
      {vistaActiva === "por-evaluar" && <VistaEvaluacionRfc />}
      {vistaActiva === "aprobacion" && <VistaAutorizaciones />}
      {vistaActiva === "ejecucion" && <VistaEjecucion />}
      {vistaActiva === "historial" && <VistaCambiosGestionTodos />}
    </div>
  );
}
