import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaInventarioActivos from "@/modules/activos/views/VistaInventarioActivos";
import VistaActivosArea from "@/modules/activos/views/VistaActivosArea";
import VistaActivosInventario from "@/modules/activos/views/VistaActivosInventario";
import VistaImportacionActivos from "@/modules/activos/views/VistaImportacionActivos";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaInventarioActivos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/inventario",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/inventario"
          />
        </div>
      )}
      {vistaActiva === "todos" && <VistaInventarioActivos />}
      {vistaActiva === "mi-area" && <VistaActivosArea />}
      {vistaActiva === "operativo" && <VistaActivosInventario />}
      {vistaActiva === "importar" && <VistaImportacionActivos />}
    </div>
  );
}
