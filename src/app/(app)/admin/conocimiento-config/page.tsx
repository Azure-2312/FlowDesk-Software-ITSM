"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Articulo {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown?: string;
  estado_editorial: string;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa: number;
  fecha_creacion: string;
  fecha_publicacion: string | null;
  id_categoria: number;
  categoria: string | null;
  autor: string;
  audiencia_perfiles?: number[];
}

interface CategoriaConocimiento {
  id_categoria: number;
  nombre: string;
  descripcion: string | null;
  codigo_corto: string;
  estado_registro: boolean;
  total_articulos: number;
}

interface PerfilItem {
  id_perfil: number;
  nombre: string;
  codigo: string;
}

interface PoliticasKCS {
  perfiles_redaccion: number[];
  perfiles_aprobacion: number[];
  requiere_aprobacion_previa: boolean;
  frecuencia_revision_dias: number;
  permitir_calificacion_csat: boolean;
}

export default function GobiernoConocimiento() {
  const [pestañaActiva, setPestañaActiva] = useState<"articulos" | "categorias" | "politicas">("articulos");

  // Estado de Artículos
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Detalle e Historial
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<any | null>(null);
  const [historialArticulo, setHistorialArticulo] = useState<any[]>([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  // Modal Retirar
  const [idRetirar, setIdRetirar] = useState<number | null>(null);
  const [motivoRetiro, setMotivoRetiro] = useState("");

  // Modal Nuevo Artículo
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevoContenido, setNuevoContenido] = useState("");
  const [nuevaCategoriaId, setNuevaCategoriaId] = useState<number>(1);
  const [nuevoEstadoInicial, setNuevoEstadoInicial] = useState<string>("BORRADOR");
  const [nuevaAudiencia, setNuevaAudiencia] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [guardandoArticulo, setGuardandoArticulo] = useState(false);

  // Estado de Categorías
  const [categorias, setCategorias] = useState<CategoriaConocimiento[]>([]);
  const [mostrarModalCategoria, setMostrarModalCategoria] = useState(false);
  const [catNombre, setCatNombre] = useState("");
  const [catDescripcion, setCatDescripcion] = useState("");
  const [catCodigo, setCatCodigo] = useState("");
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);

  // Estado de Políticas KCS
  const [perfiles, setPerfiles] = useState<PerfilItem[]>([]);
  const [politicas, setPoliticas] = useState<PoliticasKCS>({
    perfiles_redaccion: [1, 2, 4, 8],
    perfiles_aprobacion: [1, 4],
    requiere_aprobacion_previa: true,
    frecuencia_revision_dias: 90,
    permitir_calificacion_csat: true,
  });
  const [guardandoPoliticas, setGuardandoPoliticas] = useState(false);

  async function cargarArticulos() {
    setCargando(true);
    try {
      const r = await fetch("/api/admin/conocimiento", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo cargar la lista de artículos");
        return;
      }
      setArticulos(d.articulos || []);
    } catch {
      setError("Error de conexión al cargar artículos.");
    } finally {
      setCargando(false);
    }
  }

  async function cargarCategorias() {
    try {
      const r = await fetch("/api/admin/conocimiento/categorias", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) {
        setCategorias(d.categorias || []);
      }
    } catch {
      console.error("Error al cargar categorías");
    }
  }

  async function cargarPoliticas() {
    try {
      const r = await fetch("/api/admin/conocimiento/politicas", { cache: "no-store" });
      const d = await r.json();
      if (r.ok) {
        if (d.politicas) setPoliticas(d.politicas);
        if (d.perfiles) setPerfiles(d.perfiles);
      }
    } catch {
      console.error("Error al cargar políticas KCS");
    }
  }

  useEffect(() => {
    cargarArticulos();
    cargarCategorias();
    cargarPoliticas();
  }, []);

  async function accionTransicion(id: number, accionNombre: string, payloadExtra: any = {}) {
    setError("");
    setOk("");
    try {
      const r = await fetch(`/api/admin/conocimiento/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: accionNombre, ...payloadExtra }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d.error || "No se pudo actualizar el estado editorial");
        return;
      }
      setOk(`Estado editorial actualizado exitosamente.`);
      setTimeout(() => setOk(""), 4000);
      setIdRetirar(null);
      setMotivoRetiro("");
      await cargarArticulos();
      if (articuloSeleccionado?.id_articulo === id) {
        await abrirHistorial(id);
      }
    } catch {
      setError("Error de conexión al actualizar artículo.");
    }
  }

  async function abrirHistorial(id: number) {
    setCargandoDetalle(true);
    try {
      const res = await fetch(`/api/admin/conocimiento/${id}`);
      const d = await res.json();
      if (d.articulo) {
        setArticuloSeleccionado(d.articulo);
        setHistorialArticulo(d.historial || []);
      }
    } catch {
      setError("Error al cargar historial editorial.");
    } finally {
      setCargandoDetalle(false);
    }
  }

  async function crearArticulo(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) {
      alert("Título y contenido son obligatorios");
      return;
    }
    setGuardandoArticulo(true);
    try {
      const r = await fetch("/api/admin/conocimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: nuevoTitulo.trim(),
          contenido_markdown: nuevoContenido.trim(),
          id_categoria: nuevaCategoriaId,
          estado_editorial: nuevoEstadoInicial,
          audiencia_perfiles: nuevaAudiencia,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "No se pudo registrar el artículo");
        return;
      }
      setOk("Artículo de conocimiento redactado y registrado exitosamente.");
      setTimeout(() => setOk(""), 4000);
      setMostrarModalNuevo(false);
      setNuevoTitulo("");
      setNuevoContenido("");
      await cargarArticulos();
    } catch {
      alert("Error de conexión al crear artículo");
    } finally {
      setGuardandoArticulo(false);
    }
  }

  async function crearCategoria(e: React.FormEvent) {
    e.preventDefault();
    if (!catNombre.trim()) {
      alert("El nombre de categoría es obligatorio");
      return;
    }
    setGuardandoCategoria(true);
    try {
      const r = await fetch("/api/admin/conocimiento/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: catNombre.trim(),
          descripcion: catDescripcion.trim(),
          codigo_corto: catCodigo.trim(),
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "No se pudo registrar la categoría");
        return;
      }
      setOk("Categoría de conocimiento creada satisfactoriamente.");
      setTimeout(() => setOk(""), 4000);
      setMostrarModalCategoria(false);
      setCatNombre("");
      setCatDescripcion("");
      setCatCodigo("");
      await cargarCategorias();
    } catch {
      alert("Error de conexión al crear categoría");
    } finally {
      setGuardandoCategoria(false);
    }
  }

  async function guardarPoliticasKCS() {
    setGuardandoPoliticas(true);
    try {
      const r = await fetch("/api/admin/conocimiento/politicas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(politicas),
      });
      const d = await r.json();
      if (!r.ok) {
        alert(d.error || "No se pudieron guardar las políticas KCS");
        return;
      }
      setOk("Políticas de gobernanza KCS actualizadas y auditadas exitosamente.");
      setTimeout(() => setOk(""), 4000);
    } catch {
      alert("Error de conexión al guardar políticas");
    } finally {
      setGuardandoPoliticas(false);
    }
  }

  const articulosFiltrados = articulos.filter((a) => {
    if (filtroEstado !== "TODOS" && a.estado_editorial !== filtroEstado) return false;
    if (busqueda.trim()) {
      const b = busqueda.toLowerCase().trim();
      return (
        a.titulo.toLowerCase().includes(b) ||
        a.codigo_articulo.toLowerCase().includes(b) ||
        (a.categoria && a.categoria.toLowerCase().includes(b)) ||
        a.autor.toLowerCase().includes(b)
      );
    }
    return true;
  });

  const conteoEnRevision = articulos.filter((a) => a.estado_editorial === "EN_REVISION").length;
  const conteoPublicados = articulos.filter((a) => a.estado_editorial === "PUBLICADO").length;
  const conteoBorradores = articulos.filter((a) => a.estado_editorial === "BORRADOR").length;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <h1>Gobierno de la Base de Conocimiento (KCS / ITIL v4)</h1>
          <p className="subtitulo">
            Estructure las categorías de ayuda, configure los perfiles autorizados a redactar y aprobar artículos, y supervise el ciclo editorial completo antes de su publicación general.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/tickets/gestion/ayuda" className="boton-secundario" style={{ textDecoration: "none", fontSize: 13, padding: "8px 12px" }}>
            Ver Portal de Ayuda
          </Link>
          {pestañaActiva === "articulos" && (
            <button
              type="button"
              className="boton-primario"
              onClick={() => setMostrarModalNuevo(true)}
              style={{ fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Redactar Artículo
            </button>
          )}
          {pestañaActiva === "categorias" && (
            <button
              type="button"
              className="boton-primario"
              onClick={() => setMostrarModalCategoria(true)}
              style={{ fontSize: 13, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Nueva Categoría
            </button>
          )}
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #cbd5e1", marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setPestañaActiva("articulos")}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            borderBottom: pestañaActiva === "articulos" ? "3px solid #2563eb" : "3px solid transparent",
            color: pestañaActiva === "articulos" ? "#1e40af" : "#64748b",
            fontWeight: pestañaActiva === "articulos" ? 700 : 500,
            cursor: "pointer",
            fontSize: 13.5,
          }}
        >
          Artículos y Ciclo de Vida Editorial ({articulos.length})
        </button>

        <button
          type="button"
          onClick={() => setPestañaActiva("categorias")}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            borderBottom: pestañaActiva === "categorias" ? "3px solid #2563eb" : "3px solid transparent",
            color: pestañaActiva === "categorias" ? "#1e40af" : "#64748b",
            fontWeight: pestañaActiva === "categorias" ? 700 : 500,
            cursor: "pointer",
            fontSize: 13.5,
          }}
        >
          Categorías de Ayuda ({categorias.length})
        </button>

        <button
          type="button"
          onClick={() => setPestañaActiva("politicas")}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            borderBottom: pestañaActiva === "politicas" ? "3px solid #2563eb" : "3px solid transparent",
            color: pestañaActiva === "politicas" ? "#1e40af" : "#64748b",
            fontWeight: pestañaActiva === "politicas" ? 700 : 500,
            cursor: "pointer",
            fontSize: 13.5,
          }}
        >
          Gobernanza y Políticas KCS
        </button>
      </div>

      {error && <p role="alert" className="mensaje-error" style={{ marginBottom: 16 }}>{error}</p>}
      {ok && <p role="status" className="mensaje-exito" style={{ padding: "8px 12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", borderRadius: 6, marginBottom: 16 }}>{ok}</p>}

      {/* PESTAÑA 1: ARTÍCULOS */}
      {pestañaActiva === "articulos" && (
        <div>
          {/* Métricas Rápidas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", padding: "12px 16px", borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: "#1e40af", fontWeight: 700, textTransform: "uppercase" }}>Artículos Publicados</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1d4ed8", marginTop: 2 }}>{conteoPublicados}</div>
            </div>
            <div style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a", padding: "12px 16px", borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: "#92400e", fontWeight: 700, textTransform: "uppercase" }}>En Revisión (Aprobación)</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#b45309", marginTop: 2 }}>{conteoEnRevision}</div>
            </div>
            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px 16px", borderRadius: 8 }}>
              <span style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase" }}>Borradores Técnicos</span>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#334155", marginTop: 2 }}>{conteoBorradores}</div>
            </div>
          </div>

          {/* Filtros */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              className="input-base"
              placeholder="Buscar por título, código o autor..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              style={{ flex: 1, minWidth: 240, fontSize: 13 }}
            />
            <select
              className="input-base"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              style={{ width: "auto", minWidth: 160, fontSize: 13 }}
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="BORRADOR">Borrador</option>
              <option value="ARCHIVADO">Retirado / Archivado</option>
            </select>
          </div>

          {/* Diálogo de Retiro */}
          {idRetirar && (
            <div className="tarjeta-formulario" style={{ border: "1px solid #fca5a5", backgroundColor: "#fff5f5", marginBottom: 16 }}>
              <h3 style={{ margin: "0 0 8px", color: "#991b1b", fontSize: 14 }}>Retirar Artículo de Conocimiento</h3>
              <p style={{ fontSize: 12.5, margin: "0 0 10px", color: "#7f1d1d" }}>
                El retiro deshabilita la consulta del artículo en el autoservicio por pérdida de vigencia o información técnica desactualizada.
              </p>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Motivo obligatorio de retiro (mínimo 5 caracteres)..."
                  value={motivoRetiro}
                  onChange={(e) => setMotivoRetiro(e.target.value)}
                  style={{ flex: 1, fontSize: 13 }}
                />
                <button
                  type="button"
                  className="boton-primario"
                  style={{ backgroundColor: "#dc2626" }}
                  onClick={() => {
                    if (motivoRetiro.trim().length < 5) {
                      alert("Indique el motivo obligatorio de retiro.");
                      return;
                    }
                    accionTransicion(idRetirar, "RETIRAR", { motivo_retiro: motivoRetiro.trim() });
                  }}
                >
                  Confirmar Retiro
                </button>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => { setIdRetirar(null); setMotivoRetiro(""); }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Trazabilidad Detallada */}
          {articuloSeleccionado && (
            <div className="tarjeta-formulario" style={{ marginBottom: 20, border: "1px solid #cbd5e1" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 16, margin: 0 }}>
                    [{articuloSeleccionado.codigo_articulo}] {articuloSeleccionado.titulo} (v{articuloSeleccionado.version || 1})
                  </h2>
                  <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 12.5 }}>
                    Categoría: {articuloSeleccionado.categoria_nombre || "General"} | Autor: {articuloSeleccionado.autor_nombre} | Revisor: {articuloSeleccionado.revisor_nombre || "Pendiente"}
                  </p>
                </div>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setArticuloSeleccionado(null)}
                  style={{ fontSize: 12, padding: "4px 10px" }}
                >
                  Cerrar Trazabilidad
                </button>
              </div>

              <h3 style={{ fontSize: 13, margin: "14px 0 8px", textTransform: "uppercase", color: "#475569" }}>Historial Editorial de Revisiones</h3>
              {cargandoDetalle ? (
                <p style={{ fontSize: 12 }}>Cargando trazabilidad...</p>
              ) : historialArticulo.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 12 }}>Sin transiciones registradas.</p>
              ) : (
                <table className="tabla-datos" style={{ width: "100%", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Estado Previo</th>
                      <th>Estado Resultante</th>
                      <th>Comentario / Motivo</th>
                      <th>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialArticulo.map((h) => (
                      <tr key={h.id_historial}>
                        <td>{new Date(h.fecha).toLocaleString()}</td>
                        <td>{h.estado_anterior || "INICIAL"}</td>
                        <td><strong>{h.estado_nuevo}</strong></td>
                        <td>{h.comentario || "-"}</td>
                        <td>{h.usuario_nombre || "Sistema"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tabla de Artículos */}
          {cargando ? (
            <div className="contenedor-tabla" style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
              Cargando base de conocimientos...
            </div>
          ) : articulosFiltrados.length === 0 ? (
            <div className="contenedor-tabla" style={{ padding: 36, textAlign: "center", color: "#64748b" }}>
              No se encontraron artículos con los filtros aplicados.
            </div>
          ) : (
            <div className="contenedor-tabla">
              <table className="tabla-datos">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Título y Categoría</th>
                    <th>Estado Editorial</th>
                    <th>Autor</th>
                    <th>Visitas / Utilidad</th>
                    <th>Fecha Creación</th>
                    <th style={{ textAlign: "center", width: 140 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosFiltrados.map((a) => (
                    <tr key={a.id_articulo}>
                      <td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 12 }}>
                        {a.codigo_articulo}
                      </td>
                      <td>
                        <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>{a.titulo}</strong>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{a.categoria || "General"}</span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "3px 8px",
                            borderRadius: 4,
                            backgroundColor:
                              a.estado_editorial === "PUBLICADO"
                                ? "#ecfdf5"
                                : a.estado_editorial === "EN_REVISION"
                                ? "#fffbeb"
                                : a.estado_editorial === "BORRADOR"
                                ? "#eff6ff"
                                : "#fef2f2",
                            color:
                              a.estado_editorial === "PUBLICADO"
                                ? "#047857"
                                : a.estado_editorial === "EN_REVISION"
                                ? "#b45309"
                                : a.estado_editorial === "BORRADOR"
                                ? "#1d4ed8"
                                : "#b91c1c",
                          }}
                        >
                          {a.estado_editorial}
                        </span>
                      </td>
                      <td style={{ fontSize: 12 }}>{a.autor || "Especialista TI"}</td>
                      <td style={{ fontSize: 12, color: "#475569" }}>
                        {a.visitas} visitas (+{a.utilidad_positiva} / -{a.utilidad_negativa})
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>
                        {new Date(a.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "center" }}>
                          {a.estado_editorial === "BORRADOR" && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => accionTransicion(a.id_articulo, "ENVIAR_A_REVISION")}
                              title="Enviar a revisión de supervisor"
                              style={{ backgroundColor: "#fef3c7", color: "#92400e", borderColor: "#fde68a" }}
                            >
                              Revisar
                            </button>
                          )}
                          {a.estado_editorial === "EN_REVISION" && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => accionTransicion(a.id_articulo, "APROBAR")}
                              title="Aprobar y publicar en autoservicio"
                              style={{ backgroundColor: "#10b981", color: "#ffffff", borderColor: "#059669" }}
                            >
                              Publicar
                            </button>
                          )}
                          {a.estado_editorial === "PUBLICADO" && (
                            <button
                              type="button"
                              className="boton-mini"
                              onClick={() => setIdRetirar(a.id_articulo)}
                              title="Retirar por obsolescencia"
                              style={{ backgroundColor: "#fee2e2", color: "#991b1b", borderColor: "#fca5a5" }}
                            >
                              Retirar
                            </button>
                          )}
                          <button
                            type="button"
                            className="boton-mini"
                            onClick={() => abrirHistorial(a.id_articulo)}
                            title="Ver trazabilidad"
                          >
                            Historial
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 2: CATEGORÍAS DE AYUDA */}
      {pestañaActiva === "categorias" && (
        <div>
          <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 13, color: "#1e293b" }}>Catálogo de Categorías KCS:</strong>
            <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#64748b" }}>
              Organice las categorías temáticas donde se clasifican los manuales, FAQs y procedimientos técnicos del portal corporativo.
            </p>
          </div>

          <div className="contenedor-tabla">
            <table className="tabla-datos">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre de la Categoría</th>
                  <th>Descripción</th>
                  <th>Artículos Vinculados</th>
                  <th>Estado</th>
                  <th style={{ textAlign: "center", width: 100 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((c) => (
                  <tr key={c.id_categoria}>
                    <td style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 12 }}>
                      {c.codigo_corto || `CAT-${c.id_categoria}`}
                    </td>
                    <td>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>{c.nombre}</strong>
                    </td>
                    <td style={{ fontSize: 12.5, color: "#475569" }}>
                      {c.descripcion || "Sin descripción"}
                    </td>
                    <td style={{ fontSize: 12, fontWeight: 600, color: "#2563eb" }}>
                      {c.total_articulos} artículos
                    </td>
                    <td>
                      <span className={`badge-itil ${c.estado_registro ? "badge-activo" : "badge-inactivo"}`}>
                        {c.estado_registro ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={async () => {
                          const nuevoEstado = !c.estado_registro;
                          try {
                            const res = await fetch("/api/admin/conocimiento/categorias", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id_categoria: c.id_categoria, estado_registro: nuevoEstado }),
                            });
                            if (res.ok) {
                              setOk(`Categoría ${nuevoEstado ? "activada" : "desactivada"} exitosamente.`);
                              setTimeout(() => setOk(""), 4000);
                              cargarCategorias();
                            }
                          } catch {
                            alert("Error al actualizar estado");
                          }
                        }}
                      >
                        {c.estado_registro ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: GOBERNANZA Y POLÍTICAS KCS */}
      {pestañaActiva === "politicas" && (
        <div style={{ maxWidth: 800 }}>
          <div className="tarjeta-formulario" style={{ marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 14, color: "#0f172a" }}>
              Control de Roles y Autorizaciones Editoriales KCS
            </h3>
            <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
              Configure la segregación de responsabilidades: determine quiénes están facultados para escribir borradores técnicos y quiénes poseen la autoridad para aprobar y publicar contenidos visibles para los solicitantes.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quién puede redactar */}
            <div className="tarjeta-formulario">
              <strong style={{ fontSize: 13, color: "#1e293b", display: "block", marginBottom: 4 }}>
                1. Perfiles Habilitados para Redactar Soluciones y Artículos (Autores KCS):
              </strong>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
                Los usuarios con estos perfiles podrán redactar borradores técnicos y remitirlos a revisión.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {perfiles.map((p) => {
                  const check = politicas.perfiles_redaccion.includes(p.id_perfil);
                  return (
                    <label key={p.id_perfil} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={(e) => {
                          const nuevo = e.target.checked
                            ? [...politicas.perfiles_redaccion, p.id_perfil]
                            : politicas.perfiles_redaccion.filter((id) => id !== p.id_perfil);
                          setPoliticas({ ...politicas, perfiles_redaccion: nuevo });
                        }}
                      />
                      <span>{p.nombre}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quién puede aprobar */}
            <div className="tarjeta-formulario">
              <strong style={{ fontSize: 13, color: "#1e293b", display: "block", marginBottom: 4 }}>
                2. Perfiles Habilitados para Aprobar y Publicar (Editores / Supervisores KCS):
              </strong>
              <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px" }}>
                Solo los usuarios con estos perfiles pueden autorizar la publicación oficial hacia el autoservicio.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                {perfiles.map((p) => {
                  const check = politicas.perfiles_aprobacion.includes(p.id_perfil);
                  return (
                    <label key={p.id_perfil} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={(e) => {
                          const nuevo = e.target.checked
                            ? [...politicas.perfiles_aprobacion, p.id_perfil]
                            : politicas.perfiles_aprobacion.filter((id) => id !== p.id_perfil);
                          setPoliticas({ ...politicas, perfiles_aprobacion: nuevo });
                        }}
                      />
                      <span>{p.nombre}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Flujo de Aprobación Previa */}
            <div className="tarjeta-formulario">
              <strong style={{ fontSize: 13, color: "#1e293b", display: "block", marginBottom: 8 }}>
                3. Compuerta de Aprobación Obligatoria y Ciclo de Vigencia:
              </strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={politicas.requiere_aprobacion_previa}
                    onChange={(e) => setPoliticas({ ...politicas, requiere_aprobacion_previa: e.target.checked })}
                  />
                  <span>
                    <strong>Exigir aprobación previa obligatoria:</strong> Ningún artículo redactado podrá visualizarse en el portal de autoservicio hasta que un revisor autorizado lo apruebe.
                  </span>
                </label>

                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                  <span style={{ fontSize: 12.5, color: "#334155" }}>Frecuencia de auditoría de vigencia:</span>
                  <select
                    className="input-base"
                    value={politicas.frecuencia_revision_dias}
                    onChange={(e) => setPoliticas({ ...politicas, frecuencia_revision_dias: Number(e.target.value) })}
                    style={{ width: "auto", fontSize: 12.5 }}
                  >
                    <option value={30}>Cada 30 días (Mensual)</option>
                    <option value={90}>Cada 90 días (Trimestral - Recomendado ITIL)</option>
                    <option value={180}>Cada 180 días (Semestral)</option>
                    <option value={365}>Cada 365 días (Anual)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="boton-primario"
              onClick={guardarPoliticasKCS}
              disabled={guardandoPoliticas}
              style={{ padding: "10px 20px", alignSelf: "flex-start", fontSize: 13 }}
            >
              {guardandoPoliticas ? "Guardando..." : "Guardar Políticas KCS"}
            </button>
          </div>
        </div>
      )}

      {/* Modal Redactar Artículo */}
      {mostrarModalNuevo && (
        <div className="modal-overlay" onClick={() => setMostrarModalNuevo(false)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 640, backgroundColor: "#ffffff", padding: 24, borderRadius: 8 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#0f172a" }}>
              Redactar Nuevo Artículo de Conocimiento
            </h2>
            <form onSubmit={crearArticulo} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Título del Artículo
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: Guía de configuración de VPN corporativa"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                  required
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                    Categoría
                  </label>
                  <select
                    className="input-base"
                    value={nuevaCategoriaId}
                    onChange={(e) => setNuevaCategoriaId(Number(e.target.value))}
                    style={{ width: "100%", fontSize: 13 }}
                  >
                    {categorias.map((c) => (
                      <option key={c.id_categoria} value={c.id_categoria}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                    Estado Inicial
                  </label>
                  <select
                    className="input-base"
                    value={nuevoEstadoInicial}
                    onChange={(e) => setNuevoEstadoInicial(e.target.value)}
                    style={{ width: "100%", fontSize: 13 }}
                  >
                    <option value="BORRADOR">Borrador Técnico</option>
                    <option value="EN_REVISION">Remitir a Revisión</option>
                    <option value="PUBLICADO">Publicar Directamente</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Contenido del Procedimiento o Solución (Markdown / Texto)
                </label>
                <textarea
                  className="input-base"
                  rows={8}
                  placeholder="Describa paso a paso las instrucciones técnicas, requisitos y solución de contorno..."
                  value={nuevoContenido}
                  onChange={(e) => setNuevoContenido(e.target.value)}
                  required
                  style={{ width: "100%", fontSize: 12.5, fontFamily: "inherit" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Audiencia Elegible (Perfiles que podrán consultar este artículo)
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 6, maxHeight: 110, overflowY: "auto", border: "1px solid #cbd5e1", padding: 8, borderRadius: 6 }}>
                  {perfiles.map((p) => {
                    const sel = nuevaAudiencia.includes(p.id_perfil);
                    return (
                      <label key={p.id_perfil} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={(e) => {
                            const arr = e.target.checked
                              ? [...nuevaAudiencia, p.id_perfil]
                              : nuevaAudiencia.filter((id) => id !== p.id_perfil);
                            setNuevaAudiencia(arr);
                          }}
                        />
                        <span>{p.nombre}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setMostrarModalNuevo(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  disabled={guardandoArticulo}
                >
                  {guardandoArticulo ? "Guardando..." : "Registrar Artículo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {mostrarModalCategoria && (
        <div className="modal-overlay" onClick={() => setMostrarModalCategoria(false)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 460, backgroundColor: "#ffffff", padding: 24, borderRadius: 8 }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 12px", color: "#0f172a" }}>
              Nueva Categoría de Conocimiento KCS
            </h2>
            <form onSubmit={crearCategoria} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Nombre de la Categoría
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: Conectividad y Redes Remotas"
                  value={catNombre}
                  onChange={(e) => setCatNombre(e.target.value)}
                  required
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Código Corto (Identificador)
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej: RED"
                  value={catCodigo}
                  onChange={(e) => setCatCodigo(e.target.value.toUpperCase())}
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 4 }}>
                  Descripción Informativa
                </label>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Objetivo y alcance de los artículos clasificados en esta categoría..."
                  value={catDescripcion}
                  onChange={(e) => setCatDescripcion(e.target.value)}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setMostrarModalCategoria(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  disabled={guardandoCategoria}
                >
                  {guardandoCategoria ? "Guardando..." : "Crear Categoría"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
