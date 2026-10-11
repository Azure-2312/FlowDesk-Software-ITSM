"use client";

import React, { useState } from "react";

interface ModalVistaPreviaProps {
  abierto: boolean;
  secciones: any[];
  onCerrar: () => void;
}

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto,
  secciones,
  onCerrar,
}) => {
  const [origenSeleccionado, setOrigenSeleccionado] = useState("incidente_recurrente");
  const [impacto, setImpacto] = useState("2");
  const [urgencia, setUrgencia] = useState("2");
  const [titulo, setTitulo] = useState("");
  const [workaround, setWorkaround] = useState("");

  if (!abierto) return null;

  // Cálculo de prioridad P1-P4
  const calcularPrioridad = (imp: string, urg: string) => {
    const i = parseInt(imp, 10);
    const u = parseInt(urg, 10);
    if (i === 3 && u === 3) return { codigo: "P1", nombre: "P1 - Crítica", color: "bg-rose-100 text-rose-800 border-rose-300" };
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
              Vista Previa en Vivo: Formulario de Registro de Problema
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

        {/* Contenedor del Formulario Real (Sección 4 de la spec) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Barra superior con selector de plantilla */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500">
              Complete los campos requeridos para la investigación proactiva o reactiva de la causa raíz.
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Usar plantilla predefinida:</span>
              <select className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium">
                <option>Seleccione una plantilla...</option>
                <option>Problema recurrente de incidentes (ITIL 4)</option>
                <option>Problema proactivo - análisis de tendencias</option>
                <option>Falla de proveedor o tercero</option>
              </select>
            </div>
          </div>

          {/* Secciones dinámicas según configuración */}
          {secciones.map((sec) => (
            <div
              key={sec.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Encabezado de sección */}
              <div
                className="px-5 py-3 border-b border-slate-100 flex items-center justify-between"
                style={{ borderLeftColor: sec.color || "#2563eb", borderLeftWidth: 4 }}
              >
                <span className="text-sm font-bold text-slate-800">{sec.titulo}</span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {sec.campos?.filter((c: any) => c.visible).length || 0} campos visibles
                </span>
              </div>

              {/* Campos de la sección */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sec.campos
                  ?.filter((c: any) => c.visible)
                  .map((campo: any) => {
                    const esAnchoCompleto = campo.ancho === "completo";
                    const esMedioAncho = campo.ancho === "1/2";
                    const colSpan = esAnchoCompleto
                      ? "col-span-full"
                      : esMedioAncho
                      ? "col-span-full md:col-span-2 lg:col-span-2"
                      : "col-span-1";

                    return (
                      <div key={campo.codigo} className={`${colSpan} space-y-1.5`}>
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-slate-700">
                            {campo.etiqueta}
                            {campo.obligatorio === "si" && (
                              <span className="text-rose-600 ml-0.5">*</span>
                            )}
                            {campo.obligatorio === "condicional" && (
                              <span className="text-amber-600 ml-0.5" title="Obligatorio condicional">*</span>
                            )}
                          </label>
                          {campo.ayuda && (
                            <span
                              className="text-[10px] text-slate-400 hover:text-slate-600 cursor-help"
                              title={campo.ayuda}
                            >
                              ⓘ
                            </span>
                          )}
                        </div>

                        {/* Renderizado de Control específico */}
                        {campo.codigo === "titulo" && (
                          <div>
                            <input
                              type="text"
                              value={titulo}
                              onChange={(e) => setTitulo(e.target.value)}
                              placeholder={campo.placeholder || "Título claro del problema..."}
                              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {titulo.length > 3 && (
                              <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                                <strong>Detección de duplicados:</strong> 0 problemas similares encontrados en los últimos 90 días.
                              </div>
                            )}
                          </div>
                        )}

                        {campo.codigo === "descripcion" && (
                          <textarea
                            rows={3}
                            placeholder={campo.placeholder || "Síntomas observados..."}
                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}

                        {campo.codigo === "origen" && (
                          <select
                            value={origenSeleccionado}
                            onChange={(e) => setOrigenSeleccionado(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="incidente_recurrente">Incidente(s) recurrente(s)</option>
                            <option value="incidente_mayor">Incidente mayor</option>
                            <option value="deteccion_proactiva">Detección proactiva</option>
                            <option value="tendencias">Análisis de tendencias</option>
                            <option value="proveedor">Notificación de proveedor</option>
                            <option value="monitoreo">Evento de monitoreo</option>
                          </select>
                        )}

                        {campo.codigo === "incidentes_vinculados" && (
                          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                            <input
                              type="text"
                              placeholder="Buscar incidentes por ID, título o servicio..."
                              className="w-full text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-700"
                            />
                            <div className="flex flex-wrap gap-1 text-[11px]">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                                INC-2026-0042 (Crítico - Red Caída)
                                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-medium">
                                INC-2026-0051 (Alta - Timeout BD)
                                <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                              </span>
                            </div>
                          </div>
                        )}

                        {campo.codigo === "impacto" && (
                          <select
                            value={impacto}
                            onChange={(e) => setImpacto(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="3">Alta (Servicio crítico / &gt;100 usuarios)</option>
                            <option value="2">Media (Degradación parcial de servicio)</option>
                            <option value="1">Baja (Afectación accesoria o menor)</option>
                          </select>
                        )}

                        {campo.codigo === "urgencia" && (
                          <select
                            value={urgencia}
                            onChange={(e) => setUrgencia(e.target.value)}
                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="3">Alta (Incidentes bloqueantes activos)</option>
                            <option value="2">Media (Incidentes concurrentes moderados)</option>
                            <option value="1">Baja (Sin recurrencia inmediata)</option>
                          </select>
                        )}

                        {campo.codigo === "prioridad" && (
                          <div className="flex items-center space-x-2 pt-1">
                            <span
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold tracking-wide ${prioridadObj.color}`}
                            >
                              {prioridadObj.nombre}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              (Cálculo automático matriz ITIL)
                            </span>
                          </div>
                        )}

                        {campo.codigo === "workaround" && (
                          <div>
                            <textarea
                              rows={2}
                              value={workaround}
                              onChange={(e) => setWorkaround(e.target.value)}
                              placeholder="Solución temporal paso a paso..."
                              className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {workaround.trim().length > 0 && (
                              <label className="flex items-center space-x-2 mt-1.5 text-xs text-emerald-800 font-medium cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded text-emerald-600" />
                                <span>Publicar directamente como Error Conocido (KEDB) al registrar</span>
                              </label>
                            )}
                          </div>
                        )}

                        {/* Controles genéricos para otros campos */}
                        {![
                          "titulo",
                          "descripcion",
                          "origen",
                          "incidentes_vinculados",
                          "impacto",
                          "urgencia",
                          "prioridad",
                          "workaround",
                        ].includes(campo.codigo) && (
                          <input
                            type="text"
                            placeholder={campo.placeholder || `Ingrese ${campo.etiqueta.toLowerCase()}...`}
                            className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 bg-slate-50"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}

          {/* Panel Informativo de SLA y Objetivos */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Objetivos OLA de la Prioridad {prioridadObj.codigo}
              </span>
              <p className="text-xs text-blue-700">
                Límites configurados para diagnóstico y mitigación definitiva del problema.
              </p>
            </div>
            <div className="flex space-x-4 text-xs font-semibold">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-slate-800">
                Diagnóstico: <span className="text-blue-700 font-bold">24 horas</span>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-slate-800">
                Resolución: <span className="text-blue-700 font-bold">72 horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie con los 4 botones reglamentarios (Sección 4.2) */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
          <button
            type="button"
            onClick={onCerrar}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            Cerrar Vista Previa
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled
              tabIndex={-1}
              title="Vista previa - Botón no interactivo"
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg opacity-60 cursor-not-allowed pointer-events-none"
            >
              Guardar como borrador
            </button>
            <button
              type="button"
              disabled
              tabIndex={-1}
              title="Vista previa - Botón no interactivo"
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg opacity-60 cursor-not-allowed pointer-events-none"
            >
              Registrar y crear otro
            </button>
            <button
              type="button"
              disabled
              tabIndex={-1}
              title="Vista previa - Botón no interactivo"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg shadow-sm opacity-60 cursor-not-allowed pointer-events-none"
            >
              Registrar problema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
