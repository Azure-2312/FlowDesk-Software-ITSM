"use client";

import React, { useState } from "react";

interface PlantillaProblema {
  id_plantilla: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
  id_categoria?: number;
  categoria_nombre?: string;
  perfiles_visibles?: number[];
  valores_prellenados?: any;
  campos_bloqueados?: any;
  tareas_incluidas?: any[];
  veces_usada: number;
  fecha_modificacion: string;
}

interface PestanaPlantillasProps {
  plantillas: PlantillaProblema[];
  puedeEditar: boolean;
  onCrearPlantilla: (datos: any) => Promise<void>;
  onActualizarPlantilla: (id: number, datos: any) => Promise<void>;
  onEliminarPlantilla: (id: number) => Promise<void>;
}

export const PestanaPlantillas: React.FC<PestanaPlantillasProps> = ({
  plantillas,
  puedeEditar,
  onCrearPlantilla,
  onActualizarPlantilla,
  onEliminarPlantilla,
}) => {
  const [busqueda, setBusqueda] = useState("");
  const [modalEditor, setModalEditor] = useState(false);
  const [subPestanaEditor, setSubPestanaEditor] = useState<1 | 2 | 3 | 4>(1);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState<PlantillaProblema | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  // Estado del editor
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activa, setActiva] = useState(true);
  const [idCategoria, setIdCategoria] = useState<number | undefined>(undefined);
  const [valoresPrellenados, setValoresPrellenados] = useState<Record<string, any>>({});
  const [camposBloqueados, setCamposBloqueados] = useState<Record<string, boolean>>({});
  const [tareasIncluidas, setTareasIncluidas] = useState<any[]>([]);

  const abrirEditorNuevo = () => {
    setPlantillaSeleccionada(null);
    setNombre("");
    setDescripcion("");
    setActiva(true);
    setIdCategoria(undefined);
    setValoresPrellenados({
      origen: "incidente_recurrente",
      impacto: "2",
      urgencia: "2",
    });
    setCamposBloqueados({
      origen: true,
    });
    setTareasIncluidas([
      { orden: 1, titulo: "Recopilar logs y evidencias técnicas de los incidentes", obligatoria: true },
      { orden: 2, titulo: "Reproducir la falla en entorno de pruebas", obligatoria: false },
    ]);
    setSubPestanaEditor(1);
    setErrorLocal("");
    setModalEditor(true);
  };

  const abrirEditorExistente = (p: PlantillaProblema) => {
    setPlantillaSeleccionada(p);
    setNombre(p.nombre);
    setDescripcion(p.descripcion || "");
    setActiva(p.activa);
    setIdCategoria(p.id_categoria);
    setValoresPrellenados(p.valores_prellenados || {});
    setCamposBloqueados(p.campos_bloqueados || {});
    setTareasIncluidas(p.tareas_incluidas || []);
    setSubPestanaEditor(1);
    setErrorLocal("");
    setModalEditor(true);
  };

  const handleGuardarPlantilla = async () => {
    if (!nombre || nombre.trim().length < 5) {
      setErrorLocal("El nombre de la plantilla es obligatorio (mínimo 5 caracteres).");
      setSubPestanaEditor(1);
      return;
    }

    try {
      setGuardando(true);
      setErrorLocal("");

      const datos = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activa,
        id_categoria: idCategoria || null,
        valores_prellenados: valoresPrellenados,
        campos_bloqueados: camposBloqueados,
        tareas_incluidas: tareasIncluidas,
      };

      if (plantillaSeleccionada) {
        await onActualizarPlantilla(plantillaSeleccionada.id_plantilla, datos);
      } else {
        await onCrearPlantilla(datos);
      }

      setModalEditor(false);
    } catch (err: any) {
      setErrorLocal(err.message || "Error al guardar la plantilla");
    } finally {
      setGuardando(false);
    }
  };

  const plantillasFiltradas = plantillas.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Barra de Filtros y Botón de Creación */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 w-64 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-slate-500 font-medium">
            {plantillas.length} plantillas configuradas
          </span>
        </div>

        <button
          type="button"
          onClick={abrirEditorNuevo}
          disabled={!puedeEditar}
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
        >
          + Nueva plantilla
        </button>
      </div>

      {/* Tabla de Plantillas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Nombre de Plantilla</th>
              <th className="py-3 px-4">Categoría Sugerida</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-center">Veces Usada</th>
              <th className="py-3 px-4">Última Modificación</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {plantillasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                  No se encontraron plantillas de problema.
                </td>
              </tr>
            ) : (
              plantillasFiltradas.map((p) => (
                <tr key={p.id_plantilla} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {p.nombre}
                    {p.descripcion && (
                      <p className="text-[11px] text-slate-400 font-normal truncate max-w-sm">
                        {p.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {p.categoria_nombre || "General (Cualquier categoría)"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.activa
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {p.activa ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-800">
                    {p.veces_usada || 0}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500">
                    {new Date(p.fecha_modificacion).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      type="button"
                      onClick={() => abrirEditorExistente(p)}
                      disabled={!puedeEditar}
                      className="px-2.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onActualizarPlantilla(p.id_plantilla, { activa: !p.activa })
                      }
                      disabled={!puedeEditar}
                      className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 border border-slate-300 rounded"
                    >
                      {p.activa ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (p.veces_usada > 0) {
                          alert(`Esta plantilla se ha usado ${p.veces_usada} veces. Solo puede desactivarse.`);
                          return;
                        }
                        if (confirm(`¿Eliminar la plantilla '${p.nombre}'?`)) {
                          onEliminarPlantilla(p.id_plantilla);
                        }
                      }}
                      disabled={p.veces_usada > 0 || !puedeEditar}
                      className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 disabled:opacity-30 rounded"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Editor Modal de Plantilla en 4 Pestañas Internas (Sección 6.5) */}
      {modalEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* Cabecera del Editor */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                  Configurador de Plantilla ITIL 4
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {plantillaSeleccionada ? `Editar: ${plantillaSeleccionada.nombre}` : "Nueva Plantilla de Problema"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalEditor(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Pestañas Internas del Editor (1 General, 2 Valores, 3 Tareas, 4 Vista Previa) */}
            <div className="flex border-b border-slate-200 space-x-2 text-xs font-semibold">
              {[
                { id: 1, label: "1. Parámetros Generales" },
                { id: 2, label: "2. Valores Prellenados y Bloqueos" },
                { id: 3, label: "3. Tareas Incluidas" },
                { id: 4, label: "4. Vista Previa de la Plantilla" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSubPestanaEditor(p.id as any)}
                  className={`py-2 px-3 border-b-2 transition ${
                    subPestanaEditor === p.id
                      ? "border-blue-600 text-blue-600 font-bold"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Contenido según la subpestaña */}
            <div className="min-h-[300px] text-xs space-y-4">
              {/* SUBPESTAÑA 1: General */}
              {subPestanaEditor === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nombre de la Plantilla <span className="text-rose-600">*</span> (5-100 caracteres)
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Problema Recurrente de Incidentes"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Descripción del propósito
                    </label>
                    <textarea
                      rows={3}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Indique cuándo debe utilizarse esta plantilla..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                    />
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={activa}
                      onChange={(e) => setActiva(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span className="font-semibold text-slate-800">Plantilla activa para su uso</span>
                  </label>
                </div>
              )}

              {/* SUBPESTAÑA 2: Valores Prellenados */}
              {subPestanaEditor === 2 && (
                <div className="space-y-3">
                  <p className="text-slate-500 text-[11px]">
                    Configure los datos predeterminados. Active el interruptor de bloqueo para impedir que el técnico modifique el valor durante el registro.
                  </p>

                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {/* Título sugerido */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <label className="block font-semibold text-slate-700 mb-0.5">Título Sugerido:</label>
                        <input
                          type="text"
                          value={valoresPrellenados.titulo || ""}
                          onChange={(e) =>
                            setValoresPrellenados({ ...valoresPrellenados, titulo: e.target.value })
                          }
                          placeholder="[Plantilla] Falla recurrente..."
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                        />
                      </div>
                      <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={camposBloqueados.titulo || false}
                          onChange={(e) =>
                            setCamposBloqueados({ ...camposBloqueados, titulo: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span>Bloquear edición</span>
                      </label>
                    </div>

                    {/* Origen */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <label className="block font-semibold text-slate-700 mb-0.5">Origen Predefinido:</label>
                        <select
                          value={valoresPrellenados.origen || "incidente_recurrente"}
                          onChange={(e) =>
                            setValoresPrellenados({ ...valoresPrellenados, origen: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                        >
                          <option value="incidente_recurrente">Incidente(s) recurrente(s)</option>
                          <option value="deteccion_proactiva">Detección proactiva</option>
                          <option value="tendencias">Análisis de tendencias</option>
                          <option value="proveedor">Notificación de proveedor</option>
                        </select>
                      </div>
                      <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-semibold text-slate-600">
                        <input
                          type="checkbox"
                          checked={camposBloqueados.origen || false}
                          onChange={(e) =>
                            setCamposBloqueados({ ...camposBloqueados, origen: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        <span>Bloquear edición</span>
                      </label>
                    </div>

                    {/* Impacto y Urgencia prellenados */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Impacto predeterminado:</label>
                        <select
                          value={valoresPrellenados.impacto || "2"}
                          onChange={(e) =>
                            setValoresPrellenados({ ...valoresPrellenados, impacto: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                        >
                          <option value="3">Alta</option>
                          <option value="2">Media</option>
                          <option value="1">Baja</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-0.5">Urgencia predeterminada:</label>
                        <select
                          value={valoresPrellenados.urgencia || "2"}
                          onChange={(e) =>
                            setValoresPrellenados({ ...valoresPrellenados, urgencia: e.target.value })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                        >
                          <option value="3">Alta</option>
                          <option value="2">Media</option>
                          <option value="1">Baja</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUBPESTAÑA 3: Tareas Incluidas */}
              {subPestanaEditor === 3 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">
                      Tareas técnicas generadas automáticamente al aplicar la plantilla:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setTareasIncluidas([
                          ...tareasIncluidas,
                          {
                            orden: tareasIncluidas.length + 1,
                            titulo: "Nueva tarea técnica",
                            obligatoria: false,
                          },
                        ])
                      }
                      className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded"
                    >
                      + Añadir tarea
                    </button>
                  </div>

                  <div className="space-y-2">
                    {tareasIncluidas.map((tarea, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between space-x-3"
                      >
                        <span className="font-mono text-slate-400 text-xs">#{tIdx + 1}</span>
                        <input
                          type="text"
                          value={tarea.titulo}
                          onChange={(e) => {
                            const nuevas = [...tareasIncluidas];
                            nuevas[tIdx].titulo = e.target.value;
                            setTareasIncluidas(nuevas);
                          }}
                          className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs"
                        />
                        <label className="flex items-center space-x-1.5 text-xs text-slate-700">
                          <input
                            type="checkbox"
                            checked={tarea.obligatoria}
                            onChange={(e) => {
                              const nuevas = [...tareasIncluidas];
                              nuevas[tIdx].obligatoria = e.target.checked;
                              setTareasIncluidas(nuevas);
                            }}
                            className="rounded text-blue-600"
                          />
                          <span>Obligatoria</span>
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            setTareasIncluidas(tareasIncluidas.filter((_, i) => i !== tIdx))
                          }
                          className="text-rose-600 hover:text-rose-800 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBPESTAÑA 4: Vista Previa */}
              {subPestanaEditor === 4 && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 text-sm">{nombre || "Plantilla sin título"}</div>
                  <p className="text-slate-500">{descripcion || "Sin descripción"}</p>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div>
                      Origen: <strong>{valoresPrellenados.origen || "N/A"}</strong>{" "}
                      {camposBloqueados.origen && <span className="text-amber-600">[Bloqueado]</span>}
                    </div>
                    <div>
                      Impacto: <strong>{valoresPrellenados.impacto || "2"}</strong> | Urgencia:{" "}
                      <strong>{valoresPrellenados.urgencia || "2"}</strong>
                    </div>
                    <div>
                      Tareas preprogramadas: <strong>{tareasIncluidas.length} tareas</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorLocal && <p className="text-xs text-rose-600 font-medium">{errorLocal}</p>}

            {/* Pie de Acciones del Editor */}
            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalEditor(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarPlantilla}
                disabled={guardando}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
              >
                {guardando ? "Guardando..." : "Guardar plantilla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
