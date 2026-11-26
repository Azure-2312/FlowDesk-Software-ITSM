import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import VistaAuditoriaSistema from "@/modules/plataforma/config/auditoria-sistema/VistaAuditoriaSistema";
import VistaSeguridadLogs from "@/modules/plataforma/config/seguridad-logs/VistaSeguridadLogs";

interface PageProps {
  searchParams?: Promise<{ vista?: string }> | { vista?: string };
}

export default async function PaginaAuditoriaYAccesos({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/seguridad/auditoria-sistema",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/seguridad/auditoria-sistema"
          />
      )}
      {vistaActiva === "accesos" ? (
        <VistaSeguridadLogs />
      ) : (
        <VistaAuditoriaSistema />
      )}
    </div>
  );
}
