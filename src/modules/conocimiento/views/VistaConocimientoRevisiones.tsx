"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaginaRevisionesPendientes() {
  const [articulos, setArticulos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarRevisiones() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/conocimiento?vista=revisiones&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setArticulos(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar las revisiones pendientes.");
      }
    } catch {
      setError("Error de conexión al cargar revisiones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarRevisiones();
  }, []);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Revisiones de conocimiento pendientes
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Artículos redactados por el equipo a la espera de validación técnica y aprobación editorial ({articulos.length} pendientes)
          </p>
        </div>

        <button
          type="button"
          onClick={cargarRevisiones}
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

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando artículos en revisión...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && articulos.length === 0 && (
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
            No hay revisiones editoriales pendientes
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Todos los artículos enviados han sido revisados y procesados.
          </p>
        </div>
      )}

      {!cargando && !error && articulos.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Autor</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Categoría</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Envío</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((a) => (
                <tr key={a.id_articulo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    {a.codigo_articulo}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 360 }}>
                    {a.titulo}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {a.autor_nombre || "Especialista"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {a.categoria_nombre || "General"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {new Date(a.fecha_creacion).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href="/tecnico/conocimiento/base"
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
                      Examinar
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
