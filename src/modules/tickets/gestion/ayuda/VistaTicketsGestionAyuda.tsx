"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArticuloConocimiento } from "@/types";

export default function PaginaBaseAyuda() {
  const [articulos, setArticulos] = useState<ArticuloConocimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [articuloAbiertoId, setArticuloAbiertoId] = useState<number | null>(null);
  const [votados, setVotados] = useState<Record<number, boolean>>({});

  async function cargarArticulos() {
    setCargando(true);
    try {
      const url = new URL("/api/conocimiento", window.location.origin);
      if (busqueda.trim()) {
        url.searchParams.set("buscar", busqueda.trim());
      }
      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) {
        setArticulos(data);
      }
    } catch (err) {
      console.error("Error al cargar artículos:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarArticulos();
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  async function votarUtilidad(idArticulo: number, voto: "POSITIVO" | "NEGATIVO") {
    if (votados[idArticulo]) return;
    try {
      await fetch(`/api/conocimiento/${idArticulo}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voto_utilidad: voto }),
      });
      setVotados((prev) => ({ ...prev, [idArticulo]: true }));
      // Actualizar conteo local
      setArticulos((prev) =>
        prev.map((a) =>
          a.id_articulo === idArticulo
            ? {
                ...a,
                utilidad_positiva: voto === "POSITIVO" ? a.utilidad_positiva + 1 : a.utilidad_positiva,
                utilidad_negativa: voto === "NEGATIVO" ? a.utilidad_negativa + 1 : a.utilidad_negativa,
              }
            : a
        )
      );
    } catch (err) {
      console.error("Error al votar:", err);
    }
  }

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>Gestión de Conocimiento</h1>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
            Listado de todos los artículos, documentaciones de incidentes anteriores, problemas conocidos y guías de configuración básica.
          </p>
        </div>
        <Link href="/plataforma/solicitudes/crear" className="boton-primario" style={{ width: "auto", fontSize: 12.5, textDecoration: "none" }}>
          Crear Ticket
        </Link>
      </div>

      {/* Buscador de autoservicio */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          className="input-base"
          style={{ width: "100%", padding: "10px 14px", fontSize: 13 }}
          placeholder="Buscar soluciones en la base de conocimiento (ej. VPN, clave, impresora, ERP)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <div style={{ padding: 32, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Consultando repositorio de artículos publicados...
        </div>
      ) : articulos.length === 0 ? (
        <div style={{ padding: 36, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: "0 0 12px 0", color: "#64748b", fontWeight: 500 }}>
            No se encontraron artículos publicados que coincidan con la búsqueda.
          </p>
          <Link href="/plataforma/solicitudes/crear" className="boton-mini" style={{ textDecoration: "none" }}>
            Abrir un ticket para atención de la Mesa de Ayuda
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articulos.map((art) => {
            const estaAbierto = articuloAbiertoId === art.id_articulo;

            return (
              <div
                key={art.id_articulo}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                }}
              >
                <button
                  type="button"
                  onClick={() => setArticuloAbiertoId(estaAbierto ? null : art.id_articulo)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "14px 18px",
                    backgroundColor: estaAbierto ? "#f8fafc" : "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                        {art.codigo_articulo}
                      </span>
                      {art.categoria_nombre && (
                        <span
                          className="badge-itil"
                          style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe", fontSize: 11 }}
                        >
                          {art.categoria_nombre}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        {art.visitas} visitas • {art.utilidad_positiva} votos útiles
                      </span>
                    </div>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>{art.titulo}</strong>
                  </div>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      transform: estaAbierto ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.15s ease",
                      color: "#64748b",
                    }}
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {estaAbierto && (
                  <div style={{ padding: "16px 20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#fafbfc" }}>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "#334155",
                        whiteSpace: "pre-wrap",
                        marginBottom: 16,
                      }}
                    >
                      {art.contenido_markdown}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: 12,
                        fontSize: 12,
                        color: "#64748b",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        Publicado por: <strong>{art.autor_nombre || "Especialista KEDB"}</strong>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span>¿Te resultó útil este artículo?</span>
                        {votados[art.id_articulo] ? (
                          <span style={{ color: "#166534", fontWeight: 700 }}>¡Gracias por tu valoración!</span>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="boton-mini"
                              style={{ backgroundColor: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0", display: "inline-flex", alignItems: "center", gap: 5 }}
                              onClick={() => votarUtilidad(art.id_articulo, "POSITIVO")}
                              title="Sí, este artículo me fue útil"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                              </svg>
                              <span>{art.utilidad_positiva}</span>
                            </button>
                            <button
                              type="button"
                              className="boton-mini"
                              style={{ backgroundColor: "#fef2f2", color: "#991b1b", borderColor: "#fecaca", display: "inline-flex", alignItems: "center", gap: 5 }}
                              onClick={() => votarUtilidad(art.id_articulo, "NEGATIVO")}
                              title="No me sirvió este artículo"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                              </svg>
                              <span>{art.utilidad_negativa}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
