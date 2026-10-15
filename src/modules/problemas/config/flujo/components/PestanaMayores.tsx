"use client";

import React, { useState } from "react";

export interface CriterioMayor {
  id_criterio: number;
  nombre: string;
  tipo: string;
  parametros?: any;
  activo: boolean;
}

export interface ConfigMayor {
  aplicar_paquete_tareas: boolean;
  exigir_revision_cierre: boolean;
  plazo_revision_dias: number;
  participantes_roles?: string[];
  aprobacion_cierre_perfil?: number;
  notificar_direccion_al_detectar: boolean;
  notificar_direccion_al_cerrar: boolean;
  generar_informe_pdf: boolean;
  plantilla_preguntas: any[];
}

interface PestanaMayoresProps {
  criterios: CriterioMayor[];
  config: ConfigMayor;
  perfiles: any[];
  puedeEditar: boolean;
  onActualizarConfig: (datos: Partial<ConfigMayor>) => Promise<void>;
}

export const PestanaMayores: React.FC<PestanaMayoresProps> = ({
  criterios,
  config,
  perfiles,
  puedeEditar,
  onActualizarConfig,
}) => {
  const [aplicarPaquete, setAplicarPaquete] = useState(config.aplicar_paquete_tareas ?? true);
  const [exigirRevision, setExigirRevision] = useState(config.exigir_revision_cierre ?? true);
  const [plazoDias, setPlazoDias] = useState(config.plazo_revision_dias || 10);
  const [notifDetectar, setNotifDetectar] = useState(config.notificar_direccion_al_detectar ?? true);
  const [notifCerrar, setNotifCerrar] = useState(config.notificar_direccion_al_cerrar ?? true);
  const [generarPdf, setGenerarPdf] = useState(config.generar_informe_pdf ?? true);
  const [preguntas, setPreguntas] = useState<any[]>(
    config.plantilla_preguntas || [
      { id: "q1", pregunta: "¿Qué ocurrió y cuál fue el impacto en el negocio?", tipo: "texto_largo", obligatoria: true },
      { id: "q2", pregunta: "Cronología detallada de la ocurrencia e investigación", tipo: "cronologia", obligatoria: true },
      { id: "q3", pregunta: "Causa raíz confirmada", tipo: "texto_largo", obligatoria: true },
      { id: "q4", pregunta: "¿Qué funcionó bien durante la atención?", tipo: "texto_largo", obligatoria: true },
      { id: "q5", pregunta: "¿Qué aspectos deben mejorar para evitar recurrencias?", tipo: "texto_largo", obligatoria: true },
      { id: "q6", pregunta: "Acciones preventivas acordadas", tipo: "tabla_acciones", obligatoria: true },
      { id: "q7", pregunta: "¿Se actualizó la CMDB?", tipo: "si_no", obligatoria: true },
      { id: "q8", pregunta: "¿Se publicó conocimiento o lecciones aprendidas?", tipo: "si_no", obligatoria: true },
    ]
  );

  const [modalProbar, setModalProbar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setMensajeExito("");

      await onActualizarConfig({
        aplicar_paquete_tareas: aplicarPaquete,
        exigir_revision_cierre: exigirRevision,
        plazo_revision_dias: plazoDias,
        notificar_direccion_al_detectar: notifDetectar,
        notificar_direccion_al_cerrar: notifCerrar,
        generar_informe_pdf: generarPdf,
        plantilla_preguntas: preguntas,
      });

      setMensajeExito("Gobernanza de problemas mayores guardada con éxito.");
    } catch (err: any) {
      alert(err.message || "Error al actualizar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span>{mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Encabezado */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Problemas Mayores y Revisión Post-Problema (PIR)
          </h3>
          <p className="text-xs text-slate-500">
            Define los criterios automáticos de severidad mayor, el bloqueo de cierre y el cuestionario formal de lecciones aprendidas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setModalProbar(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
          >
            Probar criterios
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || !puedeEditar}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
          >
            {guardando ? "Guardando..." : "Guardar gobernanza"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start text-xs">
        {/* Columna Izquierda: Criterios y Efectos (6/12 cols) */}
        <div className="col-span-6 space-y-4">
          {/* Criterios de Detección */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider block">
              Criterios de Activación Automática
            </span>
            <p className="text-[11px] text-slate-500">
              Cualquiera de las siguientes condiciones estampa la marca institucional de Problema Mayor:
            </p>

            <div className="space-y-2 pt-1">
              {criterios.map((c) => (
                <div
                  key={c.id_criterio}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">{c.nombre}</span>
                    <span className="text-[11px] text-slate-500 capitalize">Tipo: {c.tipo}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Activo
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Efectos de Ser Mayor */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider block">
              Efectos Institucionales al Detectarse
            </span>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aplicarPaquete}
                  onChange={(e) => setAplicarPaquete(e.target.checked)}
                  disabled={!puedeEditar}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800">
                  Aplicar automáticamente paquete de tareas 'Problema Mayor'
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exigirRevision}
                  onChange={(e) => setExigirRevision(e.target.checked)}
                  disabled={!puedeEditar}
                  className="rounded text-blue-600"
                />
                <span className="text-slate-800 font-semibold">
                  Exigir revisión del problema completada para permitir el Cierre
                </span>
              </label>

              <div className="pt-2">
                <label className="block text-slate-600 font-medium mb-1">
                  Plazo máximo para completar la revisión (días desde Resuelto):
                </label>
                <input
                  type="number"
                  min={1}
                  value={plazoDias}
                  onChange={(e) => setPlazoDias(parseInt(e.target.value, 10) || 1)}
                  disabled={!puedeEditar}
                  className="w-24 border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifDetectar}
                    onChange={(e) => setNotifDetectar(e.target.checked)}
                    disabled={!puedeEditar}
                    className="rounded text-blue-600"
                  />
                  <span>Notificar a Dirección de TI al detectarse problema mayor</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generarPdf}
                    onChange={(e) => setGenerarPdf(e.target.checked)}
                    disabled={!puedeEditar}
                    className="rounded text-blue-600"
                  />
                  <span>Generar informe ejecutivo de lecciones aprendidas (PDF)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Plantilla de Revisión PIR (6/12 cols) */}
        <div className="col-span-6 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <div>
              <span className="font-bold text-slate-800 uppercase tracking-wider block">
                Cuestionario de Revisión Post-Problema (PIR)
              </span>
              <p className="text-[11px] text-slate-500">
                Preguntas que el especialista o gestor debe completar antes de autorizar el cierre formal.
              </p>
            </div>
            {puedeEditar && (
              <button
                type="button"
                onClick={() =>
                  setPreguntas([
                    ...preguntas,
                    {
                      id: `q_${Date.now()}`,
                      pregunta: "Nueva pregunta técnica de evaluación",
                      tipo: "texto_largo",
                      obligatoria: true,
                    },
                  ])
                }
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded"
              >
                + Añadir pregunta
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {preguntas.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-slate-400 text-[11px]">Pregunta #{qIdx + 1}</span>
                  {puedeEditar && (
                    <button
                      type="button"
                      onClick={() => setPreguntas(preguntas.filter((_, i) => i !== qIdx))}
                      className="text-rose-600 hover:text-rose-800 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={q.pregunta}
                  onChange={(e) => {
                    const nuevas = [...preguntas];
                    nuevas[qIdx].pregunta = e.target.value;
                    setPreguntas(nuevas);
                  }}
                  disabled={!puedeEditar}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 text-xs"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <span className="capitalize">Tipo: {q.tipo}</span>
                  <label className="flex items-center space-x-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={q.obligatoria}
                      onChange={(e) => {
                        const nuevas = [...preguntas];
                        nuevas[qIdx].obligatoria = e.target.checked;
                        setPreguntas(nuevas);
                      }}
                      disabled={!puedeEditar}
                      className="rounded text-blue-600"
                    />
                    <span>Obligatoria</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Probar Criterios */}
      {modalProbar && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                Evaluador de Criterios de Problema Mayor
              </h3>
              <button
                type="button"
                onClick={() => setModalProbar(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Simulación de análisis sobre los 14 problemas abiertos en el repositorio:
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
              <span className="font-bold text-rose-900 block">2 Problemas calificados como MAYORES:</span>
              <div className="text-rose-800">
                • <strong>PRB-000042:</strong> Prioridad P1 Crítica (Gateway de pagos).
              </div>
              <div className="text-rose-800">
                • <strong>PRB-000047:</strong> 12 incidentes vinculados concurrentes.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalProbar(false)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
