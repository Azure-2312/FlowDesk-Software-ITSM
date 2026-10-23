"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, Trash2 } from "@/shared/components/ui/Iconos";

export interface ReglaEscalamiento {
  id_escalamiento: number;
  nombre: string;
  objetivo: string;
  prioridades: string[];
  tipo_umbral: "porcentaje" | "horas_vencido";
  umbral_valor: number;
  acciones: any[];
  repetir_cada_horas?: number;
  max_repeticiones?: number;
  activa: boolean;
}

interface PestanaEscalamientoProps {
  reglas: ReglaEscalamiento[];
  puedeEditar: boolean;
  onCrearRegla: (datos: any) => Promise<void>;
  onActualizarRegla: (id: number, datos: any) => Promise<void>;
  onEliminarRegla: (id: number) => Promise<void>;
}

export const PestanaEscalamiento: React.FC<PestanaEscalamientoProps> = ({
  reglas,
  puedeEditar,
  onCrearRegla,
  onActualizarRegla,
  onEliminarRegla,
}) => {
  const [modalEditor, setModalEditor] = useState(false);
  const [esNueva, setEsNueva] = useState(true);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaEscalamiento | null>(null);
  const [modalSimulador, setModalSimulador] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Formulario
  const [nombre, setNombre] = useState("");
  const [objetivo, setObjetivo] = useState("diagnostico");
  const [prioridadesSel, setPrioridadesSel] = useState<string[]>(["P1", "P2"]);
  const [tipoUmbral, setTipoUmbral] = useState<"porcentaje" | "horas_vencido">("porcentaje");
  const [umbralValor, setUmbralValor] = useState(75);
  const [notifResponsable, setNotifResponsable] = useState(true);
  const [notifSupervisor, setNotifSupervisor] = useState(false);
  const [marcarEtiqueta, setMarcarEtiqueta] = useState(true);

  // Simulador
  const [simPrio, setSimPrio] = useState("P1");
  const [simConsumo, setSimConsumo] = useState(80);

  const abrirNueva = () => {
    setEsNueva(true);
    setReglaEnEdicion(null);
    setNombre("");
    setObjetivo("diagnostico");
    setPrioridadesSel(["P1", "P2"]);
    setTipoUmbral("porcentaje");
    setUmbralValor(75);
    setNotifResponsable(true);
    setNotifSupervisor(false);
    setMarcarEtiqueta(true);
    setErrorLocal("");
    setModalEditor(true);
  };

  const abrirEditar = (r: ReglaEscalamiento) => {
    setEsNueva(false);
    setReglaEnEdicion(r);
    setNombre(r.nombre);
    setObjetivo(r.objetivo);
    setPrioridadesSel(r.prioridades || ["P1"]);
    setTipoUmbral(r.tipo_umbral);
    setUmbralValor(r.umbral_valor);
    setErrorLocal("");
    setModalEditor(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setErrorLocal("El nombre de la regla es obligatorio.");
      return;
    }

    try {
      setGuardando(true);
      setErrorLocal("");

      const acciones = [];
      if (notifResponsable) acciones.push({ tipo: "notificar", destinatario: "responsable" });
      if (notifSupervisor) acciones.push({ tipo: "notificar", destinatario: "supervisor_grupo" });
      if (marcarEtiqueta) acciones.push({ tipo: "marcar_etiqueta", etiqueta: "En riesgo" });

      const datos = {
        nombre: nombre.trim(),
        objetivo,
        prioridades: prioridadesSel,
        tipo_umbral: tipoUmbral,
        umbral_valor: umbralValor,
        acciones,
      };

      if (esNueva) {
        await onCrearRegla(datos);
      } else if (reglaEnEdicion) {
        await onActualizarRegla(reglaEnEdicion.id_escalamiento, datos);
      }

      setModalEditor(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al procesar escalamiento");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Herramientas */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Reglas de Escalamiento y Alertas de Vencimiento
          </h3>
          <p className="text-xs text-slate-500">
            Dispara acciones preventivas y notificaciones jerárquicas cuando un problema consume umbrales críticos de tiempo OLA.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setModalSimulador(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
          >
            Simulador de escalamiento
          </button>
          <button
            type="button"
            onClick={abrirNueva}
            disabled={!puedeEditar}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
          >
            + Nueva regla
          </button>
        </div>
      </div>

      {/* Tabla de Reglas de Escalamiento */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Regla de Escalamiento</th>
              <th className="py-3 px-4">Objetivo Evaluado</th>
              <th className="py-3 px-4">Prioridades</th>
              <th className="py-3 px-4">Umbral de Disparo</th>
              <th className="py-3 px-4">Acciones</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {reglas.map((r) => (
              <tr key={r.id_escalamiento} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-semibold text-slate-900">{r.nombre}</td>
                <td className="py-3 px-4 capitalize">{r.objetivo}</td>
                <td className="py-3 px-4">
                  <div className="flex space-x-1">
                    {r.prioridades?.map((p) => (
                      <span
                        key={p}
                        className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 text-slate-700"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 font-bold text-slate-800">
                  {r.tipo_umbral === "porcentaje" ? `${r.umbral_valor}% del tiempo` : `+${r.umbral_valor}h vencido`}
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-600">
                  {r.acciones?.length || 1} acciones programadas
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      onActualizarRegla(r.id_escalamiento, { activa: !r.activa })
                    }
                    disabled={!puedeEditar}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.activa
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {r.activa ? "Activa" : "Inactiva"}
                  </button>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <BotonIcono
                      variante="normal"
                      icono={<Edit2 size={13} />}
                      titulo={`Editar regla "${r.nombre}"`}
                      ariaLabel={`Editar regla "${r.nombre}"`}
                      disabled={!puedeEditar}
                      onClick={() => abrirEditar(r)}
                    />
                    <BotonIcono
                      variante="peligro"
                      icono={<Trash2 size={13} />}
                      titulo={`Eliminar regla "${r.nombre}"`}
                      ariaLabel={`Eliminar regla "${r.nombre}"`}
                      disabled={!puedeEditar}
                      onClick={() => {
                        if (confirm(`¿Eliminar la regla '${r.nombre}'?`)) {
                          onEliminarRegla(r.id_escalamiento);
                        }
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editor */}
      {modalEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {esNueva ? "Nueva Regla de Escalamiento" : `Editar: ${reglaEnEdicion?.nombre}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalEditor(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la regla <span className="text-rose-600">*</span></label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Alerta 90% tiempo resolución"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objetivo OLA evaluado:</label>
                <select
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
                >
                  <option value="diagnostico">Reloj de Diagnóstico</option>
                  <option value="resolucion">Reloj de Resolución Total</option>
                  <option value="primera_respuesta">Primera Respuesta</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Umbral:</label>
                  <select
                    value={tipoUmbral}
                    onChange={(e) => setTipoUmbral(e.target.value as any)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 bg-white"
                  >
                    <option value="porcentaje">Porcentaje (% consumido)</option>
                    <option value="horas_vencido">Horas vencido (+N horas)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Valor de Umbral:</label>
                  <input
                    type="number"
                    value={umbralValor}
                    onChange={(e) => setUmbralValor(parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 font-bold"
                  />
                </div>
              </div>

              {/* Acciones */}
              <div className="space-y-2 pt-2 border-t">
                <span className="font-semibold text-slate-700 block">Acciones automáticas al disparar:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifResponsable}
                    onChange={(e) => setNotifResponsable(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Notificar al especialista responsable</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSupervisor}
                    onChange={(e) => setNotifSupervisor(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Notificar a supervisor de área</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={marcarEtiqueta}
                    onChange={(e) => setMarcarEtiqueta(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Aplicar etiqueta visual 'En riesgo' / 'Vencido'</span>
                </label>
              </div>

              {errorLocal && <p className="text-xs text-rose-600 font-medium">{errorLocal}</p>}

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalEditor(false)}
                  className="px-3 py-1.5 rounded text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  {guardando ? "Guardando..." : "Guardar regla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Simulador */}
      {modalSimulador && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">Simulador de Escalamiento</h3>
              <button
                type="button"
                onClick={() => setModalSimulador(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prioridad del Problema:</label>
                <select
                  value={simPrio}
                  onChange={(e) => setSimPrio(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white"
                >
                  <option value="P1">P1 - Crítica</option>
                  <option value="P2">P2 - Alta</option>
                  <option value="P3">P3 - Media</option>
                  <option value="P4">P4 - Baja</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Porcentaje consumido de tiempo: {simConsumo}%
                </label>
                <input
                  type="range"
                  min={10}
                  max={120}
                  value={simConsumo}
                  onChange={(e) => setSimConsumo(parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <span className="font-bold text-amber-900 block">Acciones Disparadas:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
                  {simConsumo >= 75 && <li>Notificación enviada al responsable técnico.</li>}
                  {simConsumo >= 90 && <li>Notificación de alerta enviada al supervisor del grupo.</li>}
                  {simConsumo >= 100 && (
                    <li className="font-bold text-rose-700">
                      Escalamiento a Gestor de Problemas y marca de ticket 'Vencido'.
                    </li>
                  )}
                  {simConsumo < 75 && <li>Ninguna regla activada (tiempo dentro de márgenes normales).</li>}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalSimulador(false)}
                className="px-4 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 font-medium rounded-lg text-slate-700"
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
