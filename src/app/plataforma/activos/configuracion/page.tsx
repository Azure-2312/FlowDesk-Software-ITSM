import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaTiposModelosAtributos from "@/modules/activos/config/tipos-modelos-atributos/VistaTiposModelosAtributos";
import VistaConfiguracionFacturacion from "@/modules/facturacion/views/VistaConfiguracionFacturacion";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaActivosConfiguracion({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/configuracion",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/configuracion"
          />
      )}
      {vistaActiva === "facturacion" ? (
        <VistaConfiguracionFacturacion />
      ) : (
        // key: cada pestaña monta su propia instancia; sin ella React reutiliza el
        // componente y conserva la subpestaña anterior (p. ej. "Atributos por tipo").
        <VistaTiposModelosAtributos key={vistaActiva} vistaActivaN1={vistaActiva} />
      )}
    </div>
  );
}
