"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface Articulo {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown: string;
  categoria_nombre?: string;
  autor_nombre?: string;
  visitas: number;
  utilidad_positiva: number;
  fecha_publicacion?: string;
}

export default function PaginaBaseConocimiento() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);

  async function cargarArticulos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/conocimiento?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setArticulos(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudo cargar la base de conocimiento.");
      }
    } catch {
      setError("Error de conexión al cargar artículos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarArticulos();
  }, []);

  const articulosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return articulos;
    const q = busqueda.toLowerCase().trim();
    return articulos.filter((a) => {
      const matchCod = a.codigo_articulo?.toLowerCase().includes(q);
      const matchTit = a.titulo?.toLowerCase().includes(q);
      const matchCont = a.contenido_markdown?.toLowerCase().includes(q);
      const matchCat = a.categoria_nombre?.toLowerCase().includes(q);
      return matchCod || matchTit || matchCont || matchCat;
    });
  }, [articulos, busqueda]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Base de conocimiento interno
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Guías, procedimientos estándar y documentación técnica validada ({articulosFiltrados.length} artículos)
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
            onClick={cargarArticulos}
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

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar por código, título, categoría o palabras clave..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13.5,
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        />
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando artículos de conocimiento...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && articulosFiltrados.length === 0 && (
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
            No se encontraron artículos
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No hay documentación que coincida con el criterio de búsqueda.
          </p>
        </div>
      )}

      {!cargando && !error && articulosFiltrados.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {articulosFiltrados.map((a) => (
            <div
              key={a.id_articulo}
              onClick={() => setArticuloSeleccionado(a)}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: 18,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "border-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#2563eb")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb" }}>
                    {a.codigo_articulo}
                  </span>
                  <span style={{ fontSize: 11.5, color: "#64748b" }}>
                    {a.categoria_nombre || "General"}
                  </span>
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.35 }}>
                  {a.titulo}
                </h2>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "#475569",
                    margin: 0,
                    lineHeight: 1.45,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.contenido_markdown}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 14,
                  paddingTop: 10,
                  borderTop: "1px solid #f1f5f9",
                  fontSize: 11.5,
                  color: "#64748b",
                }}
              >
                <span>Por {a.autor_nombre || "Especialista"}</span>
                <Link
                  href={`/conocimiento/${a.id_articulo}`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: "#2563eb", fontWeight: 600, textDecoration: "none" }}
                >
                  Leer artículo →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Cajón de Lectura de Artículo */}
      {articuloSeleccionado && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setArticuloSeleccionado(null)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 720,
              maxHeight: "85vh",
              overflowY: "auto",
              padding: 28,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
                {articuloSeleccionado.codigo_articulo} • {articuloSeleccionado.categoria_nombre}
              </span>
              <button
                type="button"
                onClick={() => setArticuloSeleccionado(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 14,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                Cerrar
              </button>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
              {articuloSeleccionado.titulo}
            </h2>

            <div
              style={{
                fontSize: 14,
                color: "#1e293b",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                backgroundColor: "#f8fafc",
                padding: 18,
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                marginBottom: 20,
              }}
            >
              {articuloSeleccionado.contenido_markdown}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setArticuloSeleccionado(null)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#2563eb",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Cerrar artículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
