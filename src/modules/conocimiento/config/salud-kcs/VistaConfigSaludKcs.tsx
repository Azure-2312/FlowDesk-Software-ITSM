"use client";

import { useState } from "react";

export default function VistaConfigSaludKcs() {
  const [frecuenciaDias, setFrecuenciaDias] = useState(90);
  const [umbralNegativo, setUmbralNegativo] = useState(3);
  const [exigirAqi, setExigirAqi] = useState(true);
  const [ok, setOk] = useState("");
  const [guardando, setGuardando] = useState(false);

  function guardarParametrosSalud(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setOk("");

    setTimeout(() => {
      setGuardando(false);
      setOk("Parámetros de Salud KCS y ciclo de recertificación actualizados correctamente.");
    }, 400);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Salud del Contenido, Obsolescencia y Calidad KCS (Evolve Loop)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Reglas automatizadas para evitar artículos obsoletos, detectar contenido defectuoso y auditar la calidad mediante el Article Quality Index (AQI).
        </p>
      </div>

      {ok && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm">
          {ok}
        </div>
      )}

      <form onSubmit={guardarParametrosSalud} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Ciclo de Recertificación Periódica
          </h2>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Frecuencia Máxima de Revisión Obligatoria (Días)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={30}
                max={365}
                value={frecuenciaDias}
                onChange={(e) => setFrecuenciaDias(Number(e.target.value))}
                className="w-36 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                días desde la última publicación o actualización (Recomendado KCS: 90 a 180 días).
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Los artículos que superen este plazo se marcarán con el badge "Pendiente de Recertificación" y generarán una tarea de verificación para su autor original.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Umbral de Alerta por Feedback Negativo
          </h2>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Cantidad de Votos Negativos Consecutivos para Alerta
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={20}
                value={umbralNegativo}
                onChange={(e) => setUmbralNegativo(Number(e.target.value))}
                className="w-36 px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                votos de insatisfacción acumulados sin votos positivos compensatorios.
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              Al alcanzar este umbral, el artículo se envía de forma preventiva a la bandeja de revisión del supervisor para corregir la solución o despublicar si ya no es aplicable.
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Índice de Calidad del Artículo (AQI - Article Quality Index)
          </h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={exigirAqi}
              onChange={(e) => setExigirAqi(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Habilitar checklist de auditoría AQI en revisiones editoriales
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exige que el supervisor marque la conformidad de los 4 criterios KCS (claridad de síntoma, completitud del entorno, precisión de solución y ausencia de datos confidenciales) antes de autorizar la publicación.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar Parámetros de Salud KCS"}
          </button>
        </div>
      </form>
    </div>
  );
}
