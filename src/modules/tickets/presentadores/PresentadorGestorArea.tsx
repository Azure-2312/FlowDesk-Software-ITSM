"use client";

import React from "react";
import { PropsVistaPresentadorTicket } from "@/modules/tickets/ticket-detail/tipos";
import TarjetaAprobacionSod from "@/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod";
import TarjetaCalificacionCsat from "@/modules/tickets/ticket-detail/secciones/TarjetaCalificacionCsat";
import PanelInfraestructuraCi from "@/modules/tickets/ticket-detail/secciones/PanelInfraestructuraCi";
import StreamChatPublico from "@/modules/tickets/ticket-detail/secciones/StreamChatPublico";

export default function PresentadorGestorArea({
  ticket,
  comentarios,
  sesion,
  onEjecutarAccion,
  onEnviarComentario,
  ejecutandoAccion,
  enviandoComentario,
}: PropsVistaPresentadorTicket) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Encabezado de Gestion Departamental */}
      <div
        style={{
          backgroundColor: "#f0fdf4",
          border: "1px solid #bbf7d0",
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
          <strong style={{ fontSize: 13.5, color: "#166534", display: "block" }}>
            Revision y Autorizacion Departamental de Servicio
          </strong>
          <span style={{ fontSize: 12, color: "#15803d" }}>
            Departamento: <strong>{ticket.departamento_nombre || "Area Asignada"}</strong>. Evaluacion de necesidad operativa, asignacion presupuestal y aprobacion formal de recursos.
          </span>
        </div>

        <span
          style={{
            backgroundColor: "#dcfce7",
            color: "#166534",
            border: "1px solid #86efac",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Gestor de Area
        </span>
      </div>

      {/* 2. Tarjeta SoD de Aprobacion o Rechazo de la Solicitud */}
      <TarjetaAprobacionSod
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 3. Datos del Colaborador y Servicio Requerido */}
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
            Colaborador a su Cargo
          </span>
          <strong style={{ color: "#0f172a" }}>{ticket.solicitante_nombre}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.solicitante_correo}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Servicio Corporativo
          </span>
          <strong style={{ color: "#166534" }}>{ticket.servicio_nombre || "Solicitud de TI"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            Codigo: {ticket.servicio_codigo || "CAT-ITSM"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Estado Actual
          </span>
          <span
            style={{
              display: "inline-block",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: `${ticket.estado_color || "#22c55e"}20`,
              color: ticket.estado_color || "#15803d",
              border: `1px solid ${ticket.estado_color || "#86efac"}`,
            }}
          >
            {ticket.estado_nombre}
          </span>
        </div>
      </div>

      {/* 4. Activo o Equipamiento Involucrado */}
      {ticket.id_ci && <PanelInfraestructuraCi ticket={ticket} />}

      {/* 5. Comunicacion con la Mesa de Servicio y Tecnico */}
      <StreamChatPublico
        comentarios={comentarios}
        onEnviarComentario={onEnviarComentario}
        enviandoComentario={enviandoComentario}
      />

      {/* 6. Encuesta de Satisfaccion CSAT (si el caso fue culminado) */}
      <TarjetaCalificacionCsat
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />
    </div>
  );
}
