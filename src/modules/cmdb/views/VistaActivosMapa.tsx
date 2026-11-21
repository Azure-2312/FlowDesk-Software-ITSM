"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface ElementoCI {
  id_ci: number;
  codigo_ci: string;
  nombre: string;
  tipo_ci: string;
  ambiente: string;
  ip_principal: string | null;
  version_software: string | null;
  criticidad: string;
  departamento_soporte_nombre?: string;
}

interface RelacionCI {
  id_ci_padre: number;
  padre_codigo: string;
  padre_nombre: string;
  id_ci_hijo: number;
  hijo_codigo: string;
  hijo_nombre: string;
  tipo_relacion: string;
}

interface NodoGrafico extends ElementoCI {
  x: number;
  y: number;
  nivel: number;
}

const COLORES_CRITICIDAD: Record<string, { bg: string; text: string; border: string }> = {
  CRITICA: { bg: "#fee2e2", text: "#991b1b", border: "#f87171" },
  ALTA: { bg: "#ffedd5", text: "#9a3412", border: "#fb923c" },
  MEDIA: { bg: "#fef9c3", text: "#854d0e", border: "#facc15" },
  BAJA: { bg: "#f0fdf4", text: "#166534", border: "#4ade80" },
};

const ICONOS_TIPO: Record<string, string> = {
  APLICACION: "[APP]",
  SERVIDOR_LOGICO: "[SRV]",
  SERVIDOR_FISICO: "[HOST]",
  BASE_DATOS: "[DB]",
  NODO_RED: "[RED]",
  SERVICIO: "[SVC]",
};

export default function VistaActivosMapa() {
  const [elementos, setElementos] = useState<ElementoCI[]>([]);
  const [relaciones, setRelaciones] = useState<RelacionCI[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de navegación e interacción
  const [ciSeleccionadoId, setCiSeleccionadoId] = useState<number | null>(null);
  const [relacionSeleccionadaIdx, setRelacionSeleccionadaIdx] = useState<number | null>(null);
  const [pestañaDerecha, setPestañaDerecha] = useState<"lista" | "grafico">("grafico");
  const [busquedaRelacion, setBusquedaRelacion] = useState("");

  // Estados de Canvas: Pan y Zoom interactivos
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`/api/activos/cmdb?_t=${Date.now()}`);
        if (!res.ok) throw new Error("No se pudo obtener la información de la CMDB.");
        const data = await res.json();
        const listaCis: ElementoCI[] = data.elementos || [];
        const listaRels: RelacionCI[] = data.relaciones || [];
        setElementos(listaCis);
        setRelaciones(listaRels);
        if (listaCis.length > 0) {
          setCiSeleccionadoId(listaCis[0].id_ci);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar la topología de la CMDB.");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  // CI actualmente activo
  const ciActivo = useMemo(() => {
    return elementos.find((e) => e.id_ci === ciSeleccionadoId) || elementos[0] || null;
  }, [elementos, ciSeleccionadoId]);

  // Relaciones filtradas para el panel izquierdo
  const relacionesFiltradas = useMemo(() => {
    if (!busquedaRelacion.trim()) return relaciones;
    const q = busquedaRelacion.toLowerCase().trim();
    return relaciones.filter(
      (r) =>
        r.padre_codigo.toLowerCase().includes(q) ||
        r.padre_nombre.toLowerCase().includes(q) ||
        r.hijo_codigo.toLowerCase().includes(q) ||
        r.hijo_nombre.toLowerCase().includes(q) ||
        r.tipo_relacion.toLowerCase().includes(q)
    );
  }, [relaciones, busquedaRelacion]);

  // Layout del grafo SVG (organizado por capas ITIL)
  const nodosGrafico = useMemo((): NodoGrafico[] => {
    if (elementos.length === 0) return [];

    const nivelesPorTipo: Record<string, number> = {
      APLICACION: 0,
      SERVICIO: 0,
      SERVIDOR_LOGICO: 1,
      SERVIDOR_FISICO: 1,
      BASE_DATOS: 2,
      NODO_RED: 3,
    };

    const columnas: Record<number, ElementoCI[]> = { 0: [], 1: [], 2: [], 3: [] };
    elementos.forEach((ci) => {
      const col = nivelesPorTipo[ci.tipo_ci] ?? 1;
      columnas[col].push(ci);
    });

    const resultado: NodoGrafico[] = [];
    const anchoColumna = 240;
    const paddingX = 60;
    const offsetY = 60;
    const gapY = 110;

    [0, 1, 2, 3].forEach((colIdx) => {
      const items = columnas[colIdx];
      items.forEach((item, rowIdx) => {
        resultado.push({
          ...item,
          nivel: colIdx,
          x: paddingX + colIdx * anchoColumna,
          y: offsetY + rowIdx * gapY,
        });
      });
    });

    return resultado;
  }, [elementos]);

  const nodoMap = useMemo(() => {
    const map = new Map<number, NodoGrafico>();
    nodosGrafico.forEach((n) => map.set(n.id_ci, n));
    return map;
  }, [nodosGrafico]);

  const dimensionesSvg = useMemo(() => {
    let maxX = 1000;
    let maxY = 550;
    nodosGrafico.forEach((n) => {
      if (n.x + 220 > maxX) maxX = n.x + 220;
      if (n.y + 120 > maxY) maxY = n.y + 120;
    });
    return { width: maxX, height: maxY };
  }, [nodosGrafico]);

  // Manejo de Pan (arrastrar con el ratón)
  function handleMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }

  function handleMouseUp() {
    setIsDragging(false);
  }

  // Manejo de Zoom con rueda del ratón
  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.min(Math.max(Number((prev + factor).toFixed(2)), 0.4), 2.5));
  }

  function restablecerVista() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function seleccionarRelacion(r: RelacionCI, idx: number) {
    setRelacionSeleccionadaIdx(idx);
    setCiSeleccionadoId(r.id_ci_padre);
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1440, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Gestión de Configuración (CMDB) · ITIL v4
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Topología & Mapa de Dependencias de CIs
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Visualización de dependencias entre servicios, infraestructura y elementos de configuración (CI).
          </p>
        </div>

        <div style={{ fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ backgroundColor: "#ffffff", padding: "4px 10px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
            Total CIs: <strong>{elementos.length}</strong>
          </span>
          <span style={{ backgroundColor: "#ffffff", padding: "4px 10px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
            Relaciones: <strong>{relaciones.length}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: 12, borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {cargando ? (
        <div style={{ padding: 48, textAlign: "center", color: "#64748b", fontSize: 14 }}>
          Cargando topología y mapa de dependencias...
        </div>
      ) : (
        /* 2. Distribución en 2 Paneles: Izquierdo (Relaciones) y Derecho (Pestañas Lista / Gráfico) */
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 20, alignItems: "stretch" }}>
          
          {/* PANEL IZQUIERDO: Listado de Todas las Relaciones con Buscador */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              height: "720px",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                Relaciones del Sistema ({relacionesFiltradas.length})
              </div>
              <p style={{ fontSize: 11.5, color: "#64748b", margin: "0 0 10px 0" }}>
                Selecciona una relación para enfocar los CIs en el visor.
              </p>
              <input
                type="text"
                placeholder="Filtrar por CI o relación..."
                value={busquedaRelacion}
                onChange={(e) => setBusquedaRelacion(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 10px",
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  fontSize: 12,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
              {relacionesFiltradas.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#94a3b8", fontSize: 12.5 }}>
                  No se encontraron relaciones coincidentes.
                </div>
              ) : (
                relacionesFiltradas.map((r, idx) => {
                  const estaSeleccionada = relacionSeleccionadaIdx === idx || (ciActivo?.id_ci === r.id_ci_padre && r.id_ci_hijo === ciSeleccionadoId);
                  return (
                    <div
                      key={`rel-izq-${idx}`}
                      onClick={() => seleccionarRelacion(r, idx)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: estaSeleccionada ? "2px solid #2563eb" : "1px solid #e2e8f0",
                        backgroundColor: estaSeleccionada ? "#eff6ff" : "#ffffff",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                          {r.padre_codigo}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            backgroundColor: estaSeleccionada ? "#dbeafe" : "#f1f5f9",
                            color: estaSeleccionada ? "#1e40af" : "#475569",
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {r.tipo_relacion}
                        </span>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>
                          {r.hijo_codigo}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r.padre_nombre} → {r.hijo_nombre}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PANEL DERECHO: Pestañas (Relaciones en Lista vs Vista Gráfica) */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              flexDirection: "column",
              height: "720px",
              overflow: "hidden",
            }}
          >
            {/* Header de Pestañas Derechas */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setPestañaDerecha("lista")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: pestañaDerecha === "lista" ? "#2563eb" : "#ffffff",
                    color: pestañaDerecha === "lista" ? "#ffffff" : "#475569",
                    fontWeight: pestañaDerecha === "lista" ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: pestañaDerecha === "lista" ? "0 1px 3px rgba(37,99,235,0.2)" : "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  Relaciones en Lista
                </button>
                <button
                  type="button"
                  onClick={() => setPestañaDerecha("grafico")}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: pestañaDerecha === "grafico" ? "#2563eb" : "#ffffff",
                    color: pestañaDerecha === "grafico" ? "#ffffff" : "#475569",
                    fontWeight: pestañaDerecha === "grafico" ? 700 : 500,
                    fontSize: 13,
                    cursor: "pointer",
                    boxShadow: pestañaDerecha === "grafico" ? "0 1px 3px rgba(37,99,235,0.2)" : "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  Vista Gráfica (Interactivo)
                </button>
              </div>

              {pestañaDerecha === "grafico" && (
                /* Controles de Zoom y Pan */
                <div style={{ display: "flex", alignItems: "center", gap: 6, backgroundColor: "#ffffff", padding: "3px 8px", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(Number((z + 0.15).toFixed(2)), 2.5))}
                    title="Acercar (Zoom In)"
                    style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: "bold", padding: "2px 6px" }}
                  >
                    +
                  </button>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#334155", minWidth: 42, textAlign: "center" }}>
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(Number((z - 0.15).toFixed(2)), 0.4))}
                    title="Alejar (Zoom Out)"
                    style={{ border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: "bold", padding: "2px 6px" }}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={restablecerVista}
                    title="Restablecer posición y zoom"
                    style={{ border: "none", background: "none", cursor: "pointer", fontSize: 12, color: "#2563eb", padding: "2px 6px" }}
                  >
                    ↺ Reset
                  </button>
                </div>
              )}
            </div>

            {/* CONTENIDO 1: Relaciones en Lista */}
            {pestañaDerecha === "lista" && (
              <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                    Matriz Completa de Dependencias y Relaciones
                  </h3>
                  <TablaDobleScroll minWidth={700}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                          <th style={{ padding: "10px 14px", color: "#475569" }}>CI Padre (Origen)</th>
                          <th style={{ padding: "10px 14px", color: "#475569" }}>Relación</th>
                          <th style={{ padding: "10px 14px", color: "#475569" }}>CI Hijo (Dependiente)</th>
                          <th style={{ padding: "10px 14px", color: "#475569", textAlign: "center" }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {relaciones.map((r, i) => (
                          <tr key={`fila-rel-${i}`} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td style={{ padding: "10px 14px" }}>
                              <strong style={{ color: "#2563eb" }}>{r.padre_codigo}</strong>
                              <div style={{ fontSize: 11.5, color: "#64748b" }}>{r.padre_nombre}</div>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#e2e8f0", color: "#334155", padding: "2px 8px", borderRadius: 4 }}>
                                {r.tipo_relacion}
                              </span>
                            </td>
                            <td style={{ padding: "10px 14px" }}>
                              <strong style={{ color: "#0f172a" }}>{r.hijo_codigo}</strong>
                              <div style={{ fontSize: 11.5, color: "#64748b" }}>{r.hijo_nombre}</div>
                            </td>
                            <td style={{ padding: "10px 14px", textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setCiSeleccionadoId(r.id_ci_padre);
                                  setPestañaDerecha("grafico");
                                }}
                                style={{
                                  padding: "4px 10px",
                                  fontSize: 11.5,
                                  backgroundColor: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #bfdbfe",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                }}
                              >
                                Ver en Grafo
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </TablaDobleScroll>
                </div>

                {ciActivo && (
                  <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                      Detalle del CI Seleccionado: {ciActivo.codigo_ci}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                      {ciActivo.nombre}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 8, fontSize: 12, color: "#475569" }}>
                      <div><strong>Tipo:</strong> {ciActivo.tipo_ci}</div>
                      <div><strong>Ambiente:</strong> {ciActivo.ambiente}</div>
                      <div><strong>Criticidad:</strong> {ciActivo.criticidad}</div>
                      <div><strong>IP:</strong> {ciActivo.ip_principal || "No asignada"}</div>
                      <div><strong>Versión:</strong> {ciActivo.version_software || "1.0"}</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO 2: Vista Gráfica Interactiva con Pan y Zoom */}
            {pestañaDerecha === "grafico" && (
              <div
                ref={svgContainerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                style={{
                  flex: 1,
                  position: "relative",
                  overflow: "hidden",
                  cursor: isDragging ? "grabbing" : "grab",
                  backgroundColor: "#f8fafc",
                }}
              >
                {/* Indicador de ayuda */}
                <div style={{ position: "absolute", top: 12, left: 16, zIndex: 10, pointerEvents: "none", backgroundColor: "rgba(255,255,255,0.85)", padding: "4px 10px", borderRadius: 6, fontSize: 11, color: "#64748b", border: "1px solid #e2e8f0" }}>
                  Arrastra con el mouse para mover el mapa · Rueda para Zoom ({Math.round(zoom * 100)}%)
                </div>

                {/* Lienzo SVG */}
                <svg
                  width="100%"
                  height="100%"
                  style={{ width: "100%", height: "100%", display: "block" }}
                >
                  <defs>
                    <marker
                      id="arrow-topo"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                    </marker>
                    <marker
                      id="arrow-topo-active"
                      viewBox="0 0 10 10"
                      refX="8"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
                    </marker>
                  </defs>

                  <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Líneas de relaciones */}
                    {relaciones.map((r, idx) => {
                      const padre = nodoMap.get(r.id_ci_padre);
                      const hijo = nodoMap.get(r.id_ci_hijo);
                      if (!padre || !hijo) return null;

                      const esActivo = ciActivo?.id_ci === r.id_ci_padre || ciActivo?.id_ci === r.id_ci_hijo;
                      const x1 = padre.x + 90;
                      const y1 = padre.y + 35;
                      const x2 = hijo.x + 90;
                      const y2 = hijo.y + 35;

                      return (
                        <g key={`topo-line-${idx}`}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={esActivo ? "#2563eb" : "#cbd5e1"}
                            strokeWidth={esActivo ? 2.5 : 1.5}
                            strokeDasharray={r.tipo_relacion === "CONECTADO_CON" ? "4,4" : undefined}
                            markerEnd={esActivo ? "url(#arrow-topo-active)" : "url(#arrow-topo)"}
                          />
                          <text
                            x={(x1 + x2) / 2}
                            y={(y1 + y2) / 2 - 4}
                            fill={esActivo ? "#1e40af" : "#94a3b8"}
                            fontSize={9.5}
                            fontWeight={esActivo ? "bold" : "normal"}
                            textAnchor="middle"
                          >
                            {r.tipo_relacion}
                          </text>
                        </g>
                      );
                    })}

                    {/* Nodos CIs */}
                    {nodosGrafico.map((nodo) => {
                      const esSeleccionado = ciActivo?.id_ci === nodo.id_ci;
                      const colorCrit = COLORES_CRITICIDAD[nodo.criticidad] || { bg: "#f1f5f9", text: "#475569", border: "#cbd5e1" };
                      const icono = ICONOS_TIPO[nodo.tipo_ci] || "[CI]";

                      return (
                        <g
                          key={`nodo-ci-${nodo.id_ci}`}
                          transform={`translate(${nodo.x}, ${nodo.y})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCiSeleccionadoId(nodo.id_ci);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <rect
                            width={180}
                            height={70}
                            rx={8}
                            fill={esSeleccionado ? "#eff6ff" : "#ffffff"}
                            stroke={esSeleccionado ? "#2563eb" : colorCrit.border}
                            strokeWidth={esSeleccionado ? 2.5 : 1.5}
                            filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.06))"
                          />
                          <text x={12} y={20} fontSize={12} fill="#2563eb" fontWeight="bold">
                            {icono} {nodo.codigo_ci}
                          </text>
                          <text x={12} y={38} fontSize={11} fill="#0f172a" fontWeight="600">
                            {nodo.nombre.length > 22 ? `${nodo.nombre.substring(0, 20)}…` : nodo.nombre}
                          </text>
                          <text x={12} y={56} fontSize={9.5} fill="#64748b">
                            {nodo.tipo_ci} · {nodo.ambiente}
                          </text>
                          <circle cx={166} cy={16} r={5} fill={colorCrit.text} />
                        </g>
                      );
                    })}
                  </g>
                </svg>

                {/* Ficha Flotante del CI seleccionado al hacer clic en el gráfico */}
                {ciActivo && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: 14,
                      right: 14,
                      backgroundColor: "rgba(255, 255, 255, 0.96)",
                      border: "1px solid #cbd5e1",
                      borderRadius: 10,
                      padding: "12px 16px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      maxWidth: 320,
                      fontSize: 12,
                      zIndex: 20,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>{ciActivo.codigo_ci}</span>
                      <span style={{ fontSize: 10.5, fontWeight: 700, backgroundColor: "#fee2e2", color: "#991b1b", padding: "1px 6px", borderRadius: 4 }}>
                        {ciActivo.criticidad}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>{ciActivo.nombre}</div>
                    <div style={{ color: "#64748b", display: "flex", flexDirection: "column", gap: 3 }}>
                      <div><strong>IP:</strong> {ciActivo.ip_principal || "No asignada"}</div>
                      <div><strong>Ambiente:</strong> {ciActivo.ambiente}</div>
                      <div><strong>Versión:</strong> {ciActivo.version_software || "1.0"}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
