"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaginaCambiosImpacto() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enterados, setEnterados] = useState<Set<number>>(new Set());

  async function cargarCambios() {
    setCargando(true);
    try {
      const res = await fetch(`/api/cambios?vista=impacto&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCambios(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error al cargar cambios de impacto:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCambios();
  }, []);

  async function marcarEnterado(idCambio: number) {
    try {
      await fetch("/api/cambios/tecnico/enterado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cambio: idCambio }),
      });
      setEnterados((prev) => new Set(prev).add(idCambio));
    } catch (e) {
      console.error("Error al marcar enterado:", e);
    }
  }

  async function marcarTodosEnterados() {
    for (const c of cambios) {
      await marcarEnterado(c.id_cambio);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Cambios que afectan mis servicios
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Notificación preventiva de intervenciones que pueden generar incidentes o consultas de usuarios ({cambios.length} cambios)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {cambios.length > 0 && (
            <button
              type="button"
              onClick={marcarTodosEnterados}
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
              Marcar todos como enterados
            </button>
          )}

          <button
            type="button"
            onClick={cargarCambios}
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

      {cargando ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando cambios que afectan tus servicios...
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
            No hay cambios con impacto sobre tus servicios
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No se registran cambios autorizados con impacto directo en tu catálogo de soporte.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cambios.map((c) => {
            const estaEnterado = enterados.has(c.id_cambio);

            return (
              <div
                key={c.id_cambio}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  padding: "18px 20px",
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

                  <div style={{ fontSize: 12.5, color: "#475569", marginTop: 4 }}>
                    Ventana: {c.ventana_inicio ? new Date(c.ventana_inicio).toLocaleString("es-ES") : "Por confirmar"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => marcarEnterado(c.id_cambio)}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: estaEnterado ? "1px solid #a7f3d0" : "1px solid #cbd5e1",
                      backgroundColor: estaEnterado ? "#ecfdf5" : "#ffffff",
                      color: estaEnterado ? "#065f46" : "#334155",
                    }}
                  >
                    {estaEnterado ? "Enterado confirmado" : "Enterado"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
