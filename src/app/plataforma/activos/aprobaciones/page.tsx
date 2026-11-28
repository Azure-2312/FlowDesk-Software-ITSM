import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCentroAprobacionesBajas from "@/modules/activos/views/VistaCentroAprobacionesBajas";
import VistaRenovacionesLicencias from "@/modules/activos/views/VistaRenovacionesLicencias";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCentroAprobacionesBajas({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/activos/aprobaciones",
    resolvedParams?.vista
  );

  return (
    <div className="vista-contenedor" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/aprobaciones"
          />
      )}

      {vistaActiva === "renovaciones" ? (
        <VistaRenovacionesLicencias />
      ) : (
        <VistaCentroAprobacionesBajas
          key={vistaActiva}
          vistaInicial={vistaActiva as "pendientes" | "historial"}
        />
      )}
    </div>
  );
}
