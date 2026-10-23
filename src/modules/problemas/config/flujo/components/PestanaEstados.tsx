"use client";

import React, { useState } from "react";
import { BotonIcono } from "@/shared/components/ui/BotonIcono";
import { Edit2, Trash2 } from "@/shared/components/ui/Iconos";

export interface EstadoProblema {
  id_estado: number;
  codigo: string;
  nombre: string;
  tipo: "inicial" | "en_curso" | "en_pausa" | "resuelto" | "final";
  color: string;
  reloj_diagnostico: "corre" | "pausado" | "detenido";
  reloj_resolucion: "corre" | "pausado" | "detenido";
  cuenta_como_abierto: boolean;
  permite_edicion: "si" | "solo_comentarios" | "no";
  descripcion?: string;
  orden: number;
  es_sistema: boolean;
  activo: boolean;
  usos_tickets?: number;
}

interface PestanaEstadosProps {
  estados: EstadoProblema[];
  puedeEditar: boolean;
  onCrearEstado: (datos: any) => Promise<void>;
  onActualizarEstado: (id: number, datos: any) => Promise<void>;
  onEliminarEstado: (id: number) => Promise<void>;
}

export const PestanaEstados: React.FC<PestanaEstadosProps> = ({
  estados,
  puedeEditar,
  onCrearEstado,
  onActualizarEstado,
  onEliminarEstado,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [esNuevo, setEsNuevo] = useState(true);
  const [estadoEnEdicion, setEstadoEnEdicion] = useState<EstadoProblema | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Formulario
  const [nombre, setNombre] = useState("");
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<"inicial" | "en_curso" | "en_pausa" | "resuelto" | "final">("en_curso");
  const [color, setColor] = useState("#3b82f6");
  const [relojDiag, setRelojDiag] = useState<"corre" | "pausado" | "detenido">("corre");
  const [relojRes, setRelojRes] = useState<"corre" | "pausado" | "detenido">("corre");
  const [cuentaAbierto, setCuentaAbierto] = useState(true);
  const [permiteEdicion, setPermiteEdicion] = useState<"si" | "solo_comentarios" | "no">("si");
  const [descripcion, setDescripcion] = useState("");

  const abrirNuevo = () => {
    setEsNuevo(true);
    setEstadoEnEdicion(null);
    setNombre("");
    setCodigo("");
    setTipo("en_curso");
    setColor("#3b82f6");
    setRelojDiag("corre");
    setRelojRes("corre");
    setCuentaAbierto(true);
    setPermiteEdicion("si");
    setDescripcion("");
    setErrorLocal("");
    setModalAbierto(true);
  };

  const abrirEditar = (est: EstadoProblema) => {
    setEsNuevo(false);
    setEstadoEnEdicion(est);
    setNombre(est.nombre);
    setCodigo(est.codigo);
    setTipo(est.tipo);
    setColor(est.color);
    setRelojDiag(est.reloj_diagnostico);
    setRelojRes(est.reloj_resolucion);
    setCuentaAbierto(est.cuenta_como_abierto);
    setPermiteEdicion(est.permite_edicion);
    setDescripcion(est.descripcion || "");
    setErrorLocal("");
    setModalAbierto(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || (esNuevo && !codigo.trim())) {
      setErrorLocal("El nombre y código son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      setErrorLocal("");

      const datos = {
        nombre: nombre.trim(),
        codigo: codigo.trim().toLowerCase(),
        tipo,
        color,
        reloj_diagnostico: relojDiag,
        reloj_resolucion: relojRes,
        cuenta_como_abierto: cuentaAbierto,
        permite_edicion: permiteEdicion,
        descripcion: descripcion.trim(),
      };

      if (esNuevo) {
        await onCrearEstado(datos);
      } else if (estadoEnEdicion) {
        await onActualizarEstado(estadoEnEdicion.id_estado, datos);
      }

      setModalAbierto(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al procesar estado");
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
            Estados del Ciclo de Vida del Problema
          </h3>
          <p className="text-xs text-slate-500">
            Define las etapas operativas, cómo afectan a los dos relojes OLA y qué permisos de edición habilitan.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevo}
          disabled={!puedeEditar}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
        >
          + Nuevo estado
        </button>
      </div>

      {/* Tabla de Estados */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3">Orden</th>
              <th className="py-3 px-3">Código</th>
              <th className="py-3 px-3">Nombre</th>
              <th className="py-3 px-3">Tipo</th>
              <th className="py-3 px-3 text-center">Reloj Diagnóstico</th>
              <th className="py-3 px-3 text-center">Reloj Resolución</th>
              <th className="py-3 px-3 text-center">¿Abierto?</th>
              <th className="py-3 px-3">Edición</th>
              <th className="py-3 px-3 text-center">Estado</th>
              <th className="py-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {estados.map((est, idx) => (
              <tr key={est.id_estado} className="hover:bg-slate-50 transition">
                <td className="py-3 px-3 font-mono text-slate-400">
                  {est.orden || idx + 1}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                  {est.codigo}
                  {est.es_sistema && (
                    <span className="ml-1 text-amber-600 font-bold" title="Estado de fábrica del sistema">
                      [Sistema]
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 font-semibold text-slate-900 flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 inline-block"
                    style={{ backgroundColor: est.color }}
                  />
                  <span>{est.nombre}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                    {est.tipo}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      est.reloj_diagnostico === "corre"
                        ? "bg-emerald-100 text-emerald-800"
                        : est.reloj_diagnostico === "pausado"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {est.reloj_diagnostico}
                  </span>
                </td>
                <td className="py-3 px-3 text-center font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] ${
                      est.reloj_resolucion === "corre"
                        ? "bg-emerald-100 text-emerald-800"
                        : est.reloj_resolucion === "pausado"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {est.reloj_resolucion}
                  </span>
                </td>
                <td className="py-3 px-3 text-center">
                  {est.cuenta_como_abierto ? "Sí" : "No"}
                </td>
                <td className="py-3 px-3 capitalize">
                  {est.permite_edicion === "solo_comentarios" ? "Solo notas" : est.permite_edicion}
                </td>
                <td className="py-3 px-3 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      onActualizarEstado(est.id_estado, { activo: !est.activo })
                    }
                    disabled={est.es_sistema || !puedeEditar}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      est.activo
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {est.activo ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <BotonIcono
                      variante="normal"
                      icono={<Edit2 size={13} />}
                      titulo={`Editar estado "${est.nombre}"`}
                      ariaLabel={`Editar estado "${est.nombre}"`}
                      disabled={!puedeEditar}
                      onClick={() => abrirEditar(est)}
                    />
                    {!est.es_sistema && (
                      <BotonIcono
                        variante="peligro"
                        icono={<Trash2 size={13} />}
                        titulo={`Eliminar estado "${est.nombre}"`}
                        ariaLabel={`Eliminar estado "${est.nombre}"`}
                        disabled={est.es_sistema || (est.usos_tickets || 0) > 0 || !puedeEditar}
                        onClick={() => {
                          if (est.es_sistema) {
                            alert("Los estados institucionales no pueden ser eliminados.");
                            return;
                          }
                          if ((est.usos_tickets || 0) > 0) {
                            alert(`El estado '${est.nombre}' tiene tickets en curso. Solo puede ser desactivado.`);
                            return;
                          }
                          if (confirm(`¿Eliminar permanentemente el estado '${est.nombre}'?`)) {
                            onEliminarEstado(est.id_estado);
                          }
                        }}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Alta / Edición de Estado */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">
                {esNuevo ? "Nuevo Estado del Problema" : `Editar: ${estadoEnEdicion?.nombre}`}
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre del Estado <span className="text-rose-600">*</span> (3-30 caracteres)
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: En Análisis de Laboratorio"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código Interno <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  disabled={!esNuevo}
                  placeholder="en_laboratorio"
                  className="w-full font-mono border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Estado:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as any)}
                    disabled={estadoEnEdicion?.es_sistema}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 bg-white"
                  >
                    <option value="inicial">Inicial</option>
                    <option value="en_curso">En curso</option>
                    <option value="en_pausa">En pausa</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="final">Final</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Color representativo:</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-slate-600">{color}</span>
                  </div>
                </div>
              </div>

              {/* Gobernanza de Relojes OLA */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-700 block">Comportamiento de Relojes OLA</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600">Reloj Diagnóstico:</label>
                    <select
                      value={relojDiag}
                      onChange={(e) => setRelojDiag(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="corre">Corre</option>
                      <option value="pausado">Pausado</option>
                      <option value="detenido">Detenido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600">Reloj Resolución:</label>
                    <select
                      value={relojRes}
                      onChange={(e) => setRelojRes(e.target.value as any)}
                      className="w-full border border-slate-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="corre">Corre</option>
                      <option value="pausado">Pausado</option>
                      <option value="detenido">Detenido</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Permisos de Edición:</label>
                <select
                  value={permiteEdicion}
                  onChange={(e) => setPermiteEdicion(e.target.value as any)}
                  className="w-full border border-slate-300 rounded px-2 py-1.5 text-slate-800 bg-white"
                >
                  <option value="si">Edición completa de campos permitida</option>
                  <option value="solo_comentarios">Solo comentarios y bitácora</option>
                  <option value="no">Solo lectura (Bloqueo total)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción (Tooltip):</label>
                <textarea
                  rows={2}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              {errorLocal && <p className="text-xs text-rose-600 font-medium">{errorLocal}</p>}

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-3 py-1.5 rounded text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs"
                >
                  {guardando ? "Guardando..." : "Guardar estado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
