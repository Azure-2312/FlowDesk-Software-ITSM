import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCambiosMisCambios from "@/modules/cambios/views/VistaCambiosMisCambios";
import VistaCambiosImplementacion from "@/modules/cambios/views/VistaCambiosImplementacion";
import VistaCambiosImpactoArea from "@/modules/cambios/views/VistaCambiosImpactoArea";
import VistaCambiosImpacto from "@/modules/cambios/views/VistaCambiosImpacto";
import VistaCambiosHistorial from "@/modules/cambios/views/VistaCambiosHistorial";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCambiosMisCambios({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cambios/mis-cambios",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cambios/mis-cambios"
          />
      )}
      {vistaActiva === "en-tramite" && <VistaCambiosMisCambios />}
      {vistaActiva === "por-implementar" && <VistaCambiosImplementacion />}
      {vistaActiva === "afectan-area" && <VistaCambiosImpactoArea />}
      {vistaActiva === "afectan-equipo" && <VistaCambiosImpacto tipoImpacto="equipo" />}
      {vistaActiva === "afectan-servicios" && <VistaCambiosImpacto tipoImpacto="servicios" />}
      {vistaActiva === "historial" && <VistaCambiosHistorial />}
    </div>
  );
}
