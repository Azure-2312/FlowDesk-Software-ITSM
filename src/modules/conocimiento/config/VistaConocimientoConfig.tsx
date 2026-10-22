"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Articulo {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown?: string;
  estado_editorial: string;
  version?: number;
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
  const [pestañaActiva, setPestañaActiva] = useState<"articulos" | "portal_preview" | "politicas">("articulos");

  // Estado de Artículos
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // Diálogo Retirar
  const [idRetirar, setIdRetirar] = useState<number | null>(null);
  const [motivoRetiro, setMotivoRetiro] = useState("");

  // Estado de Categorías
  const [categorias, setCategorias] = useState<CategoriaConocimiento[]>([]);

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

  // Estado de la Vista Previa del Portal de Ayuda
  const [categoriaSeleccionadaPreview, setCategoriaSeleccionadaPreview] = useState<CategoriaConocimiento | null>(null);
  const [articuloSeleccionadoPreview, setArticuloSeleccionadoPreview] = useState<Articulo | null>(null);
  const [busquedaPortalPreview, setBusquedaPortalPreview] = useState("");
  const [feedbackSimulado, setFeedbackSimulado] = useState<"util" | "no_util" | null>(null);

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
    } catch {
      setError("Error de conexión al actualizar artículo.");
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

  // Filtrado de artículos para la Vista Previa del Portal de Ayuda
  const articulosPublicados = articulos.filter((a) => a.estado_editorial === "PUBLICADO");

  const articulosPreviewFiltrados = articulosPublicados.filter((a) => {
    if (categoriaSeleccionadaPreview && a.id_categoria !== categoriaSeleccionadaPreview.id_categoria) {
      return false;
    }
    if (busquedaPortalPreview.trim()) {
      const term = busquedaPortalPreview.toLowerCase().trim();
      return (
        a.titulo.toLowerCase().includes(term) ||
        (a.contenido_markdown && a.contenido_markdown.toLowerCase().includes(term)) ||
        (a.categoria && a.categoria.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal */}
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div>
          <h1>Gobierno de la Base de Conocimiento (KCS / ITIL v4)</h1>
          <p className="subtitulo">
            Supervise el ciclo editorial de artículos técnicos, audite la trazabilidad y configure las políticas de redacción y compuertas de publicación del autoservicio.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link
            href="/plataforma/admin/conocimiento-config/categorias"
            className="boton-secundario"
            style={{ textDecoration: "none", fontSize: 13, padding: "8px 12px" }}
          >
            Configuración Categorías
          </Link>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #cbd5e1", marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => {
            setPestañaActiva("articulos");
            setCategoriaSeleccionadaPreview(null);
            setArticuloSeleccionadoPreview(null);
          }}
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
          onClick={() => {
            setPestañaActiva("portal_preview");
            setCategoriaSeleccionadaPreview(null);
            setArticuloSeleccionadoPreview(null);
            setFeedbackSimulado(null);
          }}
          style={{
            padding: "9px 18px",
            border: "none",
            background: "none",
            borderBottom: pestañaActiva === "portal_preview" ? "3px solid #2563eb" : "3px solid transparent",
            color: pestañaActiva === "portal_preview" ? "#1e40af" : "#64748b",
            fontWeight: pestañaActiva === "portal_preview" ? 700 : 500,
            cursor: "pointer",
            fontSize: 13.5,
          }}
        >
          Vista Previa del Portal de Ayuda ({articulosPublicados.length} publicados)
        </button>

        <button
          type="button"
          onClick={() => {
            setPestañaActiva("politicas");
            setCategoriaSeleccionadaPreview(null);
            setArticuloSeleccionadoPreview(null);
          }}
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

      {/* PESTAÑA 1: ARTÍCULOS Y CICLO EDITORIAL */}
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
              <option value="RETIRADO">Retirado</option>
              <option value="ARCHIVADO">Archivado</option>
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
                    <th>Versión</th>
                    <th>Fecha Creación</th>
                    <th style={{ textAlign: "center", width: 200 }}>Acciones</th>
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
                      <td style={{ fontSize: 12, fontFamily: "monospace", color: "#2563eb", fontWeight: 600 }}>
                        v{a.version || 1}
                      </td>
                      <td style={{ fontSize: 12, color: "#64748b" }}>
                        {new Date(a.fecha_creacion).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 5, justifyContent: "center", alignItems: "center" }}>
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
                          <Link
                            href={`/plataforma/admin/conocimiento-config/articulos/${a.id_articulo}/editar`}
                            className="boton-mini"
                            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                            title="Editar artículo"
                          >
                            Editar
                          </Link>
                          <Link
                            href={`/plataforma/admin/conocimiento-config/articulos/${a.id_articulo}/historial`}
                            className="boton-mini"
                            style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}
                            title="Ver reporte detallado de trazabilidad"
                          >
                            Historial
                          </Link>
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

      {/* PESTAÑA 2: VISTA PREVIA DEL PORTAL DE AYUDA (ORGANIZADA POR CATEGORÍAS) */}
      {pestañaActiva === "portal_preview" && (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Modo de Simulación: Portal de Autoservicio
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
              Visualice exactamente cómo los solicitantes y usuarios finales exploran las categorías temáticas y consultan las guías de resolución publicadas.
            </p>
          </div>

          {/* Barra de Búsqueda Global de la Simulación */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={busquedaPortalPreview}
                onChange={(e) => setBusquedaPortalPreview(e.target.value)}
                placeholder="Buscar guías, preguntas frecuentes o soluciones técnicas..."
                className="w-full px-4 py-3 pl-11 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* VISTA 1: ARTÍCULO SELECCIONADO EN DETALLE */}
          {articuloSeleccionadoPreview ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setArticuloSeleccionadoPreview(null);
                    setFeedbackSimulado(null);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a {categoriaSeleccionadaPreview ? categoriaSeleccionadaPreview.nombre : "las categorías"}
                </button>
                <span className="font-mono text-xs text-slate-500 font-semibold">
                  {articuloSeleccionadoPreview.codigo_articulo}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                    {articuloSeleccionadoPreview.categoria || "General"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Actualizado: {new Date(articuloSeleccionadoPreview.fecha_creacion).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {articuloSeleccionadoPreview.titulo}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Autor: {articuloSeleccionadoPreview.autor} | {articuloSeleccionadoPreview.visitas} lecturas
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans border border-slate-200/60 dark:border-slate-700/60">
                {articuloSeleccionadoPreview.contenido_markdown || "Contenido no disponible."}
              </div>

              {/* Simulación de Calificación CSAT / Utilidad */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ¿Le resultó útil esta solución?
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    ({articuloSeleccionadoPreview.utilidad_positiva} votos positivos / {articuloSeleccionadoPreview.utilidad_negativa} sugerencias)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackSimulado("util")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      feedbackSimulado === "util"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Sí, resolvió mi problema
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackSimulado("no_util")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      feedbackSimulado === "no_util"
                        ? "bg-rose-600 text-white border-rose-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    No, necesito más información
                  </button>
                </div>
              </div>
            </div>
          ) : categoriaSeleccionadaPreview ? (
            /* VISTA 2: LISTA DE ARTÍCULOS DENTRO DE LA CATEGORÍA SELECCIONADA */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCategoriaSeleccionadaPreview(null)}
                  className="inline-flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver al Catálogo de Categorías
                </button>
                <span className="text-xs text-slate-500">
                  {articulosPreviewFiltrados.length} artículos en esta categoría
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center font-mono font-bold text-blue-700 dark:text-blue-400 text-xs">
                    {categoriaSeleccionadaPreview.codigo_corto}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      {categoriaSeleccionadaPreview.nombre}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {categoriaSeleccionadaPreview.descripcion || "Guías y procedimientos técnicos clasificados."}
                    </p>
                  </div>
                </div>
              </div>

              {articulosPreviewFiltrados.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  No se encontraron artículos publicados en esta categoría con el filtro actual.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {articulosPreviewFiltrados.map((art) => (
                    <div
                      key={art.id_articulo}
                      onClick={() => setArticuloSeleccionadoPreview(art)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                            {art.codigo_articulo}
                          </span>
                          <span>v{art.version || 1}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-2">
                          {art.titulo}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3">
                          {art.contenido_markdown?.slice(0, 160)}...
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3">
                        <span>{art.autor}</span>
                        <span>+{art.utilidad_positiva} votos útiles</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* VISTA 3: GRID DE CATEGORÍAS PRIMERO (TAXONOMÍA DE AUTOSERVICIO) */
            <div className="space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Explorar por Categoría de Soporte
                </h2>
                <p className="text-xs text-slate-500">
                  Seleccione una categoría para consultar las guías técnicas y respuestas paso a paso.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {categorias
                  .filter((c) => c.estado_registro)
                  .map((cat) => {
                    const cantPublicados = articulosPublicados.filter(
                      (a) => a.id_categoria === cat.id_categoria
                    ).length;

                    return (
                      <div
                        key={cat.id_categoria}
                        onClick={() => setCategoriaSeleccionadaPreview(cat)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                              {cat.codigo_corto}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {cantPublicados} {cantPublicados === 1 ? "artículo" : "artículos"}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1.5">
                            {cat.nombre}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {cat.descripcion || "Artículos y documentación clasificada."}
                          </p>
                        </div>
                        <div className="pt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Explorar artículos</span>
                          <span>→</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: GOBERNANZA Y POLÍTICAS KCS */}
      {pestañaActiva === "politicas" && (
        <div style={{ maxWidth: 840 }}>
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
    </div>
  );
}
