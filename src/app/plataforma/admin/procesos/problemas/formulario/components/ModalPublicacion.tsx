"use client";

import React, { useState } from "react";

interface DiffItem {
  tipo: "agregado" | "modificado" | "eliminado";
  campo: string;
  anterior?: any;
  nuevo?: any;
}

interface ModalPublicacionProps {
  abierto: boolean;
  versionActual: number;
  diffs: DiffItem[];
  ticketsAbiertosAfectados: number;
  onConfirmar: (motivo: string) => Promise<void>;
  onCerrar: () => void;
}

export const ModalPublicacion: React.FC<ModalPublicacionProps> = ({
  abierto,
  versionActual,
  diffs,
  ticketsAbiertosAfectados,
  onConfirmar,
  onCerrar,
}) => {
  const [motivo, setMotivo] = useState("");
  const [revisoImpacto, setRevisoImpacto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  if (!abierto) return null;

  const requiereCasillaImpacto = ticketsAbiertosAfectados > 0;
  const motivoValido = motivo.trim().length >= 10;
  const formularioValido = motivoValido && (!requiereCasillaImpacto || revisoImpacto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido) {
      setErrorLocal("El motivo debe tener al menos 10 caracteres y confirmar la revisión del impacto.");
      return;
    }

    try {
      setEnviando(true);
      setErrorLocal("");
      await onConfirmar(motivo.trim());
      onCerrar();
    } catch (err: any) {
      setErrorLocal(err.message || "Error al publicar la versión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Publicar Nueva Versión Oficial (v{versionActual + 1})</h3>
            <p className="text-xs text-slate-500">
              Esta acción creará una versión inmutable y aplicará los cambios al entorno institucional de inmediato.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Resumen de Diferencias (Diff) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Resumen de Diferencias (Diff contra v{versionActual})
          </label>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2 text-xs">
            {diffs.length === 0 ? (
              <p className="text-slate-500 italic">No se detectaron diferencias estructurales con la versión previa.</p>
            ) : (
              diffs.map((d, idx) => (
                <div key={idx} className="flex items-start space-x-2 py-1 border-b border-slate-200/60 last:border-0">
                  {d.tipo === "agregado" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      + AGREGADO
                    </span>
                  )}
                  {d.tipo === "modificado" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      ~ MODIFICADO
                    </span>
                  )}
                  {d.tipo === "eliminado" && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      - ELIMINADO
                    </span>
                  )}
                  <div className="flex-1 text-slate-700">
                    <span className="font-semibold text-slate-900">{d.campo}:</span>{" "}
                    {d.tipo === "modificado" ? (
                      <span>
                        <span className="text-rose-600 line-through mr-1">
                          {typeof d.anterior === "object" ? JSON.stringify(d.anterior) : String(d.anterior)}
                        </span>
                        {" → "}
                        <span className="text-emerald-700 font-medium">
                          {typeof d.nuevo === "object" ? JSON.stringify(d.nuevo) : String(d.nuevo)}
                        </span>
                      </span>
                    ) : (
                      <span>{typeof d.nuevo === "object" ? JSON.stringify(d.nuevo) : String(d.nuevo || d.anterior)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Análisis de Impacto */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-start space-x-3 text-xs text-blue-900">
          <div className="font-bold text-base text-blue-700">ℹ</div>
          <div>
            <span className="font-semibold">Análisis de impacto operativo: </span>
            {ticketsAbiertosAfectados > 0 ? (
              <span>
                Esta publicación alcanza o modifica reglas en <strong className="font-bold underline">{ticketsAbiertosAfectados}</strong> tickets de problema actualmente abiertos. Los campos nuevos solo se exigirán al editarlos o ejecutar transiciones.
              </span>
            ) : (
              <span>No existen tickets de problema abiertos afectados directamente por esta modificación.</span>
            )}
          </div>
        </div>

        {/* Formulario de confirmación */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Motivo del cambio <span className="text-rose-600">*</span> (mínimo 10 caracteres)
            </label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
              placeholder="Describa el fundamento técnico o normativo del ajuste (ej: Actualización de categorías para auditoría ISO 20000)..."
              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-0.5">
              <span>Mínimo 10 caracteres obligatorios</span>
              <span className={motivo.length < 10 ? "text-amber-600 font-medium" : "text-emerald-600 font-medium"}>
                {motivo.length} / 10
              </span>
            </div>
          </div>

          {requiereCasillaImpacto && (
            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer p-2 bg-slate-50 rounded border border-slate-200">
              <input
                type="checkbox"
                checked={revisoImpacto}
                onChange={(e) => setRevisoImpacto(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">
                He revisado el impacto sobre los {ticketsAbiertosAfectados} tickets abiertos y confirmo la aplicación.
              </span>
            </label>
          )}

          {errorLocal && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2 rounded border border-rose-200">
              {errorLocal}
            </p>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onCerrar}
              disabled={enviando}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formularioValido || enviando}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
            >
              {enviando ? "Publicando..." : "Confirmar publicación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
