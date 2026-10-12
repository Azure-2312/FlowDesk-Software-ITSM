"use client";

import React, { useState } from "react";

export interface ReglaAsignacion {
  id_regla: number;
  nombre: string;
  orden: number;
  activa: boolean;
  evento_evaluacion: string;
  condiciones: any[];
  id_departamento_destino?: number;
  departamento_nombre?: string;
  estrategia: "sin_responsable" | "round_robin" | "menor_carga" | "tecnico_fijo";
  id_tecnico_fijo?: number;
  tecnico_nombre?: string;
  considerar_disponibilidad: boolean;
  notificar_asignacion: boolean;
  veces_aplicada: number;
}

interface PestanaAsignacionProps {
  reglas: ReglaAsignacion[];
  departamentos: any[];
  puedeEditar: boolean;
  onCrearRegla: (datos: any) => Promise<void>;
  onActualizarRegla: (id: number, datos: any) => Promise<void>;
  onEliminarRegla: (id: number) => Promise<void>;
}

export const PestanaAsignacion: React.FC<PestanaAsignacionProps> = ({
  reglas,
  departamentos,
  puedeEditar,
  onCrearRegla,
  onActualizarRegla,
  onEliminarRegla,
}) => {
  const [detenerPrimera, setDetenerPrimera] = useState(true);
  const [modalEditor, setModalEditor] = useState(false);
  const [esNueva, setEsNueva] = useState(true);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaAsignacion | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Formulario
  const [nombre, setNombre] = useState("");
  const [evento, setEvento] = useState("al_registrar");
  const [idDepto, setIdDepto] = useState<number | undefined>(undefined);
  const [estrategia, setEstrategia] = useState<"sin_responsable" | "round_robin" | "menor_carga" | "tecnico_fijo">("sin_responsable");
  const [considerarDisp, setConsiderarDisp] = useState(true);
  const [notificarAsig, setNotificarAsig] = useState(true);

  // Simulador
  const [simCategoria, setSimCategoria] = useState("Hardware");
  const [simPrioridad, setSimPrioridad] = useState("P1");
  const [simOrigen, setSimOrigen] = useState("incidente_recurrente");

  const abrirNueva = () => {
    setEsNueva(true);
    setReglaEnEdicion(null);
    setNombre("");
    setEvento("al_registrar");
    setIdDepto(departamentos[0]?.id_departamento);
    setEstrategia("sin_responsable");
    setConsiderarDisp(true);
    setNotificarAsig(true);
    setErrorLocal("");
    setModalEditor(true);
  };

  const abrirEditar = (r: ReglaAsignacion) => {
    setEsNueva(false);
    setReglaEnEdicion(r);
    setNombre(r.nombre);
    setEvento(r.evento_evaluacion);
    setIdDepto(r.id_departamento_destino);
    setEstrategia(r.estrategia);
    setConsiderarDisp(r.considerar_disponibilidad);
    setNotificarAsig(r.notificar_asignacion);
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

      const datos = {
        nombre: nombre.trim(),
        evento_evaluacion: evento,
        id_departamento_destino: idDepto || null,
        estrategia,
        considerar_disponibilidad: considerarDisp,
        notificar_asignacion: notificarAsig,
      };

      if (esNueva) {
        await onCrearRegla({ ...datos, orden: reglas.length + 1 });
      } else if (reglaEnEdicion) {
        await onActualizarRegla(reglaEnEdicion.id_regla, datos);
      }

      setModalEditor(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al procesar regla de asignación");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Opciones y Añadir */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={detenerPrimera}
              onChange={(e) => setDetenerPrimera(e.target.checked)}
              disabled={!puedeEditar}
              className="rounded text-blue-600"
            />
            <span>Detener en la primera regla que coincida (Evaluación en cascada)</span>
          </label>
        </div>

        <button
          type="button"
          onClick={abrirNueva}
          disabled={!puedeEditar}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
        >
          + Nueva regla de asignación
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Tabla de Reglas (8/12 cols) */}
        <div className="col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Reglas de Enrutamiento Automático ({reglas.length})
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Prioridad</th>
                <th className="py-3 px-3">Nombre de la Regla</th>
                <th className="py-3 px-3">Grupo Destino</th>
                <th className="py-3 px-3">Estrategia</th>
                <th className="py-3 px-3 text-center">Estado</th>
                <th className="py-3 px-3 text-center">Aplicada</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {reglas.map((r, idx) => (
                <tr key={r.id_regla} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-mono font-bold text-slate-400">
                    #{r.orden || idx + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {r.nombre}
                    <span className="block text-[10px] text-slate-400 font-normal">
                      Evalúa: {r.evento_evaluacion}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-800">
                    {r.departamento_nombre || "Grupo de la categoría"}
                  </td>
                  <td className="py-3 px-3 capitalize">
                    {r.estrategia.replace("_", " ")}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() =>
                        onActualizarRegla(r.id_regla, { activa: !r.activa })
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
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {r.veces_aplicada || 0}
                  </td>
                  <td className="py-3 px-3 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => abrirEditar(r)}
                      disabled={!puedeEditar}
                      className="px-2 py-0.5 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la regla '${r.nombre}'?`)) {
                          onEliminarRegla(r.id_regla);
                        }
                      }}
                      disabled={!puedeEditar}
                      className="px-2 py-0.5 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Panel Lateral: Simulador de Asignación (4/12 cols) */}
        <div className="col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
          <span className="font-bold text-slate-800 uppercase tracking-wider block">
            Simulador de Asignación
          </span>
          <p className="text-[11px] text-slate-500">
            Compruebe qué grupo y especialista recibirían el ticket con los siguientes atributos:
          </p>

          <div className="space-y-2">
            <div>
              <label className="block text-slate-600 font-medium mb-0.5">Categoría:</label>
              <select
                value={simCategoria}
                onChange={(e) => setSimCategoria(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1 text-slate-800 bg-white"
              >
                <option value="Hardware">Hardware / Equipos</option>
                <option value="Software">Software y Aplicaciones</option>
                <option value="Red">Red y Telecomunicaciones</option>
                <option value="Seguridad">Seguridad de Información</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-0.5">Prioridad OLA:</label>
              <select
                value={simPrioridad}
                onChange={(e) => setSimPrioridad(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1 text-slate-800 bg-white"
              >
                <option value="P1">P1 - Crítica</option>
                <option value="P2">P2 - Alta</option>
                <option value="P3">P3 - Media</option>
                <option value="P4">P4 - Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-0.5">Origen:</label>
              <select
                value={simOrigen}
                onChange={(e) => setSimOrigen(e.target.value)}
                className="w-full border border-slate-300 rounded px-2.5 py-1 text-slate-800 bg-white"
              >
                <option value="incidente_recurrente">Incidente(s) recurrente(s)</option>
                <option value="deteccion_proactiva">Detección proactiva</option>
                <option value="tendencias">Análisis de tendencias</option>
              </select>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1 mt-3">
              <span className="text-[10px] text-blue-700 uppercase font-bold tracking-wider block">
                Resultado de Asignación Simulado
              </span>
              <div className="font-bold text-blue-900 text-xs">
                {reglas[0]?.nombre || "Regla de fábrica"}
              </div>
              <div className="text-[11px] text-blue-800">
                Grupo destino: <strong>{reglas[0]?.departamento_nombre || "Gestión de Problemas"}</strong>
              </div>
              <div className="text-[11px] text-slate-600">
                Estrategia: Bandeja de entrada sin responsable directo (espera asignación de mesa).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Editor de Regla */}
      {modalEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {esNueva ? "Nueva Regla de Asignación" : `Editar: ${reglaEnEdicion?.nombre}`}
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
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre descriptivo <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Enrutar problemas de red al NOC"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cuándo se evalúa:</label>
                <select
                  value={evento}
                  onChange={(e) => setEvento(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
                >
                  <option value="al_registrar">Al registrar el problema</option>
                  <option value="al_cambiar_categoria">Al cambiar de categoría</option>
                  <option value="al_cambiar_prioridad">Al cambiar de prioridad</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grupo Resolutor Destino:</label>
                <select
                  value={idDepto || ""}
                  onChange={(e) => setIdDepto(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
                >
                  <option value="">Grupo asociado a la categoría</option>
                  {departamentos.map((d) => (
                    <option key={d.id_departamento} value={d.id_departamento}>
                      {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estrategia de asignación:</label>
                <select
                  value={estrategia}
                  onChange={(e) => setEstrategia(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 bg-white"
                >
                  <option value="sin_responsable">Dejar sin responsable (Bandeja del grupo)</option>
                  <option value="round_robin">Round-Robin (Asignación equitativa)</option>
                  <option value="menor_carga">Menor carga de trabajo (Menos tickets)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={considerarDisp}
                    onChange={(e) => setConsiderarDisp(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Considerar disponibilidad (omitir ausencias vigentes)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificarAsig}
                    onChange={(e) => setNotificarAsig(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Notificar al grupo/técnico asignado</span>
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
    </div>
  );
};
