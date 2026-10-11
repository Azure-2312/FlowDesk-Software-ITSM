"use client";

import { useState } from "react";
import { PropsVistaPresentadorTicket } from "../tipos";
import StepperProgresoConsumidor from "../secciones/StepperProgresoConsumidor";
import StreamChatPublico from "../secciones/StreamChatPublico";
import TarjetaAprobacionSod from "../secciones/TarjetaAprobacionSod";
import TarjetaCalificacionCsat from "../secciones/TarjetaCalificacionCsat";

export default function VistaTicketConsumidor({
  ticket,
  comentarios,
  sesion,
  onEjecutarAccion,
  onEnviarComentario,
  ejecutandoAccion,
  enviandoComentario,
  onCerrarModal,
}: PropsVistaPresentadorTicket) {
  const [modoReapertura, setModoReapertura] = useState(false);
  const [motivoReapertura, setMotivoReapertura] = useState("");

  const horasDesdeResolucion = ticket.fecha_resolucion
    ? (Date.now() - new Date(ticket.fecha_resolucion).getTime()) / (1000 * 60 * 60)
    : 0;

  const esResuelto = ticket.id_estado === 5;
  const esCerrado = ticket.id_estado === 6;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Stepper Visual de 4 Etapas */}
      <StepperProgresoConsumidor ticket={ticket} />

      {/* 2. Resumen de Requerimiento */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
          padding: "10px 0 14px 0",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 12.5,
        }}
      >
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Servicio Solicitado
          </span>
          <strong style={{ color: "#1e293b", fontSize: 13 }}>
            {ticket.servicio_nombre || ticket.categoria_nombre}
          </strong>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Especialista Asignado
          </span>
          <span style={{ color: ticket.tecnico_nombre ? "#0f172a" : "#64748b", fontWeight: ticket.tecnico_nombre ? 600 : 400 }}>
            {ticket.tecnico_nombre || "Mesa de Ayuda (Asignando especialista)"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Fecha de Registro
          </span>
          <span style={{ color: "#1e293b" }}>
            {new Date(ticket.fecha_creacion).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Tiempo Estimado de Entrega
          </span>
          <span style={{ color: ticket.sla_vencido ? "#dc2626" : "#059669", fontWeight: 600 }}>
            {esCerrado
              ? "Servicio Concluido"
              : esResuelto
              ? "Resuelto"
              : new Date(ticket.fecha_limite_sla).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* 3. Compuerta de Aprobacion si aplica */}
      <TarjetaAprobacionSod
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 4. Solucion Aplicada si esta Resuelto */}
      {ticket.solucion_aplicada && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <strong style={{ color: "#065f46", fontSize: 13, display: "block", marginBottom: 4 }}>
            Solucion Aplicada por el Equipo de Soporte:
          </strong>
          <p style={{ color: "#064e3b", margin: 0, fontSize: 13, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
            {ticket.solucion_aplicada}
          </p>
        </div>
      )}

      {/* 5. Acciones de Cierre / Conformidad para el Solicitante si esta Resuelto */}
      {esResuelto && (
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "14px 16px",
          }}
        >
          <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginBottom: 6 }}>
            Confirmacion de Servicio:
          </strong>
          <p style={{ margin: "0 0 12px 0", fontSize: 12.5, color: "#475569" }}>
            El especialista indico que el requerimiento esta atendido. Si todo funciona correctamente, confirma tu conformidad para cerrar el ticket. Si la falla persiste, puedes solicitar una reapertura durante las primeras 48 horas.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="boton-primario"
              style={{ width: "auto", backgroundColor: "#047857", borderColor: "#065f46", display: "inline-flex", alignItems: "center", gap: 6 }}
              onClick={() => onEjecutarAccion({ id_estado: 6 })}
              disabled={ejecutandoAccion}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Confirmar Conformidad y Cerrar Ticket
            </button>

            {horasDesdeResolucion <= 48 ? (
              <button
                type="button"
                className="boton-mini"
                style={{ backgroundColor: "#ffffff", color: "#dc2626", borderColor: "#fca5a5", fontWeight: 600 }}
                onClick={() => setModoReapertura(!modoReapertura)}
                disabled={ejecutandoAccion}
              >
                {modoReapertura ? "Cancelar reapertura" : "La falla persiste (Reabrir)"}
              </button>
            ) : (
              <span style={{ fontSize: 11.5, color: "#94a3b8", fontStyle: "italic", alignSelf: "center" }}>
                Ventana de reapertura (48h) concluida
              </span>
            )}
          </div>

          {modoReapertura && (
            <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#991b1b", display: "block", marginBottom: 4 }}>
                Describe detalladamente que problema continua ocurriendo:
              </label>
              <textarea
                rows={2}
                className="input-base"
                style={{ width: "100%", fontSize: 12.5, marginBottom: 8 }}
                placeholder="Explica la falla que persiste..."
                value={motivoReapertura}
                onChange={(e) => setMotivoReapertura(e.target.value)}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="boton-primario"
                  style={{ width: "auto", backgroundColor: "#dc2626", borderColor: "#b91c1c" }}
                  onClick={async () => {
                    if (!motivoReapertura.trim() || motivoReapertura.trim().length < 8) {
                      alert("Por favor detalla el motivo de persistencia de la falla (minimo 8 caracteres).");
                      return;
                    }
                    await onEjecutarAccion({ es_reapertura: true, motivo_reapertura: motivoReapertura.trim() });
                    setModoReapertura(false);
                  }}
                  disabled={ejecutandoAccion}
                >
                  Enviar Solicitud de Reapertura
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Encuesta CSAT */}
      <TarjetaCalificacionCsat
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 7. Descripcion Detallada y Evidencias */}
      <div>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Detalle de tu Requerimiento
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

      {/* Evidencias Adjuntas */}
      {ticket.adjuntos && ticket.adjuntos.length > 0 && (
        <div>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Archivos Adjuntos ({ticket.adjuntos.length})
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {ticket.adjuntos.map((adj) => (
              <div
                key={adj.id_adjunto}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                }}
              >
                <span style={{ fontWeight: 600, color: "#1e293b" }}>{adj.nombre_archivo}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  ({(adj.tamano_bytes / 1024).toFixed(1)} KB)
                </span>
                <a
                  href={adj.datos_base64}
                  download={adj.nombre_archivo}
                  className="boton-mini"
                  style={{ textDecoration: "none", fontSize: 11, padding: "3px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Descargar
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Canal de Comunicacion Publico con TI */}
      <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 10px 0", color: "#0f172a" }}>
          Mensajes con el Equipo de Soporte
        </h3>
        <StreamChatPublico
          comentarios={comentarios}
          onEnviarComentario={onEnviarComentario}
          enviandoComentario={enviandoComentario}
          esConsumidor={true}
          placeholder="Escribe un mensaje o consulta para el especialista de TI que atiende tu solicitud..."
        />
      </div>
    </div>
  );
}
