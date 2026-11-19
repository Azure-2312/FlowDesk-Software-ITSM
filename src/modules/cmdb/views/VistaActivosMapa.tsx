"use client";

import { useEffect, useState, useMemo } from "react";

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
  APLICACION: "📱",
  SERVIDOR_LOGICO: "💻",
  SERVIDOR_FISICO: "🖥️",
  BASE_DATOS: "🗄️",
  NODO_RED: "🔀",
  SERVICIO: "⚙️",
};

export default function VistaActivosMapa() {
  const [elementos, setElementos] = useState<ElementoCI[]>([]);
  const [relaciones, setRelaciones] = useState<RelacionCI[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ciSeleccionadoId, setCiSeleccionadoId] = useState<number | null>(null);
  const [modoVista, setModoVista] = useState<"grafico" | "lista">("grafico");
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");

  useEffect(() => {
    async function cargarDatos() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch(`/api/activos/cmdb?_t=${Date.now()}`);
        if (!res.ok) throw new Error("No se pudo obtener la topología de la CMDB.");
        const data = await res.json();
        const listaCis: ElementoCI[] = data.elementos || [];
        const listaRels: RelacionCI[] = data.relaciones || [];
        setElementos(listaCis);
        setRelaciones(listaRels);
        if (listaCis.length > 0) {
          setCiSeleccionadoId(listaCis[0].id_ci);
        }
      } catch (err: any) {
        setError(err.message || "Error al cargar la información de configuración.");
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  const elementosFiltrados = useMemo(() => {
    if (filtroTipo === "TODOS") return elementos;
    return elementos.filter((e) => e.tipo_ci === filtroTipo);
  }, [elementos, filtroTipo]);

  const ciActivo = useMemo(() => {
    return elementos.find((e) => e.id_ci === ciSeleccionadoId) || elementos[0] || null;
  }, [elementos, ciSeleccionadoId]);

  // Relaciones donde el CI activo es origen o destino
  const dependenciasHijo = useMemo(() => {
    if (!ciActivo) return [];
    return relaciones.filter((r) => r.id_ci_padre === ciActivo.id_ci);
  }, [relaciones, ciActivo]);

  const dependenciasPadre = useMemo(() => {
    if (!ciActivo) return [];
    return relaciones.filter((r) => r.id_ci_hijo === ciActivo.id_ci);
  }, [relaciones, ciActivo]);

  // Layout de grafo visual SVG (posiciones calculadas)
  const nodosGrafico = useMemo((): NodoGrafico[] => {
    if (elementos.length === 0) return [];

    // Agrupación por capas lógicas ITIL:
    // Nivel 0: Aplicaciones / Servicios
    // Nivel 1: Servidores lógicos / Servidores físicos
    // Nivel 2: Bases de datos / Middleware
    // Nivel 3: Red / Almacenamiento / Infraestructura
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
    const anchoColumna = 230;
    const paddingX = 80;
    const offsetY = 70;
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

  const alturaSvg = useMemo(() => {
    let maxY = 450;
    nodosGrafico.forEach((n) => {
      if (n.y + 100 > maxY) maxY = n.y + 100;
    });
    return maxY;
  }, [nodosGrafico]);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Cabecera */}
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
            Visualización gráfica y relacional de infraestructura, software y dependencias operativas para análisis de impacto preventivo.
          </p>
        </div>

        {/* Controles de Vista */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", backgroundColor: "#f1f5f9", padding: 3, borderRadius: 8, border: "1px solid #cbd5e1" }}>
            <button
              type="button"
              onClick={() => setModoVista("grafico")}
              style={{
                border: "none",
                backgroundColor: modoVista === "grafico" ? "#ffffff" : "transparent",
                color: modoVista === "grafico" ? "#0f172a" : "#64748b",
                fontWeight: modoVista === "grafico" ? 700 : 500,
                fontSize: 12.5,
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                boxShadow: modoVista === "grafico" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              📊 Diagrama Gráfico
            </button>
            <button
              type="button"
              onClick={() => setModoVista("lista")}
              style={{
                border: "none",
                backgroundColor: modoVista === "lista" ? "#ffffff" : "transparent",
                color: modoVista === "lista" ? "#0f172a" : "#64748b",
                fontWeight: modoVista === "lista" ? 700 : 500,
                fontSize: 12.5,
                padding: "6px 14px",
                borderRadius: 6,
                cursor: "pointer",
                boxShadow: modoVista === "lista" ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              }}
            >
              📑 Lista de Relaciones
            </button>
          </div>

          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            style={{
              padding: "6px 12px",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: 12.5,
              backgroundColor: "#ffffff",
              color: "#334155",
            }}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="APLICACION">Aplicaciones</option>
            <option value="SERVIDOR_LOGICO">Servidores Lógicos</option>
            <option value="SERVIDOR_FISICO">Servidores Físicos</option>
            <option value="BASE_DATOS">Bases de Datos</option>
            <option value="NODO_RED">Nodos de Red</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #f87171", color: "#991b1b", padding: 12, borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {cargando ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 14 }}>
          Cargando topología y dependencias de la CMDB...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* Panel Principal: Gráfico o Lista */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              minHeight: 520,
            }}
          >
            {modoVista === "grafico" ? (
              <div style={{ overflowX: "auto", padding: 16 }}>
                {/* Leyenda superior del diagrama */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                  <div style={{ display: "flex", gap: 14, fontSize: 11.5, color: "#64748b", flexWrap: "wrap" }}>
                    <span>Capas ITIL:</span>
                    <strong style={{ color: "#0369a1" }}>1. Apps / Servicios</strong> →
                    <strong style={{ color: "#475569" }}>2. Servidores</strong> →
                    <strong style={{ color: "#0d9488" }}>3. Bases de Datos</strong> →
                    <strong style={{ color: "#7c3aed" }}>4. Red</strong>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#64748b" }}>
                    💡 Clic en cualquier nodo para inspeccionar relaciones
                  </div>
                </div>

                {/* Lienzo SVG interactivo */}
                <svg
                  width={980}
                  height={alturaSvg}
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #f1f5f9",
                    display: "block",
                  }}
                >
                  <defs>
                    <marker
                      id="arrow"
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
                      id="arrow-active"
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

                  {/* Líneas de conexión de relaciones */}
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
                      <g key={`rel-${idx}`}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={esActivo ? "#2563eb" : "#cbd5e1"}
                          strokeWidth={esActivo ? 2.5 : 1.5}
                          strokeDasharray={r.tipo_relacion === "CONECTADO_CON" ? "4,4" : undefined}
                          markerEnd={esActivo ? "url(#arrow-active)" : "url(#arrow)"}
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
                    const icono = ICONOS_TIPO[nodo.tipo_ci] || "📦";

                    return (
                      <g
                        key={`nodo-${nodo.id_ci}`}
                        transform={`translate(${nodo.x}, ${nodo.y})`}
                        onClick={() => setCiSeleccionadoId(nodo.id_ci)}
                        style={{ cursor: "pointer" }}
                      >
                        <rect
                          width={180}
                          height={70}
                          rx={8}
                          fill={esSeleccionado ? "#eff6ff" : "#ffffff"}
                          stroke={esSeleccionado ? "#2563eb" : colorCrit.border}
                          strokeWidth={esSeleccionado ? 2.5 : 1.5}
                          filter="drop-shadow(0px 2px 3px rgba(0,0,0,0.06))"
                        />
                        {/* Header del nodo */}
                        <text x={12} y={20} fontSize={12} fill="#2563eb" fontWeight="bold">
                          {icono} {nodo.codigo_ci}
                        </text>
                        {/* Nombre del CI */}
                        <text x={12} y={38} fontSize={11} fill="#0f172a" fontWeight="600">
                          {nodo.nombre.length > 22 ? `${nodo.nombre.substring(0, 20)}…` : nodo.nombre}
                        </text>
                        {/* Tipo y criticidad */}
                        <text x={12} y={56} fontSize={9.5} fill="#64748b">
                          {nodo.tipo_ci} · {nodo.ambiente}
                        </text>
                        {/* Badge de criticidad */}
                        <circle cx={166} cy={16} r={5} fill={colorCrit.text} />
                      </g>
                    );
                  })}
                </svg>
              </div>
            ) : (
              /* Vista Lista y Matriz */
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                  Matriz de Dependencias y Relaciones Registradas ({relaciones.length})
                </h3>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left" }}>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>CI Origen / Padre</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Tipo de Relación</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>CI Destino / Dependiente</th>
                        <th style={{ padding: "10px 12px", color: "#475569" }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relaciones.map((r, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 12px" }}>
                            <strong style={{ color: "#2563eb" }}>{r.padre_codigo}</strong>
                            <div style={{ fontSize: 11.5, color: "#64748b" }}>{r.padre_nombre}</div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                backgroundColor: "#e2e8f0",
                                color: "#334155",
                                padding: "2px 8px",
                                borderRadius: 4,
                              }}
                            >
                              {r.tipo_relacion}
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <strong style={{ color: "#0f172a" }}>{r.hijo_codigo}</strong>
                            <div style={{ fontSize: 11.5, color: "#64748b" }}>{r.hijo_nombre}</div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setCiSeleccionadoId(r.id_ci_padre);
                                setModoVista("grafico");
                              }}
                              style={{
                                padding: "4px 8px",
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
                </div>
              </div>
            )}
          </div>

          {/* Panel Lateral: Detalle del CI Activo & Análisis de Impacto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ciActivo ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  padding: 18,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    {ciActivo.codigo_ci}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: COLORES_CRITICIDAD[ciActivo.criticidad]?.bg || "#f1f5f9",
                      color: COLORES_CRITICIDAD[ciActivo.criticidad]?.text || "#475569",
                      padding: "2px 8px",
                      borderRadius: 4,
                    }}
                  >
                    Criticidad: {ciActivo.criticidad}
                  </span>
                </div>

                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                  {ciActivo.nombre}
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "#475569", borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                  <div><strong>Tipo de CI:</strong> {ciActivo.tipo_ci}</div>
                  <div><strong>Ambiente:</strong> {ciActivo.ambiente}</div>
                  <div><strong>IP Principal:</strong> {ciActivo.ip_principal || "No asignada"}</div>
                  <div><strong>Versión:</strong> {ciActivo.version_software || "1.0"}</div>
                  <div><strong>Soporte TI:</strong> {ciActivo.departamento_soporte_nombre || "Infraestructura & Operaciones"}</div>
                </div>

                {/* Dependencias Aguas Arriba */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Componentes requeridos (Depende de):
                  </div>
                  {dependenciasHijo.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                      No tiene dependencias registradas hacia otros CIs.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {dependenciasHijo.map((dep, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCiSeleccionadoId(dep.id_ci_hijo)}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          <strong style={{ color: "#2563eb" }}>{dep.hijo_codigo}</strong>: {dep.hijo_nombre}
                          <div style={{ fontSize: 10.5, color: "#64748b" }}>({dep.tipo_relacion})</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Servicios / CIs afectados si este CI falla */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                    Elementos que dependen de este CI:
                  </div>
                  {dependenciasPadre.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
                      Ningún componente depende directamente de este nodo.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {dependenciasPadre.map((dep, idx) => (
                        <div
                          key={idx}
                          onClick={() => setCiSeleccionadoId(dep.id_ci_padre)}
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 12,
                          }}
                        >
                          <strong style={{ color: "#b91c1c" }}>{dep.padre_codigo}</strong>: {dep.padre_nombre}
                          <div style={{ fontSize: 10.5, color: "#7f1d1d" }}>Se interrumpirá si este nodo cae.</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tarjeta de impacto preventivo */}
                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: "#fef3c7",
                    borderRadius: 8,
                    border: "1px solid #fde68a",
                    fontSize: 12,
                    color: "#92400e",
                  }}
                >
                  <strong>⚠️ Análisis de Impacto en Cambios:</strong>
                  <div style={{ marginTop: 4, lineHeight: 1.4 }}>
                    Cualquier cambio o reinicio sobre este CI debe ser planificado en ventana de mantenimiento con plan de contingencia (Rollback) aprobado.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>
                Selecciona un CI para ver su información técnica y dependencias.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
