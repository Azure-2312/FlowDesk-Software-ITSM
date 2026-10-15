"use client";

import { useState } from "react";

export default function PaginaLicenciasSoftware() {
  const [busqueda, setBusqueda] = useState("");

  const licencias = [
    {
      id: "LIC-001",
      producto: "Microsoft 365 Business Premium",
      tipo: "Suscripción anual",
      adquiridas: 120,
      enUso: 114,
      disponibles: 6,
      estado: "Cumple",
      vencimiento: "2026-12-31",
    },
    {
      id: "LIC-002",
      producto: "Adobe Creative Cloud All Apps",
      tipo: "Por usuario nominal",
      adquiridas: 15,
      enUso: 15,
      disponibles: 0,
      estado: "En riesgo",
      vencimiento: "2026-11-15",
    },
    {
      id: "LIC-003",
      producto: "Autodesk AutoCAD 2026",
      tipo: "Red concurrente",
      adquiridas: 10,
      enUso: 7,
      disponibles: 3,
      estado: "Cumple",
      vencimiento: "2027-03-31",
    },
    {
      id: "LIC-004",
      producto: "VMware vSphere Enterprise Plus",
      tipo: "Por socket de CPU",
      adquiridas: 8,
      enUso: 8,
      disponibles: 0,
      estado: "Cumple",
      vencimiento: "2027-06-30",
    },
  ];

  const licenciasFiltradas = licencias.filter((l) =>
    l.producto.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Licencias de software (Consulta operativa)
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Disponibilidad de cupos, asignaciones y cumplimiento normativo (claves protegidas y costos restringidos)
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar licencia por nombre de producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "9px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13.5,
            backgroundColor: "#ffffff",
          }}
        />
      </div>

      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Producto</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Modalidad</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Adquiridas</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>En Uso</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Disponibles</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Cumplimiento</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {licenciasFiltradas.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0f172a" }}>
                  {l.producto}
                </td>
                <td style={{ padding: "12px 16px", color: "#475569" }}>
                  {l.tipo}
                </td>
                <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 600 }}>
                  {l.adquiridas}
                </td>
                <td style={{ padding: "12px 16px", color: "#2563eb", fontWeight: 600 }}>
                  {l.enUso}
                </td>
                <td style={{ padding: "12px 16px", color: l.disponibles === 0 ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
                  {l.disponibles}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11.5,
                      fontWeight: 600,
                      backgroundColor: l.estado === "Cumple" ? "#ecfdf5" : "#fef3c7",
                      color: l.estado === "Cumple" ? "#065f46" : "#92400e",
                    }}
                  >
                    {l.estado}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "#64748b" }}>
                  {l.vencimiento}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
