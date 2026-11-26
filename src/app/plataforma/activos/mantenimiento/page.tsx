import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaMantenimientoActivos from "@/modules/activos/views/VistaMantenimientoActivos";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaMantenimientoActivos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/mantenimiento",
    resolvedParams?.vista
  );

  return (
    <div className="vista-contenedor space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/mantenimiento"
          />
      )}
      <VistaMantenimientoActivos vistaActiva={vistaActiva} />
    </div>
  );
}
