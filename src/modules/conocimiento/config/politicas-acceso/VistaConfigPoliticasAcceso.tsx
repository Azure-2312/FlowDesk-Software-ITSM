"use client";

import { useState } from "react";

export default function VistaConfigPoliticasAcceso() {
  const [ok, setOk] = useState("");
  const [bloquearComandosSensibles, setBloquearComandosSensibles] = useState(true);
  const [exigirClasificacion, setExigirClasificacion] = useState(true);
  const [permitirDescargaPublica, setPermitirDescargaPublica] = useState(false);
  const [guardando, setGuardando] = useState(false);

  async function guardarPoliticas(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setOk("");

    // Simulación de persistencia de políticas de seguridad
    setTimeout(() => {
      setGuardando(false);
      setOk("Políticas de seguridad y acceso ISO 27001 actualizadas correctamente.");
    }, 500);
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Políticas de Acceso y Seguridad de la Información (ISO/IEC 27001)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Directrices de clasificación de confidencialidad, segregación de audiencias y prevención de fuga de datos en artículos técnicos.
        </p>
      </div>

      {ok && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm">
          {ok}
        </div>
      )}

      <form onSubmit={guardarPoliticas} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Niveles Oficiales de Clasificación de Artículos
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  PUBLICO
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Autoservicio y Solicitantes</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Visible para todos los colaboradores de la empresa en el portal de autoservicio. No debe contener direcciones IP internas, contraseñas, comandos de backend ni nombres de servidores.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                  INTERNO TI
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Uso Operativo Exclusivo para Resolutores</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Visible únicamente para técnicos, supervisores y administradores. Contiene guías de diagnóstico profundo, comandos de consola, scripts de reparación y topología de red.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-xs font-bold rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                  CONFIDENCIAL
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">Gestores, Aprobadores y Auditoría</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Procedimientos críticos de recuperación ante desastres (DRP), llaves maestras de cifrado o documentación de auditoría reservada.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Controles de Seguridad Automatizados
          </h2>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={exigirClasificacion}
                onChange={(e) => setExigirClasificacion(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Exigir asignación obligatoria de clasificación de seguridad al crear o editar
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Impide guardar artículos sin clasificar formalmente su nivel de audiencia y sensibilidad de datos.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={bloquearComandosSensibles}
                onChange={(e) => setBloquearComandosSensibles(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Inspección y advertencia contra exposición accidental de secretos (DLP)
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detecta cadenas que coincidan con llaves privadas SSH, tokens API o contraseñas en artículos clasificados como PUBLICO.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={permitirDescargaPublica}
                onChange={(e) => setPermitirDescargaPublica(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  Permitir exportación en PDF de artículos clasificados como INTERNO TI
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Si está deshabilitado, los artículos técnicos solo pueden consultarse en pantalla para prevenir exfiltración de manuales.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={guardando}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar Políticas de Seguridad"}
          </button>
        </div>
      </form>
    </div>
  );
}
