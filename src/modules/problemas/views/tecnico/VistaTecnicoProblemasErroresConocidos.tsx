"use client";

import { useEffect, useState, useMemo } from "react";

interface ErrorConocidoItem {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  causa_raiz?: string;
  workaround?: string;
  solucion_definitiva?: string;
  fecha_creacion: string;
}

export default function PaginaKEDB() {
  const [errores, setErrores] = useState<ErrorConocidoItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [copiadoId, setCopiadoId] = useState<number | null>(null);

  async function cargarKEDB() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas?kedb=true&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setErrores(Array.isArray(data) ? data : []);
      } else {
        setError("No se pudo cargar la base de errores conocidos.");
      }
    } catch {
      setError("Error de conexión al cargar KEDB.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarKEDB();
  }, []);

  function copiarWorkaround(id: number, texto?: string) {
    if (!texto) return;
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  }

  const erroresFiltrados = useMemo(() => {
    if (!busqueda.trim()) return errores;
    const q = busqueda.toLowerCase().trim();
    return errores.filter((e) => {
      const matchCod = e.codigo_problema?.toLowerCase().includes(q);
      const matchTit = e.titulo?.toLowerCase().includes(q);
      const matchSint = e.descripcion?.toLowerCase().includes(q);
      const matchWork = e.workaround?.toLowerCase().includes(q);
      return matchCod || matchTit || matchSint || matchWork;
    });
  }, [errores, busqueda]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Base de errores conocidos (KEDB)
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Repositorio ITIL de soluciones temporales (workarounds) documentadas y validadas
          </p>
        </div>

        <button
          type="button"
          onClick={cargarKEDB}
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

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Buscar por código, título, síntoma o workaround..."
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
          Consultando repositorio KEDB...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && erroresFiltrados.length === 0 && (
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
            No se encontraron errores conocidos
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No hay registros en la base de errores conocidos que coincidan con la búsqueda.
          </p>
        </div>
      )}

      {!cargando && !error && erroresFiltrados.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {erroresFiltrados.map((item) => (
            <div
              key={item.id_problema}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: 20,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        backgroundColor: "#ecfdf5",
                        color: "#065f46",
                        border: "1px solid #a7f3d0",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {item.codigo_problema}
                    </span>
                    <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {item.titulo}
                    </h2>
                  </div>
                </div>

                {item.workaround && (
                  <button
                    type="button"
                    onClick={() => copiarWorkaround(item.id_problema, item.workaround)}
                    style={{
                      padding: "6px 14px",
                      backgroundColor: copiadoId === item.id_problema ? "#16a34a" : "#2563eb",
                      border: "none",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                    }}
                  >
                    {copiadoId === item.id_problema ? "Copiado" : "Copiar workaround"}
                  </button>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Síntomas y manifestación
                </div>
                <div style={{ fontSize: 13.5, color: "#334155", marginTop: 4, lineHeight: 1.45 }}>
                  {item.descripcion}
                </div>
              </div>

              {item.causa_raiz && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                    Causa raíz identificada
                  </div>
                  <div style={{ fontSize: 13.5, color: "#334155", marginTop: 4, lineHeight: 1.45 }}>
                    {item.causa_raiz}
                  </div>
                </div>
              )}

              {item.workaround ? (
                <div style={{ backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                    Solución temporal (Workaround) paso a paso
                  </div>
                  <div style={{ fontSize: 13.5, color: "#0f172a", marginTop: 6, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    {item.workaround}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic" }}>
                  Workaround en proceso de documentación por el equipo especialista.
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
