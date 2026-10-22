"use client";

import { useEffect, useState } from "react";

interface CategoriaItem {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  codigo_corto: string;
  estado_registro: boolean;
  total_articulos: number;
}

export default function VistaConfigCategorias() {
  const [categorias, setCategorias] = useState<CategoriaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Buscador en tiempo real
  const [busqueda, setBusqueda] = useState("");

  // Modal Crear
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevoCodigoCorto, setNuevoCodigoCorto] = useState("");
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  // Modal Editar
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaItem | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editCodigoCorto, setEditCodigoCorto] = useState("");
  const [editEstado, setEditEstado] = useState(true);
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  // Diálogo Eliminar
  const [categoriaEliminar, setCategoriaEliminar] = useState<CategoriaItem | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargarCategorias() {
    setCargando(true);
    setError("");
    try {
      const res = await fetch("/api/admin/conocimiento/categorias", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar categorías");
      setCategorias(data.categorias || []);
    } catch (e: any) {
      setError(e.message || "Error de conexión al cargar categorías");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCategorias();
  }, []);

  async function guardarNuevaCategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    setGuardandoNuevo(true);
    setError("");
    setOk("");

    try {
      const res = await fetch("/api/admin/conocimiento/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre.trim(),
          descripcion: nuevaDescripcion.trim(),
          codigo_corto: nuevoCodigoCorto.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo crear la categoría");

      setOk("Categoría de conocimiento creada correctamente.");
      setTimeout(() => setOk(""), 4000);
      setNuevoNombre("");
      setNuevaDescripcion("");
      setNuevoCodigoCorto("");
      setMostrarModalNuevo(false);
      cargarCategorias();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardandoNuevo(false);
    }
  }

  function abrirEdicion(cat: CategoriaItem) {
    setCategoriaEditando(cat);
    setEditNombre(cat.nombre || "");
    setEditDescripcion(cat.descripcion || "");
    setEditCodigoCorto(cat.codigo_corto || "");
    setEditEstado(cat.estado_registro);
    setError("");
    setOk("");
  }

  async function guardarEdicion(e: React.FormEvent) {
    e.preventDefault();
    if (!categoriaEditando) return;
    if (!editNombre.trim()) {
      setError("El nombre de la categoría es obligatorio.");
      return;
    }

    setGuardandoEdit(true);
    setError("");
    setOk("");

    try {
      const res = await fetch("/api/admin/conocimiento/categorias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_categoria: categoriaEditando.id_categoria,
          nombre: editNombre.trim(),
          descripcion: editDescripcion.trim(),
          codigo_corto: editCodigoCorto.trim() || undefined,
          estado_registro: editEstado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar la categoría");

      setOk(`Categoría "${editNombre.trim()}" actualizada exitosamente.`);
      setTimeout(() => setOk(""), 4000);
      setCategoriaEditando(null);
      cargarCategorias();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGuardandoEdit(false);
    }
  }

  async function cambiarEstado(cat: CategoriaItem) {
    setError("");
    setOk("");
    const nuevoEstado = !cat.estado_registro;
    try {
      const res = await fetch("/api/admin/conocimiento/categorias", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_categoria: cat.id_categoria,
          estado_registro: nuevoEstado,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo cambiar el estado de la categoría");

      setOk(`Categoría "${cat.nombre}" ${nuevoEstado ? "activada" : "desactivada"} exitosamente.`);
      setTimeout(() => setOk(""), 4000);
      cargarCategorias();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function confirmarEliminar() {
    if (!categoriaEliminar) return;

    setEliminando(true);
    setError("");
    setOk("");

    try {
      const res = await fetch(`/api/admin/conocimiento/categorias?id=${categoriaEliminar.id_categoria}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo eliminar la categoría");

      setOk(`Categoría "${categoriaEliminar.nombre}" eliminada correctamente.`);
      setTimeout(() => setOk(""), 4000);
      setCategoriaEliminar(null);
      cargarCategorias();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setEliminando(false);
    }
  }

  // Filtrado por buscador
  const categoriasFiltradas = categorias.filter((c) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.toLowerCase().trim();
    return (
      c.nombre.toLowerCase().includes(term) ||
      (c.codigo_corto && c.codigo_corto.toLowerCase().includes(term)) ||
      (c.descripcion && c.descripcion.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-5">
      {/* 1. Fila de Encabezado: Título a la izquierda, botones Actualizar y Nuevo pegados a la derecha (solo iconos) */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
            Taxonomía y Categorías de Conocimiento
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gestión de la estructura jerárquica de artículos de soporte, autoayuda y procedimientos técnicos.
          </p>
        </div>

        {/* Botones pegados a la derecha del título: sin nombre, solo símbolos */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={cargarCategorias}
            disabled={cargando}
            title="Actualizar catálogo de categorías"
            aria-label="Actualizar catálogo"
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <svg
              className={`w-5 h-5 ${cargando ? "animate-spin text-blue-600" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => {
              setNuevoNombre("");
              setNuevaDescripcion("");
              setNuevoCodigoCorto("");
              setMostrarModalNuevo(true);
            }}
            title="Nueva Categoría"
            aria-label="Nueva Categoría"
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors border border-blue-700 flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Buscador ubicado debajo del subtítulo */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por código, nombre o descripción..."
          className="w-full px-4 py-2 pl-10 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
        />
        <svg
          className="w-4 h-4 text-slate-400 absolute left-3 top-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Alertas */}
      {ok && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm">
          {ok}
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-800 dark:text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* 3. Tabla de categorías con columna de opciones */}
      {cargando ? (
        <div className="py-12 text-center text-sm text-slate-500">Cargando categorías...</div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Nombre de Categoría</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4 text-center">Artículos Activos</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-center" style={{ width: 220 }}>Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    {busqueda.trim()
                      ? "No se encontraron categorías que coincidan con la búsqueda."
                      : "No existen categorías registradas."}
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((cat) => (
                  <tr key={cat.id_categoria} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-blue-600 dark:text-blue-400">
                      {cat.codigo_corto || `CAT-${cat.id_categoria}`}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                      {cat.nombre}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {cat.descripcion || "-"}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-slate-800 dark:text-slate-200">
                      {cat.total_articulos}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          cat.estado_registro
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {cat.estado_registro ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => abrirEdicion(cat)}
                          className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                          title="Editar categoría"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => cambiarEstado(cat)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                            cat.estado_registro
                              ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200"
                              : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                          }`}
                          title={cat.estado_registro ? "Desactivar categoría" : "Activar categoría"}
                        >
                          {cat.estado_registro ? "Desactivar" : "Activar"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoriaEliminar(cat)}
                          className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                          title="Eliminar categoría"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Crear Nueva Categoría */}
      {mostrarModalNuevo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Crear Categoría de Conocimiento
            </h3>
            <form onSubmit={guardarNuevaCategoria} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Conectividad y Redes Remotas"
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Código Corto (opcional)
                </label>
                <input
                  type="text"
                  value={nuevoCodigoCorto}
                  onChange={(e) => setNuevoCodigoCorto(e.target.value.toUpperCase())}
                  placeholder="Ej: RED"
                  maxLength={10}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Detalle el alcance y temática de esta categoría..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoNuevo}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {guardandoNuevo ? "Guardando..." : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar Categoría */}
      {categoriaEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Editar Categoría de Conocimiento
            </h3>
            <form onSubmit={guardarEdicion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Código Corto
                </label>
                <input
                  type="text"
                  value={editCodigoCorto}
                  onChange={(e) => setEditCodigoCorto(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={editEstado}
                    onChange={(e) => setEditEstado(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Categoría activa y disponible en el catálogo</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCategoriaEditando(null)}
                  className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdit}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {guardandoEdit ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo de Confirmación: Eliminar Categoría */}
      {categoriaEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Confirmar Eliminación de Categoría
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              ¿Está seguro de que desea eliminar la categoría{" "}
              <strong className="text-slate-900 dark:text-white">
                [{categoriaEliminar.codigo_corto || `CAT-${categoriaEliminar.id_categoria}`}] {categoriaEliminar.nombre}
              </strong>?
            </p>
            {categoriaEliminar.total_articulos > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
                Atención: Esta categoría tiene {categoriaEliminar.total_articulos} artículo(s) asociado(s). El sistema no permitirá la eliminación física si existen dependencias activas; en su lugar, se sugiere desactivarla.
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCategoriaEliminar(null)}
                className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="px-4 py-2 text-sm bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {eliminando ? "Eliminando..." : "Confirmar Eliminación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
