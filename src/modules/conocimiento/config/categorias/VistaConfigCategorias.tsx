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
    <div className="vista-contenedor">
      {/* 1. Encabezado: Título a la izquierda y botones Actualizar / Nuevo a la derecha (solo iconos) */}
      <div
        className="cabecera-pagina"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 14,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1>Taxonomía y Categorías de Conocimiento</h1>
          <p
            className="subtitulo"
            style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}
          >
            Gestión de la estructura jerárquica de artículos de soporte, autoayuda y procedimientos técnicos.
          </p>
        </div>

        {/* Botones pegados a la derecha del espacio del título: solo iconos, sin palabras */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Botón Actualizar (Solo Icono) */}
          <button
            type="button"
            onClick={cargarCategorias}
            disabled={cargando}
            title="Actualizar catálogo"
            aria-label="Actualizar catálogo"
            className="boton-accion-icono"
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #cbd5e1",
              backgroundColor: "#ffffff",
              cursor: cargando ? "wait" : "pointer",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cargando ? "animate-spin" : ""}
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>

          {/* Botón Nueva Categoría (Solo Icono +) */}
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
            className="boton-primario"
            style={{
              width: 36,
              height: 36,
              padding: 0,
              borderRadius: 6,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#2563eb",
              border: "1px solid #1d4ed8",
              cursor: "pointer",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. Buscador ubicado debajo del subtítulo */}
      <div style={{ marginBottom: 16, maxWidth: 360, position: "relative" }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar por código, nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            paddingLeft: 34,
            fontSize: 13,
            width: "100%",
            height: 38,
            borderRadius: 6,
            border: "1px solid #cbd5e1",
          }}
        />
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", left: 10, top: 12, pointerEvents: "none" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>

      {/* Banners de Notificación / Alertas */}
      {ok && (
        <p
          role="status"
          className="mensaje-exito"
          style={{
            padding: "8px 12px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#166534",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {ok}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mensaje-error"
          style={{
            padding: "8px 12px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {error}
        </p>
      )}

      {/* 3. Tabla con sus opciones por fila (todas con iconos, sin palabras) */}
      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
          Cargando categorías de conocimiento...
        </div>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th style={{ width: 85 }}>Código</th>
                <th>Nombre de Categoría</th>
                <th>Descripción</th>
                <th style={{ textAlign: "center", width: 130 }}>Artículos Activos</th>
                <th style={{ textAlign: "center", width: 95 }}>Estado</th>
                <th style={{ textAlign: "center", width: 130 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categoriasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                    {busqueda.trim()
                      ? "No se encontraron categorías que coincidan con la búsqueda."
                      : "No existen categorías registradas."}
                  </td>
                </tr>
              ) : (
                categoriasFiltradas.map((cat) => (
                  <tr key={cat.id_categoria}>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 12, color: "#2563eb" }}>
                      {cat.codigo_corto || `CAT-${cat.id_categoria}`}
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{cat.nombre}</strong>
                    </td>
                    <td style={{ fontSize: 12.5, color: "#475569" }}>
                      {cat.descripcion || "-"}
                    </td>
                    <td style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>
                      {cat.total_articulos}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`badge-itil ${cat.estado_registro ? "badge-activo" : "badge-inactivo"}`}>
                        {cat.estado_registro ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                        {/* Botón Editar - Solo Icono Lápiz */}
                        <button
                          type="button"
                          className="boton-accion-icono"
                          onClick={() => abrirEdicion(cat)}
                          title="Editar categoría"
                          aria-label="Editar categoría"
                          style={{
                            width: 30,
                            height: 30,
                            color: "#2563eb",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>

                        {/* Botón Desactivar / Activar - Solo Icono */}
                        <button
                          type="button"
                          className="boton-accion-icono"
                          onClick={() => cambiarEstado(cat)}
                          title={cat.estado_registro ? "Desactivar categoría" : "Activar categoría"}
                          aria-label={cat.estado_registro ? "Desactivar categoría" : "Activar categoría"}
                          style={{
                            width: 30,
                            height: 30,
                            color: cat.estado_registro ? "#b45309" : "#16a34a",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {cat.estado_registro ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="10" y1="15" x2="10" y2="9" />
                              <line x1="14" y1="15" x2="14" y2="9" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
                        </button>

                        {/* Botón Eliminar - Solo Icono Papelera */}
                        <button
                          type="button"
                          className="boton-accion-icono boton-accion-peligro"
                          onClick={() => setCategoriaEliminar(cat)}
                          title="Eliminar categoría"
                          aria-label="Eliminar categoría"
                          style={{
                            width: 30,
                            height: 30,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
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
        <div className="modal-overlay" onClick={() => setMostrarModalNuevo(false)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, padding: 24, backgroundColor: "#ffffff", borderRadius: 10 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#0f172a" }}>
              Nueva Categoría de Conocimiento
            </h2>
            <form onSubmit={guardarNuevaCategoria} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej: Conectividad y Redes Remotas"
                  className="input-base"
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Código Corto (Identificador opcional)
                </label>
                <input
                  type="text"
                  value={nuevoCodigoCorto}
                  onChange={(e) => setNuevoCodigoCorto(e.target.value.toUpperCase())}
                  placeholder="Ej: RED"
                  maxLength={10}
                  className="input-base"
                  style={{ width: "100%", fontSize: 13, fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Descripción
                </label>
                <textarea
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  rows={3}
                  placeholder="Detalle el alcance y temática de esta categoría..."
                  className="input-base"
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setMostrarModalNuevo(false)}
                  className="boton-secundario"
                  style={{ fontSize: 13, padding: "7px 14px" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoNuevo}
                  className="boton-primario"
                  style={{ fontSize: 13, padding: "7px 16px" }}
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
        <div className="modal-overlay" onClick={() => setCategoriaEditando(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, padding: 24, backgroundColor: "#ffffff", borderRadius: 10 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#0f172a" }}>
              Editar Categoría de Conocimiento
            </h2>
            <form onSubmit={guardarEdicion} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="input-base"
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Código Corto
                </label>
                <input
                  type="text"
                  value={editCodigoCorto}
                  onChange={(e) => setEditCodigoCorto(e.target.value.toUpperCase())}
                  maxLength={10}
                  className="input-base"
                  style={{ width: "100%", fontSize: 13, fontFamily: "monospace" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Descripción
                </label>
                <textarea
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  rows={3}
                  className="input-base"
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div style={{ marginTop: 4 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={editEstado}
                    onChange={(e) => setEditEstado(e.target.checked)}
                  />
                  <span>Categoría activa y disponible en el catálogo</span>
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setCategoriaEditando(null)}
                  className="boton-secundario"
                  style={{ fontSize: 13, padding: "7px 14px" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdit}
                  className="boton-primario"
                  style={{ fontSize: 13, padding: "7px 16px" }}
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
        <div className="modal-overlay" onClick={() => setCategoriaEliminar(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, padding: 24, backgroundColor: "#ffffff", borderRadius: 10 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 10px", color: "#991b1b" }}>
              Confirmar Eliminación de Categoría
            </h2>
            <p style={{ fontSize: 13, color: "#475569", margin: "0 0 12px", lineHeight: 1.45 }}>
              ¿Está seguro de que desea eliminar permanentemente la categoría{" "}
              <strong style={{ color: "#0f172a" }}>
                [{categoriaEliminar.codigo_corto || `CAT-${categoriaEliminar.id_categoria}`}] {categoriaEliminar.nombre}
              </strong>?
            </p>
            {categoriaEliminar.total_articulos > 0 && (
              <div
                style={{
                  padding: "10px 12px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: 6,
                  color: "#92400e",
                  fontSize: 12,
                  marginBottom: 14,
                }}
              >
                Advertencia: Esta categoría contiene {categoriaEliminar.total_articulos} artículo(s) asociado(s). La base de datos no permitirá eliminarla si existen dependencias activas; en su lugar, le recomendamos desactivarla.
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                onClick={() => setCategoriaEliminar(null)}
                className="boton-secundario"
                style={{ fontSize: 13, padding: "7px 14px" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarEliminar}
                disabled={eliminando}
                className="boton-primario"
                style={{ backgroundColor: "#dc2626", borderColor: "#b91c1c", fontSize: 13, padding: "7px 16px" }}
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
