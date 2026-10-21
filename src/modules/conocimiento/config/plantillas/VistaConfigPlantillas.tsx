"use client";

import { useEffect, useState } from "react";

interface PlantillaKcs {
  id_plantilla: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  estructura_markdown: string;
  campos_obligatorios: string[];
  activo: boolean;
}

export default function VistaConfigPlantillas() {
  const [plantillas, setPlantillas] = useState<PlantillaKcs[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaKcs | null>(null);

  async function cargarPlantillas() {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/conocimiento/plantillas", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar plantillas KCS");
      setPlantillas(data.plantillas || []);
      if (data.plantillas && data.plantillas.length > 0) {
        setPlantillaSeleccionada(data.plantillas[0]);
      }
    } catch (e: any) {
      setError(e.message || "Error al conectar con el servidor");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPlantillas();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Plantillas de Redacción KCS Estandarizadas
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Estructuras predefinidas para homogeneizar la documentación técnica, agilizar la captura en la mesa y asegurar la calidad del contenido.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando plantillas KCS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Plantillas del Sistema
            </h2>
            <div className="space-y-2">
              {plantillas.map((p) => {
                const esActiva = plantillaSeleccionada?.id_plantilla === p.id_plantilla;
                return (
                  <button
                    key={p.id_plantilla}
                    type="button"
                    onClick={() => setPlantillaSeleccionada(p)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      esActiva
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-sm"
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {p.nombre}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                        {p.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {p.descripcion}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2">
            {plantillaSeleccionada ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Estructura Markdown: {plantillaSeleccionada.nombre}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Código: {plantillaSeleccionada.codigo}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    Activa
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Esqueleto Inicial Cargado al Redactor
                  </label>
                  <pre className="p-4 bg-slate-900 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed whitespace-pre-wrap">
                    {plantillaSeleccionada.estructura_markdown}
                  </pre>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Campos Obligatorios de Validación
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(plantillaSeleccionada.campos_obligatorios) &&
                      plantillaSeleccionada.campos_obligatorios.map((campo, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          {campo}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-slate-400 text-sm">
                Seleccione una plantilla para ver su estructura.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
