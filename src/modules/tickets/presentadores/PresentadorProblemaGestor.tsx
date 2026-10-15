"use client";

import React from "react";
import { PropsVistaPresentadorTicket } from "@/components/ticket-detail/tipos";
import PanelInfraestructuraCi from "@/components/ticket-detail/secciones/PanelInfraestructuraCi";

export default function PresentadorProblemaGestor({
  ticket,
  comentarios,
  onElevarAProblema,
  elevandoProblema,
}: PropsVistaPresentadorTicket) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Header de Investigacion de Causa Raiz y KEDB (ITIL 4) */}
      <div
        style={{
          backgroundColor: "#fdf2f8",
          border: "1px solid #fbcfe8",
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
          <strong style={{ fontSize: 13.5, color: "#9d174d", display: "block" }}>
            Investigacion de Causa Raiz (RCA) y Errores Conocidos (KEDB)
          </strong>
          <span style={{ fontSize: 12, color: "#be185d" }}>
            Analisis de patrones de incidentes recurrentes, documentacion de solucion temporal (Workaround) y erradicacion definitiva de fallas.
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              backgroundColor: "#fce7f3",
              color: "#9d174d",
              border: "1px solid #f472b6",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Gestor de Problemas
          </span>

          {onElevarAProblema && (
            <button
              type="button"
              onClick={onElevarAProblema}
              disabled={elevandoProblema}
              style={{
                backgroundColor: "#be185d",
                color: "#ffffff",
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 12,
                fontWeight: 700,
                cursor: elevandoProblema ? "not-allowed" : "pointer",
                opacity: elevandoProblema ? 0.6 : 1,
              }}
            >
              {elevandoProblema ? "Vinculando..." : "Abrir Expediente de Problema"}
            </button>
          )}
        </div>
      </div>

      {/* 2. Cuadro de Diagnostico RCA y Workaround */}
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
          Metodologia de Diagnostico (5 Porques / Ishikawa - RN-37)
        </strong>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, borderLeft: "3px solid #ec4899" }}>
            <span style={{ fontWeight: 700, color: "#be185d", display: "block" }}>
              Sintoma y Comportamiento Observado
            </span>
            <span style={{ color: "#64748b", fontSize: 11.5 }}>
              {ticket.titulo || "Falla tecnica reportada"}
            </span>
          </div>

          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, borderLeft: "3px solid #10b981" }}>
            <span style={{ fontWeight: 700, color: "#047857", display: "block" }}>
              Estado en KEDB (Error Conocido)
            </span>
            <span style={{ color: "#64748b", fontSize: 11.5 }}>
              Requiere solucion temporal documentada para ser publicado en la KEDB.
            </span>
          </div>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Descripcion Detallada del Incidente:
          </span>
          <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#334155", lineHeight: 1.5 }}>
            {ticket.descripcion || "Sin descripcion tecnica registrada."}
          </p>
        </div>
      </div>

      {/* 3. Elemento de Configuracion (CI) con Fallas Recurrentes */}
      {ticket.id_ci && <PanelInfraestructuraCi ticket={ticket} />}

      {/* 4. Bitacora de Investigacion */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
          Bitacora de Investigacion y Pruebas ({comentarios.length})
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 240, overflowY: "auto" }}>
          {comentarios.map((c) => (
            <div key={c.id_comentario} style={{ backgroundColor: "#f8fafc", padding: 8, borderRadius: 6, fontSize: 11.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 10.5 }}>
                <strong>{c.autor_nombre}</strong>
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
