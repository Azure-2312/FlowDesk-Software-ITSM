import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaCabAgenda from "@/modules/cambios/views/VistaCabAgenda";
import VistaCabEmergencia from "@/modules/cambios/views/VistaCabEmergencia";
import VistaCambiosGestionCab from "@/modules/cambios/gestion/cab/VistaCambiosGestionCab";
import VistaCabMiembros from "@/modules/cambios/views/cab/VistaCabMiembros";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCambiosCab({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cambios/cab",
    resolvedParams?.vista
  );

  return (
    <div className="vista-contenedor" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-2 rounded-xl border border-slate-200 shadow-xs">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cambios/cab"
          />
        </div>
      )}
      {vistaActiva === "agenda" && <VistaCabAgenda />}
      {vistaActiva === "emergencia" && <VistaCabEmergencia />}
      {vistaActiva === "dictamen" && <VistaCambiosGestionCab />}
      {vistaActiva === "miembros" && <VistaCabMiembros />}
    </div>
  );
}
