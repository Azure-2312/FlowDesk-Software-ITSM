import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaContratos from "@/modules/activos/views/VistaContratos";
import VistaContratosArea from "@/modules/activos/views/VistaContratosArea";
import VistaRenovaciones from "@/modules/activos/views/VistaRenovaciones";
import VistaProveedores from "@/modules/proveedores/views/VistaProveedores";
import { CAPACIDADES, tieneCapacidad } from "@/shared/lib/capacidades";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaContratos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas, idPerfil } = await exigirVistaPagina(
    "/plataforma/activos/contratos",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/contratos"
          />
      )}
      {vistaActiva === "contratos" && <VistaContratos />}
      {vistaActiva === "mi-area" && <VistaContratosArea />}
      {vistaActiva === "renovaciones" && <VistaRenovaciones />}
      {vistaActiva === "proveedores" && (
        <VistaProveedores
          puedeEditar={tieneCapacidad(idPerfil, CAPACIDADES.PROVEEDORES_GESTIONAR)}
        />
      )}
    </div>
  );
}
