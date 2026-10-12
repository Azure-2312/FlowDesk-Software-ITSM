"use client";

import React, { useState } from "react";

interface DiffItem {
  tipo: "agregado" | "modificado" | "eliminado";
  campo: string;
  anterior?: any;
  nuevo?: any;
}

interface ModalPublicacionProps {
  abierto: boolean;
  versionActual: number;
  diffs: DiffItem[];
  ticketsAbiertosAfectados: number;
  onConfirmar: (motivo: string) => Promise<void>;
  onCerrar: () => void;
}

export const ModalPublicacion: React.FC<ModalPublicacionProps> = ({
  abierto,
  versionActual,
  diffs,
  ticketsAbiertosAfectados,
  onConfirmar,
  onCerrar,
}) => {
  const [motivo, setMotivo] = useState("");
  const [revisoImpacto, setRevisoImpacto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorLocal, setErrorLocal] = useState("");

  if (!abierto) return null;

  const requiereCasillaImpacto = ticketsAbiertosAfectados > 0;
  const motivoValido = motivo.trim().length >= 10;
  const formularioValido = motivoValido && (!requiereCasillaImpacto || revisoImpacto);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido) {
      setErrorLocal("El motivo debe tener al menos 10 caracteres y confirmar la revisión del impacto.");
      return;
    }

    try {
      setEnviando(true);
      setErrorLocal("");
      await onConfirmar(motivo.trim());
      onCerrar();
    } catch (err: any) {
      setErrorLocal(err.message || "Error al publicar la versión");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 16,
      }}
      onClick={onCerrar}
    >
      <div
        className="modal-contenido"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          maxWidth: 620,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          border: "1px solid #e2e8f0",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Publicar Configuración de Cambios (v{versionActual + 1})
            </h2>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: "4px 0 0 0" }}>
              Los cambios se aplicarán inmediatamente para nuevas solicitudes RFC y transiciones en curso.
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

        {/* Resumen de Diferencias (Diff) */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", margin: "0 0 8px 0" }}>
            Resumen de Modificaciones Detectadas
          </h3>
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 12,
              maxHeight: 180,
              overflowY: "auto",
              fontSize: 12,
            }}
          >
            {diffs.length === 0 ? (
              <p style={{ color: "#64748b", fontStyle: "italic", margin: 0 }}>
                Se detectaron cambios estructurales en el borrador que se consolidarán en la nueva versión inmutable v{versionActual + 1}.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                {diffs.map((d, idx) => (
                  <li key={idx} style={{ color: d.tipo === "agregado" ? "#16a34a" : d.tipo === "eliminado" ? "#dc2626" : "#d97706" }}>
                    <strong style={{ textTransform: "uppercase", fontSize: 10 }}>[{d.tipo}]</strong> {d.campo}
                    {d.anterior !== undefined && d.nuevo !== undefined && (
                      <span style={{ color: "#64748b", marginLeft: 4 }}>
                        ({String(d.anterior)} → {String(d.nuevo)})
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Análisis de Impacto */}
        <div
          style={{
            backgroundColor: ticketsAbiertosAfectados > 0 ? "#fffbeb" : "#f0fdf4",
            border: `1px solid ${ticketsAbiertosAfectados > 0 ? "#fde68a" : "#bbf7d0"}`,
            borderRadius: 8,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{ticketsAbiertosAfectados > 0 ? "⚠️" : "✓"}</span>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: ticketsAbiertosAfectados > 0 ? "#92400e" : "#166534" }}>
              Análisis de Impacto en Operación
            </span>
          </div>
          <p style={{ fontSize: 12, color: ticketsAbiertosAfectados > 0 ? "#78350f" : "#14532d", margin: "4px 0 0 0" }}>
            {ticketsAbiertosAfectados > 0
              ? `Esta publicación puede afectar a ${ticketsAbiertosAfectados} RFC(s) abiertas en curso. Las nuevas reglas de validación se exigirán en su próxima edición o transición.`
              : "No hay RFCs abiertas afectadas directamente por este ajuste de configuración."}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Motivo del cambio (Obligatorio, min 10 caracteres) */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
              Motivo del cambio de configuración <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <textarea
              className="input-base"
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describa la justificación técnica u organizativa para publicar esta versión (mínimo 10 caracteres)..."
              style={{ width: "100%", fontSize: 12 }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 11, color: motivoValido ? "#16a34a" : "#94a3b8" }}>
                {motivo.trim().length} / 10 caracteres requeridos
              </span>
              <span style={{ fontSize: 11, color: "#64748b" }}>Auditoría obligatoria ITIL / ISO 20000</span>
            </div>
          </div>

          {/* Casilla de confirmación de impacto */}
          {requiereCasillaImpacto && (
            <div style={{ marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <input
                type="checkbox"
                id="check-impacto"
                checked={revisoImpacto}
                onChange={(e) => setRevisoImpacto(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <label htmlFor="check-impacto" style={{ fontSize: 12, color: "#334155", cursor: "pointer" }}>
                He revisado el análisis de impacto y confirmo que las RFCs en curso asimilarán este cambio en su siguiente transición.
              </label>
            </div>
          )}

          {errorLocal && (
            <div style={{ padding: "8px 12px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, color: "#991b1b", fontSize: 12, marginBottom: 16 }}>
              {errorLocal}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="boton-secundario" onClick={onCerrar} disabled={enviando} style={{ fontSize: 12.5 }}>
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-primario"
              disabled={!formularioValido || enviando}
              style={{ fontSize: 12.5, backgroundColor: "#2563eb", opacity: !formularioValido || enviando ? 0.5 : 1 }}
            >
              {enviando ? "Publicando versión..." : `Confirmar y Publicar v${versionActual + 1}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
