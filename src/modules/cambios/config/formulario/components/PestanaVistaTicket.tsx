"use client";

import React, { useState } from "react";

interface CabeceraElemento {
  id: string;
  etiqueta: string;
  visible: boolean;
  fijo: boolean;
  orden: number;
}

interface PestanaElemento {
  id: string;
  nombre: string;
  visible: boolean;
  fijo: boolean;
  orden: number;
  visible_desde: string;
  editable_en: string[];
}

interface PanelLateralElemento {
  id: string;
  etiqueta: string;
  visible: boolean;
  orden: number;
}

interface PestanaVistaTicketProps {
  config: {
    cabecera: CabeceraElemento[];
    pestanas: PestanaElemento[];
    panel_lateral: PanelLateralElemento[];
  };
  onChangeConfig: (nuevaConfig: any) => void;
}

export const PestanaVistaTicket: React.FC<PestanaVistaTicketProps> = ({
  config,
  onChangeConfig,
}) => {
  const [bloqueActivo, setBloqueActivo] = useState<"cabecera" | "pestanas" | "panel">("pestanas");

  const cabecera = config.cabecera || [];
  const pestanas = config.pestanas || [];
  const panelLateral = config.panel_lateral || [];

  const alternarVisibleCabecera = (id: string) => {
    const nuevas = cabecera.map((c) => (c.id === id && !c.fijo ? { ...c, visible: !c.visible } : c));
    onChangeConfig({ ...config, cabecera: nuevas });
  };

  const alternarVisiblePestana = (id: string) => {
    const nuevas = pestanas.map((p) => (p.id === id && !p.fijo ? { ...p, visible: !p.visible } : p));
    onChangeConfig({ ...config, pestanas: nuevas });
  };

  const alternarVisiblePanel = (id: string) => {
    const nuevas = panelLateral.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p));
    onChangeConfig({ ...config, panel_lateral: nuevas });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Cabecera */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "14px 18px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Configuración de la Vista del Ticket RFC (Sección 5)
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
            Controla qué pestañas, metadatos de cabecera y paneles laterales se muestran al visualizar una RFC según su estado en el ciclo de vida.
          </p>
        </div>

        {/* Selector de Bloques */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { id: "cabecera", label: "Bloque 1: Cabecera Fija" },
            { id: "pestanas", label: "Bloque 2: Pestañas del Ticket" },
            { id: "panel", label: "Bloque 3: Panel Lateral" },
          ].map((b) => (
            <button
              key={b.id}
              type="button"
              className="boton-mini"
              onClick={() => setBloqueActivo(b.id as any)}
              style={{
                backgroundColor: bloqueActivo === b.id ? "#eff6ff" : "#ffffff",
                color: bloqueActivo === b.id ? "#1d4ed8" : "#475569",
                borderColor: bloqueActivo === b.id ? "#93c5fd" : "#cbd5e1",
                fontWeight: 700,
              }}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bloque 1: Cabecera Fija */}
      {bloqueActivo === "cabecera" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
            Bloque 1 — Elementos Visibles en la Cabecera Fija del Ticket
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {cabecera.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  backgroundColor: c.visible ? "#ffffff" : "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: c.visible ? "#1e293b" : "#94a3b8" }}>
                    {c.etiqueta}
                  </span>
                  {c.fijo && (
                    <span style={{ fontSize: 10.5, color: "#d97706", display: "block", marginTop: 2 }}>
                      [Bloqueado] Elemento fijo obligatorio
                    </span>
                  )}
                </div>
                {!c.fijo ? (
                  <button
                    type="button"
                    onClick={() => alternarVisibleCabecera(c.id)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: c.visible ? "#16a34a" : "#94a3b8",
                    }}
                  >
                    {c.visible ? "Visible" : "Oculto"}
                  </button>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Visible</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bloque 2: Pestañas del Ticket RFC */}
      {bloqueActivo === "pestanas" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
            Bloque 2 — Matriz de Visibilidad y Edición de Pestañas según Estado
          </h4>

          <div className="contenedor-tabla">
            <table className="tabla">
              <thead>
                <tr>
                  <th style={{ width: 40, textAlign: "center" }}>#</th>
                  <th>Pestaña del Ticket</th>
                  <th>Visible desde el Estado</th>
                  <th>Editable en Estados</th>
                  <th style={{ width: 90 }}>Estado</th>
                  <th style={{ width: 100 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pestanas.map((p) => (
                  <tr key={p.id}>
                    <td style={{ textAlign: "center", fontWeight: 700, color: "#64748b" }}>{p.orden}</td>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>
                      {p.nombre}
                      {p.fijo && (
                        <span title="Pestaña no puede ocultarse" style={{ marginLeft: 6, fontSize: 11 }}>
                          [Bloqueado]
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "#2563eb", fontWeight: 600, textTransform: "capitalize" }}>
                      {p.visible_desde.replace("_", " ")}
                    </td>
                    <td style={{ fontSize: 11, color: "#475569" }}>
                      {p.editable_en.length > 0 ? p.editable_en.join(", ") : "Solo lectura"}
                    </td>
                    <td>
                      <span
                        className="badge-itil"
                        style={{
                          backgroundColor: p.visible ? "#dcfce7" : "#f1f5f9",
                          color: p.visible ? "#166534" : "#64748b",
                          border: `1px solid ${p.visible ? "#86efac" : "#cbd5e1"}`,
                          fontWeight: 700,
                          fontSize: 10.5,
                        }}
                      >
                        {p.visible ? "Visible" : "Oculta"}
                      </span>
                    </td>
                    <td>
                      {!p.fijo && (
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => alternarVisiblePestana(p.id)}
                          style={{ fontSize: 11, padding: "2px 6px" }}
                        >
                          {p.visible ? "Ocultar" : "Mostrar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bloque 3: Panel Lateral */}
      {bloqueActivo === "panel" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
            Bloque 3 — Elementos del Panel Lateral de Resumen
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {panelLateral.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  backgroundColor: p.visible ? "#ffffff" : "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 600, color: p.visible ? "#1e293b" : "#94a3b8" }}>
                  {p.etiqueta}
                </span>
                <button
                  type="button"
                  onClick={() => alternarVisiblePanel(p.id)}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: p.visible ? "#16a34a" : "#94a3b8",
                  }}
                >
                  {p.visible ? "Visible" : "Oculto"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
