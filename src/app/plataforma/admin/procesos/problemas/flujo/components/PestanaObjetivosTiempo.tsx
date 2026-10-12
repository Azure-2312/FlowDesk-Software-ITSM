"use client";

import React, { useState } from "react";

export interface ObjetivoTiempoProblema {
  id_objetivo: number;
  id_prioridad: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  prioridad_color: string;
  prioridad_nivel: number;
  primera_respuesta_horas: number;
  diagnostico_horas: number;
  resolucion_total_horas: number;
  descripcion_operativa?: string;
  umbrales_alerta?: number[];
}

interface PestanaObjetivosTiempoProps {
  objetivos: ObjetivoTiempoProblema[];
  puedeEditar: boolean;
  onActualizarObjetivos: (objetivos: ObjetivoTiempoProblema[]) => Promise<void>;
}

const VALORES_SUGERIDOS_FABRICA: Record<string, { resp: number; diag: number; res: number }> = {
  P1: { resp: 4, diag: 72, res: 240 },
  P2: { resp: 8, diag: 120, res: 480 },
  P3: { resp: 24, diag: 240, res: 960 },
  P4: { resp: 72, diag: 480, res: 1440 },
};

export const PestanaObjetivosTiempo: React.FC<PestanaObjetivosTiempoProps> = ({
  objetivos,
  puedeEditar,
  onActualizarObjetivos,
}) => {
  const [listaObjetivos, setListaObjetivos] = useState<ObjetivoTiempoProblema[]>(objetivos);
  const [guardando, setGuardando] = useState(false);
  const [modalMedidores, setModalMedidores] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");

  const handleModificar = (idPrioridad: number, campo: keyof ObjetivoTiempoProblema, valor: any) => {
    if (!puedeEditar) return;
    setListaObjetivos((prev) =>
      prev.map((o) => (o.id_prioridad === idPrioridad ? { ...o, [campo]: valor } : o))
    );
  };

  const handleRestaurarSugeridos = () => {
    if (!puedeEditar) return;
    if (confirm("¿Restaurar los tiempos OLA a los valores institucionales recomendados por ITIL v4?")) {
      setListaObjetivos((prev) =>
        prev.map((o) => {
          const sug = VALORES_SUGERIDOS_FABRICA[o.prioridad_codigo];
          if (!sug) return o;
          return {
            ...o,
            primera_respuesta_horas: sug.resp,
            diagnostico_horas: sug.diag,
            resolucion_total_horas: sug.res,
          };
        })
      );
    }
  };

  const handleGuardar = async () => {
    try {
      setGuardando(true);
      setMensajeExito("");
      await onActualizarObjetivos(listaObjetivos);
      setMensajeExito("Metas operativas OLA actualizadas exitosamente.");
    } catch (err: any) {
      alert(err.message || "Error al actualizar metas OLA");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span>{mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito("")} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Barra Superior */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Metas Internas de Tiempo OLA para Problemas
          </h3>
          <p className="text-xs text-slate-500">
            Los problemas utilizan acuerdos OLA de gestión interna diferenciados del SLA de incidentes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleRestaurarSugeridos}
            disabled={!puedeEditar}
            className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
          >
            Restaurar valores sugeridos
          </button>
          <button
            type="button"
            onClick={() => setModalMedidores(true)}
            className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
          >
            Vista previa de medidores
          </button>
          <button
            type="button"
            onClick={handleGuardar}
            disabled={guardando || !puedeEditar}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
          >
            {guardando ? "Guardando..." : "Guardar metas OLA"}
          </button>
        </div>
      </div>

      {/* Tabla de Metas OLA por Prioridad */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4">Primera Respuesta (Horas)</th>
              <th className="py-3 px-4">Diagnóstico (Horas)</th>
              <th className="py-3 px-4">Resolución Total (Horas)</th>
              <th className="py-3 px-4">Descripción Operativa de la Severidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {listaObjetivos.map((obj) => (
              <tr key={obj.id_objetivo} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: obj.prioridad_color }}
                  />
                  <span>
                    {obj.prioridad_codigo} - {obj.prioridad_nombre}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={1}
                      value={obj.primera_respuesta_horas}
                      onChange={(e) =>
                        handleModificar(
                          obj.id_prioridad,
                          "primera_respuesta_horas",
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      disabled={!puedeEditar}
                      className="w-16 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                    <span className="text-slate-400 font-medium">horas</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={1}
                      value={obj.diagnostico_horas}
                      onChange={(e) =>
                        handleModificar(
                          obj.id_prioridad,
                          "diagnostico_horas",
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      disabled={!puedeEditar}
                      className="w-20 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                    <span className="text-slate-400 font-medium">horas</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      min={1}
                      value={obj.resolucion_total_horas}
                      onChange={(e) =>
                        handleModificar(
                          obj.id_prioridad,
                          "resolucion_total_horas",
                          parseInt(e.target.value, 10) || 1
                        )
                      }
                      disabled={!puedeEditar}
                      className="w-20 border border-slate-300 rounded px-2 py-1 text-slate-800 font-bold"
                    />
                    <span className="text-slate-400 font-medium">horas</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <textarea
                    rows={2}
                    value={obj.descripcion_operativa || ""}
                    onChange={(e) =>
                      handleModificar(obj.id_prioridad, "descripcion_operativa", e.target.value)
                    }
                    disabled={!puedeEditar}
                    className="w-full border border-slate-300 rounded px-2.5 py-1 text-slate-800 text-xs"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bloque Informativo sobre Integración con 1.2.4 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <div className="font-bold text-base text-blue-700">ℹ</div>
        <div>
          <span className="font-semibold">Integración de fuente única con 1.2.4 Objetivos SLA: </span>
          La pantalla general de Objetivos Institucionales (1.2.4) refleja automáticamente los valores de esta tabla en su bloque de solo lectura "Objetivos internos de Problemas", preservando la consistencia entre niveles de servicio y metas internas.
        </div>
      </div>

      {/* Modal Vista Previa de Medidores */}
      {modalMedidores && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                Vista Previa de los Medidores en Cabecera del Ticket
              </h3>
              <button
                type="button"
                onClick={() => setModalMedidores(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border rounded-xl space-y-3">
                <span className="font-bold text-slate-800 text-xs block">
                  Simulación de Ticket P1 Crítico (Consumo 45% Diagnóstico / 15% Resolución)
                </span>

                {/* Medidor Diagnóstico */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">Reloj Diagnóstico:</span>
                    <span className="font-bold text-blue-700">32h de 72h (45% consumido)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: "45%" }} />
                  </div>
                </div>

                {/* Medidor Resolución */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">Reloj Resolución:</span>
                    <span className="font-bold text-emerald-700">36h de 240h (15% consumido)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: "15%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalMedidores(false)}
                className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg"
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
