"use client";

import React, { useState } from "react";

export interface DiffItem {
  tipo: "agregado" | "modificado" | "eliminado";
  campo: string;
  anterior?: any;
  nuevo?: any;
}

export interface ModalPublicacionProps {
  abierto: boolean;
  versionActual: number;
  diffs: DiffItem[];
  ticketsAbiertosAfectados: number;
  tituloModulo?: string;
  onConfirmar: (motivo: string) => Promise<void>;
  onCerrar: () => void;
}

export const ModalPublicacion: React.FC<ModalPublicacionProps> = ({
  abierto,
  versionActual,
  diffs,
  ticketsAbiertosAfectados,
  tituloModulo = "Proceso ITSM",
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
      setErrorLocal("El motivo debe tener al menos 10 caracteres y confirmar la revision del impacto.");
      return;
    }

    try {
      setEnviando(true);
      setErrorLocal("");
      await onConfirmar(motivo.trim());
      onCerrar();
    } catch (err: any) {
      setErrorLocal(err.message || "Error al publicar la version");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Publicar Nueva Version Oficial ({tituloModulo})
            </h3>
            <p className="text-xs text-slate-500">
              La publicacion creara la version v{versionActual + 1} de forma inmutable y con trazabilidad ISO 20000.
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
          >
            x
          </button>
        </div>

        {/* Resumen de cambios detectados */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Resumen de Cambios Frente a la Version v{versionActual}:
          </span>
          {diffs.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No se detectaron cambios estructurales o son ajustes menores.</p>
          ) : (
            <ul className="text-xs space-y-1 max-h-36 overflow-y-auto pr-1">
              {diffs.map((d, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      d.tipo === "agregado"
                        ? "bg-emerald-100 text-emerald-800"
                        : d.tipo === "eliminado"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {d.tipo}
                  </span>
                  <span className="font-semibold text-slate-700">{d.campo}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Advertencia de impacto en tickets abiertos */}
        {requiereCasillaImpacto && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
              <span>!</span>
              <span>Advertencia de Impacto Operativo</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Existen <strong>{ticketsAbiertosAfectados}</strong> expedientes abiertos que se rigen por la version anterior. La publicacion aplicara retroactivamente las reglas de validacion y transiciones modificadas.
            </p>
            <label className="flex items-start space-x-2 text-xs text-amber-950 font-medium cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={revisoImpacto}
                onChange={(e) => setRevisoImpacto(e.target.checked)}
                className="mt-0.5 rounded border-amber-400 text-blue-600 focus:ring-blue-500"
              />
              <span>He evaluado y confirmo el impacto sobre los tickets y expedientes en curso.</span>
            </label>
          </div>
        )}

        {/* Formulario de confirmacion con motivo obligatorio */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Motivo o Justificacion del Cambio (Obligatorio, min. 10 caracteres):
            </label>
            <textarea
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa el motivo tecnico o de negocio que sustenta esta nueva version..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 block text-right mt-1">
              {motivo.trim().length} / 10 caracteres minimos
            </span>
          </div>

          {errorLocal && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 p-2 rounded-lg">
              {errorLocal}
            </p>
          )}

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
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
            >
              {enviando ? "Publicando version..." : `Confirmar y Publicar v${versionActual + 1}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
