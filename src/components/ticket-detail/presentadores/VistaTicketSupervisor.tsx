"use client";

import { useState } from "react";
import { PropsVistaPresentadorTicket } from "../tipos";
import CockpitTemporizadorSla from "../secciones/CockpitTemporizadorSla";
import StreamChatPublico from "../secciones/StreamChatPublico";
import StreamNotasInternas from "../secciones/StreamNotasInternas";
import PanelInfraestructuraCi from "../secciones/PanelInfraestructuraCi";
import TarjetaAprobacionSod from "../secciones/TarjetaAprobacionSod";
import BarraAccionesOperativas from "../secciones/BarraAccionesOperativas";
import ControlesDespacho from "../secciones/ControlesDespacho";
import TarjetaCalificacionCsat from "../secciones/TarjetaCalificacionCsat";

export default function VistaTicketSupervisor({
  ticket,
  comentarios,
  catalogos,
  sesion,
  onEjecutarAccion,
  onEnviarComentario,
  onElevarAProblema,
  ejecutandoAccion,
  enviandoComentario,
  elevandoProblema,
}: PropsVistaPresentadorTicket) {
  const [pestanaActiva, setPestanaActiva] = useState<"interno" | "publico">("interno");

  const conteoPublico = comentarios.filter((c) => !c.es_interno).length;
  const conteoInterno = comentarios.filter((c) => c.es_interno).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Barra de Control de Despacho y Reasignacion de Especialistas */}
      <ControlesDespacho
        ticket={ticket}
        catalogos={catalogos}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 2. Resumen Metadatos Operativos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          padding: "8px 0 12px 0",
          borderBottom: "1px solid #f1f5f9",
          fontSize: 12,
        }}
      >
        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>
            Solicitante
          </span>
          <strong style={{ color: "#0f172a", fontSize: 12.5 }}>{ticket.solicitante_nombre}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.solicitante_correo}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>
            Area TI y OLA
          </span>
          <span style={{ color: "#166534", fontWeight: 600 }}>{ticket.departamento_nombre || "Mesa Central"}</span>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            Servicio: {ticket.servicio_codigo ? `[${ticket.servicio_codigo}]` : ""} {ticket.servicio_nombre || "General"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>
            Matriz Prioridad ITIL
          </span>
          <span style={{ color: "#1e293b", fontWeight: 600 }}>
            {ticket.impacto_nombre} / {ticket.urgencia_nombre}
          </span>
          <span
            className={`badge-itil badge-prioridad-${ticket.prioridad_codigo?.toLowerCase()}`}
            style={{ display: "inline-block", marginTop: 2, fontSize: 10.5 }}
          >
            {ticket.prioridad_codigo} - {ticket.prioridad_nombre}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase" }}>
            Fecha Creacion
          </span>
          <span style={{ color: "#1e293b" }}>
            {new Date(ticket.fecha_creacion).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
          </span>
        </div>
      </div>

      {/* 3. Diseno Cabina 2 Columnas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Columna Izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Descripcion */}
          <div>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Descripcion Reportada
            </span>
            <div style={{ borderLeft: "3px solid #cbd5e1", padding: "4px 0 4px 12px", fontSize: 12.5, color: "#1e293b", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
              {ticket.descripcion}
            </div>
          </div>

          {/* Solucion Aplicada */}
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
                Solucion o Workaround Documentado:
              </strong>
              <p style={{ margin: 0, fontSize: 12.5, color: "#064e3b", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {ticket.solucion_aplicada}
              </p>
            </div>
          )}

          {/* Activity Stream Dual con Pestanas */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 14,
            }}
          >
            <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 8, marginBottom: 12 }}>
              <button
                type="button"
                onClick={() => setPestanaActiva("interno")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1px solid ${pestanaActiva === "interno" ? "#f59e0b" : "#e2e8f0"}`,
                  backgroundColor: pestanaActiva === "interno" ? "#fffbeb" : "#ffffff",
                  color: pestanaActiva === "interno" ? "#92400e" : "#64748b",
                  fontWeight: pestanaActiva === "interno" ? 700 : 500,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>Notas Tecnicas Internas</span>
                <span style={{ backgroundColor: pestanaActiva === "interno" ? "#fef3c7" : "#f1f5f9", padding: "1px 6px", borderRadius: 10, fontSize: 11 }}>
                  {conteoInterno}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPestanaActiva("publico")}
                style={{
                  padding: "6px 14px",
                  borderRadius: 6,
                  border: `1px solid ${pestanaActiva === "publico" ? "#2563eb" : "#e2e8f0"}`,
                  backgroundColor: pestanaActiva === "publico" ? "#eff6ff" : "#ffffff",
                  color: pestanaActiva === "publico" ? "#1d4ed8" : "#64748b",
                  fontWeight: pestanaActiva === "publico" ? 700 : 500,
                  fontSize: 12,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>Respuestas al Solicitante</span>
                <span style={{ backgroundColor: pestanaActiva === "publico" ? "#dbeafe" : "#f1f5f9", padding: "1px 6px", borderRadius: 10, fontSize: 11 }}>
                  {conteoPublico}
                </span>
              </button>
            </div>

            {pestanaActiva === "interno" ? (
              <StreamNotasInternas
                comentarios={comentarios}
                onEnviarComentario={onEnviarComentario}
                enviandoComentario={enviandoComentario}
              />
            ) : (
              <StreamChatPublico
                comentarios={comentarios}
                onEnviarComentario={onEnviarComentario}
                enviandoComentario={enviandoComentario}
                placeholder="Escribe una respuesta para el solicitante..."
              />
            )}
          </div>

          {/* Barra de Transiciones Operativas */}
          <BarraAccionesOperativas
            ticket={ticket}
            catalogos={catalogos}
            sesion={sesion}
            onEjecutarAccion={onEjecutarAccion}
            onElevarAProblema={onElevarAProblema}
            ejecutandoAccion={ejecutandoAccion}
            elevandoProblema={elevandoProblema}
          />
        </div>

        {/* Columna Derecha */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Cockpit SLA */}
          <CockpitTemporizadorSla ticket={ticket} />

          {/* Evaluacion CSAT si aplica */}
          <TarjetaCalificacionCsat
            ticket={ticket}
            sesion={sesion}
            onEjecutarAccion={onEjecutarAccion}
            ejecutandoAccion={ejecutandoAccion}
          />

          {/* Compuerta de Aprobacion */}
          <TarjetaAprobacionSod
            ticket={ticket}
            sesion={sesion}
            onEjecutarAccion={onEjecutarAccion}
            ejecutandoAccion={ejecutandoAccion}
          />

          {/* Infraestructura CMDB y Causa Raiz */}
          <PanelInfraestructuraCi ticket={ticket} />

          {/* Evidencias Adjuntas */}
          {ticket.adjuntos && ticket.adjuntos.length > 0 && (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "12px 14px",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Evidencias Tecnicas ({ticket.adjuntos.length})
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {ticket.adjuntos.map((adj) => (
                  <div
                    key={adj.id_adjunto}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 11.5,
                      padding: "4px 0",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }} title={adj.nombre_archivo}>
                      {adj.nombre_archivo}
                    </span>
                    <a
                      href={adj.datos_base64}
                      download={adj.nombre_archivo}
                      className="boton-mini"
                      style={{ textDecoration: "none", padding: "4px 6px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
                      title={`Descargar archivo (${adj.nombre_archivo})`}
                      aria-label={`Descargar archivo (${adj.nombre_archivo})`}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
