"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PaginaHistorialCambios() {
  const [cambios, setCambios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  async function cargarHistorial() {
    setCargando(true);
    try {
      const res = await fetch(`/api/cambios?vista=historial&_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCambios(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error al cargar historial de cambios:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarHistorial();
  }, []);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Historial de cambios finalizados
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Registro histórico de intervenciones cerradas para correlación con incidentes y auditoría ({cambios.length} cambios)
          </p>
        </div>

        <button
          type="button"
          onClick={cargarHistorial}
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
          Cargando historial de cambios...
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
            No hay cambios finalizados en el historial
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No se registran cambios cerrados o cancelados en el sistema.
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Resultado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Responsable</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Cierre</th>
              </tr>
            </thead>
            <tbody>
              {cambios.map((c) => (
                <tr key={c.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    {c.codigo_cambio}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {c.tipo_cambio}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 360 }}>
                    {c.titulo}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: c.id_estado === 6 ? "#ecfdf5" : "#fef2f2",
                        color: c.id_estado === 6 ? "#065f46" : "#991b1b",
                      }}
                    >
                      {c.estado_nombre}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {c.responsable_nombre || "Especialista"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {c.fecha_creacion
                      ? new Date(c.fecha_creacion).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Cerrado"}
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
