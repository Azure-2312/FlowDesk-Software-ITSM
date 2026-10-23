"use client";

import React, { useState, useEffect } from "react";

interface CatalogoItem {
  id_item: number;
  catalogo: string;
  id_padre?: number | null;
  padre_nombre?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color: string;
  orden: number;
  activo: boolean;
  es_sistema: boolean;
  atributos?: any;
  usos_count: number;
}

const CATALOGOS_CAMBIOS = [
  { id: "categorias_cambio", nombre: "Categorías de cambio", desc: "Clasificación jerárquica en 2 niveles" },
  { id: "origenes", nombre: "Orígenes", desc: "Procedencia formal del requerimiento de cambio" },
  { id: "entornos", nombre: "Entornos", desc: "Ambientes tecnológicos y ponderación de criticidad" },
  { id: "resultados_implementacion", nombre: "Resultados de implementación", desc: "Dictamen técnico tras ejecutar la ventana ([Bloqueado])" },
  { id: "codigos_cierre", nombre: "Códigos de cierre", desc: "Estado de culminación formal y efectos en KPI" },
  { id: "motivos_rechazo", nombre: "Motivos de rechazo", desc: "Causales de denegación por evaluador o CAB" },
  { id: "motivos_aplazamiento", nombre: "Motivos de aplazamiento", desc: "Causales de reprogramación de ventana" },
  { id: "causas_fallo", nombre: "Causas de fallo", desc: "Factores raíz ante fallo o ejecución de rollback" },
  { id: "tipos_dependencia", nombre: "Tipos de dependencia", desc: "Relaciones de bloqueo o concurrencia ([Bloqueado])" },
  { id: "medios_emergencia", nombre: "Medios de autorización de emergencia", desc: "Canales de dictamen verbal o inmediato para ECAB" },
];

export const PestanaCatalogos: React.FC = () => {
  const [catalogoSeleccionado, setCatalogoSeleccionado] = useState<string>("categorias_cambio");
  const [items, setItems] = useState<CatalogoItem[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");

  // Modales
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalFusionarAbierto, setModalFusionarAbierto] = useState(false);
  const [itemEditar, setItemEditar] = useState<CatalogoItem | null>(null);

  // Campos para nuevo / edición
  const [formCodigo, setFormCodigo] = useState("");
  const [formNombre, setFormNombre] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formColor, setFormColor] = useState("#475569");
  const [formIdPadre, setFormIdPadre] = useState<number | "">("");
  const [formDestinoFusion, setFormDestinoFusion] = useState<number | "">("");
  const [errorModal, setErrorModal] = useState("");

  const cargarCatalogo = async (cat: string) => {
    setCargando(true);
    try {
      const res = await fetch(`/api/cambios/configuracion/catalogos?catalogo=${cat}`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error("Error al cargar catálogo:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCatalogo(catalogoSeleccionado);
  }, [catalogoSeleccionado]);

  const abrirCrear = () => {
    setFormCodigo("");
    setFormNombre("");
    setFormDescripcion("");
    setFormColor("#2563eb");
    setFormIdPadre("");
    setErrorModal("");
    setModalNuevoAbierto(true);
  };

  const abrirEditar = (item: CatalogoItem) => {
    setItemEditar(item);
    setFormNombre(item.nombre);
    setFormDescripcion(item.descripcion || "");
    setFormColor(item.color || "#475569");
    setFormIdPadre(item.id_padre || "");
    setErrorModal("");
    setModalEditarAbierto(true);
  };

  const abrirFusionar = (item: CatalogoItem) => {
    setItemEditar(item);
    setFormDestinoFusion("");
    setErrorModal("");
    setModalFusionarAbierto(true);
  };

  const guardarNuevo = async () => {
    if (!formCodigo.trim() || !formNombre.trim()) {
      setErrorModal("Código y nombre son obligatorios.");
      return;
    }

    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          catalogo: catalogoSeleccionado,
          codigo: formCodigo,
          nombre: formNombre,
          descripcion: formDescripcion,
          color: formColor,
          id_padre: formIdPadre || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al crear elemento.");
        return;
      }

      setModalNuevoAbierto(false);
      cargarCatalogo(catalogoSeleccionado);
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar.");
    }
  };

  const guardarEdicion = async () => {
    if (!itemEditar || !formNombre.trim()) {
      setErrorModal("El nombre es obligatorio.");
      return;
    }

    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_item: itemEditar.id_item,
          nombre: formNombre,
          descripcion: formDescripcion,
          color: formColor,
          id_padre: formIdPadre || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al actualizar.");
        return;
      }

      setModalEditarAbierto(false);
      cargarCatalogo(catalogoSeleccionado);
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar.");
    }
  };

  const ejecutarFusion = async () => {
    if (!itemEditar || !formDestinoFusion) {
      setErrorModal("Seleccione el elemento destino.");
      return;
    }

    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "fusionar",
          id_origen: itemEditar.id_item,
          id_destino: Number(formDestinoFusion),
          catalogo: catalogoSeleccionado,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al fusionar.");
        return;
      }

      alert(data.mensaje || "Fusión completada.");
      setModalFusionarAbierto(false);
      cargarCatalogo(catalogoSeleccionado);
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar.");
    }
  };

  const alternarActivo = async (item: CatalogoItem) => {
    try {
      const res = await fetch("/api/cambios/configuracion/catalogos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_item: item.id_item, activo: !item.activo }),
      });
      const data = await res.json();
      if (res.ok) {
        cargarCatalogo(catalogoSeleccionado);
      } else {
        alert(data.error || "No se pudo cambiar el estado.");
      }
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const eliminarItem = async (item: CatalogoItem) => {
    if (!confirm(`¿Está seguro de eliminar "${item.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/cambios/configuracion/catalogos?id_item=${item.id_item}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        cargarCatalogo(catalogoSeleccionado);
      } else {
        alert(data.error || "No se pudo eliminar.");
      }
    } catch (err) {
      console.error("Error al eliminar elemento:", err);
    }
  };

  // Filtrado de items
  const itemsFiltrados = items.filter((it) => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return it.nombre.toLowerCase().includes(txt) || it.codigo.toLowerCase().includes(txt) || (it.padre_nombre && it.padre_nombre.toLowerCase().includes(txt));
  });

  // Categorías padre para selector de subcategorías
  const categoriasPadre = items.filter((it) => !it.id_padre);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
      {/* Columna Izquierda: Lista de los 11 Catálogos */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "4px 8px 8px 8px" }}>
          Catálogos de Gestión de Cambios
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {CATALOGOS_CAMBIOS.map((cat) => {
            const activo = catalogoSeleccionado === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => setCatalogoSeleccionado(cat.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: activo ? "#eff6ff" : "transparent",
                  border: `1px solid ${activo ? "#bfdbfe" : "transparent"}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: activo ? 700 : 600, color: activo ? "#1d4ed8" : "#334155" }}>
                  {cat.nombre}
                </span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{cat.desc}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Columna Derecha: Tabla y Gestión del Catálogo Seleccionado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Cabecera del catálogo activo */}
        <div style={{ backgroundColor: "#ffffff", padding: "12px 18px", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              {CATALOGOS_CAMBIOS.find((c) => c.id === catalogoSeleccionado)?.nombre}
            </h3>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              {items.length} valores registrados ({items.filter((i) => i.activo).length} activos)
            </span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="boton-primario"
              onClick={abrirCrear}
              style={{ fontSize: 12, padding: "6px 12px", backgroundColor: "#2563eb" }}
            >
              + Nuevo Valor
            </button>
          </div>
        </div>

        {/* Filtro rápido */}
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            className="input-base"
            placeholder="Buscar valor o código en este catálogo..."
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
            style={{ maxWidth: 340, fontSize: 12 }}
          />
        </div>

        {/* Tabla de Items */}
        <div className="contenedor-tabla">
          {cargando ? (
            <div style={{ textAlign: "center", padding: 32, color: "#2563eb" }}>Cargando catálogo...</div>
          ) : (
            <table className="tabla">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>Color</th>
                  <th>Nombre</th>
                  <th>Código</th>
                  {catalogoSeleccionado === "categorias_cambio" && <th>Categoría Padre</th>}
                  <th>Descripción</th>
                  <th style={{ width: 80, textAlign: "center" }}>Usos</th>
                  <th style={{ width: 90 }}>Estado</th>
                  <th style={{ width: 140 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={catalogoSeleccionado === "categorias_cambio" ? 8 : 7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                      No hay registros en este catálogo.
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((it) => (
                    <tr key={it.id_item}>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            backgroundColor: it.color || "#475569",
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: "#1e293b" }}>
                        {it.nombre}
                        {it.es_sistema && (
                          <span title="Valor base del sistema protegido" style={{ marginLeft: 6, fontSize: 11 }}>
                            [Bloqueado]
                          </span>
                        )}
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "#64748b" }}>{it.codigo}</td>
                      {catalogoSeleccionado === "categorias_cambio" && (
                        <td style={{ fontSize: 12, color: it.id_padre ? "#2563eb" : "#94a3b8" }}>
                          {it.padre_nombre || "— Principal"}
                        </td>
                      )}
                      <td style={{ fontSize: 12, color: "#475569" }}>{it.descripcion || "—"}</td>
                      <td style={{ textAlign: "center", fontWeight: 700, color: it.usos_count > 0 ? "#2563eb" : "#94a3b8" }}>
                        {it.usos_count}
                      </td>
                      <td>
                        <span
                          className="badge-itil"
                          style={{
                            backgroundColor: it.activo ? "#dcfce7" : "#f1f5f9",
                            color: it.activo ? "#166534" : "#64748b",
                            border: `1px solid ${it.activo ? "#86efac" : "#cbd5e1"}`,
                            fontSize: 10.5,
                            fontWeight: 700,
                          }}
                        >
                          {it.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => abrirEditar(it)}
                            style={{ fontSize: 11, padding: "2px 6px" }}
                          >
                            Editar
                          </button>
                          {!it.es_sistema && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => alternarActivo(it)}
                              style={{ fontSize: 11, padding: "2px 6px" }}
                            >
                              {it.activo ? "Desact" : "Act"}
                            </button>
                          )}
                          {!it.es_sistema && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => abrirFusionar(it)}
                              style={{ fontSize: 11, padding: "2px 6px", color: "#d97706" }}
                              title="Fusionar este valor en otro existente"
                            >
                              Fusionar
                            </button>
                          )}
                          {!it.es_sistema && it.usos_count === 0 && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => eliminarItem(it)}
                              style={{ fontSize: 11, padding: "2px 6px", color: "#dc2626" }}
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal Crear Nuevo Elemento */}
      {modalNuevoAbierto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={() => setModalNuevoAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 480, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
              Nuevo Valor en {CATALOGOS_CAMBIOS.find((c) => c.id === catalogoSeleccionado)?.nombre}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Nombre del valor <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={formNombre}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormNombre(v);
                    if (!formCodigo) setFormCodigo(v.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30));
                  }}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Código único <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={formCodigo}
                  onChange={(e) => setFormCodigo(e.target.value.toLowerCase())}
                  style={{ width: "100%", fontSize: 12, fontFamily: "monospace" }}
                />
              </div>

              {catalogoSeleccionado === "categorias_cambio" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Categoría Padre (Opcional si es categoría principal)
                  </label>
                  <select
                    className="input-base"
                    value={formIdPadre}
                    onChange={(e) => setFormIdPadre(e.target.value ? Number(e.target.value) : "")}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="">— Ninguna (Categoría principal de nivel 1)</option>
                    {categoriasPadre.map((cp) => (
                      <option key={cp.id_item} value={cp.id_item}>
                        {cp.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Descripción explicativa
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Color distintivo
                </label>
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  style={{ width: 48, height: 32, cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: 4 }}
                />
              </div>
            </div>

            {errorModal && (
              <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                {errorModal}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalNuevoAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarNuevo} style={{ backgroundColor: "#2563eb" }}>
                Guardar Valor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Elemento */}
      {modalEditarAbierto && itemEditar && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={() => setModalEditarAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 480, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
              Editar Valor: {itemEditar.nombre}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Nombre
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              {catalogoSeleccionado === "categorias_cambio" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Categoría Padre
                  </label>
                  <select
                    className="input-base"
                    value={formIdPadre}
                    onChange={(e) => setFormIdPadre(e.target.value ? Number(e.target.value) : "")}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="">— Ninguna (Categoría principal)</option>
                    {categoriasPadre
                      .filter((cp) => cp.id_item !== itemEditar.id_item)
                      .map((cp) => (
                        <option key={cp.id_item} value={cp.id_item}>
                          {cp.nombre}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Descripción
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Color
                </label>
                <input
                  type="color"
                  value={formColor}
                  onChange={(e) => setFormColor(e.target.value)}
                  style={{ width: 48, height: 32, cursor: "pointer", border: "1px solid #cbd5e1", borderRadius: 4 }}
                />
              </div>
            </div>

            {errorModal && (
              <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                {errorModal}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalEditarAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarEdicion} style={{ backgroundColor: "#2563eb" }}>
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fusionar Elementos */}
      {modalFusionarAbierto && itemEditar && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={() => setModalFusionarAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 500, width: "100%", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
              Fusionar: {itemEditar.nombre}
            </h3>
            <p style={{ fontSize: 12, color: "#475569", margin: "0 0 14px 0" }}>
              Todos los registros históricos ({itemEditar.usos_count} RFCs) vinculados a este valor se reasignarán al valor de destino seleccionado, y el valor origen quedará desactivado.
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
                Seleccione el valor de destino:
              </label>
              <select
                className="input-base"
                value={formDestinoFusion}
                onChange={(e) => setFormDestinoFusion(e.target.value ? Number(e.target.value) : "")}
                style={{ width: "100%", fontSize: 12.5 }}
              >
                <option value="">Seleccione destino...</option>
                {items
                  .filter((i) => i.id_item !== itemEditar.id_item && i.activo)
                  .map((i) => (
                    <option key={i.id_item} value={i.id_item}>
                      {i.nombre} ({i.codigo})
                    </option>
                  ))}
              </select>
            </div>

            {errorModal && (
              <div style={{ padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12, marginBottom: 14 }}>
                {errorModal}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalFusionarAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={ejecutarFusion} style={{ backgroundColor: "#d97706" }}>
                Confirmar Fusión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
