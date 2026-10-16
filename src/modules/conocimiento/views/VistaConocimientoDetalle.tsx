"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface ArticuloDetalle {
  id_articulo: number;
  codigo_articulo: string;
  titulo: string;
  contenido_markdown: string;
  id_categoria: number | null;
  categoria_nombre?: string | null;
  id_problema_origen: number | null;
  estado_editorial: string;
  id_autor: number;
  autor_nombre?: string | null;
  visitas: number;
  utilidad_positiva: number;
  utilidad_negativa: number;
  fecha_publicacion?: string | null;
  fecha_creacion?: string | null;
}

const PALABRAS_VACIAS = new Set([
  "para", "como", "con", "los", "las", "una", "uno", "del", "que", "por",
  "the", "and", "desde", "este", "esta", "sobre", "entre", "cuando", "donde",
]);

function formatearFecha(valor?: string | null) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "2-digit" });
}

function construirEtiquetas(articulo: ArticuloDetalle) {
  const etiquetas = new Set<string>();
  if (articulo.categoria_nombre) etiquetas.add(articulo.categoria_nombre);

  const palabras = `${articulo.titulo}`.toLowerCase().match(/[a-záéíóúñ0-9]{4,}/g) ?? [];
  for (const palabra of palabras) {
    if (etiquetas.size >= 6) break;
    if (PALABRAS_VACIAS.has(palabra)) continue;
    etiquetas.add(palabra.charAt(0).toUpperCase() + palabra.slice(1));
  }
  return Array.from(etiquetas);
}

export default function VistaConocimientoDetalle() {
  const params = useParams();
  const idArticulo = params?.id as string;

  const [articulo, setArticulo] = useState<ArticuloDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votando, setVotando] = useState(false);
  const [mensajeVoto, setMensajeVoto] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      setNoEncontrado(false);
      try {
        const res = await fetch(`/api/conocimiento/${idArticulo}`);
        if (res.status === 404) {
          setNoEncontrado(true);
          return;
        }
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "No se pudo cargar el artículo.");
          return;
        }
        const data = await res.json();
        setArticulo(data);
      } catch {
        setError("Error de conexión al cargar el artículo.");
      } finally {
        setCargando(false);
      }
    }
    if (idArticulo) cargar();
  }, [idArticulo]);

  async function votar(voto: "POSITIVO" | "NEGATIVO") {
    if (votando) return;
    setVotando(true);
    setMensajeVoto(null);
    try {
      const res = await fetch(`/api/conocimiento/${idArticulo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto_utilidad: voto }),
      });
      if (!res.ok) {
        setMensajeVoto("No se pudo registrar tu valoración. Inténtalo de nuevo.");
        return;
      }
      setArticulo((prev) =>
        prev
          ? {
              ...prev,
              utilidad_positiva: prev.utilidad_positiva + (voto === "POSITIVO" ? 1 : 0),
              utilidad_negativa: prev.utilidad_negativa + (voto === "NEGATIVO" ? 1 : 0),
            }
          : prev
      );
      setMensajeVoto("¡Gracias! Tu valoración fue registrada.");
    } catch {
      setMensajeVoto("Error de conexión al registrar tu valoración.");
    } finally {
      setVotando(false);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 16 }}>
        <Link
          href="/conocimiento"
          style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 600 }}
        >
          ← Volver a la base de conocimiento
        </Link>
      </div>

      {cargando && (
        <div style={{ padding: "48px 0", textAlign: "center", color: "#64748b" }}>
          Cargando artículo...
        </div>
      )}

      {!cargando && noEncontrado && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            Artículo no encontrado
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "0 0 18px" }}>
            El artículo solicitado no existe o fue retirado de la base de conocimiento.
          </p>
          <Link
            href="/conocimiento"
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
            Volver al listado
          </Link>
        </div>
      )}

      {!cargando && error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6 }}>
          {error}
        </div>
      )}

      {!cargando && articulo && (
        <article
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: 28,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
              {articulo.codigo_articulo}
            </span>
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 600,
                color: "#065f46",
                backgroundColor: "#ecfdf5",
                borderRadius: 4,
                padding: "3px 8px",
              }}
            >
              {articulo.estado_editorial}
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: "0 0 14px", lineHeight: 1.3 }}>
            {articulo.titulo}
          </h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 18,
              fontSize: 12.5,
              color: "#64748b",
              paddingBottom: 16,
              marginBottom: 18,
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span><strong style={{ color: "#334155" }}>Categoría:</strong> {articulo.categoria_nombre || "General"}</span>
            <span><strong style={{ color: "#334155" }}>Autor:</strong> {articulo.autor_nombre || "Especialista"}</span>
            <span><strong style={{ color: "#334155" }}>Publicado:</strong> {formatearFecha(articulo.fecha_publicacion ?? articulo.fecha_creacion)}</span>
            <span><strong style={{ color: "#334155" }}>Visitas:</strong> {articulo.visitas}</span>
          </div>

          {construirEtiquetas(articulo).length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {construirEtiquetas(articulo).map((etiqueta) => (
                <span
                  key={etiqueta}
                  style={{
                    fontSize: 11.5,
                    color: "#334155",
                    backgroundColor: "#f1f5f9",
                    borderRadius: 12,
                    padding: "3px 10px",
                  }}
                >
                  {etiqueta}
                </span>
              ))}
            </div>
          )}

          <div
            style={{
              fontSize: 14,
              color: "#1e293b",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              backgroundColor: "#f8fafc",
              padding: 20,
              borderRadius: 6,
              border: "1px solid #e2e8f0",
            }}
          >
            {articulo.contenido_markdown}
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 18,
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 13, color: "#334155", fontWeight: 600 }}>
              ¿Te resultó útil este artículo?
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="button"
                onClick={() => votar("POSITIVO")}
                disabled={votando}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#065f46",
                  cursor: votando ? "not-allowed" : "pointer",
                }}
              >
                Útil ({articulo.utilidad_positiva})
              </button>
              <button
                type="button"
                onClick={() => votar("NEGATIVO")}
                disabled={votando}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#991b1b",
                  cursor: votando ? "not-allowed" : "pointer",
                }}
              >
                No útil ({articulo.utilidad_negativa})
              </button>
            </div>
          </div>

          {mensajeVoto && (
            <div style={{ marginTop: 12, fontSize: 12.5, color: "#475569" }}>{mensajeVoto}</div>
          )}
        </article>
      )}
    </div>
  );
}
