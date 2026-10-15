"use client";

import { Ticket } from "@/types";

interface Props {
  ticket: Ticket;
}

export default function CockpitTemporizadorSla({ ticket }: Props) {
  const horasRestantes =
    ticket.minutos_restantes_sla !== undefined
      ? Math.round((ticket.minutos_restantes_sla / 60) * 10) / 10
      : null;

  return (
    <div
      style={{
        backgroundColor: ticket.sla_vencido
          ? "#fef2f2"
          : ticket.pausa_sla
          ? "#fffbeb"
          : "#f0fdf4",
        border: `1px solid ${
          ticket.sla_vencido ? "#fca5a5" : ticket.pausa_sla ? "#fde68a" : "#bbf7d0"
        }`,
        borderRadius: 8,
        padding: "14px 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            color: ticket.sla_vencido ? "#991b1b" : ticket.pausa_sla ? "#92400e" : "#166534",
          }}
        >
          Compromiso de Nivel de Servicio (SLA)
        </span>
        <span
          className="badge-itil"
          style={{
            backgroundColor: ticket.sla_vencido
              ? "#fee2e2"
              : ticket.pausa_sla
              ? "#fef3c7"
              : "#dcfce7",
            color: ticket.sla_vencido ? "#991b1b" : ticket.pausa_sla ? "#92400e" : "#15803d",
            border: `1px solid ${
              ticket.sla_vencido ? "#fecaca" : ticket.pausa_sla ? "#fde68a" : "#86efac"
            }`,
            fontWeight: 700,
          }}
        >
          {ticket.pausa_sla
            ? "SLA Pausado"
            : ticket.sla_vencido
            ? "SLA Vencido"
            : ticket.es_terminal
            ? "Cumplido"
            : "A Tiempo"}
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: ticket.sla_vencido ? "#dc2626" : "#0f172a" }}>
            {ticket.pausa_sla ? (
              <span style={{ color: "#d97706" }}>En Espera</span>
            ) : ticket.es_terminal ? (
              <span style={{ color: "#16a34a" }}>Finalizado</span>
            ) : ticket.sla_vencido ? (
              <span>Vencido hace {Math.abs(horasRestantes || 0)}h</span>
            ) : (
              <span>{horasRestantes}h restantes</span>
            )}
          </div>
          <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginTop: 2 }}>
            Vence: {new Date(ticket.fecha_limite_sla).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>

        {ticket.tiempo_pausado_minutos !== undefined && ticket.tiempo_pausado_minutos > 0 && (
          <div style={{ textAlign: "right", fontSize: 11.5 }}>
            <span style={{ color: "#92400e", display: "block" }}>Pausa Acumulada:</span>
            <strong style={{ color: "#b45309" }}>{ticket.tiempo_pausado_minutos} min</strong>
          </div>
        )}
      </div>

      {ticket.pausa_sla && ticket.motivo_espera_nombre && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px dashed #fde68a",
            fontSize: 12,
            color: "#92400e",
          }}
        >
          <strong>Causa de Pausa:</strong> {ticket.motivo_espera_nombre}
        </div>
      )}
    </div>
  );
}
