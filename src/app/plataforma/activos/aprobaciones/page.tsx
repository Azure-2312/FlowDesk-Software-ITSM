import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCentroAprobacionesBajas from "@/modules/activos/views/VistaCentroAprobacionesBajas";

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
        <div className="bg-white px-6 pt-2 rounded-xl border border-slate-200 shadow-xs">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/activos/aprobaciones"
          />
        </div>
      )}

      <VistaCentroAprobacionesBajas
        vistaInicial={vistaActiva as "pendientes" | "historial"}
      />
    </div>
  );
}
