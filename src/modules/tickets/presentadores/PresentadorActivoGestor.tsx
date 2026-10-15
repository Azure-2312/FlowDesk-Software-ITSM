"use client";

import React from "react";
import { PropsVistaPresentadorTicket } from "@/components/ticket-detail/tipos";
import PanelInfraestructuraCi from "@/components/ticket-detail/secciones/PanelInfraestructuraCi";

export default function PresentadorActivoGestor({
  ticket,
  comentarios,
}: PropsVistaPresentadorTicket) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Header de Gestion de Activos y Configuracion (ITAM / CMDB) */}
      <div
        style={{
          backgroundColor: "#f0f9ff",
          border: "1px solid #bae6fd",
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
          <strong style={{ fontSize: 13.5, color: "#0369a1", display: "block" }}>
            Hoja de Vida de Infraestructura y Elemento de Configuracion (CI)
          </strong>
          <span style={{ fontSize: 12, color: "#0284c7" }}>
            Gestion de inventario fisico, garantias vigentes, licencias asociadas y relaciones de topologia en la CMDB.
          </span>
        </div>

        <span
          style={{
            backgroundColor: "#e0f2fe",
            color: "#0369a1",
            border: "1px solid #7dd3fc",
            padding: "4px 12px",
            borderRadius: 6,
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Gestor de Activos
        </span>
      </div>

      {/* 2. Panel Especializado de Infraestructura CI */}
      {ticket.id_ci ? (
        <PanelInfraestructuraCi ticket={ticket} />
      ) : (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: 8,
            padding: "24px 16px",
            textAlign: "center",
            fontSize: 12.5,
            color: "#64748b",
          }}
        >
          Este expediente no cuenta con un activo o Elemento de Configuracion (CI) explicitamente vinculado.
        </div>
      )}

      {/* 3. Datos del Custodio Actual y Ubicacion */}
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
            Custodio o Asignatario
          </span>
          <strong style={{ color: "#0f172a" }}>{ticket.solicitante_nombre || "Sin Custodio"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>{ticket.departamento_nombre || "Almacen General"}</span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Servicio Afectado
          </span>
          <strong style={{ color: "#0369a1" }}>{ticket.servicio_nombre || "Servicio no especificado"}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            Codigo: {ticket.servicio_codigo || "N/A"}
          </span>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Historial de Incidencias
          </span>
          <strong style={{ color: "#b45309" }}>Ticket #{ticket.codigo_ticket || ticket.id_ticket}</strong>
          <span style={{ color: "#64748b", display: "block", fontSize: 11 }}>
            Estado: {ticket.estado_nombre || "En Revision"}
          </span>
        </div>
      </div>

      {/* 4. Notas y Bitacora de Mantenimiento */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
          Bitacora de Registro y Mantenimiento ({comentarios.length})
        </strong>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 220, overflowY: "auto" }}>
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
