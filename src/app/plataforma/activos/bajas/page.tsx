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
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/bajas"
          />
      )}
      {vistaActiva === "gestion" && <VistaBajasActivos />}
      {vistaActiva === "consulta" && <VistaBajasDisposicion />}
    </div>
  );
}
