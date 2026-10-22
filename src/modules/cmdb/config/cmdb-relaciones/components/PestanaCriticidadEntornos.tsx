"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, X } from "@/shared/components/ui/Iconos";

export interface NivelCriticidadItem {
  codigo: string;
  nombre: string;
  peso: number;
  color: string;
  rto_horas: number;
  rpo_horas: number;
  descripcion: string;
  bloqueado: boolean;
  activo: boolean;
}

export interface EntornoItem {
  id: string;
  nombre: string;
  peso_riesgo: number;
  productivo: boolean;
  color: string;
  activo: boolean;
}

export interface CriticidadEfectivaConfig {
  activada: boolean;
  profundidad_maxima: number;
  utilizar_en_tickets: "efectiva" | "propia";
  recalculo_automatico: boolean;
}

export interface CriticidadEntornosData {
  niveles_criticidad?: NivelCriticidadItem[];
  criticidad_efectiva?: CriticidadEfectivaConfig;
  entornos?: EntornoItem[];
}

interface Props {
  datos: CriticidadEntornosData;
  onChange: (nuevosDatos: CriticidadEntornosData) => void;
  bloqueado: boolean;
}

export function PestanaCriticidadEntornos({ datos, onChange, bloqueado }: Props) {
  const niveles: NivelCriticidadItem[] = datos?.niveles_criticidad || [];
  const entornos: EntornoItem[] = datos?.entornos || [];
  const configEfectiva: CriticidadEfectivaConfig = datos?.criticidad_efectiva || {
    activada: true,
    profundidad_maxima: 2,
    utilizar_en_tickets: "efectiva",
    recalculo_automatico: true
  };

  const [modalNivel, setModalNivel] = useState<{ abierto: boolean; nivel?: NivelCriticidadItem }>({ abierto: false });
  const [formNivel, setFormNivel] = useState<Partial<NivelCriticidadItem>>({});
  const [modalEntorno, setModalEntorno] = useState<{ abierto: boolean; entorno?: EntornoItem }>({ abierto: false });
  const [formEntorno, setFormEntorno] = useState<Partial<EntornoItem>>({});
  const [simuladorAbierto, setSimuladorAbierto] = useState(false);
  const [recalculando, setRecalculando] = useState(false);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);

  // Estados de simulación de criticidad
  const [simCriticidadPropia, setSimCriticidadPropia] = useState("MEDIA");
  const [simCriticidadServicio, setSimCriticidadServicio] = useState("CRITICA");

  const mostrarToast = (msg: string) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(null), 3000);
  };

  const handleUpdateEfectiva = (campo: keyof CriticidadEfectivaConfig, valor: any) => {
    if (bloqueado) return;
    onChange({
      ...datos,
      criticidad_efectiva: {
        ...configEfectiva,
        [campo]: valor
      }
    });
  };

  const ejecutarRecalculoCMDB = () => {
    setRecalculando(true);
    setTimeout(() => {
      setRecalculando(false);
      mostrarToast("Recálculo de criticidad efectiva completado sobre todos los elementos de la CMDB.");
    }, 1500);
  };

  const abrirEditarNivel = (n: NivelCriticidadItem) => {
    setFormNivel({ ...n });
    setModalNivel({ abierto: true, nivel: n });
  };

  const guardarNivel = () => {
    if (bloqueado || !formNivel.codigo) return;
    const actualizados = niveles.map((n) => (n.codigo === formNivel.codigo ? (formNivel as NivelCriticidadItem) : n));
    onChange({ ...datos, niveles_criticidad: actualizados });
    setModalNivel({ abierto: false });
    mostrarToast("Nivel de criticidad actualizado.");
  };

  const abrirEditarEntorno = (e: EntornoItem) => {
    setFormEntorno({ ...e });
    setModalEntorno({ abierto: true, entorno: e });
  };

  const guardarEntorno = () => {
    if (bloqueado || !formEntorno.id) return;
    const actualizados = entornos.map((e) => (e.id === formEntorno.id ? (formEntorno as EntornoItem) : e));
    onChange({ ...datos, entornos: actualizados });
    setModalEntorno({ abierto: false });
    mostrarToast("Entorno operacional actualizado.");
  };

  // Cálculo simulado
  const pesoPropia = niveles.find((n) => n.codigo === simCriticidadPropia)?.peso || 2;
  const pesoServicio = niveles.find((n) => n.codigo === simCriticidadServicio)?.peso || 4;
  const mayorPeso = Math.max(pesoPropia, pesoServicio);
  const nivelEfectivoCalculado = niveles.find((n) => n.peso === mayorPeso)?.nombre || "Crítica";

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
            Criticidad, Entornos y Propagación de Impacto
          </h2>
          <p className="text-sm text-slate-500">
            Escala de criticidad con objetivos RTO/RPO, cálculo automático de criticidad efectiva según topología y catálogo de entornos compartidos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSimuladorAbierto(true)}
            className="px-3 py-2 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-sm font-semibold rounded-md shadow-sm"
          >
            Simular criticidad efectiva
          </button>
          <button
            type="button"
            disabled={recalculando}
            onClick={ejecutarRecalculoCMDB}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-md shadow-sm disabled:opacity-50"
          >
            {recalculando ? "Recalculando..." : "Recalcular ahora en CMDB"}
          </button>
        </div>
      </div>

      {/* Regla de Criticidad Efectiva */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
          Motor de Criticidad Efectiva (ITIL 4 Service Impact)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkEfectivaActiva"
                disabled={bloqueado}
                checked={configEfectiva.activada}
                onChange={(e) => handleUpdateEfectiva("activada", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <label htmlFor="chkEfectivaActiva" className="text-sm font-semibold text-slate-800">
                  Calcular criticidad efectiva automática
                </label>
                <p className="text-xs text-slate-500">
                  La criticidad efectiva es la mayor entre la propia del CI y la de los servicios críticos a los que soporta.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="chkRecalculoAuto"
                disabled={bloqueado}
                checked={configEfectiva.recalculo_automatico}
                onChange={(e) => handleUpdateEfectiva("recalculo_automatico", e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              <div>
                <label htmlFor="chkRecalculoAuto" className="text-sm font-semibold text-slate-800">
                  Recálculo automático al modificar relaciones
                </label>
                <p className="text-xs text-slate-500">
                  Dispara la reevaluación de criticidad al vincular o desvincular un servicio en la CMDB.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Profundidad Máxima de Propagación (Saltos en Topología)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="5"
                disabled={bloqueado}
                value={configEfectiva.profundidad_maxima}
                onChange={(e) => handleUpdateEfectiva("profundidad_maxima", parseInt(e.target.value) || 2)}
                className="w-20 px-3 py-1.5 border border-slate-300 rounded text-sm text-center font-bold"
              />
              <span className="text-xs text-slate-500">niveles de dependencia (Fábrica: 2)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Limita cuántos saltos jerárquicos puede viajar la criticidad hacia componentes de infraestructura.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Criticidad Utilizada en Procesos Operativos (Tickets)
            </label>
            <select
              disabled={bloqueado}
              value={configEfectiva.utilizar_en_tickets}
              onChange={(e) => handleUpdateEfectiva("utilizar_en_tickets", e.target.value as any)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm"
            >
              <option value="efectiva">Criticidad Efectiva (Heredada del impacto al negocio)</option>
              <option value="propia">Criticidad Propia (Asignada estáticamente al CI)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Determina qué valor alimenta la matriz de prioridad de Incidentes y el análisis de riesgo de Cambios.
            </p>
          </div>
        </div>
      </div>

      {/* Escala de Niveles de Criticidad */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-800 border-b pb-2">
          Niveles de Criticidad Institucional (Bloqueados de Fábrica)
        </h3>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Nivel</th>
                <th className="px-4 py-3 text-center">Peso Numérico</th>
                <th className="px-4 py-3">Objetivos de Continuidad</th>
                <th className="px-4 py-3">Criterio de Impacto en Negocio</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {niveles.map((n) => (
                <tr key={n.codigo} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: n.color }}></span>
                      <span className="font-bold text-slate-900">{n.nombre}</span>
                      <span className="font-mono text-slate-400">({n.codigo})</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-bold font-mono text-slate-800">
                    {n.peso}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div><strong>RTO:</strong> &le; {n.rto_horas}h</div>
                    <div><strong>RPO:</strong> &le; {n.rpo_horas}h</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 max-w-md">
                    {n.descripcion}
                  </td>
                  <td className="px-4 py-2 text-right"><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar nivel de criticidad" ariaLabel="Editar nivel de criticidad" disabled={bloqueado} onClick={() => abrirEditarNivel(n)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Catálogo Compartido de Entornos */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              Catálogo de Entornos Operacionales
            </h3>
            <p className="text-xs text-slate-500">
              Ambientes tecnológicos homologados y compartidos con el Módulo de Gestión de Cambios (1.3.3).
            </p>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-md">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Entorno</th>
                <th className="px-4 py-3 text-center">Peso de Riesgo</th>
                <th className="px-4 py-3 text-center">¿Es Productivo?</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entornos.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }}></span>
                      <span>{e.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-bold text-slate-700">
                    {e.peso_riesgo}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {e.productivo ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Productivo
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        No productivo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right"><BotonIcono variante="normal" icono={<Edit2 size={13} />} titulo="Editar entorno" ariaLabel="Editar entorno" disabled={bloqueado} onClick={() => abrirEditarEntorno(e)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulador de Criticidad Efectiva */}
      {simuladorAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                Simulación Interactiva de Criticidad Efectiva
              </h3>
              <button
                type="button"
                onClick={() => setSimuladorAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                Cerrar
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Compruebe cómo la criticidad de un servicio soportado eleva automáticamente la criticidad efectiva de un componente de infraestructura subordinado.
            </p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-md border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Criticidad Propia del Servidor / Base de Datos:
                </label>
                <select
                  value={simCriticidadPropia}
                  onChange={(e) => setSimCriticidadPropia(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                >
                  {niveles.map((n) => (
                    <option key={n.codigo} value={n.codigo}>{n.nombre} (Peso {n.peso})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Criticidad del Servicio de Negocio Soportado:
                </label>
                <select
                  value={simCriticidadServicio}
                  onChange={(e) => setSimCriticidadServicio(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                >
                  {niveles.map((n) => (
                    <option key={n.codigo} value={n.codigo}>{n.nombre} (Peso {n.peso})</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-white border border-indigo-200 rounded-md mt-3 text-center">
                <span className="text-xs text-slate-500 block">Criticidad Efectiva Resultante:</span>
                <span className="text-base font-extrabold text-indigo-700 block mt-0.5">
                  {nivelEfectivoCalculado} (Peso {mayorPeso})
                </span>
                <span className="text-[11px] text-slate-500 block mt-1">
                  Se adoptó la criticidad más alta debido a la relación de soporte directo en la topología.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSimuladorAbierto(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-semibold"
              >
                Cerrar simulador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Nivel */}
      {modalNivel.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Editar Nivel: {modalNivel.nivel?.nombre}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Descriptivo</label>
                <input
                  type="text"
                  value={formNivel.nombre || ""}
                  onChange={(e) => setFormNivel({ ...formNivel, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RTO Máximo (Horas)</label>
                  <input
                    type="number"
                    min="0"
                    value={formNivel.rto_horas ?? 1}
                    onChange={(e) => setFormNivel({ ...formNivel, rto_horas: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">RPO Máximo (Horas)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={formNivel.rpo_horas ?? 0.25}
                    onChange={(e) => setFormNivel({ ...formNivel, rpo_horas: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Criterio Institucional</label>
                <textarea
                  rows={2}
                  value={formNivel.descripcion || ""}
                  onChange={(e) => setFormNivel({ ...formNivel, descripcion: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalNivel({ abierto: false })}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarNivel}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Entorno */}
      {modalEntorno.abierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-800 border-b pb-2">
              Editar Entorno: {modalEntorno.entorno?.nombre}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre</label>
                <input
                  type="text"
                  value={formEntorno.nombre || ""}
                  onChange={(e) => setFormEntorno({ ...formEntorno, nombre: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Peso de Riesgo</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formEntorno.peso_riesgo ?? 0}
                    onChange={(e) => setFormEntorno({ ...formEntorno, peso_riesgo: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Color Identificativo</label>
                  <input
                    type="color"
                    value={formEntorno.color || "#4f46e5"}
                    onChange={(e) => setFormEntorno({ ...formEntorno, color: e.target.value })}
                    className="w-full h-8 p-1 border border-slate-300 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chkProductivo"
                  checked={formEntorno.productivo ?? false}
                  onChange={(e) => setFormEntorno({ ...formEntorno, productivo: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600"
                />
                <label htmlFor="chkProductivo" className="text-xs text-slate-700 font-medium">
                  Marcar como Entorno Productivo
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setModalEntorno({ abierto: false })}
                className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarEntorno}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
