"use client";

import { PropsVistaPresentadorTicket } from "@/modules/tickets/ticket-detail/tipos";
import TarjetaAprobacionSod from "@/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod";
import TarjetaCalificacionCsat from "@/modules/tickets/ticket-detail/secciones/TarjetaCalificacionCsat";
import PanelInfraestructuraCi from "@/modules/tickets/ticket-detail/secciones/PanelInfraestructuraCi";
import StreamChatPublico from "@/modules/tickets/ticket-detail/secciones/StreamChatPublico";

export default function VistaTicketGobernanza({
  ticket,
  comentarios,
  sesion,
  onEjecutarAccion,
  onEnviarComentario,
  ejecutandoAccion,
  enviandoComentario,
}: PropsVistaPresentadorTicket) {
  const idPerfil = sesion.perfilActivo?.id_perfil;
  const esAuditor = idPerfil === 6;
  const esGestorArea = idPerfil === 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Alerta de Expediente de Gobernanza */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <strong style={{ fontSize: 13, color: "#1e293b", display: "block" }}>
            {esAuditor
              ? "Expediente de Inspeccion Forense y Seguridad (ISO 27001)"
              : "Revision y Aprobacion Departamental de Servicio"}
          </strong>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>
            {esAuditor
              ? "Modo de solo lectura para consulta de cumplimiento y trazabilidad autorizada."
              : "Verificacion de necesidad de negocio, impacto operativo y autorizacion presupuestal/acceso."}
          </span>
        </div>

        <span
          className="badge-itil"
          style={{
            backgroundColor: "#f1f5f9",
            color: "#334155",
            border: "1px solid #cbd5e1",
            fontWeight: 700,
          }}
        >
          {sesion.perfilActivo?.nombre}
        </span>
      </div>

      {/* 2. Resumen de Impacto de Negocio */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          padding: "8px 0 12px 0",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 12.5,
        }}
      >
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Colaborador Solicitante
          </span>
          <strong style={{ color: "#0f172a" }}>{ticket.solicitante_nombre}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.solicitante_correo}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Area y Servicio
          </span>
          <strong style={{ color: "#166534" }}>{ticket.departamento_nombre || "General"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            {ticket.servicio_codigo ? `[${ticket.servicio_codigo}] ` : ""}{ticket.servicio_nombre || "Solicitud de Mesa"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Estado y Aprobacion
          </span>
          <span
            className="badge-itil"
            style={{
              backgroundColor: `${ticket.estado_color}20`,
              color: ticket.estado_color,
              border: `1px solid ${ticket.estado_color}`,
              display: "inline-block",
              marginTop: 2,
            }}
          >
            {ticket.estado_nombre}
          </span>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, marginTop: 2 }}>
            Aprobacion: {ticket.estado_aprobacion}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Metas de Cumplimiento SLA
          </span>
          <span style={{ color: ticket.sla_vencido ? "#dc2626" : "#059669", fontWeight: 600 }}>
            {ticket.sla_vencido ? "SLA Vencido" : ticket.pausa_sla ? "SLA Pausado" : "A tiempo"}
          </span>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            Limite: {new Date(ticket.fecha_limite_sla).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* 3. Compuerta de Aprobacion Jerarquica (Destacada para Gestor de Area) */}
      <TarjetaAprobacionSod
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 4. Analisis CSAT (Especial interes para Analista de Calidad) */}
      <TarjetaCalificacionCsat
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 5. Descripcion y Requerimiento de Negocio */}
      <div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Justificacion y Descripcion del Requerimiento
        </span>
        <div
          style={{
            borderLeft: "3px solid #cbd5e1",
            padding: "4px 0 4px 12px",
            fontSize: 13,
            color: "#1e293b",
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {ticket.descripcion}
        </div>
      </div>

      {/* 6. Solucion si esta disponible */}
      {ticket.solucion_aplicada && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            padding: "12px 14px",
          }}
        >
          <strong style={{ color: "#065f46", fontSize: 12.5, display: "block", marginBottom: 2 }}>
            Solucion Aplicada por TI:
          </strong>
          <p style={{ margin: 0, fontSize: 12.5, color: "#064e3b", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
            {ticket.solucion_aplicada}
          </p>
        </div>
      )}

      {/* 7. Infraestructura, CMDB y Especificaciones */}
      <PanelInfraestructuraCi ticket={ticket} />

      {/* 8. Canal de Conversacion y Trazabilidad */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
          Trazabilidad de Comunicaciones del Ticket
        </h3>
        <StreamChatPublico
          comentarios={comentarios}
          onEnviarComentario={onEnviarComentario}
          enviandoComentario={enviandoComentario}
          placeholder="Escribe una observacion para la bitacora de atencion..."
          soloLectura={esAuditor}
        />
      </div>
    </div>
  );
}
