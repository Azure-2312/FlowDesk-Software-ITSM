"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

export default function PaginaMisCambios() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [segmento, setSegmento] = useState<"todos" | "normal" | "estandar" | "emergencia">("todos");
  const [busqueda, setBusqueda] = useState("");

  async function cargarCambios() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios?vista=mis_cambios&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCambios(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar tus cambios RFC.");
      }
    } catch {
      setError("Error de conexión al cargar cambios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCambios();
  }, []);

  const cambiosFiltrados = useMemo(() => {
    return cambios.filter((c) => {
      if (segmento === "normal" && c.tipo_cambio !== "NORMAL") return false;
      if (segmento === "estandar" && c.tipo_cambio !== "ESTANDAR") return false;
      if (segmento === "emergencia" && c.tipo_cambio !== "EMERGENCIA") return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchCod = c.codigo_cambio?.toLowerCase().includes(q);
        const matchTit = c.titulo?.toLowerCase().includes(q);
        if (!matchCod && !matchTit) return false;
      }

      return true;
    });
  }, [cambios, segmento, busqueda]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Mis cambios (Solicitudes RFC)
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Solicitudes de cambio propuestas o asignadas a tu responsabilidad ({cambiosFiltrados.length} cambios)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/tecnico/cambios/nuevo"
            style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              textDecoration: "none",
            }}
          >
            Registrar solicitud RFC
          </Link>
          <button
            type="button"
            onClick={cargarCambios}
            style={{
              padding: "8px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 13,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Segmentos */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setSegmento("todos")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "todos" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "todos" ? "#2563eb" : "transparent",
            color: segmento === "todos" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Todos ({cambios.length})
        </button>
        <button
          type="button"
          onClick={() => setSegmento("normal")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "normal" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "normal" ? "#2563eb" : "transparent",
            color: segmento === "normal" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Normales
        </button>
        <button
          type="button"
          onClick={() => setSegmento("estandar")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "estandar" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "estandar" ? "#2563eb" : "transparent",
            color: segmento === "estandar" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Estándar
        </button>
        <button
          type="button"
          onClick={() => setSegmento("emergencia")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "emergencia" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "emergencia" ? "#dc2626" : "transparent",
            color: segmento === "emergencia" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Emergencia
        </button>
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando solicitudes de cambio...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && cambiosFiltrados.length === 0 && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            No tienes solicitudes de cambio en esta vista
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Puedes registrar una nueva solicitud RFC para mantenimientos o actualizaciones programadas.
          </p>
        </div>
      )}

      {!cargando && !error && cambiosFiltrados.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Ventana Programada</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cambiosFiltrados.map((c) => (
                <tr key={c.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    {c.codigo_cambio}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor:
                          c.tipo_cambio === "EMERGENCIA"
                            ? "#fee2e2"
                            : c.tipo_cambio === "ESTANDAR"
                            ? "#dbeafe"
                            : "#f1f5f9",
                        color:
                          c.tipo_cambio === "EMERGENCIA"
                            ? "#991b1b"
                            : c.tipo_cambio === "ESTANDAR"
                            ? "#1e40af"
                            : "#334155",
                      }}
                    >
                      {c.tipo_cambio}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 320 }}>
                    {c.titulo}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                      }}
                    >
                      {c.estado_nombre}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569" }}>
                      {c.prioridad_nombre || "Media"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {c.ventana_inicio
                      ? new Date(c.ventana_inicio).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Por programar"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href="/tecnico/cambios/implementacion"
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#1e293b",
                        textDecoration: "none",
                      }}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
