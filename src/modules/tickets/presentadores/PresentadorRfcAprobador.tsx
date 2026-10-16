"use client";

import React, { useState } from "react";
import { Cambio, SesionUsuario } from "@/types";

/**
 * Presentador de solo lectura de una Solicitud de Cambio (RFC) orientado al
 * perfil Aprobador (miembro del CAB). Muestra los datos del cambio, la
 * evaluacion de impacto/riesgo, el plan de implementacion y rollback, la
 * ventana de mantenimiento y las acciones de dictamen (Aprobar / Rechazar).
 */
export type DecisionRfc =
  | "APROBADO"
  | "APROBADO_CON_CONDICIONES"
  | "OBSERVADO"
  | "RECHAZADO";

export interface PropsPresentadorRfcAprobador {
  cambio: Cambio;
  sesion: SesionUsuario;
  onDecidir: (decision: DecisionRfc, comentario: string) => Promise<void> | void;
  procesando: boolean;
}

function formatearFecha(valor: string | null | undefined): string {
  if (!valor) return "—";
  const d = new Date(valor);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString([], { dateStyle: "short", timeStyle: "short" });
}

export default function PresentadorRfcAprobador({
  cambio,
  sesion,
  onDecidir,
  procesando,
}: PropsPresentadorRfcAprobador) {
  const [comentario, setComentario] = useState("");

  const esEmergencia = cambio.tipo_cambio === "EMERGENCIA";
  const riesgoEtiqueta = esEmergencia
    ? "Critico (ECAB)"
    : cambio.impacto_nombre === "Alto"
    ? "Alto (Evaluacion CAB)"
    : "Medio (Evaluacion CAB)";
  const aprobaciones = cambio.aprobaciones || [];
  const yaDecidido = aprobaciones.some((a) => a.id_usuario_aprobador === sesion.id_usuario);
  const esSolicitante = cambio.id_usuario_solicitante === sesion.id_usuario;
  const puedeDecidir = !yaDecidido && !esSolicitante;

  function decidir(decision: DecisionRfc) {
    onDecidir(decision, comentario.trim());
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* 1. Encabezado de Dictamen del Aprobador */}
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
            Dictamen de Solicitud de Cambio (RFC) - Comite CAB
          </strong>
          <span style={{ fontSize: 12, color: "#6d28d9" }}>
            Revision del plan de implementacion, retorno (rollback) y ventana de mantenimiento antes de emitir la autorizacion formal.
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

      {/* 2. Datos Generales del Cambio */}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: "#2563eb" }}>
              {cambio.codigo_cambio}
            </span>
            <h3 style={{ margin: "6px 0 2px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              {cambio.titulo}
            </h3>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              Solicitado por: <strong style={{ color: "#334155" }}>{cambio.solicitante_nombre || "Especialista TI"}</strong>
            </span>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span
              className="badge-itil"
              style={{
                backgroundColor: esEmergencia ? "#fee2e2" : "#eff6ff",
                color: esEmergencia ? "#991b1b" : "#1d4ed8",
                border: `1px solid ${esEmergencia ? "#fca5a5" : "#bfdbfe"}`,
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {cambio.tipo_cambio}
            </span>
            <span
              className="badge-itil"
              style={{ backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", fontWeight: 700, fontSize: 11 }}
            >
              {cambio.estado_nombre || "Registrado"}
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, fontSize: 12 }}>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Nivel de Impacto</span>
            <strong style={{ color: "#0f172a" }}>{cambio.impacto_nombre || "Medio"}</strong>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Nivel de Urgencia</span>
            <strong style={{ color: "#0f172a" }}>{cambio.urgencia_nombre || "Media"}</strong>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Prioridad</span>
            <strong style={{ color: "#b45309" }}>{cambio.prioridad_nombre || "Media"}</strong>
          </div>
          <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6 }}>
            <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 600 }}>Riesgo Evaluado</span>
            <strong style={{ color: esEmergencia ? "#991b1b" : "#92400e" }}>{riesgoEtiqueta}</strong>
          </div>
        </div>

        <div>
          <span style={{ color: "#64748b", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Elemento de Configuracion (CI) Afectado
          </span>
          <strong style={{ fontSize: 12.5, color: "#1e293b" }}>
            {cambio.ci_codigo ? `[${cambio.ci_codigo}] ${cambio.ci_nombre || ""}` : "No asignado"}
          </strong>
        </div>
      </div>

      {/* 3. Justificacion de Negocio */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 18px" }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Motivo / Justificacion de Negocio
        </strong>
        <p style={{ margin: 0, fontSize: 12.5, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {cambio.justificacion || "Sin justificacion registrada."}
        </p>
      </div>

      {/* 4. Plan de Implementacion y Rollback */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 18px" }}>
          <strong style={{ fontSize: 12.5, color: "#047857", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Plan de Implementacion
          </strong>
          <p style={{ margin: 0, fontSize: 12, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {cambio.plan_implementacion || "No especificado."}
          </p>
        </div>

        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 18px" }}>
          <strong style={{ fontSize: 12.5, color: "#b91c1c", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
            Plan de Rollback (Retorno)
          </strong>
          <p style={{ margin: 0, fontSize: 12, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
            {cambio.plan_rollback || "No especificado."}
          </p>
        </div>
      </div>

      {/* 5. Ventana de Mantenimiento */}
      <div
        style={{
          backgroundColor: "#fffbeb",
          border: "1px solid #fde68a",
          borderRadius: 8,
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          fontSize: 12.5,
        }}
      >
        <div>
          <span style={{ color: "#92400e", display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
            Ventana de Mantenimiento Programada
          </span>
          <strong style={{ color: "#78350f" }}>
            {formatearFecha(cambio.ventana_inicio)} - {formatearFecha(cambio.ventana_fin)}
          </strong>
        </div>
        {cambio.plan_pruebas && (
          <span style={{ color: "#92400e", fontSize: 11.5, maxWidth: 480 }}>
            <strong>Plan de pruebas:</strong> {cambio.plan_pruebas}
          </span>
        )}
      </div>

      {/* 6. Panel de Dictamen */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #ddd6fe",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <strong style={{ fontSize: 12.5, color: "#5b21b6", textTransform: "uppercase" }}>
          Emision de Dictamen (Aprobacion / Rechazo)
        </strong>

        {esSolicitante ? (
          <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, padding: "10px 14px", color: "#991b1b", fontSize: 12 }}>
            Restriccion de Segregacion de Funciones (SoD): usted es el solicitante de esta RFC y no puede autoaprobarse.
          </div>
        ) : yaDecidido ? (
          <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 6, padding: "10px 14px", color: "#065f46", fontSize: 12 }}>
            Ya registro su dictamen para esta solicitud de cambio.
          </div>
        ) : (
          <>
            <textarea
              className="input-base"
              rows={3}
              placeholder="Sustento del dictamen (obligatorio, minimo 3 caracteres)..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              style={{ fontSize: 12 }}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", color: "#b45309", borderColor: "#fcd34d" }}
                onClick={() => decidir("OBSERVADO")}
                disabled={procesando || !puedeDecidir}
              >
                Solicitar informacion
              </button>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto" }}
                onClick={() => decidir("APROBADO_CON_CONDICIONES")}
                disabled={procesando || !puedeDecidir}
              >
                Aprobar con condiciones
              </button>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", backgroundColor: "#dc2626", color: "#ffffff", borderColor: "#b91c1c" }}
                onClick={() => decidir("RECHAZADO")}
                disabled={procesando || !puedeDecidir}
              >
                {procesando ? "Registrando..." : "Rechazar"}
              </button>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", backgroundColor: "#059669", borderColor: "#047857" }}
                onClick={() => decidir("APROBADO")}
                disabled={procesando || !puedeDecidir}
              >
                {procesando ? "Registrando..." : "Aprobar"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 7. Historial de Dictamenes */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14 }}>
        <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 8 }}>
          Dictamenes Registrados ({aprobaciones.length})
        </strong>
        {aprobaciones.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>
            Aun no se han registrado dictamenes para esta RFC.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {aprobaciones.map((ap) => (
              <div
                key={ap.id_cambio_aprobacion}
                style={{
                  backgroundColor: ap.decision === "APROBADO" ? "#ecfdf5" : ap.decision === "RECHAZADO" ? "#fef2f2" : "#fffbeb",
                  border: `1px solid ${ap.decision === "APROBADO" ? "#a7f3d0" : ap.decision === "RECHAZADO" ? "#fecaca" : "#fde68a"}`,
                  padding: 8,
                  borderRadius: 6,
                  fontSize: 11.5,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: 10.5 }}>
                  <strong>{ap.aprobador_nombre || "Miembro CAB"}: {ap.decision}</strong>
                  <span>{formatearFecha(ap.fecha_decision)}</span>
                </div>
                <p style={{ margin: "4px 0 0 0", color: "#334155" }}>{ap.comentario}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
