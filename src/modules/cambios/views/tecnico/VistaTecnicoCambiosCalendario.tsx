"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaginaCalendarioCambios() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargarCalendario() {
    setCargando(true);
    try {
      const res = await fetch(`/api/cambios?vista=calendario&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCambios(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error al cargar calendario de cambios:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCalendario();
  }, []);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Calendario de cambios (Ventanas de mantenimiento)
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Cronograma institucional de intervenciones autorizadas para evitar colisiones y coordinar servicios
          </p>
        </div>

        <button
          type="button"
          onClick={cargarCalendario}
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

      {cargando ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando calendario de cambios...
        </div>
      ) : cambios.length === 0 ? (
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
            No hay ventanas de cambio programadas
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No se registran cambios autorizados con ventana de ejecución próxima.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cambios.map((c) => (
            <div
              key={c.id_cambio}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: "#e2e8f0",
                      color: "#334155",
                    }}
                  >
                    {c.tipo_cambio}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2563eb" }}>
                    {c.codigo_cambio}
                  </span>
                  <span style={{ fontSize: 14.5, fontWeight: 600, color: "#0f172a" }}>
                    {c.titulo}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#64748b" }}>
                  Ventana programada:{" "}
                  {c.ventana_inicio
                    ? new Date(c.ventana_inicio).toLocaleString("es-ES", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Fecha por confirmar"}{" "}
                  {c.ventana_fin && `hasta ${new Date(c.ventana_fin).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`}
                </div>
              </div>

              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                }}
              >
                {c.estado_nombre}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
