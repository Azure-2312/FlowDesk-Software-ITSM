"use client";

import { Ticket } from "@/types";

interface Props {
  ticket: Ticket;
}

export default function PanelInfraestructuraCi({ ticket }: Props) {
  const tieneCi = Boolean(ticket.ci_codigo);
  const tieneProblema = Boolean(ticket.problema_codigo);
  const tieneCampos = ticket.campos_adicionales && Object.keys(ticket.campos_adicionales).length > 0;
  const tieneReapertura = ticket.conteo_reaperturas && ticket.conteo_reaperturas > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Informacion de CMDB y Problemas ITIL */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "12px 14px",
          fontSize: 12,
        }}
      >
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>
            Elemento CMDB (CI)
          </span>
          <span style={{ color: tieneCi ? "#6b21a8" : "#94a3b8", fontWeight: tieneCi ? 600 : 400 }}>
            {tieneCi ? `[${ticket.ci_codigo}] ${ticket.ci_nombre}` : "No vinculado a CI especifico"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>
            Problema ITIL Relacionado
          </span>
          <span style={{ color: tieneProblema ? "#b45309" : "#94a3b8", fontWeight: tieneProblema ? 600 : 400 }}>
            {tieneProblema ? `[${ticket.problema_codigo}] ${ticket.problema_titulo || ""}` : "Incidente aislado (Sin problema)"}
          </span>
        </div>

        {ticket.categoria_resolucion && (
          <div>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>
              Causa Raiz / Tipificacion
            </span>
            <span style={{ color: "#059669", fontWeight: 600 }}>
              {ticket.categoria_resolucion}
            </span>
          </div>
        )}

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 2 }}>
            Canal de Origen
          </span>
          <span style={{ color: "#1e293b", fontWeight: 500 }}>
            {ticket.canal_comunicacion || "PORTAL_WEB"}
          </span>
        </div>
      </div>

      {/* Alerta de Reaperturas */}
      {tieneReapertura && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 6,
            padding: "10px 14px",
            fontSize: 12,
            color: "#991b1b",
          }}
        >
          <strong>Alerta de Calidad:</strong> Ticket reabierto {ticket.conteo_reaperturas} {ticket.conteo_reaperturas === 1 ? "vez" : "veces"}.
          {ticket.motivo_reapertura && (
            <div style={{ marginTop: 4, fontStyle: "italic", color: "#7f1d1d" }}>
              Ultimo motivo: &quot;{ticket.motivo_reapertura}&quot;
            </div>
          )}
        </div>
      )}

      {/* Campos Dinamicos JSONB */}
      {tieneCampos && (
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Especificaciones Tecnicas Parametrizadas
          </span>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "10px 14px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              fontSize: 12,
            }}
          >
            {Object.entries(ticket.campos_adicionales!).map(([clave, valor]) => (
              <div key={clave}>
                <span style={{ display: "block", fontSize: 10.5, color: "#64748b", textTransform: "capitalize", fontWeight: 600 }}>
                  {clave.replace(/_/g, " ")}:
                </span>
                <span style={{ color: "#1e293b", fontWeight: 500 }}>
                  {typeof valor === "boolean" ? (valor ? "Si" : "No") : String(valor || "No especificado")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
