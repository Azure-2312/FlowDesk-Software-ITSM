"use client";

import React, { useState } from "react";

export interface ModalRestaurarFabricaProps {
  abierto: boolean;
  onConfirmar: () => Promise<void>;
  onCerrar: () => void;
  tituloModulo?: string;
}

export const ModalRestaurarFabrica: React.FC<ModalRestaurarFabricaProps> = ({
  abierto,
  onConfirmar,
  onCerrar,
  tituloModulo = "Proceso ITSM",
}) => {
  const [palabra, setPalabra] = useState("");
  const [procesando, setProcesando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  if (!abierto) return null;

  const esValido = palabra === "RESTAURAR";

  const handleConfirmar = async () => {
    if (!esValido) {
      setErrorLocal("Debe escribir exactamente RESTAURAR en mayusculas.");
      return;
    }

    try {
      setProcesando(true);
      setErrorLocal("");
      await onConfirmar();
      onCerrar();
    } catch (err: any) {
      setErrorLocal(err.message || "Error al restaurar valores de fabrica");
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-rose-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center space-x-3 text-rose-600">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center font-bold text-lg">
            !
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Restaurar Valores de Fabrica</h3>
            <p className="text-xs text-rose-700 font-medium">{tituloModulo} - Accion critica de reconfiguracion</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Esta accion reemplazara la configuracion actual de la pestana por la plantilla institucional de fabrica de ITIL 4. El borrador actual se sobrescribira por completo.
        </p>

        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 space-y-2">
          <label className="block text-xs font-semibold text-rose-900">
            Para confirmar, escriba la palabra <span className="font-mono font-bold tracking-widest bg-rose-200/80 px-1 py-0.5 rounded">RESTAURAR</span>:
          </label>
          <input
            type="text"
            value={palabra}
            onChange={(e) => setPalabra(e.target.value)}
            placeholder="RESTAURAR"
            className="w-full text-xs font-mono rounded border border-rose-300 px-3 py-2 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase"
          />
        </div>

        {errorLocal && (
          <p className="text-xs text-rose-600 font-medium">{errorLocal}</p>
        )}

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onCerrar}
            disabled={procesando}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!esValido || procesando}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition"
          >
            {procesando ? "Restaurando..." : "Confirmar Restauracion"}
          </button>
        </div>
      </div>
    </div>
  );
};
