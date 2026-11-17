// ============================================================================
// GESTIÓN DE PROBLEMAS Y ERRORES CONOCIDOS (KEDB): Workspace de Investigación
// ============================================================================
// Permite registrar problemas mayores, documentar causas raíz (RCA), registrar
// soluciones temporales (workarounds) y publicar en la base KEDB (ITIL v4).
// ============================================================================

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

// ----------------------------------------------------------------------------
// 1. MODELO DE DATOS: Estructura de Problema, estado, causa raíz y KEDB
// ----------------------------------------------------------------------------
type Problema = {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  estado_nombre: string;
  causa_raiz?: string | null;
  workaround?: string | null;
  es_error_conocido: boolean;
  incidentes_asociados?: { codigo_ticket: string; titulo: string }[];
};

export default function ProblemasWorkspace({
  puedeCrear,
  soloKedb = false,
}: {
  puedeCrear: boolean;
  soloKedb?: boolean;
}) {
  // --------------------------------------------------------------------------
  // 2. ESTADOS LOCALES: Lista de problemas y banderas
  // --------------------------------------------------------------------------
  const [items, setItems] = useState<Problema[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  // --------------------------------------------------------------------------
  // 3. CONSULTA A LA API: Carga el listado completo o exclusivo para la KEDB
  // --------------------------------------------------------------------------
  async function cargar() {
    setCargando(true);
    const res = await fetch(`/api/problemas${soloKedb ? "?kedb=true" : ""}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "No se pudieron cargar los problemas");
    else setItems(Array.isArray(data) ? data : []);
    setCargando(false);
  }

  useEffect(() => {
    void cargar();
  }, [soloKedb]);

  function getBadgeStyle(estado: string) {
    const norm = (estado || "").toLowerCase();
    if (norm.includes("resuelt")) {
      return { backgroundColor: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" };
    }
    if (norm.includes("cerrad")) {
      return { backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" };
    }
    if (norm.includes("proceso") || norm.includes("investig") || norm.includes("analis")) {
      return { backgroundColor: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" };
    }
    return { backgroundColor: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  }

  // --------------------------------------------------------------------------
  // 4. RENDERIZADO VISUAL: Encabezado sin tarjetas y tabla con espaciado amplio
  // --------------------------------------------------------------------------
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        width: "100%",
        boxSizing: "border-box",
        padding: "24px 32px",
      }}
    >
      <div style={{ maxWidth: 1400, width: "100%", margin: "0 auto" }}>
        {/* Encabezado Principal */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 24,
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: 0,
                color: "#0f172a",
                letterSpacing: "-0.01em",
              }}
            >
              {soloKedb ? "Errores conocidos (KEDB)" : "Historial de problemas"}
            </h1>
            <p
              style={{
                margin: "6px 0 0 0",
                color: "#64748b",
                fontSize: 13.5,
                lineHeight: 1.5,
              }}
            >
              {soloKedb
                ? "Catálogo de soluciones temporales documentadas para acelerar la resolución de incidentes."
                : "Bitácora y trazabilidad de problemas investigados, causas raíz documentadas y soluciones temporales (workarounds)."}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              backgroundColor: "#fef2f2",
              color: "#b91c1c",
              border: "1px solid #fecaca",
              borderRadius: 8,
              marginBottom: 20,
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        {cargando ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b", fontSize: 14 }}>
            Cargando problemas...
          </div>
        ) : items.length === 0 ? (
          <div
            style={{
              padding: 48,
              textAlign: "center",
              backgroundColor: "#ffffff",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            No hay registros para mostrar.
          </div>
        ) : (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            }}
          >
            <TablaDobleScroll minWidth={950}>
            <table
              className="tabla-datos"
              style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th
                    style={{
                      padding: "12px 18px",
                      textAlign: "center",
                      width: 150,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Código
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      minWidth: 260,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Título
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      textAlign: "center",
                      width: 140,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Estado
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      minWidth: 280,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Causa raíz
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      textAlign: "left",
                      minWidth: 280,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Solución temporal
                  </th>
                  <th
                    style={{
                      padding: "12px 18px",
                      textAlign: "center",
                      width: 110,
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: 11.5,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Incidentes
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const bStyle = getBadgeStyle(p.estado_nombre);
                  return (
                    <tr
                      key={p.id_problema}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s ease",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 18px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Link
                          href={`/plataforma/problemas/${p.id_problema}`}
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "#2563eb",
                            textDecoration: "none",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {p.codigo_problema}
                        </Link>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "left" }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: "#0f172a",
                            fontSize: 13.5,
                            display: "block",
                          }}
                        >
                          {p.titulo}
                        </span>
                        {p.descripcion && p.descripcion !== p.titulo && (
                          <span
                            style={{
                              display: "block",
                              color: "#64748b",
                              fontSize: 12,
                              marginTop: 3,
                              lineHeight: 1.4,
                            }}
                          >
                            {p.descripcion.length > 90
                              ? `${p.descripcion.slice(0, 90)}...`
                              : p.descripcion}
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 12px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 600,
                            ...bStyle,
                          }}
                        >
                          {p.estado_nombre}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          textAlign: "left",
                          color: p.causa_raiz ? "#334155" : "#94a3b8",
                          fontSize: 12.5,
                          lineHeight: 1.5,
                        }}
                      >
                        {p.causa_raiz || (
                          <span style={{ fontStyle: "italic" }}>Pendiente de análisis</span>
                        )}
                      </td>
                      <td
                        style={{
                          padding: "14px 18px",
                          textAlign: "left",
                          color: p.workaround ? "#334155" : "#94a3b8",
                          fontSize: 12.5,
                          lineHeight: 1.5,
                        }}
                      >
                        {p.workaround || (
                          <span style={{ fontStyle: "italic" }}>Sin solución provisional</span>
                        )}
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: "#f1f5f9",
                            color: "#334155",
                            fontWeight: 700,
                            fontSize: 12.5,
                          }}
                        >
                          {p.incidentes_asociados?.length || 0}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </TablaDobleScroll>
          </div>
        )}
      </div>
    </div>
  );
}
