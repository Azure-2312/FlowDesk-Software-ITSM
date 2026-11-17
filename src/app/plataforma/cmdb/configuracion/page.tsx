import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCmdbRelaciones from "@/modules/cmdb/config/cmdb-relaciones/VistaCmdbRelaciones";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCmdbConfiguracion({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cmdb/configuracion",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cmdb/configuracion"
          />
        </div>
      )}
      {vistaActiva === "clases" && <VistaCmdbRelaciones pestanaFija="clases_ci" />}
      {vistaActiva === "relaciones" && <VistaCmdbRelaciones pestanaFija="tipos_relacion" />}
    </div>
  );
}
