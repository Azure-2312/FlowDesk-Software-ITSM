"use client";

import { useEffect, useState } from "react";

interface MetricasKcsData {
  totalArticulos: number;
  articulosEnRevision: number;
  totalBusquedas: number;
  totalDeflexiones: number;
  tasaDeflexionPct: number;
  totalReusoTickets: number;
  topArticulos: Array<{
    id_articulo: number;
    codigo_articulo: string;
    titulo: string;
    visitas: number;
    utilidad_positiva: number;
    utilidad_negativa: number;
    veces_utilizado_en_tickets: number;
  }>;
  gapsBusqueda: Array<{
    termino_busqueda: string;
    repeticiones: string;
    ultima_fecha: string;
  }>;
}

export default function VistaMetricasKcsSupervisor() {
  const [metricas, setMetricas] = useState<MetricasKcsData | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarMetricas() {
    setCargando(true);
    try {
      const res = await fetch("/api/conocimiento/metricas-kcs", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar analítica KCS");
      setMetricas(data);
    } catch (e: any) {
      setError(e.message || "Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMetricas();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Tablero de Calidad y Métricas KCS (Consortium for Service Innovation)
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Monitoreo del Solve Loop, tasa de desvío de tickets (Deflection Rate) y brechas de conocimiento sin respuesta.
          </p>
        </div>
        <button
          onClick={cargarMetricas}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
        >
          Actualizar Datos
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando métricas de conocimiento...</div>
      ) : metricas ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Tasa de Desvío (Deflection)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                  {metricas.tasaDeflexionPct}%
                </span>
                <span className="text-xs text-slate-500">tickets evitados</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {metricas.totalDeflexiones} de {metricas.totalBusquedas} búsquedas en portal resolvieron el problema sin crear ticket.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reutilización en Mesa (Solve Loop)
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {metricas.totalReusoTickets}
                </span>
                <span className="text-xs text-slate-500">veces vinculado</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Tickets cerrados por especialistas vinculando un artículo de conocimiento formal.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Artículos Publicados
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {metricas.totalArticulos}
                </span>
                <span className="text-xs text-slate-500">activos</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Base documental vigente clasificada según ISO 27001.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cola de Revisión Editorial
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                  {metricas.articulosEnRevision}
                </span>
                <span className="text-xs text-slate-500">pendientes</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Borradores enviados por técnicos a la espera de auditoría AQI del supervisor.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Brechas de Conocimiento (Búsquedas sin Resultados)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Términos que los usuarios buscaron y que la base no pudo responder. Prioridad alta para redacción.
                </p>
              </div>

              {metricas.gapsBusqueda.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No se registran brechas de búsqueda sin resultados.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {metricas.gapsBusqueda.map((gap, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {gap.termino_busqueda}
                        </span>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {gap.repeticiones} búsquedas fallidas
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Artículos con Mayor Impacto en Resolución
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Artículos más vinculados a tickets y con mayor tasa de utilidad confirmada.
                </p>
              </div>

              {metricas.topArticulos.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No hay artículos vinculados a tickets todavía.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {metricas.topArticulos.map((art) => (
                    <div key={art.id_articulo} className="py-2.5 flex items-center justify-between text-sm">
                      <div className="max-w-xs truncate">
                        <span className="text-xs font-mono font-bold text-blue-600 mr-2">
                          {art.codigo_articulo}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {art.titulo}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 font-semibold">
                          +{art.utilidad_positiva} útiles
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold">
                          {art.veces_utilizado_en_tickets} tickets
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
