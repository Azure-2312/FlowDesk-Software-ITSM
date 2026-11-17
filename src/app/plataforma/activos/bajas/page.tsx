import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaBajasActivos from "@/modules/activos/views/VistaBajasActivos";
import VistaBajasDisposicion from "@/modules/activos/views/VistaBajasDisposicion";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaBajasActivos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/bajas",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/bajas"
          />
        </div>
      )}
      {vistaActiva === "gestion" && <VistaBajasActivos />}
      {vistaActiva === "consulta" && <VistaBajasDisposicion />}
    </div>
  );
}
