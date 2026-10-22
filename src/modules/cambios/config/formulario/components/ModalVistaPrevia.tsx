"use client";

import React, { useState } from "react";

export interface ModalVistaPreviaProps {
  abierto: boolean;
  secciones?: any[];
  onCerrar: () => void;
}

const PRIORIDADES_CAMBIO = [
  { nivel: 1, codigo: "P1", nombre: "P1 - Crítica", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  { nivel: 2, codigo: "P2", nombre: "P2 - Alta", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  { nivel: 3, codigo: "P3", nombre: "P3 - Media", color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  { nivel: 4, codigo: "P4", nombre: "P4 - Baja", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
];

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto,
  secciones = [],
  onCerrar,
}) => {
  const [subpestana, setSubpestana] = useState<"formulario" | "ticket">("formulario");
  const [tipoCambio, setTipoCambio] = useState<"NORMAL" | "ESTANDAR" | "EMERGENCIA">("NORMAL");
  const [urgencia, setUrgencia] = useState<number>(3);
  const [impacto, setImpacto] = useState<number>(2);

  if (!abierto) return null;

  function calcularPrioridad(imp: number, urg: number) {
    if (imp === 3 && urg === 3) return PRIORIDADES_CAMBIO[0];
    if ((imp === 3 && urg === 2) || (imp === 2 && urg === 3)) return PRIORIDADES_CAMBIO[1];
    if ((imp === 2 && urg === 2) || (imp === 3 && urg === 1) || (imp === 1 && urg === 3)) return PRIORIDADES_CAMBIO[2];
    return PRIORIDADES_CAMBIO[3];
  }

  const prioridadCalculada = calcularPrioridad(impacto, urgencia);

  const nivelRiesgo = tipoCambio === "EMERGENCIA" ? "Muy Alto" : tipoCambio === "ESTANDAR" ? "Bajo" : impacto >= 3 ? "Alto" : "Medio";
  const riesgoColor = nivelRiesgo === "Muy Alto" ? "#b91c1c" : nivelRiesgo === "Alto" ? "#c2410c" : nivelRiesgo === "Medio" ? "#854d0e" : "#16a34a";
  const riesgoBg = nivelRiesgo === "Muy Alto" ? "#fee2e2" : nivelRiesgo === "Alto" ? "#ffedd5" : nivelRiesgo === "Medio" ? "#fef9c3" : "#dcfce7";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 12,
          border: "1px solid #cbd5e1",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          width: "100%",
          maxWidth: 1100,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Cabecera Principal del Modal */}
        <div
          style={{
            padding: "14px 20px",
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 4,
                textTransform: "uppercase",
              }}
            >
              Simulador Interactivo
            </span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Vista Previa en Vivo: Solicitud de Cambio RFC (ITIL v4)
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Sub-Pestañas: Formulario vs Ticket Creado */}
            <div style={{ display: "flex", gap: 4, backgroundColor: "#f1f5f9", padding: 3, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setSubpestana("formulario")}
                style={{
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: subpestana === "formulario" ? 700 : 500,
                  backgroundColor: subpestana === "formulario" ? "#ffffff" : "transparent",
                  color: subpestana === "formulario" ? "#2563eb" : "#64748b",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  boxShadow: subpestana === "formulario" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                Vista de Formulario
              </button>
              <button
                type="button"
                onClick={() => setSubpestana("ticket")}
                style={{
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: subpestana === "ticket" ? 700 : 500,
                  backgroundColor: subpestana === "ticket" ? "#ffffff" : "transparent",
                  color: subpestana === "ticket" ? "#2563eb" : "#64748b",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  boxShadow: subpestana === "ticket" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                Vista de Ticket Creado
              </button>
            </div>

            {/* Botón cerrar modal con icono únicamente */}
            <button
              type="button"
              onClick={onCerrar}
              className="boton-accion-icono"
              title="Cerrar vista previa"
              aria-label="Cerrar vista previa"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Barra de Control del Simulador */}
        <div
          style={{
            padding: "10px 20px",
            backgroundColor: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
              Parámetros de Simulación RFC:
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Tipo de Cambio:</label>
              <select
                className="input-base"
                value={tipoCambio}
                onChange={(e) => setTipoCambio(e.target.value as any)}
                style={{ fontSize: 11.5, padding: "3px 8px" }}
              >
                <option value="NORMAL">Normal (Evaluación CAB)</option>
                <option value="ESTANDAR">Estándar (Pre-autorizado)</option>
                <option value="EMERGENCIA">Emergencia (Comité ECAB)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Urgencia:</label>
              <select
                className="input-base"
                value={urgencia}
                onChange={(e) => setUrgencia(parseInt(e.target.value, 10))}
                style={{ fontSize: 11.5, padding: "3px 8px" }}
              >
                <option value={3}>3 - Alta</option>
                <option value={2}>2 - Media</option>
                <option value={1}>1 - Baja</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Impacto:</label>
              <select
                className="input-base"
                value={impacto}
                onChange={(e) => setImpacto(parseInt(e.target.value, 10))}
                style={{ fontSize: 11.5, padding: "3px 8px" }}
              >
                <option value={3}>3 - Alto</option>
                <option value={2}>2 - Medio</option>
                <option value={1}>1 - Bajo</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Prioridad:</span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                  backgroundColor: prioridadCalculada.bg,
                  color: prioridadCalculada.color,
                  border: `1px solid ${prioridadCalculada.border}`,
                }}
              >
                {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Riesgo Calculado:</span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: 6,
                  backgroundColor: riesgoBg,
                  color: riesgoColor,
                }}
              >
                Riesgo {nivelRiesgo}
              </span>
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: "#64748b" }}>
            {subpestana === "formulario"
              ? "Evaluando campos visibles y validaciones de la solicitud"
              : "Evaluando ciclo de vida, trazabilidad y dictamen del CAB"}
          </div>
        </div>

        {/* Contenedor con Scroll del Simulador */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, backgroundColor: "#f1f5f9" }}>
          {/* SUB-PESTAÑA 1: VISTA DE FORMULARIO DE CAMBIO RFC */}
          {subpestana === "formulario" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
                maxWidth: 960,
                margin: "0 auto",
              }}
            >
              {/* Encabezado del Formulario */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                    Formulario de Solicitud de Cambio RFC (ITIL v4)
                  </h4>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    Registro de intervención controlada con análisis de impacto y rollback
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 4,
                      backgroundColor: "#1e3a8a",
                      color: "#bfdbfe",
                    }}
                  >
                    Tipo: {tipoCambio}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 9px",
                      borderRadius: 4,
                      backgroundColor: prioridadCalculada.bg,
                      color: prioridadCalculada.color,
                    }}
                  >
                    {prioridadCalculada.codigo}
                  </span>
                </div>
              </div>

              {/* Cuerpo del formulario de RFC */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Sección A: Identificación */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", borderLeft: "4px solid #2563eb", fontWeight: 700, fontSize: 12.5 }}>
                    Sección A — Identificación del Cambio
                  </div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Título del Cambio *
                      </label>
                      <input
                        type="text"
                        disabled
                        defaultValue="Actualización del Firmware Switch Core Datacenter Sede Central"
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          Categoría del Cambio *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Redes y Conectividad &gt; Equipamiento Activo (Switches / Routers)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          Origen del Cambio *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Gestión de Problemas (#PRB-2026-0042)</option>
                          <option>Mantenimiento Preventivo</option>
                          <option>Proyecto Estratégico TI</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección B: Justificación de Negocio */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", borderLeft: "4px solid #0891b2", fontWeight: 700, fontSize: 12.5 }}>
                    Sección B — Justificación y Descripción Técnica
                  </div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Motivo / Justificación de Negocio *
                      </label>
                      <textarea
                        rows={2}
                        disabled
                        defaultValue="El switch core actual presenta fuga de memoria en buffers de conmutación afectando la conectividad de 850 colaboradores."
                        style={{ width: "100%", padding: "8px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Descripción Técnica Detallada *
                      </label>
                      <textarea
                        rows={2}
                        disabled
                        defaultValue="Aplicación del release Cisco IOS-XE 17.9.4a recomendado por fabricante con parche de seguridad CVE-2026-1184."
                        style={{ width: "100%", padding: "8px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección C: Alcance y CMDB */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", borderLeft: "4px solid #16a34a", fontWeight: 700, fontSize: 12.5 }}>
                    Sección C — Alcance y Elementos CI (CMDB)
                  </div>
                  <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Servicio(s) Afectado(s) *
                      </label>
                      <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                        <option>SRV-WAN-001 · Red Corporativa y Enlaces Datacenter</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Activos / CIs Afectados (CMDB) *
                      </label>
                      <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                        <option>SW-CORE-CISCO-9300 (Switch Capa 3 Principal)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sección D: Planes Técnicos Mandatorios (ITIL v4) */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", borderLeft: "4px solid #7c3aed", fontWeight: 700, fontSize: 12.5 }}>
                    Sección D — Planes Técnicos Mandatorios (ITIL v4)
                  </div>
                  <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Plan de Implementación Paso a Paso *
                      </label>
                      <textarea
                        rows={2}
                        disabled
                        defaultValue="1. Respaldo de configuración 'running-config' a TFTP seguro. 2. Copia binaria de firmware a flash. 3. Verificación MD5. 4. Comando boot system y reload."
                        style={{ width: "100%", padding: "8px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#b91c1c", display: "block", marginBottom: 4 }}>
                        Plan de Rollback / Marcha Atrás (Mandatorio) *
                      </label>
                      <textarea
                        rows={2}
                        disabled
                        defaultValue="Si tras 15 minutos del reinicio se detectan pérdidas en rutas OSPF/BGP, interrumpir procedimiento y forzar arranque con imagen previa almacenada en slot sec."
                        style={{ width: "100%", padding: "8px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #fca5a5", borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Plan de Pruebas y Validación Post-Cambio *
                      </label>
                      <textarea
                        rows={2}
                        disabled
                        defaultValue="Comprobar adyacencias de enrutamiento con switch secundario, latencia con sedes remotas menor a 18ms y pruebas de tráfico SAP."
                        style={{ width: "100%", padding: "8px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección E: Ventana de Mantenimiento y Aprobaciones */}
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                  <div style={{ backgroundColor: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e2e8f0", borderLeft: "4px solid #ea580c", fontWeight: 700, fontSize: 12.5 }}>
                    Sección E — Programación y Gobernanza CAB
                  </div>
                  <div style={{ padding: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Ventana de Mantenimiento Programada *
                      </label>
                      <input
                        type="text"
                        disabled
                        defaultValue="Sábado 24/10/2026 de 23:00 a Domingo 25/10/2026 03:00 hrs"
                        style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Autoridad de Aprobación Requerida
                      </label>
                      <div style={{ padding: "7px 10px", fontSize: 12, backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontWeight: 600, color: "#2563eb" }}>
                        {tipoCambio === "EMERGENCIA" ? "Comité de Emergencia (ECAB)" : tipoCambio === "ESTANDAR" ? "Pre-aprobado por Catálogo" : "Comité Pleno CAB (5 votos)"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-PESTAÑA 2: VISTA DE TICKET CREADO */}
          {subpestana === "ticket" && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
                maxWidth: 960,
                margin: "0 auto",
              }}
            >
              {/* Cabecera del Ticket RFC */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#60a5fa" }}>
                      #RFC-2026-0189
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: "#1e3a8a",
                        color: "#bfdbfe",
                      }}
                    >
                      Tipo: {tipoCambio}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: prioridadCalculada.bg,
                        color: prioridadCalculada.color,
                      }}
                    >
                      {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: riesgoBg,
                        color: riesgoColor,
                      }}
                    >
                      Riesgo {nivelRiesgo}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 4,
                      backgroundColor: "#312e81",
                      color: "#c7d2fe",
                    }}
                  >
                    Estado: Bajo Evaluación CAB
                  </span>
                </div>

                <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>
                  Actualización del Firmware Switch Core Datacenter Sede Central
                </h3>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Solicitado el 18/10/2026 15:40 hrs por Ing. Elena Morales (Gestora de Cambios) · Servicio: SRV-WAN-001
                </div>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* LÍNEA DE ESTADOS DEL WORKFLOW ITIL DE CAMBIOS (6 PASOS) */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 14 }}>
                    Ciclo de Vida ITIL: Flujo Formal de Gestión de Cambios (RFC)
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                      padding: "0 8px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 13,
                        left: 24,
                        right: 24,
                        height: 3,
                        backgroundColor: "#e2e8f0",
                        zIndex: 1,
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: 13,
                        left: 24,
                        width: "40%",
                        height: 3,
                        backgroundColor: "#2563eb",
                        zIndex: 2,
                      }}
                    />

                    {[
                      { num: 1, label: "Registrado", estado: "completado" },
                      { num: 2, label: "Evaluación Riesgo", estado: "completado" },
                      { num: 3, label: "Aprobación CAB", estado: "actual" },
                      { num: 4, label: "Programado", estado: "pendiente" },
                      { num: 5, label: "Implementación", estado: "pendiente" },
                      { num: 6, label: "Revisión PIR", estado: "pendiente" },
                    ].map((paso) => (
                      <div
                        key={paso.num}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: 3,
                          width: 90,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            backgroundColor:
                              paso.estado === "actual"
                                ? "#2563eb"
                                : paso.estado === "completado"
                                ? "#16a34a"
                                : "#ffffff",
                            border:
                              paso.estado === "pendiente"
                                ? "2px solid #cbd5e1"
                                : paso.estado === "actual"
                                ? "2px solid #1d4ed8"
                                : "2px solid #16a34a",
                            color: paso.estado === "pendiente" ? "#94a3b8" : "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            boxShadow: paso.estado === "actual" ? "0 0 0 3px rgba(37,99,235,0.2)" : "none",
                          }}
                        >
                          {paso.estado === "completado" ? "✓" : paso.num}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: paso.estado === "actual" ? 700 : 500,
                            color: paso.estado === "actual" ? "#1e40af" : "#64748b",
                            marginTop: 6,
                            lineHeight: 1.2,
                          }}
                        >
                          {paso.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tarjetas de Gobernanza y Aprobadores */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Gestor del Cambio Responsable
                    </span>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                      Ing. Elena Morales
                    </strong>
                    <span style={{ fontSize: 11, color: "#2563eb" }}>
                      Oficina de Gestión de Servicios TI
                    </span>
                  </div>

                  <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Quórum de Aprobación CAB
                    </span>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                      3 de 5 votos recibidos (60%)
                    </strong>
                    <span style={{ fontSize: 11, color: "#d97706", fontWeight: 600 }}>
                      Pendiente dictamen de Seguridad de la Información
                    </span>
                  </div>
                </div>

                {/* Detalles Registrados del RFC */}
                <div style={{ padding: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 10 }}>
                    Parámetros Técnicos Registrados en el Cambio
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>Servicio Primario:</span>{" "}
                      <strong>SRV-WAN-001 (Red Datacenter)</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Activo CI CMDB:</span>{" "}
                      <strong>SW-CORE-CISCO-9300</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Ventana Autorizada:</span>{" "}
                      <strong>Sábado 24/10 23:00 a Domingo 25/10 03:00</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Entorno Impactado:</span>{" "}
                      <strong>Producción (Datacenter Central)</strong>
                    </div>
                  </div>
                </div>

                {/* Resumen de Planes Mandatorios */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e40af", display: "block", marginBottom: 4 }}>
                      Plan de Rollback Aprobado
                    </span>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.4 }}>
                      Reversión en menos de 15 minutos mediante conmutación de imagen en flash secundaria.
                    </p>
                  </div>
                  <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#166534", display: "block", marginBottom: 4 }}>
                      Plan de Validación de Calidad
                    </span>
                    <p style={{ margin: 0, color: "#475569", lineHeight: 1.4 }}>
                      Batería de pruebas de carga en túneles VPN y confirmación de conectividad con sedes remotas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Los cambios reflejan la configuración activa de secciones, obligatoriedad y gobernanza de la solicitud RFC.
          </span>
          <button
            type="button"
            onClick={onCerrar}
            className="boton-accion-icono"
            title="Cerrar simulador"
            aria-label="Cerrar simulador"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
