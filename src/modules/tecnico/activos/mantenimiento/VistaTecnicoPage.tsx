"use client";

import { useState } from "react";

export default function PaginaMantenimientoActivos() {
  const [pestana, setPestana] = useState<"preventivo" | "reparacion" | "historial">("preventivo");

  const preventivos = [
    {
      id: "MNT-001",
      activoCodigo: "ACT-2026-0012",
      activoNombre: "Servidor Principal Dell PowerEdge",
      tipo: "Limpieza física y cambio de pasta térmica",
      fechaLimite: "2026-10-15",
      estado: "Programado",
    },
    {
      id: "MNT-002",
      activoCodigo: "ACT-2026-0045",
      activoNombre: "UPS Trifásica Datacenter 10kVA",
      tipo: "Prueba de descarga y revisión de baterías",
      fechaLimite: "2026-10-20",
      estado: "Programado",
    },
  ];

  const reparaciones = [
    {
      id: "REP-001",
      activoCodigo: "ACT-2026-0089",
      activoNombre: "Laptop Lenovo ThinkPad T14",
      falla: "Falla de teclado y ventilador ruidoso",
      taller: "Servicio Técnico Autorizado",
      fechaEnvio: "2026-10-01",
      estado: "En diagnóstico",
    },
  ];

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Mantenimiento y reparaciones de activos
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Control de planes de mantenimiento preventivo y seguimiento de equipos en taller
          </p>
        </div>

        <button
          type="button"
          style={{
            padding: "8px 16px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Registrar mantenimiento
        </button>
      </div>

      {/* Pestañas */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setPestana("preventivo")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: pestana === "preventivo" ? 600 : 500,
            border: "none",
            backgroundColor: pestana === "preventivo" ? "#2563eb" : "transparent",
            color: pestana === "preventivo" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Preventivo pendiente ({preventivos.length})
        </button>
        <button
          type="button"
          onClick={() => setPestana("reparacion")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: pestana === "reparacion" ? 600 : 500,
            border: "none",
            backgroundColor: pestana === "reparacion" ? "#2563eb" : "transparent",
            color: pestana === "reparacion" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          En reparación ({reparaciones.length})
        </button>
        <button
          type="button"
          onClick={() => setPestana("historial")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: pestana === "historial" ? 600 : 500,
            border: "none",
            backgroundColor: pestana === "historial" ? "#2563eb" : "transparent",
            color: pestana === "historial" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Historial completado
        </button>
      </div>

      {/* Contenido de la pestaña */}
      {pestana === "preventivo" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Plan</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Activo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo Mantenimiento</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Límite</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {preventivos.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>{p.id}</td>
                  <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 500 }}>
                    {p.activoCodigo} - {p.activoNombre}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>{p.tipo}</td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>{p.fechaLimite}</td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      type="button"
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#2563eb",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Ejecutar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pestana === "reparacion" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Registro</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Activo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Falla Reportada</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Proveedor / Taller</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {reparaciones.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>{r.id}</td>
                  <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 500 }}>
                    {r.activoCodigo} - {r.activoNombre}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>{r.falla}</td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>{r.taller}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                      }}
                    >
                      {r.estado}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      type="button"
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#334155",
                        cursor: "pointer",
                      }}
                    >
                      Registrar retorno
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pestana === "historial" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b" }}>Sin mantenimientos archivados</div>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>Los mantenimientos completados aparecerán registrados aquí.</p>
        </div>
      )}
    </div>
  );
}
