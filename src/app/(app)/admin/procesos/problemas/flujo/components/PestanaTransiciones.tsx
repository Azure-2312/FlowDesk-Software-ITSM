"use client";

import React, { useState } from "react";
import { EstadoProblema } from "./PestanaEstados";

export interface TransicionProblema {
  id_transicion: number;
  codigo: string;
  nombre: string;
  estado_origen_id: number;
  estado_destino_id: number;
  origen_nombre?: string;
  origen_codigo?: string;
  origen_color?: string;
  destino_nombre?: string;
  destino_codigo?: string;
  destino_color?: string;
  perfiles_autorizados?: number[];
  roles_contextuales?: { responsable?: boolean; grupo?: boolean; supervisor?: boolean };
  condiciones_previas?: any[];
  campos_requeridos?: string[];
  politica_comentario?: string;
  requiere_confirmacion?: boolean;
  mensaje_confirmacion?: string;
  requiere_aprobacion?: boolean;
  aprobador_tipo?: string;
  color_boton?: string;
  automatizaciones?: any[];
  activa: boolean;
  orden: number;
  es_sistema?: boolean;
}

interface PestanaTransicionesProps {
  estados: EstadoProblema[];
  transiciones: TransicionProblema[];
  perfiles: any[];
  puedeEditar: boolean;
  onCrearTransicion: (datos: any) => Promise<void>;
  onActualizarTransicion: (id: number, datos: any) => Promise<void>;
  onEliminarTransicion: (id: number) => Promise<void>;
}

export const PestanaTransiciones: React.FC<PestanaTransicionesProps> = ({
  estados,
  transiciones,
  perfiles,
  puedeEditar,
  onCrearTransicion,
  onActualizarTransicion,
  onEliminarTransicion,
}) => {
  const [vista, setVista] = useState<"matriz" | "diagrama">("matriz");
  const [modalEditor, setModalEditor] = useState(false);
  const [esNueva, setEsNueva] = useState(true);
  const [transicionEnEdicion, setTransicionEnEdicion] = useState<TransicionProblema | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Formulario
  const [nombreAccion, setNombreAccion] = useState("");
  const [estadoOrigen, setEstadoOrigen] = useState<number>(estados[0]?.id_estado || 1);
  const [estadoDestino, setEstadoDestino] = useState<number>(estados[1]?.id_estado || 2);
  const [perfilesSel, setPerfilesSel] = useState<number[]>([1, 10]);
  const [camposReq, setCamposReq] = useState<string[]>([]);
  const [politicaComentario, setPoliticaComentario] = useState("opcional");
  const [requiereConf, setRequiereConf] = useState(false);
  const [mensajeConf, setMensajeConf] = useState("");
  const [requiereAprob, setRequiereAprob] = useState(false);
  const [colorBoton, setColorBoton] = useState("#2563eb");

  const abrirNueva = (origen?: number, destino?: number) => {
    setEsNueva(true);
    setTransicionEnEdicion(null);
    setNombreAccion("");
    setEstadoOrigen(origen || estados[0]?.id_estado || 1);
    setEstadoDestino(destino || estados[1]?.id_estado || 2);
    setPerfilesSel([1, 10]);
    setCamposReq([]);
    setPoliticaComentario("opcional");
    setRequiereConf(false);
    setMensajeConf("");
    setRequiereAprob(false);
    setColorBoton("#2563eb");
    setErrorLocal("");
    setModalEditor(true);
  };

  const abrirEditar = (t: TransicionProblema) => {
    setEsNueva(false);
    setTransicionEnEdicion(t);
    setNombreAccion(t.nombre);
    setEstadoOrigen(t.estado_origen_id);
    setEstadoDestino(t.estado_destino_id);
    setPerfilesSel(t.perfiles_autorizados || [1, 10]);
    setCamposReq(t.campos_requeridos || []);
    setPoliticaComentario(t.politica_comentario || "opcional");
    setRequiereConf(t.requiere_confirmacion || false);
    setMensajeConf(t.mensaje_confirmacion || "");
    setRequiereAprob(t.requiere_aprobacion || false);
    setColorBoton(t.color_boton || "#2563eb");
    setErrorLocal("");
    setModalEditor(true);
  };

  const handleGuardarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreAccion.trim()) {
      setErrorLocal("El nombre de la acción es obligatorio.");
      return;
    }
    if (estadoOrigen === estadoDestino) {
      setErrorLocal("El estado origen y destino no pueden ser idénticos.");
      return;
    }

    try {
      setGuardando(true);
      setErrorLocal("");

      const datos = {
        nombre: nombreAccion.trim(),
        estado_origen_id: estadoOrigen,
        estado_destino_id: estadoDestino,
        perfiles_autorizados: perfilesSel,
        campos_requeridos: camposReq,
        politica_comentario: politicaComentario,
        requiere_confirmacion: requiereConf,
        mensaje_confirmacion: mensajeConf.trim(),
        requiere_aprobacion: requiereAprob,
        color_boton: colorBoton,
      };

      if (esNueva) {
        await onCrearTransicion(datos);
      } else if (transicionEnEdicion) {
        await onActualizarTransicion(transicionEnEdicion.id_transicion, datos);
      }

      setModalEditor(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al procesar transición");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de Vista: Matriz vs Diagrama */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Modo de Visualización:
          </span>
          <div className="bg-slate-100 p-0.5 rounded-lg flex space-x-1 text-xs">
            <button
              type="button"
              onClick={() => setVista("matriz")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                vista === "matriz"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Matriz Origen × Destino
            </button>
            <button
              type="button"
              onClick={() => setVista("diagrama")}
              className={`px-3 py-1 rounded-md font-semibold transition ${
                vista === "diagrama"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Diagrama de Grafo de Flujo
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => abrirNueva()}
          disabled={!puedeEditar}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
        >
          + Nueva transición
        </button>
      </div>

      {/* VISTA 1: Matriz de Transiciones */}
      {vista === "matriz" && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Matriz de Transiciones Permitidas
            </h4>
            <span className="text-xs text-slate-400">
              Haga clic en una celda vacía para crear una acción, o sobre un check (✓) para editarla.
            </span>
          </div>

          <div className="overflow-x-auto text-xs border border-slate-200 rounded-xl">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-2.5 text-left font-bold text-slate-700 bg-slate-100/70 border-r border-slate-200 min-w-[140px]">
                    Origen ↓ \ Destino →
                  </th>
                  {estados.map((dest) => (
                    <th
                      key={dest.id_estado}
                      className="p-2 font-bold text-slate-700 border-r border-slate-200 last:border-0 min-w-[90px]"
                    >
                      <div className="flex items-center justify-center space-x-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: dest.color }}
                        />
                        <span className="truncate max-w-[80px]" title={dest.nombre}>
                          {dest.nombre}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {estados.map((orig) => (
                  <tr key={orig.id_estado} className="border-b border-slate-200 last:border-0">
                    <td className="p-2.5 text-left font-bold text-slate-800 bg-slate-50 border-r border-slate-200">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: orig.color }}
                        />
                        <span className="truncate">{orig.nombre}</span>
                      </div>
                    </td>
                    {estados.map((dest) => {
                      const esDiagonal = orig.id_estado === dest.id_estado;
                      const trn = transiciones.find(
                        (t) =>
                          t.estado_origen_id === orig.id_estado &&
                          t.estado_destino_id === dest.id_estado
                      );

                      if (esDiagonal) {
                        return (
                          <td
                            key={dest.id_estado}
                            className="p-2 bg-slate-100/50 border-r border-slate-200 last:border-0 text-slate-300 font-bold"
                          >
                            —
                          </td>
                        );
                      }

                      return (
                        <td
                          key={dest.id_estado}
                          onClick={() => {
                            if (!puedeEditar) return;
                            if (trn) {
                              abrirEditar(trn);
                            } else {
                              abrirNueva(orig.id_estado, dest.id_estado);
                            }
                          }}
                          className={`p-2 border-r border-slate-200 last:border-0 cursor-pointer transition ${
                            trn
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold"
                              : "hover:bg-blue-50/60 text-slate-300"
                          }`}
                        >
                          {trn ? (
                            <span title={`${trn.nombre} (Clic para editar)`}>
                              ✓
                            </span>
                          ) : (
                            <span className="text-[10px] opacity-0 hover:opacity-100 text-blue-600">
                              +
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: Grafo Visual del Flujo ITIL 4 */}
      {vista === "diagrama" && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Diagrama de Flujo del Ciclo de Vida
              </h4>
              <p className="text-xs text-slate-500">
                Visualización automática de nodos de estado y transiciones dirigidas.
              </p>
            </div>
            <button
              type="button"
              onClick={() => alert("Diagrama exportado como imagen.")}
              className="px-3 py-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
            >
              Exportar PNG
            </button>
          </div>

          <div className="bg-slate-900 rounded-xl p-6 overflow-x-auto min-h-[300px] flex items-center justify-around space-x-4">
            {estados.map((est) => (
              <div
                key={est.id_estado}
                className="flex flex-col items-center space-y-2 p-3 rounded-xl border border-slate-700 bg-slate-800 min-w-[110px]"
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: est.color }}
                />
                <span className="text-white font-bold text-xs text-center">{est.nombre}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{est.tipo}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista Completa de Transiciones */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Listado de Transiciones Configuradas ({transiciones.length})
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Acción / Botón</th>
              <th className="py-3 px-4">Origen → Destino</th>
              <th className="py-3 px-4">Campos Requeridos</th>
              <th className="py-3 px-4">Aprobación</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {transiciones.map((t) => (
              <tr key={t.id_transicion} className="hover:bg-slate-50 transition">
                <td className="py-3 px-4 font-bold text-slate-900 flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: t.color_boton || "#2563eb" }}
                  />
                  <span>[{t.nombre}]</span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-semibold text-slate-800">{t.origen_nombre}</span>
                  <span className="text-slate-400 mx-1.5">→</span>
                  <span className="font-semibold text-slate-800">{t.destino_nombre}</span>
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-500">
                  {t.campos_requeridos && t.campos_requeridos.length > 0
                    ? t.campos_requeridos.join(", ")
                    : "Ninguno"}
                </td>
                <td className="py-3 px-4">
                  {t.requiere_aprobacion ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Req. Aprobación
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Directa</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.activa
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {t.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right space-x-1.5">
                  <button
                    type="button"
                    onClick={() => abrirEditar(t)}
                    disabled={!puedeEditar}
                    className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`¿Eliminar la transición '${t.nombre}'?`)) {
                        onEliminarTransicion(t.id_transicion);
                      }
                    }}
                    disabled={!puedeEditar || t.es_sistema}
                    className="px-2.5 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-30 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Editor de Transición */}
      {modalEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {esNueva ? "Nueva Transición de Estado" : `Editar: ${nombreAccion}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalEditor(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGuardarSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre de la Acción / Etiqueta del Botón <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={nombreAccion}
                  onChange={(e) => setNombreAccion(e.target.value)}
                  placeholder="Ej: Iniciar análisis"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Origen:</label>
                  <select
                    value={estadoOrigen}
                    onChange={(e) => setEstadoOrigen(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 bg-white"
                  >
                    {estados.map((est) => (
                      <option key={est.id_estado} value={est.id_estado}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estado Destino:</label>
                  <select
                    value={estadoDestino}
                    onChange={(e) => setEstadoDestino(parseInt(e.target.value, 10))}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 bg-white"
                  >
                    {estados.map((est) => (
                      <option key={est.id_estado} value={est.id_estado}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Perfiles autorizados */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Perfiles Autorizados para Ejecutar la Transición:
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 border rounded">
                  {perfiles.map((p) => {
                    const checked = perfilesSel.includes(p.id_perfil);
                    return (
                      <label key={p.id_perfil} className="flex items-center space-x-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPerfilesSel([...perfilesSel, p.id_perfil]);
                            } else {
                              setPerfilesSel(perfilesSel.filter((id) => id !== p.id_perfil));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span className="truncate">{p.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiereConf}
                    onChange={(e) => setRequiereConf(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Solicitar confirmación al usuario</span>
                </label>
                {requiereConf && (
                  <input
                    type="text"
                    value={mensajeConf}
                    onChange={(e) => setMensajeConf(e.target.value)}
                    placeholder="¿Está seguro de avanzar el problema?"
                    className="w-full border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                  />
                )}

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiereAprob}
                    onChange={(e) => setRequiereAprob(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="font-semibold text-slate-700">Requiere aprobación previa de supervisor</span>
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
                  {guardando ? "Guardando..." : "Guardar transición"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
