import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCredencialesApi from "@/modules/integraciones/views/VistaCredencialesApi";
import VistaBitacoraApi from "@/modules/integraciones/views/VistaBitacoraApi";
import VistaClientesExternos from "@/modules/integraciones/views/VistaClientesExternos";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

const URL_BASE = "/plataforma/seguridad/integraciones-api";

export default async function PaginaIntegracionesApi({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(URL_BASE, resolvedParams?.vista);

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista vistas={vistasPermitidas} vistaActiva={vistaActiva} urlBase={URL_BASE} />
      )}
      {vistaActiva === "bitacora" ? (
        <VistaBitacoraApi />
      ) : vistaActiva === "externos" ? (
        <VistaClientesExternos />
      ) : (
        <VistaCredencialesApi />
      )}
    </div>
  );
}
