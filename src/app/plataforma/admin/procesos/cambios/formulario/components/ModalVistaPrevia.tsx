"use client";

import React, { useState } from "react";

interface ModalVistaPreviaProps {
  abierto: boolean;
  secciones: any[];
  onCerrar: () => void;
}

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto,
  secciones,
  onCerrar,
}) => {
  const [tipoCambio, setTipoCambio] = useState<"NORMAL" | "ESTANDAR" | "EMERGENCIA">("NORMAL");
  const [impacto, setImpacto] = useState<string>("2");
  const [urgencia, setUrgencia] = useState<string>("2");
  const [requiereInterrupcion, setRequiereInterrupcion] = useState<boolean>(false);
  const [perfilSimulado, setPerfilSimulado] = useState<string>("Técnico TI");

  if (!abierto) return null;

  // Cálculo de prioridad basado en la matriz 3x3
  const calcularPrioridad = (imp: string, urg: string) => {
    const i = parseInt(imp, 10);
    const u = parseInt(urg, 10);
    if (i === 1 && u === 1) return { codigo: "P1", nombre: "P1 - Crítica", color: "#fee2e2", textColor: "#991b1b", border: "#fca5a5" };
    if ((i === 1 && u === 2) || (i === 2 && u === 1)) return { codigo: "P2", nombre: "P2 - Alta", color: "#ffedd5", textColor: "#9a3412", border: "#fed7aa" };
    if ((i === 2 && u === 2) || (i === 1 && u === 3) || (i === 3 && u === 1)) return { codigo: "P3", nombre: "P3 - Media", color: "#fef3c7", textColor: "#92400e", border: "#fde68a" };
    if ((i === 2 && u === 3) || (i === 3 && u === 2)) return { codigo: "P4", nombre: "P4 - Baja", color: "#f0fdf4", textColor: "#166534", border: "#bbf7d0" };
    return { codigo: "P5", nombre: "P5 - Planificada", color: "#f1f5f9", textColor: "#475569", border: "#cbd5e1" };
  };

  const prioridadObj = calcularPrioridad(impacto, urgencia);

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 20,
      }}
      onClick={onCerrar}
    >
      <div
        className="modal-contenido"
        style={{
          backgroundColor: "#f8fafc",
          borderRadius: 14,
          maxWidth: 960,
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 25px 30px -5px rgba(0, 0, 0, 0.25)",
          border: "1px solid #cbd5e1",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div style={{ padding: "16px 24px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", borderTopLeftRadius: 14, borderTopRightRadius: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontWeight: 700, fontSize: 11 }}>
              SIMULADOR INTERACTIVO
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Vista Previa en Vivo: Formulario de Solicitud de Cambio (RFC)
            </h3>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <span style={{ color: "#64748b" }}>Simular como:</span>
              <select
                className="input-base"
                value={perfilSimulado}
                onChange={(e) => setPerfilSimulado(e.target.value)}
                style={{ fontSize: 12, padding: "4px 8px" }}
              >
                <option value="Técnico TI">Técnico TI</option>
                <option value="Gestor de Cambios">Gestor de Cambios</option>
                <option value="Supervisor TI">Supervisor TI</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
            <button
              type="button"
              className="modal-cerrar-boton"
              onClick={onCerrar}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Panel Resumen de Cabecera del Formulario */}
        <div style={{ padding: "12px 24px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>Tipo de Cambio:</span>
            <div style={{ display: "flex", gap: 6 }}>
              {(["NORMAL", "ESTANDAR", "EMERGENCIA"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipoCambio(t)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: `1px solid ${tipoCambio === t ? "#2563eb" : "#cbd5e1"}`,
                    backgroundColor: tipoCambio === t ? "#eff6ff" : "#ffffff",
                    color: tipoCambio === t ? "#1d4ed8" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>Prioridad Técnica:</span>
              <span
                className="badge-itil"
                style={{
                  backgroundColor: prioridadObj.color,
                  color: prioridadObj.textColor,
                  border: `1px solid ${prioridadObj.border}`,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {prioridadObj.nombre}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>Riesgo Inicial:</span>
              <span
                className="badge-itil"
                style={{
                  backgroundColor: tipoCambio === "EMERGENCIA" ? "#fee2e2" : "#fef3c7",
                  color: tipoCambio === "EMERGENCIA" ? "#991b1b" : "#92400e",
                  border: `1px solid ${tipoCambio === "EMERGENCIA" ? "#fca5a5" : "#fde68a"}`,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {tipoCambio === "EMERGENCIA" ? "Crítico (ECAB)" : "Medio (Evaluación CAB)"}
              </span>
            </div>
          </div>
        </div>

        {/* Cuerpo del formulario simulado */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Sección A — Identificación */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 18 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#2563eb", margin: "0 0 14px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
              Sección A — Identificación del Cambio
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Título del cambio <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. Actualización de kernel y parches de seguridad en clúster de base de datos..."
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Origen formal <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select className="input-base" style={{ width: "100%", fontSize: 12 }}>
                  <option value="problema">Problema de infraestructura</option>
                  <option value="incidente">Incidente crítico recurrente</option>
                  <option value="mejora">Mejora continua</option>
                  <option value="proyecto">Proyecto estratégico</option>
                </select>
              </div>
            </div>

            {tipoCambio === "ESTANDAR" && (
              <div style={{ marginTop: 14, padding: 12, backgroundColor: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1e40af", marginBottom: 4 }}>
                  Modelo de cambio estándar aplicable <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <select className="input-base" style={{ width: "100%", fontSize: 12 }}>
                  <option value="">Seleccione modelo preaprobado...</option>
                  <option value="1">Reinicio programado de servidor de aplicaciones (Riesgo Bajo)</option>
                  <option value="2">Renovación de certificado digital SSL/TLS (Riesgo Bajo)</option>
                  <option value="3">Instalación de software ofimático estándar (Riesgo Bajo)</option>
                </select>
                <span style={{ fontSize: 11, color: "#3b82f6", display: "block", marginTop: 4 }}>
                  Al seleccionar un modelo preaprobado, los planes técnicos se prellenan y quedan en solo lectura.
                </span>
              </div>
            )}
          </div>

          {/* Sección B — Justificación y Descripción */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 18 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0891b2", margin: "0 0 14px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
              Sección B — Justificación de Negocio y Alcance
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Motivo / Justificación del negocio <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className="input-base"
                  rows={2}
                  placeholder="Por qué es indispensable este cambio para la operación..."
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Impacto técnico <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    className="input-base"
                    value={impacto}
                    onChange={(e) => setImpacto(e.target.value)}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="1">Alta (Afecta servicios críticos institucionales)</option>
                    <option value="2">Media (Degradación de componentes secundarios)</option>
                    <option value="3">Baja (Sin impacto perceptible para usuarios)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Urgencia operativa <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    className="input-base"
                    value={urgencia}
                    onChange={(e) => setUrgencia(e.target.value)}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="1">Alta (Atención inmediata en próxima ventana)</option>
                    <option value="2">Media (Programación dentro del ciclo mensual)</option>
                    <option value="3">Baja (Intervención diferible)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Sección G — Emergencia (Solo si tipo = Emergencia) */}
          {tipoCambio === "EMERGENCIA" && (
            <div style={{ backgroundColor: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 14 }}>🚨</span>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#dc2626", margin: 0 }}>
                  Sección G — Justificación de Emergencia (Convocatoria ECAB)
                </h4>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>
                    Sustento crítico de emergencia <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <textarea
                    className="input-base"
                    rows={2}
                    placeholder="Detalle por qué este cambio no puede esperar el ciclo formal del CAB ordinario..."
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" id="check-retroactivo" />
                  <label htmlFor="check-retroactivo" style={{ fontSize: 12, color: "#991b1b", fontWeight: 600 }}>
                    Registro de cambio retroactivo (Ejecutado verbalmente durante contingencia activa)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Sección F — Planes y Rollback */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 18 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#059669", margin: "0 0 14px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
              Sección F — Planes Técnicos de Implementación y Rollback
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Plan de Implementación <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Paso a paso técnico a ejecutar durante la ventana..."
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Plan de Rollback (Reversión) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <textarea
                  className="input-base"
                  rows={3}
                  placeholder="Procedimiento de retorno seguro en caso de fallo..."
                  style={{ width: "100%", fontSize: 12 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pie del modal */}
        <div style={{ padding: "14px 24px", backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }}>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Los datos ingresados en esta simulación no se almacenan en la base de datos.
          </span>
          <button type="button" className="boton-primario" onClick={onCerrar} style={{ fontSize: 12 }}>
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
