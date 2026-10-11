"use client";

import React, { useState } from "react";

export interface PlantillaAuditoriaItem {
  id: string;
  nombre: string;
  alcance: string;
  frecuencia: "mensual" | "trimestral" | "semestral" | "anual";
  metodo: string;
  responsable: string;
  activo: boolean;
}

export interface IndicadorCalidadItem {
  indicador: string;
  meta_porcentaje: number;
}

export interface LineaBaseConfigItem {
  id: string;
  nombre: string;
  activacion: string;
  retencion_meses: number;
  incluye_relaciones: boolean;
  incluye_atributos: boolean;
  activa: boolean;
}

export interface AuditoriaLineasBaseData {
  plantillas_auditoria?: PlantillaAuditoriaItem[];
  indicadores_calidad?: IndicadorCalidadItem[];
  lineas_base_configuracion?: LineaBaseConfigItem[];
}

interface Props {
  datos: AuditoriaLineasBaseData;
  onChange: (nuevosDatos: AuditoriaLineasBaseData) => void;
  bloqueado: boolean;
}

export function PestanaAuditoriaLineasBase({ datos, onChange, bloqueado }: Props) {
  const plantillas: PlantillaAuditoriaItem[] = datos?.plantillas_auditoria || [];
  const indicadores: IndicadorCalidadItem[] = datos?.indicadores_calidad || [];
  const lineasBase: LineaBaseConfigItem[] = datos?.lineas_base_configuracion || [];

  const [seccion, setSeccion] = useState<"auditoria" | "lineas_base">("auditoria");
  const [modalAuditoria, setModalAuditoria] = useState(false);
  const [modalComparador, setModalComparador] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const handleUpdateIndicador = (idx: number, meta: number) => {
    if (bloqueado) return;
    const actualizados = [...indicadores];
    actualizados[idx] = { ...actualizados[idx], meta_porcentaje: meta };
    onChange({ ...datos, indicadores_calidad: actualizados });
  };

  const ejecutarAuditoria = () => {
    setModalAuditoria(true);
    mostrarToast("Auditoría de integridad y exactitud ejecutada.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMensaje && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 text-white px-4 py-2 rounded-md shadow-lg text-sm transition-opacity">
          {toastMensaje}
        </div>
      )}

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Auditoría de Exactitud de CMDB y Líneas Base (Snapshots)
          </h2>
          <p className="text-sm text-slate-500">
            Campañas periódicas de calidad de datos, metas de exactitud institucional e instantáneas históricas de topología para control de cambios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-md flex">
            <button
              type="button"
              onClick={() => setSeccion("auditoria")}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                seccion === "auditoria" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Auditorías y Calidad
            </button>
            <button
              type="button"
              onClick={() => setSeccion("lineas_base")}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                seccion === "lineas_base" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Líneas Base (Snapshots)
            </button>
          </div>
          {seccion === "auditoria" ? (
            <button
              type="button"
              onClick={ejecutarAuditoria}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm"
            >
              Ejecutar auditoría ahora
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModalComparador(true)}
              className="px-3 py-2 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-sm font-semibold rounded-md shadow-sm"
            >
              Comparar líneas base
            </button>
          )}
        </div>
      </div>

      {seccion === "auditoria" && (
        <div className="space-y-6">
          {/* Metas e Indicadores de Exactitud */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-semibold text-slate-800">
                Indicadores y Metas Institucionales de Exactitud
              </h3>
              <span className="text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                Estándar recomendado ITIL: &ge; 95%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {indicadores.map((ind, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">{ind.indicador}</span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500">Meta exigida:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        disabled={bloqueado}
                        value={ind.meta_porcentaje}
                        onChange={(e) => handleUpdateIndicador(idx, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-xs text-center font-bold"
                      />
                      <span className="text-xs font-bold text-slate-600">%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plantillas de Auditoría */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">
                Programación de Auditorías Periódicas de CMDB
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Campaña de Auditoría</th>
                    <th className="px-4 py-3">Alcance y Criterio</th>
                    <th className="px-4 py-3 text-center">Frecuencia</th>
                    <th className="px-4 py-3">Método Operativo</th>
                    <th className="px-4 py-3">Responsable Asignado</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {plantillas.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{p.nombre}</td>
                      <td className="px-4 py-3 text-slate-600">{p.alcance}</td>
                      <td className="px-4 py-3 text-center capitalize font-medium text-indigo-700">
                        {p.frecuencia}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{p.metodo}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{p.responsable}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {p.activo ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {seccion === "lineas_base" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
              Líneas Base de Configuración (Snapshots Inmutables)
            </h3>
            <p className="text-xs text-slate-500">
              Instantáneas que congelan el estado de los CIs y relaciones para permitir comparación histórica antes y después de cambios de infraestructura (Prompt 2).
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Nombre de la Línea Base</th>
                    <th className="px-4 py-3">Disparador de Activación</th>
                    <th className="px-4 py-3 text-center">Retención Histórica</th>
                    <th className="px-4 py-3 text-center">Incluye Topología</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineasBase.map((lb) => (
                    <tr key={lb.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-bold text-slate-900">{lb.nombre}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{lb.activacion}</td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-slate-600">
                        {lb.retencion_meses} meses
                      </td>
                      <td className="px-4 py-3 text-center">
                        {lb.incluye_relaciones ? (
                          <span className="text-emerald-700 font-bold">Si</span>
                        ) : (
                          <span className="text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          {lb.activa ? "Activa" : "Inactiva"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ejecutar Auditoría */}
      {modalAuditoria && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Resultado de la Campaña de Auditoría de CMDB
              </h3>
              <button
                type="button"
                onClick={() => setModalAuditoria(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-emerald-800">
              Evaluación completada sobre los 4 elementos de configuración registrados. Nivel global de exactitud estimado: <strong>96.2%</strong> (Cumple la meta institucional del 95%).
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span>CI con atributos obligatorios completos:</span>
                <span className="font-bold text-emerald-700">100% (4 de 4)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span>CI con responsable técnico designado:</span>
                <span className="font-bold text-emerald-700">100% (4 de 4)</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span>Discrepancias detectadas en muestreo:</span>
                <span className="font-bold text-indigo-700">0 discrepancias</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-200">
                <span>CI huérfanos sin relaciones:</span>
                <span className="font-bold text-amber-700">1 elemento detectado</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalAuditoria(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Aceptar informe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Comparador de Líneas Base */}
      {modalComparador && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Comparador Diferencial de Líneas Base
              </h3>
              <button
                type="button"
                onClick={() => setModalComparador(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-bold text-slate-800 block mb-1">Línea Base A (Snapshot Previo):</span>
                <span className="text-slate-600">LB-2024-Q3-PRE-RFC (01/09/2024)</span>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded">
                <span className="font-bold text-indigo-900 block mb-1">Estado de CMDB Actual:</span>
                <span className="text-indigo-700">Producción en tiempo real</span>
              </div>
            </div>

            <div className="border border-slate-200 rounded p-3 text-xs space-y-2">
              <div className="font-bold text-slate-800">Diferencias detectadas (Delta):</div>
              <ul className="list-disc pl-5 text-slate-600 space-y-1">
                <li>Atributo <code>version_software</code> en CI <strong>SRV-001</strong> modificado de <code>1.4.2</code> a <code>1.5.0</code> vía RFC #104.</li>
                <li>Nueva relación topológica creada: <strong>SRV-001</strong> <em>Se ejecuta en</em> <strong>ESX-HOST-01</strong>.</li>
              </ul>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalComparador(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Cerrar comparador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
