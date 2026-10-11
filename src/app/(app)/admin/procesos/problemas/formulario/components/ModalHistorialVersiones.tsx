"use client";

import React, { useState } from "react";

interface VersionItem {
  id_version: number;
  numero_version: number;
  fecha_creacion: string;
  autor_nombre?: string;
  motivo_cambio?: string;
  snapshot: any;
}

interface ModalHistorialVersionesProps {
  abierto: boolean;
  versiones: VersionItem[];
  versionActual: number;
  onRestaurarComoBorrador: (version: VersionItem) => void;
  onCerrar: () => void;
}

export const ModalHistorialVersiones: React.FC<ModalHistorialVersionesProps> = ({
  abierto,
  versiones,
  versionActual,
  onRestaurarComoBorrador,
  onCerrar,
}) => {
  const [versionSeleccionada, setVersionSeleccionada] = useState<VersionItem | null>(null);
  const [modoComparacion, setModoComparacion] = useState(false);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Cabecera del Panel Lateral */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">Historial Inmutable de Versiones</h3>
            <p className="text-xs text-slate-500">Registro histórico de publicaciones auditadas (ISO 20000 / ITIL 4)</p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {versionSeleccionada ? (
            /* Vista de detalle de versión o comparación */
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setVersionSeleccionada(null);
                    setModoComparacion(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>← Volver al listado</span>
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => onRestaurarComoBorrador(versionSeleccionada)}
                    className="px-3 py-1 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 transition"
                  >
                    Restaurar como borrador
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900">Versión v{versionSeleccionada.numero_version}</span>
                  <span className="text-slate-500">
                    {new Date(versionSeleccionada.fecha_creacion).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-700">
                  <strong>Autor:</strong> {versionSeleccionada.autor_nombre || "Administrador del Sistema"}
                </p>
                <p className="text-slate-700">
                  <strong>Motivo:</strong> {versionSeleccionada.motivo_cambio || "Sin motivo registrado"}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Snapshot de Configuración (JSON)
                </label>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[11px] overflow-x-auto max-h-96 font-mono">
                  {JSON.stringify(versionSeleccionada.snapshot, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            /* Listado cronológico de versiones */
            <div className="space-y-3">
              {versiones.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No existen versiones publicadas previamente.
                </div>
              ) : (
                versiones.map((ver) => (
                  <div
                    key={ver.id_version}
                    className={`p-3 rounded-xl border transition ${
                      ver.numero_version === versionActual
                        ? "border-blue-300 bg-blue-50/50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">
                            Versión v{ver.numero_version}
                          </span>
                          {ver.numero_version === versionActual && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                              Vigente
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(ver.fecha_creacion).toLocaleString()} por{" "}
                          {ver.autor_nombre || "Administrador"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setVersionSeleccionada(ver)}
                          className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition"
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          onClick={() => onRestaurarComoBorrador(ver)}
                          title="Carga los datos de esta versión en el borrador editable sin publicar directamente"
                          className="px-2 py-1 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition"
                        >
                          Restaurar borrador
                        </button>
                      </div>
                    </div>

                    {ver.motivo_cambio && (
                      <p className="text-xs text-slate-700 mt-2 bg-white/70 p-2 rounded border border-slate-100 italic">
                        "{ver.motivo_cambio}"
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pie del Panel */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition"
          >
            Cerrar panel
          </button>
        </div>
      </div>
    </div>
  );
};
