"use client";

import React, { useState } from "react";

interface VersionItem {
  id_version: number;
  numero_version: number;
  fecha_creacion: string;
  autor_nombre?: string;
  motivo?: string;
  snapshot: any;
  diff?: any;
}

interface ModalHistorialVersionesProps {
  abierto: boolean;
  versiones: VersionItem[];
  versionActual: number;
  onRestaurarComoBorrador: (version: VersionItem) => void;
  onCerrar: () => void;
}

export const ModalHistorialVersiones: React.FC<ModalHistorialVersionesProps> = ({
  abierto,
  versiones,
  versionActual,
  onRestaurarComoBorrador,
  onCerrar,
}) => {
  const [versionSeleccionada, setVersionSeleccionada] = useState<VersionItem | null>(null);

  if (!abierto) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 200,
      }}
      onClick={onCerrar}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          width: "100%",
          maxWidth: 620,
          height: "100%",
          boxShadow: "-4px 0 20px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          borderLeft: "1px solid #cbd5e1",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Panel Lateral */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Historial Inmutable de Versiones
            </h3>
            <p style={{ fontSize: 11.5, color: "#64748b", margin: "2px 0 0 0" }}>
              Trazabilidad y auditoría de publicaciones de configuración (ITIL 4 / ISO 20000)
            </p>
          </div>
          <button
            type="button"
            className="modal-cerrar-boton"
            onClick={onCerrar}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {versionSeleccionada ? (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #e2e8f0" }}>
                <button
                  type="button"
                  onClick={() => setVersionSeleccionada(null)}
                  style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}
                >
                  ← Volver al listado
                </button>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => {
                    onRestaurarComoBorrador(versionSeleccionada);
                    setVersionSeleccionada(null);
                    onCerrar();
                  }}
                  style={{ fontSize: 11.5, padding: "5px 10px" }}
                >
                  Restaurar esta versión en borrador
                </button>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#166534", fontWeight: 700 }}>
                    Versión v{versionSeleccionada.numero_version}
                  </span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {new Date(versionSeleccionada.fecha_creacion).toLocaleString()}
                  </span>
                </div>
                <p style={{ fontSize: 12.5, color: "#334155", margin: "8px 0" }}>
                  <strong>Motivo:</strong> {versionSeleccionada.motivo || "Sin motivo registrado"}
                </p>
                <p style={{ fontSize: 11.5, color: "#64748b", margin: 0 }}>
                  <strong>Autor:</strong> {versionSeleccionada.autor_nombre || "Sistema"}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                  Snapshot JSON de la versión:
                </h4>
                <pre
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#f8fafc",
                    padding: 12,
                    borderRadius: 6,
                    fontSize: 11,
                    maxHeight: 400,
                    overflowY: "auto",
                    fontFamily: "monospace",
                  }}
                >
                  {JSON.stringify(versionSeleccionada.snapshot, null, 2)}
                </pre>
              </div>
            </div>
          ) : versiones.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
              <p>No hay versiones registradas aún para esta pestaña.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {versiones.map((v) => {
                const esActual = v.numero_version === versionActual;
                return (
                  <div
                    key={v.id_version}
                    style={{
                      border: `1px solid ${esActual ? "#93c5fd" : "#e2e8f0"}`,
                      backgroundColor: esActual ? "#eff6ff" : "#ffffff",
                      borderRadius: 8,
                      padding: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                          v{v.numero_version}
                        </span>
                        {esActual && (
                          <span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontSize: 10, fontWeight: 700 }}>
                            PUBLICADA ACTUAL
                          </span>
                        )}
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          {new Date(v.fecha_creacion).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "#475569", margin: "6px 0 2px 0" }}>
                        {v.motivo || "Publicación de configuración"}
                      </p>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        Por: {v.autor_nombre || "Sistema"}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => setVersionSeleccionada(v)}
                        style={{ fontSize: 11, padding: "4px 8px" }}
                      >
                        Inspeccionar
                      </button>
                      {!esActual && (
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => {
                            onRestaurarComoBorrador(v);
                            onCerrar();
                          }}
                          style={{ fontSize: 11, padding: "4px 8px", backgroundColor: "#f1f5f9" }}
                        >
                          Cargar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
