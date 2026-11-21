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
        <div className="bg-white px-6 pt-2 rounded-xl border border-slate-200 shadow-xs">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/mantenimiento"
          />
        </div>
      )}
      <VistaMantenimientoActivos vistaActiva={vistaActiva} />
    </div>
  );
}
