"use client";

import React, { useState } from "react";
import { PropsVistaPresentadorTicket } from "@/components/ticket-detail/tipos";
import PanelInfraestructuraCi from "@/components/ticket-detail/secciones/PanelInfraestructuraCi";
import TarjetaAprobacionSod from "@/components/ticket-detail/secciones/TarjetaAprobacionSod";

export default function PresentadorAprobador({
  ticket,
  comentarios,
  sesion,
  onEjecutarAccion,
  ejecutandoAccion,
}: PropsVistaPresentadorTicket) {
  const [motivoDecision, setMotivoDecision] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Header Ejecutivo de Decision CAB / Comite */}
      <div
        style={{
          backgroundColor: "#f5f3ff",
          border: "1px solid #ddd6fe",
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
          <strong style={{ fontSize: 13.5, color: "#5b21b6", display: "block" }}>
            Expediente de Decision Ejecutiva y Dictamen Colegiado (CAB)
          </strong>
          <span style={{ fontSize: 12, color: "#6d28d9" }}>
            Autorizacion de cambios de arquitectura, excepciones tecnicas y solicitudes con impacto de riesgo institucional.
          </span>
        </div>

        <span
          style={{
            backgroundColor: "#ede9fe",
            color: "#5b21b6",
            border: "1px solid #c4b5fd",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Miembro Aprobador
        </span>
      </div>

      {/* 2. Tarjeta SoD de Aprobacion Existente */}
      <TarjetaAprobacionSod
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 3. Matriz de Riesgo y Justificacion */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <strong style={{ fontSize: 12.5, color: "#1e293b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Evaluacion de Impacto y Urgencia
        </strong>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Nivel de Impacto</span>
            <strong style={{ color: "#0f172a" }}>{ticket.impacto_nombre || "Medio"}</strong>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Nivel de Urgencia</span>
            <strong style={{ color: "#0f172a" }}>{ticket.urgencia_nombre || "Media"}</strong>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Prioridad Calculada</span>
            <strong style={{ color: "#b45309" }}>{ticket.prioridad_nombre || "P3 - Media"}</strong>
          </div>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
            Descripcion y Sustento del Requerimiento:
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
            {ticket.descripcion || "Sin descripcion detallada."}
          </p>
        </div>
      </div>

      {/* 4. Elemento de Configuracion (CI) Asociado */}
      {ticket.id_ci && <PanelInfraestructuraCi ticket={ticket} />}

      {/* 5. Historial Breve de Comentarios y Dictamenes */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
          Bitacora de Evaluacion ({comentarios.length} intervenciones)
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
          {comentarios.map((c) => (
            <div key={c.id_comentario} style={{ backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 10.5 }}>
                <strong>{c.autor_nombre || c.usuario_nombre || "Usuario"}</strong>
                <span>{new Date(c.fecha_creacion).toLocaleString()}</span>
              </div>
              <p style={{ margin: "4px 0 0 0", color: "#334155" }}>{c.comentario}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
