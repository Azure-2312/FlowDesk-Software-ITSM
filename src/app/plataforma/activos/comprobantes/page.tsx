import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import ComprobantesWorkspace, { type ModoComprobantes } from "@/modules/facturacion/components/ComprobantesWorkspace";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

// Comprobantes electrónicos de proveedores (SUNAT vía fact_api).
// Misma información para todos; la pestaña autorizada al perfil define alcance y acciones.
export default async function PaginaComprobantes({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/comprobantes",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista vistas={vistasPermitidas} vistaActiva={vistaActiva} urlBase="/plataforma/activos/comprobantes" />
      )}
      <ComprobantesWorkspace key={vistaActiva} modo={vistaActiva as ModoComprobantes} />
    </div>
  );
}
