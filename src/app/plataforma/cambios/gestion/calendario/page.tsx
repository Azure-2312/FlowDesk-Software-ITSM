import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCambiosGestionCalendario from "@/modules/cambios/gestion/calendario/VistaCambiosGestionCalendario";
import VistaProgramacion from "@/modules/cambios/views/gestion/VistaProgramacion";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCambiosGestionCalendario({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cambios/gestion/calendario",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cambios/gestion/calendario"
          />
      )}
      {vistaActiva === "calendario" && <VistaCambiosGestionCalendario />}
      {vistaActiva === "programacion" && <VistaProgramacion />}
    </div>
  );
}
