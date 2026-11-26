import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaDepartamentos from "@/modules/organizacion/config/departamentos/VistaDepartamentos";
import VistaTecnicos from "@/modules/organizacion/config/tecnicos/VistaTecnicos";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaGruposTI({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/organizacion/grupos-ti",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/organizacion/grupos-ti"
          />
      )}
      {vistaActiva === "tecnicos" ? (
        <VistaTecnicos />
      ) : (
        <VistaDepartamentos />
      )}
    </div>
  );
}
