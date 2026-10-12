"use client";

import { useState } from "react";

interface NodoCMDB {
  id: string;
  nombre: string;
  tipo: "Servicio" | "Servidor" | "Base de datos" | "Switch" | "Aplicación";
  estado: "Operativo" | "Degradado" | "Interrumpido";
  dependeDe: string[];
}

export default function PaginaMapaCMDB() {
  const [ciSeleccionado, setCiSeleccionado] = useState<string>("SRV-APP-01");

  const nodos: NodoCMDB[] = [
    {
      id: "SRV-APP-01",
      nombre: "Servidor Aplicación ERP",
      tipo: "Servidor",
      estado: "Operativo",
      dependeDe: ["BD-ERP-PROD", "SW-CORE-01"],
    },
    {
      id: "BD-ERP-PROD",
      nombre: "Base de Datos PostgreSQL ERP",
      tipo: "Base de datos",
      estado: "Operativo",
      dependeDe: ["SAN-STOR-01"],
    },
    {
      id: "SW-CORE-01",
      nombre: "Switch Core Principal Datacenter",
      tipo: "Switch",
      estado: "Operativo",
      dependeDe: [],
    },
    {
      id: "SAN-STOR-01",
      nombre: "Almacenamiento SAN Corporativo",
      tipo: "Servidor",
      estado: "Operativo",
      dependeDe: [],
    },
    {
      id: "SRV-MAIL-01",
      nombre: "Servidor Correo Exchange",
      tipo: "Servidor",
      estado: "Operativo",
      dependeDe: ["SW-CORE-01"],
    },
  ];

  const nodoActivo = nodos.find((n) => n.id === ciSeleccionado) || nodos[0];

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1300, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Mapa de topología y relaciones CMDB
        </h1>
        <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
          Visualización de dependencias entre servicios, infraestructura y elementos de configuración (CI)
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        {/* Selector de CI */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 10 }}>
            Elementos de configuración (CI)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nodos.map((n) => (
              <div
                key={n.id}
                onClick={() => setCiSeleccionado(n.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: ciSeleccionado === n.id ? "2px solid #2563eb" : "1px solid #e2e8f0",
                  backgroundColor: ciSeleccionado === n.id ? "#eff6ff" : "#ffffff",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#2563eb" }}>{n.id}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", marginTop: 2 }}>{n.nombre}</div>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{n.tipo}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Visor de dependencias e impacto */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 24 }}>
          <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 16, marginBottom: 20 }}>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 11.5,
                fontWeight: 700,
                backgroundColor: "#dbeafe",
                color: "#1e40af",
              }}
            >
              {nodoActivo.id} • {nodoActivo.tipo}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "8px 0 4px" }}>
              {nodoActivo.nombre}
            </h2>
            <div style={{ fontSize: 13, color: "#16a34a", fontWeight: 600 }}>
              Estado CMDB: {nodoActivo.estado}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: "0 0 12px" }}>
              Dependencias directas de este elemento (Componentes requeridos)
            </h3>
            {nodoActivo.dependeDe.length === 0 ? (
              <div style={{ fontSize: 13, color: "#64748b", fontStyle: "italic" }}>
                Este componente no depende de otros elementos de infraestructura registrados.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {nodoActivo.dependeDe.map((depId) => {
                  const depNodo = nodos.find((n) => n.id === depId);
                  return (
                    <div
                      key={depId}
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                          {depNodo?.nombre || depId}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>
                          Identificador: {depId} • Tipo: {depNodo?.tipo || "Infraestructura"}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 4,
                          backgroundColor: "#ecfdf5",
                          color: "#065f46",
                        }}
                      >
                        Operativo
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ backgroundColor: "#fef3c7", padding: "14px 18px", borderRadius: 6, border: "1px solid #fde68a" }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#92400e" }}>
              Análisis de impacto ante falla
            </div>
            <div style={{ fontSize: 13, color: "#78350f", marginTop: 4, lineHeight: 1.45 }}>
              Si {nodoActivo.nombre} experimenta una interrupción total, afectará de manera directa a los servicios dependientes y requerirá escalamiento a ingeniería de infraestructura.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
