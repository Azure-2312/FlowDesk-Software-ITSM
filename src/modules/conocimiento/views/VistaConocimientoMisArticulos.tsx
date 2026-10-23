"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaginaMisArticulos() {
  const [articulos, setArticulos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargarMisArticulos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/conocimiento?vista=mis_articulos&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setArticulos(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar tus artículos.");
      }
    } catch {
      setError("Error de conexión al cargar tus artículos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarMisArticulos();
  }, []);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Mis artículos de conocimiento
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Artículos redactados por ti y estado del flujo editorial de publicación ({articulos.length} artículos)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/plataforma/conocimiento/tecnico/nuevo"
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
            Crear artículo
          </Link>
          <button
            type="button"
            onClick={cargarMisArticulos}
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
          Cargando tus artículos...
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
            Aún no has redactado artículos de conocimiento
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 16px" }}>
            Aporta conocimiento y procedimientos para enriquecer la base de conocimiento del equipo.
          </p>
          <Link
            href="/plataforma/conocimiento/tecnico/nuevo"
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
            Crear mi primer artículo
          </Link>
        </div>
      )}

      {!cargando && !error && articulos.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Categoría</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado Editorial</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Visitas</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Creación</th>
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
                    {a.categoria_nombre || "General"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor:
                          a.estado_editorial === "PUBLICADO"
                            ? "#ecfdf5"
                            : a.estado_editorial === "EN_REVISION"
                            ? "#fef3c7"
                            : "#f1f5f9",
                        color:
                          a.estado_editorial === "PUBLICADO"
                            ? "#065f46"
                            : a.estado_editorial === "EN_REVISION"
                            ? "#92400e"
                            : "#475569",
                      }}
                    >
                      {a.estado_editorial === "PUBLICADO"
                        ? "Publicado"
                        : a.estado_editorial === "EN_REVISION"
                        ? "En revisión"
                        : "Borrador"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {a.visitas || 0}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {new Date(a.fecha_creacion).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
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
