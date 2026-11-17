import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaLicenciasActivos from "@/modules/activos/views/VistaLicenciasActivos";
import VistaActivosLicencias from "@/modules/activos/views/VistaActivosLicencias";
import VistaCatalogoSoftware from "@/modules/activos/views/VistaCatalogoSoftware";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaLicenciasActivos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/licencias",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/licencias"
          />
        </div>
      )}
      {vistaActiva === "licencias" && <VistaLicenciasActivos />}
      {vistaActiva === "consulta" && <VistaActivosLicencias />}
      {vistaActiva === "catalogo-software" && <VistaCatalogoSoftware />}
    </div>
  );
}
