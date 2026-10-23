"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProblemaItem {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  id_prioridad: number;
  prioridad_nombre: string;
  id_estado: number;
  estado_nombre: string;
  causa_raiz?: string;
  workaround?: string;
  es_error_conocido?: boolean;
  tecnico_asignado_nombre?: string;
  id_usuario_asignado?: number;
  incidentes_asociados?: any[];
  fecha_creacion: string;
}

export default function PaginaProblemasAsignados() {
  const [problemas, setProblemas] = useState<ProblemaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarProblemas() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        // Filtrar los asignados a mí (o todos los del técnico si la API ya los filtra)
        setProblemas(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar los problemas asignados.");
      }
    } catch {
      setError("Error de conexión al cargar problemas.");
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
            Problemas asignados a mí
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Investigaciones de causa raíz y workaround asignadas a tu gestión técnica ({problemas.length} problemas)
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
          Cargando problemas asignados...
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
            No tienes problemas asignados actualmente
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 16px" }}>
            Revisa los problemas de tu grupo o analiza candidatos por incidentes recurrentes.
          </p>
          <Link
            href="/plataforma/problemas/tecnico/candidatos"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Explorar candidatos a problema
          </Link>
        </div>
      )}

      {!cargando && !error && problemas.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Incidentes</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>KEDB</th>
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
                  <td style={{ padding: "12px 16px" }}>
                    {p.es_error_conocido ? (
                      <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 12 }}>Publicado en KEDB</span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>Sin KEDB</span>
                    )}
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
