"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaginaProblemasGrupo() {
  const [problemas, setProblemas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarProblemas() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setProblemas(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar los problemas del grupo.");
      }
    } catch {
      setError("Error de conexión al cargar problemas del grupo.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProblemas();
  }, []);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Problemas de mi grupo
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Visibilidad de causas raíz e investigaciones abiertas en tu área técnica ({problemas.length} problemas)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/plataforma/problemas/tecnico/nuevo"
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
            Registrar problema
          </Link>
          <button
            type="button"
            onClick={cargarProblemas}
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

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando problemas del grupo...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && problemas.length === 0 && (
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
            No hay problemas registrados en tu grupo
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No se han identificado problemas abiertos en tu área técnica.
          </p>
        </div>
      )}

      {!cargando && !error && problemas.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Responsable</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Incidentes</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {problemas.map((p) => (
                <tr key={p.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    {p.codigo_problema}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 300 }}>
                    {p.titulo}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {p.tecnico_asignado_nombre || "Sin asignar"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 700,
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                      }}
                    >
                      {p.prioridad_nombre || "Media"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                      }}
                    >
                      {p.estado_nombre}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {p.incidentes_asociados?.length || 0} incidentes
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href={`/plataforma/problemas/tecnico/errores-conocidos`}
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
                      Consultar
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
