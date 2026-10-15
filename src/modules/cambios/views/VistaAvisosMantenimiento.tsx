"use client";

import { useEffect, useState } from "react";

interface Aviso {
  id_cambio: number;
  codigo_cambio: string;
  titulo: string;
  descripcion: string;
  tipo_cambio: string;
  estado_nombre: string;
  ventana_inicio: string;
  ventana_fin: string;
  impacto_nombre: string | null;
  codigo_ci: string | null;
  ci_nombre: string | null;
}

function formatearFechaHora(valor: string | null) {
  if (!valor) return "—";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "—";
  return fecha.toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function esVigente(a: Aviso) {
  const ahora = Date.now();
  const inicio = new Date(a.ventana_inicio).getTime();
  const fin = new Date(a.ventana_fin).getTime();
  return ahora >= inicio && ahora <= fin;
}

export default function VistaAvisosMantenimiento() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/avisos/mantenimientos?_t=${Date.now()}`);
      const data = await res.json();
      if (res.ok) {
        setAvisos(Array.isArray(data) ? data : []);
      } else {
        setError(data.error ?? "No se pudieron cargar los avisos.");
      }
    } catch {
      setError("Error de conexión al cargar los avisos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="vista-contenedor" style={{ maxWidth: 900 }}>
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Avisos de mantenimiento</h1>
        <p>Ventanas de cambio aprobadas o en ejecución que pueden afectar a los servicios.</p>
      </div>

      {cargando ? (
        <p>Cargando avisos...</p>
      ) : error ? (
        <p role="alert" className="mensaje-error">{error}</p>
      ) : avisos.length === 0 ? (
        <div className="tarjeta-formulario" style={{ textAlign: "center", color: "#6b7280", fontSize: 13 }}>
          No hay mantenimientos programados por el momento.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {avisos.map((a) => {
            const vigente = esVigente(a);
            return (
              <div
                key={a.id_cambio}
                className="tarjeta-formulario"
                style={{
                  borderLeft: vigente ? "4px solid #f59e0b" : "4px solid #2563eb",
                  margin: 0,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>{a.codigo_cambio} · {a.titulo}</strong>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {a.tipo_cambio} · Impacto {a.impacto_nombre ?? "—"}
                      {a.codigo_ci ? ` · CI ${a.codigo_ci}` : ""}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "4px 10px",
                      borderRadius: 999,
                      backgroundColor: vigente ? "#fef3c7" : "#dbeafe",
                      color: vigente ? "#92400e" : "#1e40af",
                    }}
                  >
                    {vigente ? "EN CURSO" : a.estado_nombre}
                  </span>
                </div>

                <p style={{ fontSize: 13, color: "#374151", marginTop: 10, marginBottom: 8 }}>{a.descripcion}</p>

                <div style={{ fontSize: 12.5, color: "#374151" }}>
                  <strong>Ventana:</strong> {formatearFechaHora(a.ventana_inicio)} → {formatearFechaHora(a.ventana_fin)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
