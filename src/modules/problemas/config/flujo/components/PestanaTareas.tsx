"use client";

import React, { useState } from "react";

export interface TareaCatalogo {
  id_tarea: number;
  codigo: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  id_departamento_destino?: number;
  departamento_nombre?: string;
  duracion_estimada_horas: number;
  offset_dias_vencimiento: number;
  obligatoria: boolean;
  checklist?: string[];
  activa: boolean;
}

export interface PaqueteTareas {
  id_paquete: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tareas: any[];
  regla_aplicacion?: any;
  activo: boolean;
}

interface PestanaTareasProps {
  tareas: TareaCatalogo[];
  paquetes: PaqueteTareas[];
  departamentos: any[];
  puedeEditar: boolean;
  onCrearTarea: (datos: any) => Promise<void>;
  onEliminarTarea: (id: number, tipo: "tarea" | "paquete") => Promise<void>;
}

export const PestanaTareas: React.FC<PestanaTareasProps> = ({
  tareas,
  paquetes,
  departamentos,
  puedeEditar,
  onCrearTarea,
  onEliminarTarea,
}) => {
  const [modalNuevaTarea, setModalNuevaTarea] = useState(false);
  const [modalNuevoPaquete, setModalNuevoPaquete] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Formulario Tarea
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("investigacion");
  const [duracion, setDuracion] = useState(4);
  const [obligatoria, setObligatoria] = useState(false);

  // Formulario Paquete
  const [nombrePaquete, setNombrePaquete] = useState("");
  const [descPaquete, setDescPaquete] = useState("");
  const [tareasSelPaquete, setTareasSelPaquete] = useState<string[]>([]);

  const handleCrearTareaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    try {
      setGuardando(true);
      await onCrearTarea({
        tipo_entidad: "tarea",
        titulo: titulo.trim(),
        tipo,
        duracion_estimada_horas: duracion,
        obligatoria,
      });
      setTitulo("");
      setModalNuevaTarea(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleCrearPaqueteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombrePaquete.trim()) return;
    try {
      setGuardando(true);
      await onCrearTarea({
        tipo_entidad: "paquete",
        nombre: nombrePaquete.trim(),
        descripcion: descPaquete.trim(),
        tareas: tareasSelPaquete.map((codigo, idx) => ({ codigo, orden: idx + 1 })),
      });
      setNombrePaquete("");
      setDescPaquete("");
      setTareasSelPaquete([]);
      setModalNuevoPaquete(false);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN A: Catálogo de Tareas Técnicas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Sección A — Catálogo de Tareas Técnicas de Investigación
            </h3>
            <p className="text-xs text-slate-500">
              Actividades especializadas disponibles para asignación individual o en paquetes metodológicos.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalNuevaTarea(true)}
            disabled={!puedeEditar}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-xs transition"
          >
            + Nueva tarea
          </button>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Título de la Tarea</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3 text-center">Duración Estimada</th>
                <th className="py-2.5 px-3 text-center">Obligatoria</th>
                <th className="py-2.5 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {tareas.map((t) => (
                <tr key={t.id_tarea} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{t.codigo}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{t.titulo}</td>
                  <td className="py-2.5 px-3 capitalize">{t.tipo}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                    {t.duracion_estimada_horas}h
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {t.obligatoria ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        Obligatoria
                      </span>
                    ) : (
                      <span className="text-slate-400">Opcional</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`¿Eliminar la tarea '${t.titulo}'?`)) {
                          onEliminarTarea(t.id_tarea, "tarea");
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
      </div>

      {/* SECCIÓN B: Paquetes de Tareas */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Sección B — Paquetes de Tareas Preconfigurados
            </h3>
            <p className="text-xs text-slate-500">
              Conjuntos estructurados que se activan según la categoría, plantilla o severidad del problema.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModalNuevoPaquete(true)}
            disabled={!puedeEditar}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition"
          >
            + Nuevo paquete
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-xs">
          {paquetes.map((p) => (
            <div
              key={p.id_paquete}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{p.nombre}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Activo
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">{p.descripcion}</p>

                <div className="space-y-1 pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700 block text-[11px]">
                    Tareas Incluidas ({Array.isArray(p.tareas) ? p.tareas.length : 0}):
                  </span>
                  <div className="space-y-1">
                    {Array.isArray(p.tareas) &&
                      p.tareas.slice(0, 4).map((tItem: any, iIdx: number) => {
                        const tareaObj = tareas.find((t) => t.codigo === tItem.codigo);
                        return (
                          <div
                            key={iIdx}
                            className="p-1.5 bg-white border border-slate-200 rounded text-[11px] flex items-center justify-between"
                          >
                            <span className="truncate">{tareaObj?.titulo || tItem.codigo}</span>
                            <span className="font-mono text-slate-400">#{iIdx + 1}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`¿Eliminar el paquete '${p.nombre}'?`)) {
                      onEliminarTarea(p.id_paquete, "paquete");
                    }
                  }}
                  disabled={!puedeEditar}
                  className="text-rose-600 hover:text-rose-800 font-medium text-[11px]"
                >
                  Eliminar paquete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Alta de Tarea */}
      {modalNuevaTarea && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Nueva Tarea Técnica</h3>
            <form onSubmit={handleCrearTareaSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Título de la actividad:</label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Análisis de volcado de memoria (Memory Dump)"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo:</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 bg-white"
                  >
                    <option value="investigacion">Investigación</option>
                    <option value="logs">Revisión de logs</option>
                    <option value="laboratorio">Prueba en laboratorio</option>
                    <option value="proveedor">Contacto con proveedor</option>
                    <option value="documentacion">Documentación</option>
                    <option value="validacion">Validación</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duración estimada (h):</label>
                  <input
                    type="number"
                    min={1}
                    value={duracion}
                    onChange={(e) => setDuracion(parseInt(e.target.value, 10) || 1)}
                    className="w-full border border-slate-300 rounded px-2 py-1.5 font-bold"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={obligatoria}
                  onChange={(e) => setObligatoria(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-700">
                  Tarea obligatoria (bloquea la transición a Resuelto)
                </span>
              </label>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalNuevaTarea(false)}
                  className="px-3 py-1.5 rounded text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  {guardando ? "Creando..." : "Crear tarea"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alta de Paquete */}
      {modalNuevoPaquete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Nuevo Paquete de Tareas</h3>
            <form onSubmit={handleCrearPaqueteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del paquete:</label>
                <input
                  type="text"
                  value={nombrePaquete}
                  onChange={(e) => setNombrePaquete(e.target.value)}
                  placeholder="Ej: Diagnóstico de Base de Datos"
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción:</label>
                <textarea
                  rows={2}
                  value={descPaquete}
                  onChange={(e) => setDescPaquete(e.target.value)}
                  className="w-full border border-slate-300 rounded px-2.5 py-1.5"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seleccionar Tareas:</label>
                <div className="max-h-36 overflow-y-auto p-2 bg-slate-50 border rounded space-y-1">
                  {tareas.map((t) => (
                    <label key={t.id_tarea} className="flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tareasSelPaquete.includes(t.codigo)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTareasSelPaquete([...tareasSelPaquete, t.codigo]);
                          } else {
                            setTareasSelPaquete(tareasSelPaquete.filter((c) => c !== t.codigo));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span className="truncate">{t.titulo}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalNuevoPaquete(false)}
                  className="px-3 py-1.5 rounded text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-4 py-1.5 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700"
                >
                  {guardando ? "Creando..." : "Crear paquete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
