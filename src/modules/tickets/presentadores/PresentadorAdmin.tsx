"use client";

import Link from "next/link";
import { PropsVistaPresentadorTicket } from "@/modules/tickets/ticket-detail/tipos";
import PanelInfraestructuraCi from "@/modules/tickets/ticket-detail/secciones/PanelInfraestructuraCi";

export default function VistaTicketAdministrador({
  ticket,
  comentarios,
  onCerrarModal,
}: PropsVistaPresentadorTicket) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Banner de Gobernanza Administrativa */}
      <div
        style={{
          backgroundColor: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#2563eb",
              }}
            />
            <strong style={{ fontSize: 13.5, color: "#0f172a" }}>
              Modo Auditoría y Gobernanza del Sistema (Administrador)
            </strong>
          </div>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b", lineHeight: 1.5, maxWidth: 650 }}>
            Como Administrador del Sistema, usted no opera resolviendo tickets ni registrando notas técnicas directas.
            Su función es fiscalizar la trazabilidad y gobernar la configuración de vistas, formularios y acuerdos de servicio.
            Si requiere operar técnicamente sobre este ticket, cambie al perfil de <strong>Técnico</strong> o <strong>Supervisor</strong>.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link
            href="/plataforma/tickets/configuracion/vistas"
            onClick={onCerrarModal}
            className="boton-mini"
            style={{ fontSize: 11.5, textDecoration: "none", padding: "6px 10px" }}
          >
            Configurar Vistas
          </Link>
          <Link
            href="/plataforma/tickets/configuracion/formularios"
            onClick={onCerrarModal}
            className="boton-mini"
            style={{ fontSize: 11.5, textDecoration: "none", padding: "6px 10px" }}
          >
            Configurar Formularios
          </Link>
        </div>
      </div>

      {/* 2. Ficha Resumen de Auditoria */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "14px 16px",
          fontSize: 12.5,
        }}
      >
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Solicitante
          </span>
          <strong style={{ color: "#0f172a", fontSize: 13 }}>{ticket.solicitante_nombre}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.solicitante_correo}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Asignación Técnica
          </span>
          {ticket.tecnico_nombre ? (
            <div>
              <strong style={{ color: "#166534", fontSize: 13 }}>{ticket.tecnico_nombre}</strong>
              <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.tecnico_correo}</span>
              <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>Área: {ticket.departamento_nombre}</span>
            </div>
          ) : (
            <span style={{ color: "#d97706", fontWeight: 600 }}>Sin técnico asignado (Bandeja Libre)</span>
          )}
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Servicio y SLA Comprometido
          </span>
          <strong style={{ color: "#2563eb", fontSize: 13 }}>
            {ticket.servicio_codigo ? `[${ticket.servicio_codigo}] ` : ""}{ticket.servicio_nombre || "Servicio General"}
          </strong>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, color: ticket.sla_vencido ? "#dc2626" : "#16a34a", fontWeight: 700 }}>
              {ticket.sla_vencido ? "SLA Vencido" : "Dentro de SLA"}
            </span>
            {ticket.fecha_limite_sla && (
              <span style={{ fontSize: 11, color: "#64748b", display: "block" }}>
                Límite: {new Date(ticket.fecha_limite_sla).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Trazabilidad Temporal
          </span>
          <span style={{ fontSize: 11.5, color: "#475569", display: "block" }}>
            Creación: {new Date(ticket.fecha_creacion).toLocaleString()}
          </span>
          {ticket.fecha_resolucion && (
            <span style={{ fontSize: 11.5, color: "#166534", display: "block" }}>
              Resolución: {new Date(ticket.fecha_resolucion).toLocaleString()}
            </span>
          )}
          {ticket.fecha_cierre && (
            <span style={{ fontSize: 11.5, color: "#047857", display: "block" }}>
              Cierre: {new Date(ticket.fecha_cierre).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* 3. Descripcion del Caso */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 18px" }}>
        <h4 style={{ margin: "0 0 8px 0", fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>
          Descripción Reportada
        </h4>
        <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {ticket.descripcion}
        </div>
      </div>

      {/* 4. Vinculacion CMDB */}
      {ticket.id_ci && (
        <PanelInfraestructuraCi ticket={ticket} />
      )}

      {/* 5. Evaluacion CSAT (Si existe) */}
      {ticket.calificacion_csat && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#166534" }}>
              Calificación de Satisfacción CSAT otorgada por el solicitante:
            </span>
            <span style={{ fontSize: 14, fontWeight: 800, color: "#15803d" }}>
              {ticket.calificacion_csat} / 5
            </span>
          </div>
          {ticket.comentario_csat && (
            <p style={{ margin: "6px 0 0 0", fontSize: 12, color: "#166534", fontStyle: "italic" }}>
              &quot;{ticket.comentario_csat}&quot;
            </p>
          )}
        </div>
      )}

      {/* 6. Historial de Notas y Comunicaciones (Solo Lectura para Auditoria) */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0f172a", textTransform: "uppercase" }}>
            Bitácora de Notas y Respuestas (Registro de Auditoría)
          </h4>
          <span style={{ fontSize: 11.5, color: "#64748b" }}>
            {comentarios.length} registro(s) inmutable(s)
          </span>
        </div>

        {comentarios.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12.5, color: "#94a3b8", fontStyle: "italic" }}>
            No se han registrado notas internas ni comunicaciones en este ticket.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 350, overflowY: "auto" }}>
            {comentarios.map((c) => (
              <div
                key={c.id_comentario}
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: c.es_interno ? "1px solid #fef3c7" : "1px solid #e2e8f0",
                  backgroundColor: c.es_interno ? "#fffbeb" : "#f8fafc",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 12, color: "#0f172a" }}>{c.usuario_nombre || "Usuario"}</strong>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                        backgroundColor: c.es_interno ? "#fef3c7" : "#e0f2fe",
                        color: c.es_interno ? "#92400e" : "#0369a1",
                        border: c.es_interno ? "1px solid #fde68a" : "1px solid #bae6fd",
                      }}
                    >
                      {c.es_interno ? "Nota Técnica Interna" : "Comunicación con Solicitante"}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {new Date(c.fecha_creacion).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                  {c.comentario}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
