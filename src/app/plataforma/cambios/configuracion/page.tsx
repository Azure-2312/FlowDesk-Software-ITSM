import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaFormularioCambio from "@/modules/cambios/config/formulario/VistaFormularioCambio";
import VistaTiposRequisitos from "@/modules/cambios/config/tipos-requisitos/VistaTiposRequisitos";
import VistaNotificacionesCalendario from "@/modules/cambios/config/notificaciones-calendario/VistaNotificacionesCalendario";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaCambiosConfiguracion({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/cambios/configuracion",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <div className="bg-white px-6 pt-4 rounded-xl border border-slate-200 shadow-sm">
          <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/cambios/configuracion"
          />
        </div>
      )}
      {vistaActiva === "campos" && <VistaFormularioCambio pestanaFija="campos" />}
      {vistaActiva === "listas" && <VistaFormularioCambio pestanaFija="catalogos" />}
      {vistaActiva === "riesgo" && <VistaFormularioCambio pestanaFija="cuestionario_riesgo" />}
      {vistaActiva === "autoridad" && <VistaTiposRequisitos pestanaFija="matriz_autoridad" />}
      {vistaActiva === "calendario" && <VistaNotificacionesCalendario />}
    </div>
  );
}
