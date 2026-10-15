"use client";

import { useState } from "react";

export default function PaginaSlaObjetivos() {
  const [prioridadSeleccionada, setPrioridadSeleccionada] = useState("P2");
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16);
  });

  // Matriz institucional
  const matriz = [
    {
      codigo: "P1",
      nombre: "Crítica",
      primeraRespuesta: "1 hora",
      horasRespuesta: 1,
      resolucion: "4 horas",
      horasResolucion: 4,
      descripcion: "Interrupción crítica que afecta operaciones esenciales o a toda la organización.",
      color: "#dc2626",
      bg: "#fee2e2",
    },
    {
      codigo: "P2",
      nombre: "Alta",
      primeraRespuesta: "2 horas",
      horasRespuesta: 2,
      resolucion: "8 horas",
      horasResolucion: 8,
      descripcion: "Afectación sustancial a un proceso clave o grupo significativo de usuarios sin workaround.",
      color: "#ea580c",
      bg: "#ffedd5",
    },
    {
      codigo: "P3",
      nombre: "Media",
      primeraRespuesta: "4 horas",
      horasRespuesta: 4,
      resolucion: "24 horas",
      horasResolucion: 24,
      descripcion: "Problema localizado con impacto operativo moderado o disponibilidad de solución alternativa.",
      color: "#d97706",
      bg: "#fef3c7",
    },
    {
      codigo: "P4",
      nombre: "Baja",
      primeraRespuesta: "8 horas",
      horasRespuesta: 8,
      resolucion: "72 horas",
      horasResolucion: 72,
      descripcion: "Inconveniente menor, consulta técnica o requerimiento no urgente.",
      color: "#2563eb",
      bg: "#dbeafe",
    },
  ];

  const obj = matriz.find((m) => m.codigo === prioridadSeleccionada) || matriz[1];

  function calcularFechaEstimada(fechaIso: string, horas: number) {
    if (!fechaIso) return "-";
    const d = new Date(fechaIso);
    d.setHours(d.getHours() + horas);
    return d.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Objetivos de tiempo vigentes (Matriz de SLA)
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Parámetros institucionales acordados para primera respuesta y restauración del servicio
        </p>
      </div>

      {/* Matriz Institucional */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden", marginBottom: 28 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
          <h2 style={{ fontSize: 14.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Matriz Institucional de Tiempos por Prioridad ITIL 4
          </h2>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
              <th style={{ padding: "12px 18px", fontWeight: 600 }}>Nivel</th>
              <th style={{ padding: "12px 18px", fontWeight: 600 }}>Prioridad</th>
              <th style={{ padding: "12px 18px", fontWeight: 600 }}>Primera Respuesta</th>
              <th style={{ padding: "12px 18px", fontWeight: 600 }}>Resolución Total</th>
              <th style={{ padding: "12px 18px", fontWeight: 600 }}>Criterio Operativo</th>
            </tr>
          </thead>
          <tbody>
            {matriz.map((m) => (
              <tr key={m.codigo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "14px 18px", fontWeight: 700 }}>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      backgroundColor: m.bg,
                      color: m.color,
                      fontSize: 12,
                    }}
                  >
                    {m.codigo}
                  </span>
                </td>
                <td style={{ padding: "14px 18px", fontWeight: 600, color: "#0f172a" }}>{m.nombre}</td>
                <td style={{ padding: "14px 18px", fontWeight: 600, color: "#1e293b" }}>{m.primeraRespuesta}</td>
                <td style={{ padding: "14px 18px", fontWeight: 700, color: "#0f172a" }}>{m.resolucion}</td>
                <td style={{ padding: "14px 18px", color: "#475569", lineHeight: 1.4 }}>{m.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Calculadora de Vencimiento de SLA */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 16px" }}>
          Calculadora de vencimientos proyectados
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Prioridad del caso
            </label>
            <select
              value={prioridadSeleccionada}
              onChange={(e) => setPrioridadSeleccionada(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13.5,
              }}
            >
              <option value="P1">P1 - Crítica (1h / 4h)</option>
              <option value="P2">P2 - Alta (2h / 8h)</option>
              <option value="P3">P3 - Media (4h / 24h)</option>
              <option value="P4">P4 - Baja (8h / 72h)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
              Fecha y hora de apertura
            </label>
            <input
              type="datetime-local"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                fontSize: 13.5,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Proyección */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Fecha límite primera respuesta</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
              {calcularFechaEstimada(fechaInicio, obj.horasRespuesta)}
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
              Objetivo: {obj.primeraRespuesta} desde creación
            </div>
          </div>

          <div style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Fecha límite resolución total</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>
              {calcularFechaEstimada(fechaInicio, obj.horasResolucion)}
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>
              Objetivo: {obj.resolucion} desde creación
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
