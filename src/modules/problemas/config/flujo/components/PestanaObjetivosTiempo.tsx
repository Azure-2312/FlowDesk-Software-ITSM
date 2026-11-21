"use client";

import React, { useState } from "react";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

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

  React.useEffect(() => {
    onActualizarObjetivos(listaObjetivos);
  }, [listaObjetivos, onActualizarObjetivos]);

  return (
    <div className="space-y-6">
      {/* Alerta de Éxito */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <span>{mensajeExito}</span>
          <button type="button" onClick={() => setMensajeExito("")} className="font-bold">
            ×
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
        </div>
      </div>

      {/* Tabla de Metas OLA por Prioridad */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <TablaDobleScroll minWidth={850}>
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
        </TablaDobleScroll>
      </div>

      {/* Bloque Informativo sobre Integración con 1.2.4 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3 text-xs text-blue-900">
        <div className="font-bold text-base text-blue-700">!</div>
        <div>
          <span className="font-semibold">Integración de fuente única con 1.2.4 Objetivos SLA: </span>
          La pantalla general de Objetivos Institucionales (1.2.4) refleja automáticamente los valores de esta tabla en su bloque de solo lectura "Objetivos internos de Problemas", preservando la consistencia entre niveles de servicio y metas internas.
        </div>
      </div>
    </div>
  );
};
