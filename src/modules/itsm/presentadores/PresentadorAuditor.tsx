"use client";

import React from "react";
import { PropsVistaPresentadorTicket } from "@/components/ticket-detail/tipos";
import PanelInfraestructuraCi from "@/components/ticket-detail/secciones/PanelInfraestructuraCi";
import TarjetaCalificacionCsat from "@/components/ticket-detail/secciones/TarjetaCalificacionCsat";

export default function PresentadorAuditor({
  ticket,
  comentarios,
  sesion,
  onEjecutarAccion,
  ejecutandoAccion,
}: PropsVistaPresentadorTicket) {
  const comentariosInternos = comentarios.filter((c) => c.es_interno);
  const comentariosPublicos = comentarios.filter((c) => !c.es_interno);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Banner de Inspeccion Forense Inmutable */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #94a3b8",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: "#475569",
              }}
            />
            <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
              Consola de Auditoria Forense y Cumplimiento (Solo Lectura Estricta)
            </strong>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.5, maxWidth: 680 }}>
            Inspeccion formal bajo estandares ISO/IEC 20000 e ISO/IEC 27001. En este perfil todas las acciones transaccionales de modificacion, cierre o derivacion quedan bloqueadas para garantizar la inmutabilidad de la evidencia.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              backgroundColor: "#e2e8f0",
              color: "#1e293b",
              border: "1px solid #cbd5e1",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Auditor Oficial
          </span>
          <span
            style={{
              backgroundColor: "#f1f5f9",
              color: "#475569",
              border: "1px solid #cbd5e1",
              padding: "4px 10px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 600,
            }}
          >
            Expediente #{ticket.codigo_ticket || ticket.id_ticket}
          </span>
        </div>
      </div>

      {/* 2. Matriz de Evidencia y Datos de Trazabilidad */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          padding: "12px 16px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 12,
        }}
      >
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Solicitante Identificado
          </span>
          <strong style={{ color: "#0f172a" }}>{ticket.solicitante_nombre || "Sin registrar"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.solicitante_correo || "-"}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Especialista Asignado
          </span>
          <strong style={{ color: "#0f172a" }}>{ticket.tecnico_nombre || "Sin Asignar"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.departamento_nombre || "Mesa General"}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Prioridad y SLA Asignado
          </span>
          <strong style={{ color: "#b45309" }}>{ticket.prioridad_nombre || "P3 - Media"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            Impacto: {ticket.impacto_nombre || "Medio"} / Urgencia: {ticket.urgencia_nombre || "Media"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Estado del Expediente
          </span>
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: `${ticket.estado_color || "#64748b"}20`,
              color: ticket.estado_color || "#334155",
              border: `1px solid ${ticket.estado_color || "#cbd5e1"}`,
            }}
          >
            {ticket.estado_nombre || "Abierto"}
          </span>
        </div>
      </div>

      {/* 3. Infraestructura CI Vinculada */}
      {ticket.id_ci && <PanelInfraestructuraCi ticket={ticket} />}

      {/* 4. Trazabilidad Dual de Comunicacion */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Comunicaciones Publicas */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8, marginBottom: 12 }}>
            <strong style={{ fontSize: 12.5, color: "#1e293b" }}>
              Comunicaciones Externas ({comentariosPublicos.length})
            </strong>
            <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>
              Intercambio visible entre el solicitante y la mesa tecnica.
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {comentariosPublicos.length === 0 ? (
              <span style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}>
                Sin registros publicos.
              </span>
            ) : (
              comentariosPublicos.map((c) => (
                <div key={c.id_comentario} style={{ backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, fontSize: 11.5 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 10.5 }}>
                    <strong>{c.autor_nombre || c.usuario_nombre || "Usuario"}</strong>
                    <span>{new Date(c.fecha_creacion).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#334155" }}>{c.comentario}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bitacora Interna de Soporte */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #fed7aa", borderRadius: 8, padding: 14 }}>
          <div style={{ borderBottom: "1px solid #ffedd5", paddingBottom: 8, marginBottom: 12 }}>
            <strong style={{ fontSize: 12.5, color: "#9a3412" }}>
              Bitacora y Notas Tecnicas Internas ({comentariosInternos.length})
            </strong>
            <span style={{ fontSize: 11, color: "#9a3412", display: "block" }}>
              Notas confidenciales de resolutores (ocultas para el solicitante).
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 280, overflowY: "auto" }}>
            {comentariosInternos.length === 0 ? (
              <span style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic" }}>
                Sin notas tecnicas internas registradas.
              </span>
            ) : (
              comentariosInternos.map((c) => (
                <div key={c.id_comentario} style={{ backgroundColor: "#fff7ed", padding: 8, borderRadius: 6, fontSize: 11.5, borderLeft: "3px solid #f97316" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#9a3412", fontSize: 10.5 }}>
                    <strong>{c.autor_nombre || c.usuario_nombre || "Tecnico"}</strong>
                    <span>{new Date(c.fecha_creacion).toLocaleString()}</span>
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#7c2d12" }}>{c.comentario}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 5. Calificacion de Satisfaccion CSAT (si fue resuelto) */}
      <TarjetaCalificacionCsat
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />
    </div>
  );
}
