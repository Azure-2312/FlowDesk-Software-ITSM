"use client";

import { useState } from "react";
import { Ticket, SesionUsuario } from "@/types";

interface Props {
  ticket: Ticket;
  sesion: SesionUsuario;
  onEjecutarAccion: (payload: { decision_aprobacion: "APROBADO" | "RECHAZADO"; comentario_aprobacion: string }) => Promise<void>;
  ejecutandoAccion: boolean;
}

export default function TarjetaAprobacionSod({
  ticket,
  sesion,
  onEjecutarAccion,
  ejecutandoAccion,
}: Props) {
  const [comentarioAprobacion, setComentarioAprobacion] = useState("");

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const esSolicitantePropietario = ticket.id_usuario_solicitante === sesion.id_usuario;
  const puedeAprobar = [1, 4, 5].includes(idPerfil || 0);

  const tieneAprobacionPendiente = ticket.estado_aprobacion === "PENDIENTE_APROBACION";
  const tieneHistorial = ticket.aprobaciones && ticket.aprobaciones.length > 0;

  if (!tieneAprobacionPendiente && !tieneHistorial) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {tieneAprobacionPendiente && (
        <div
          style={{
            backgroundColor: "#fffbeb",
            border: "2px solid #fde68a",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "#92400e", fontSize: 13, display: "block" }}>
              Compuerta de Aprobacion Jerarquica Requerida (ISO 27001 / SoD)
            </strong>
            <span style={{ color: "#78350f", fontSize: 11.5 }}>
              Este requerimiento exige visto bueno formal de Jefatura antes de su ejecucion tecnica.
            </span>
          </div>

          {esSolicitantePropietario ? (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 6,
                padding: "10px 14px",
                color: "#991b1b",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              <strong style={{ display: "block", marginBottom: 2 }}>
                Restriccion de Segregacion de Funciones (SoD / ISO 27001):
              </strong>
              Usted es el solicitante registrado de este ticket. Conforme al principio de control de cuatro ojos y gobernanza de TI, no esta permitido autoaprobar ni autorechazar sus propias solicitudes. Esta accion debe ser ejecutada por otra jefatura o supervisor autorizado.
            </div>
          ) : puedeAprobar ? (
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                className="input-base"
                style={{ width: "100%", fontSize: 12, marginBottom: 8 }}
                placeholder="Nota de decision (opcional para aprobacion, obligatoria si rechaza)..."
                value={comentarioAprobacion}
                onChange={(e) => setComentarioAprobacion(e.target.value)}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="boton-mini"
                  style={{ backgroundColor: "#dc2626", color: "#ffffff", borderColor: "#b91c1c", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}
                  onClick={() =>
                    onEjecutarAccion({
                      decision_aprobacion: "RECHAZADO",
                      comentario_aprobacion: comentarioAprobacion.trim() || "Rechazado por jefatura",
                    })
                  }
                  disabled={ejecutandoAccion}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Rechazar Solicitud
                </button>
                <button
                  type="button"
                  className="boton-primario"
                  style={{ width: "auto", backgroundColor: "#059669", borderColor: "#047857", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}
                  onClick={() =>
                    onEjecutarAccion({
                      decision_aprobacion: "APROBADO",
                      comentario_aprobacion: comentarioAprobacion.trim() || "Aprobado por jefatura",
                    })
                  }
                  disabled={ejecutandoAccion}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Aprobar Solicitud
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: "#92400e", marginTop: 4, fontStyle: "italic" }}>
              Esperando decision de la Jefatura de Area o Supervisor responsable.
            </div>
          )}
        </div>
      )}

      {/* Historial de Aprobaciones Registradas */}
      {tieneHistorial && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <strong style={{ fontSize: 12, color: "#334155", display: "block", marginBottom: 6 }}>
            Auditoria de Compuertas de Aprobacion:
          </strong>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ticket.aprobaciones!.map((ap) => (
              <div
                key={ap.id_ticket_aprobacion}
                style={{
                  fontSize: 11.5,
                  color: "#1e293b",
                  padding: "6px 8px",
                  borderRadius: 4,
                  backgroundColor: ap.estado_decision === "APROBADO" ? "#ecfdf5" : "#fef2f2",
                  border: `1px solid ${ap.estado_decision === "APROBADO" ? "#a7f3d0" : "#fecaca"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  <strong>{ap.aprobador_nombre}</strong>: {ap.estado_decision} - &quot;{ap.comentario}&quot;
                </span>
                <span style={{ fontSize: 10.5, color: "#64748b" }}>
                  {new Date(ap.fecha_decision).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
