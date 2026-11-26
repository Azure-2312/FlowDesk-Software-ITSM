import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import {
  VistaReportesOperativos,
  VistaReportesArea,
  VistaInformeSupervision,
} from "@/modules/reportes/ui";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaReportesOperativos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/reportes/operativos",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/reportes/operativos"
          />
      )}
      {vistaActiva === "supervision" ? (
        <VistaInformeSupervision />
      ) : vistaActiva === "area" ? (
        <VistaReportesArea />
      ) : (
        <VistaReportesOperativos />
      )}
    </div>
  );
}
