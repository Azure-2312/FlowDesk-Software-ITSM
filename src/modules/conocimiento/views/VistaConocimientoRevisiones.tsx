"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ArticuloRevision {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  categoria_nombre: string | null;
  autor_nombre: string | null;
  estado_editorial: string;
  fecha_creacion: string;
}

export default function VistaConocimientoRevisiones({
  vista = "pendientes",
}: {
  vista?: "publicacion" | "pendientes";
} = {}) {
  const [articulos, setArticulos] = useState<ArticuloRevision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [publicandoTodos, setPublicandoTodos] = useState(false);

  const esPublicacion = vista === "publicacion";

  async function cargarArticulos() {
    setCargando(true);
    setError(null);
    try {
      const endpointVista = esPublicacion ? "publicacion" : "pendientes";
      const res = await fetch(`/api/conocimiento?vista=${endpointVista}&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setArticulos(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudieron cargar los artículos.");
      }
    } catch {
      setError("Error de conexión al cargar artículos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarArticulos();
  }, [vista]);

  async function aprobarArticulo(idArticulo: number) {
    setProcesandoId(idArticulo);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/conocimiento/publicacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "aprobar", id_articulo: idArticulo }),
      });
      if (res.ok) {
        setOk("Artículo aprobado exitosamente. Pasó a la bandeja de publicación.");
        await cargarArticulos();
      } else {
        const j = await res.json();
        setError(j.error || "No se pudo aprobar el artículo.");
      }
    } catch {
      setError("Error de conexión al aprobar el artículo.");
    } finally {
      setProcesandoId(null);
    }
  }

  async function publicarTodosLosAprobados() {
    if (articulos.length === 0) return;
    setPublicandoTodos(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/conocimiento/publicacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "publicar" }),
      });
      if (res.ok) {
        setOk("Artículos publicados oficialmente en la base de conocimiento.");
        await cargarArticulos();
      } else {
        const j = await res.json();
        setError(j.error || "No se pudieron publicar los artículos.");
      }
    } catch {
      setError("Error de conexión al publicar artículos.");
    } finally {
      setPublicandoTodos(false);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box" }}>
      {/* 1. Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
            {esPublicacion
              ? "Artículos aprobados listos para publicación"
              : "Revisiones editoriales pendientes"}
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            {esPublicacion
              ? `Artículos validados técnica y formalmente, listos para difusión oficial (${articulos.length} artículos aprobados)`
              : `Artículos redactados por especialistas técnicos a la espera de validación (${articulos.length} pendientes)`}
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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

          {esPublicacion && (
            <button
              type="button"
              onClick={publicarTodosLosAprobados}
              disabled={articulos.length === 0 || publicandoTodos}
              style={{
                padding: "8px 16px",
                backgroundColor: "#2563eb",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#ffffff",
                cursor: articulos.length > 0 && !publicandoTodos ? "pointer" : "not-allowed",
                opacity: articulos.length > 0 && !publicandoTodos ? 1 : 0.6,
              }}
            >
              {publicandoTodos ? "Publicando..." : "Publicar artículos"}
            </button>
          )}
        </div>
      </div>

      {ok && (
        <div style={{ padding: "10px 14px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 6, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
          {ok}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando artículos...
        </div>
      )}

      {!cargando && articulos.length === 0 && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px dashed #cbd5e1",
            padding: "36px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
            {esPublicacion
              ? "No hay artículos aprobados pendientes de publicación"
              : "No hay revisiones editoriales pendientes"}
          </div>
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>
            {esPublicacion
              ? "Los artículos aprobados en la pestaña de revisiones aparecerán aquí para su lanzamiento oficial."
              : "Todos los artículos técnicos redactados ya han sido revisados y dictaminados."}
          </p>
        </div>
      )}

      {!cargando && articulos.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Autor</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Categoría</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Fecha envío</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {articulos.map((a) => {
                const esAprobando = procesandoId === a.id_articulo;

                return (
                  <tr key={a.id_articulo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                      {a.codigo_articulo}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#1e293b", fontWeight: 500, maxWidth: 360 }}>
                      <Link href={`/plataforma/conocimiento/${a.id_articulo}`} style={{ color: "#1e293b", textDecoration: "none" }}>
                        {a.titulo}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>
                      {a.autor_nombre || "Especialista"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#475569" }}>
                      {a.categoria_nombre || "General"}
                    </td>
                    <td style={{ padding: "10px 14px", color: "#64748b", fontSize: 12 }}>
                      {new Date(a.fecha_creacion).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                        <Link
                          href={`/plataforma/conocimiento/${a.id_articulo}`}
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

                        {!esPublicacion && (
                          <button
                            type="button"
                            onClick={() => aprobarArticulo(a.id_articulo)}
                            disabled={esAprobando}
                            style={{
                              padding: "4px 12px",
                              backgroundColor: "#2563eb",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#ffffff",
                              cursor: esAprobando ? "not-allowed" : "pointer",
                              opacity: esAprobando ? 0.6 : 1,
                            }}
                          >
                            {esAprobando ? "Aprobando..." : "Aprobar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
