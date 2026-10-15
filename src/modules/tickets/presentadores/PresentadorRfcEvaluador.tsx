"use client";

import React from "react";
import { PropsVistaPresentadorTicket } from "@/modules/tickets/ticket-detail/tipos";
import PanelInfraestructuraCi from "@/modules/tickets/ticket-detail/secciones/PanelInfraestructuraCi";
import TarjetaAprobacionSod from "@/modules/tickets/ticket-detail/secciones/TarjetaAprobacionSod";

export default function PresentadorRfcEvaluador({
  ticket,
  comentarios,
  sesion,
  onEjecutarAccion,
  ejecutandoAccion,
}: PropsVistaPresentadorTicket) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Header de Habilitacion del Cambio (ITIL 4) */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
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
          <strong style={{ fontSize: 13.5, color: "#92400e", display: "block" }}>
            Evaluacion Tecnica de Solicitud de Cambio (RFC)
          </strong>
          <span style={{ fontSize: 12, color: "#b45309" }}>
            Control de ventanas de mantenimiento, validacion obligatoria de Plan de Rollback y prevencion de solapamientos (Change Freeze).
          </span>
        </div>

        <span
          style={{
            backgroundColor: "#fef3c7",
            color: "#92400e",
            border: "1px solid #fcd34d",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Gestor de Cambios
        </span>
      </div>

      {/* 2. Checklist de Requisitos Obligatorios de Cambio */}
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
        <strong style={{ fontSize: 12.5, color: "#1e293b", textTransform: "uppercase" }}>
          Checklist de Viabilidad de la RFC (Regla de Negocio RN-34)
        </strong>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, borderLeft: "3px solid #22c55e" }}>
            <span style={{ fontWeight: 700, color: "#15803d", display: "block" }}>
              Analisis de Riesgo e Impacto
            </span>
            <span style={{ color: "#64748b", fontSize: 11.5 }}>
              Evaluado conforme a matriz de criticidad de servicios.
            </span>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, borderLeft: "3px solid #3b82f6" }}>
            <span style={{ fontWeight: 700, color: "#1d4ed8", display: "block" }}>
              Plan de Retorno (Rollback) Documentado
            </span>
            <span style={{ color: "#64748b", fontSize: 11.5 }}>
              Procedimiento tecnico de reversion paso a paso registrado.
            </span>
          </div>
        </div>

        <div style={{ marginTop: 4 }}>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Objetivo Tecnico del Cambio:
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
            {ticket.descripcion || "Sin descripcion tecnica de la RFC."}
          </p>
        </div>
      </div>

      {/* 3. Aprobacion / Dictamen CAB */}
      <TarjetaAprobacionSod
        ticket={ticket}
        sesion={sesion}
        onEjecutarAccion={onEjecutarAccion}
        ejecutandoAccion={ejecutandoAccion}
      />

      {/* 4. Elementos de Configuracion (CI) que seran modificados */}
      {ticket.id_ci && <PanelInfraestructuraCi ticket={ticket} />}

      {/* 5. Bitacora Tecnica de Coordinacion */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
          Notas Tecnicas de Evaluacion ({comentarios.length})
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
          {comentarios.map((c) => (
            <div key={c.id_comentario} style={{ backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 10.5 }}>
                <strong>{c.autor_nombre || c.usuario_nombre || "Tecnico"}</strong>
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
