"use client";

import { useEffect, useState } from "react";

interface PerfilItem {
  id_perfil: number;
  nombre: string;
  codigo: string;
}

interface PoliticasKCS {
  perfiles_redaccion: number[];
  perfiles_aprobacion: number[];
  requiere_aprobacion_previa: boolean;
  frecuencia_revision_dias: number;
  permitir_calificacion_csat: boolean;
}

export default function VistaConfigWorkflowEditorial() {
  const [politicas, setPoliticas] = useState<PoliticasKCS>({
    perfiles_redaccion: [1, 2, 4, 8],
    perfiles_aprobacion: [1, 4],
    requiere_aprobacion_previa: true,
    frecuencia_revision_dias: 90,
    permitir_calificacion_csat: true,
  });

  const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  async function cargarPoliticas() {
    setCargando(true);
    try {
      const res = await fetch("/api/conocimiento/politicas", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar políticas KCS");
      if (data.politicas) setPoliticas(data.politicas);
      if (data.perfiles) setPerfiles(data.perfiles);
    } catch (e: any) {
      setError(e.message || "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPoliticas();
  }, []);

  async function guardarPoliticas(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    setOk("");

    try {
      const res = await fetch("/api/conocimiento/politicas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(politicas),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudieron actualizar las políticas");
      setOk("Políticas del flujo editorial KCS guardadas y auditadas exitosamente.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardando(false);
    }
  }

  function togglePerfilRedaccion(id: number) {
    setPoliticas((prev) => {
      const existe = prev.perfiles_redaccion.includes(id);
      return {
        ...prev,
        perfiles_redaccion: existe
          ? prev.perfiles_redaccion.filter((x) => x !== id)
          : [...prev.perfiles_redaccion, id],
      };
    });
  }

  function togglePerfilAprobacion(id: number) {
    setPoliticas((prev) => {
      const existe = prev.perfiles_aprobacion.includes(id);
      return {
        ...prev,
        perfiles_aprobacion: existe
          ? prev.perfiles_aprobacion.filter((x) => x !== id)
          : [...prev.perfiles_aprobacion, id],
      };
    });
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Flujo Editorial y Aprobación KCS
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Reglas de revisión, compuertas de publicación y asignación de roles editoriales según la metodología KCS v6.
        </p>
      </div>

      {ok && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm">
          {ok}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {cargando ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando configuración editorial...</div>
      ) : (
        <form onSubmit={guardarPoliticas} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Compuerta de Aprobación Previa
            </h2>
            <div className="flex items-start gap-3">
              <input
                id="check-aprobacion"
                type="checkbox"
                checked={politicas.requiere_aprobacion_previa}
                onChange={(e) =>
                  setPoliticas((prev) => ({ ...prev, requiere_aprobacion_previa: e.target.checked }))
                }
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <label htmlFor="check-aprobacion" className="text-sm font-semibold text-slate-900 dark:text-white">
                  Exigir aprobación técnica obligatoria antes de publicar
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Si está activado, los artículos creados por técnicos resolutores entrarán al estado EN_REVISION y requerirán validación de un supervisor o KCS Coach antes de ser visibles en el catálogo general.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Perfiles con Autoridad de Redacción (Autores)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seleccione los perfiles facultados para redactar borradores y proponer artículos de conocimiento.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {perfiles.map((p) => (
                <label
                  key={p.id_perfil}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={politicas.perfiles_redaccion.includes(p.id_perfil)}
                    onChange={() => togglePerfilRedaccion(p.id_perfil)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{p.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Perfiles con Autoridad de Aprobación y Publicación
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perfiles autorizados para revisar, dictaminar cambios, calificar calidad AQI y publicar oficialmente artículos.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {perfiles.map((p) => (
                <label
                  key={p.id_perfil}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-sm cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800/80 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={politicas.perfiles_aprobacion.includes(p.id_perfil)}
                    onChange={() => togglePerfilAprobacion(p.id_perfil)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium">{p.nombre}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={guardando}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {guardando ? "Guardando políticas..." : "Guardar Políticas Editoriales"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
