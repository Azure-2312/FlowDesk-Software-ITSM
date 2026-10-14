"use client";

import React, { useState } from "react";

export interface ModalVistaPreviaProps {
  abierto: boolean;
  secciones: any[];
  tituloModulo?: string;
  onCerrar: () => void;
}

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto,
  secciones,
  tituloModulo = "Formulario ITSM",
  onCerrar,
}) => {
  const [impacto, setImpacto] = useState("2");
  const [urgencia, setUrgencia] = useState("2");

  if (!abierto) return null;

  const calcularPrioridad = (imp: string, urg: string) => {
    const i = parseInt(imp, 10);
    const u = parseInt(urg, 10);
    if (i === 3 && u === 3) return { codigo: "P1", nombre: "P1 - Critica", color: "bg-rose-100 text-rose-800 border-rose-300" };
    if ((i === 3 && u === 2) || (i === 2 && u === 3)) return { codigo: "P2", nombre: "P2 - Alta", color: "bg-orange-100 text-orange-800 border-orange-300" };
    if ((i === 2 && u === 2) || (i === 3 && u === 1) || (i === 1 && u === 3)) return { codigo: "P3", nombre: "P3 - Media", color: "bg-amber-100 text-amber-800 border-amber-300" };
    return { codigo: "P4", nombre: "P4 - Baja", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  const prioridadObj = calcularPrioridad(impacto, urgencia);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-slate-50 rounded-2xl shadow-2xl border border-slate-300 max-w-5xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Cabecera del modal */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold tracking-wide uppercase">
              Simulador Interactivo
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Vista Previa en Vivo: {tituloModulo}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            aria-label="Cerrar vista previa"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenedor del Formulario Real */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-xs text-slate-500">
              Complete los campos requeridos para evaluar la presentacion interactiva segun las reglas configuradas.
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Calculo de Prioridad:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border ${prioridadObj.color}`}>
                {prioridadObj.nombre}
              </span>
            </div>
          </div>

          {/* Secciones dinamicas segun configuracion */}
          {secciones.map((sec) => (
            <div
              key={sec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden"
            >
              <div
                className="px-5 py-3 border-b border-slate-100 flex items-center justify-between"
                style={{ borderLeftColor: sec.color || "#2563eb", borderLeftWidth: 4 }}
              >
                <span className="text-sm font-bold text-slate-800">{sec.titulo}</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {sec.campos?.filter((c: any) => c.visible).length || 0} campos visibles
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.campos
                  ?.filter((c: any) => c.visible)
                  .map((campo: any) => (
                    <div key={campo.id} className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>{campo.etiqueta || campo.nombre}</span>
                        {campo.obligatorio && <span className="text-rose-500 font-bold">*</span>}
                      </label>
                      <input
                        type="text"
                        disabled
                        placeholder={campo.placeholder || "Campo de ejemplo"}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pie del modal */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex justify-end rounded-b-2xl">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cerrar simulador
          </button>
        </div>
      </div>
    </div>
  );
};
