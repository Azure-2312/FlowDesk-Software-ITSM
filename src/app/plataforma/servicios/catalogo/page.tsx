import { Suspense } from "react";
import { exigirVistaPagina } from "@/shared/lib/vistas";
import PestanasVista from "@/shared/components/ui/PestanasVista";
import PaginaCatalogo from "@/modules/servicios/catalogo/VistaCatalogoServicios";
import { VistaCatalogoServicios } from "@/modules/servicios/config/servicios/page";
import GestionCategorias from "@/modules/servicios/config/servicios/GestionCategorias";

interface PageProps {
  searchParams?: Promise<{ vista?: string; tipo?: string; [key: string]: any }> | { vista?: string; tipo?: string; [key: string]: any };
}

export default async function PaginaServiciosCatalogo({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const { vistaActiva, vistasPermitidas } = await exigirVistaPagina(
    "/plataforma/servicios/catalogo",
    resolvedParams?.vista
  );

  return (
    <div className="space-y-4">
      {vistasPermitidas.length > 1 && (
        <PestanasVista
            vistas={vistasPermitidas}
            vistaActiva={vistaActiva}
            urlBase="/plataforma/servicios/catalogo"
          />
      )}

      {vistaActiva === "explorar" && (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando catálogo...</div>}>
          <PaginaCatalogo />
        </Suspense>
      )}

      {vistaActiva === "administrar-incidentes" && (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando servicios de incidentes...</div>}>
          <VistaCatalogoServicios tipoForzado={1} />
        </Suspense>
      )}

      {vistaActiva === "administrar-solicitudes" && (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando servicios de solicitudes...</div>}>
          <VistaCatalogoServicios tipoForzado={2} />
        </Suspense>
      )}

      {vistaActiva === "crear" && (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Cargando asistente de creación...</div>}>
          <VistaCatalogoServicios vistaForzada="nuevo" />
        </Suspense>
      )}

      {vistaActiva === "categorias" && (
        <div className="vista-contenedor">
          <GestionCategorias />
        </div>
      )}
    </div>
  );
}
