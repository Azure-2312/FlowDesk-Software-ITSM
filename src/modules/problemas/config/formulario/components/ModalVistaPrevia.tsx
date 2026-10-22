"use client";

import React, { useState } from "react";

export interface ModalVistaPreviaProps {
  abierto: boolean;
  secciones?: any[];
  onCerrar: () => void;
}

const PRIORIDADES_PROBLEMA = [
  { nivel: 1, codigo: "P1", nombre: "P1 - Crítica", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  { nivel: 2, codigo: "P2", nombre: "P2 - Alta", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  { nivel: 3, codigo: "P3", nombre: "P3 - Media", color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  { nivel: 4, codigo: "P4", nombre: "P4 - Baja", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  { nivel: 5, codigo: "P5", nombre: "P5 - Planificada", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
];

interface IncidenteCatalogo {
  id: string;
  codigo: string;
  titulo: string;
  servicio_codigo: string;
  servicio_nombre: string;
  prioridad: string;
  prioridad_color: string;
  estado: string;
  fecha: string;
}

const INCIDENTES_CATALOGO: IncidenteCatalogo[] = [
  {
    id: "1",
    codigo: "INC-2026-0814",
    titulo: "Caída intermitente en enlace switch core Datacenter",
    servicio_codigo: "SRV-WAN-001",
    servicio_nombre: "Enlace WAN Principal y Red",
    prioridad: "P2 - Alta",
    prioridad_color: "#c2410c",
    estado: "En Curso",
    fecha: "Hoy 08:30",
  },
  {
    id: "2",
    codigo: "INC-2026-0820",
    titulo: "Pérdida de paquetes persistente en túnel VPN sedes remotas",
    servicio_codigo: "SRV-WAN-001",
    servicio_nombre: "Enlace WAN Principal y Red",
    prioridad: "P2 - Alta",
    prioridad_color: "#c2410c",
    estado: "Asignado",
    fecha: "Hoy 09:15",
  },
  {
    id: "3",
    codigo: "INC-2026-0831",
    titulo: "Bloqueo de acceso y degradación de red en Contabilidad sede sur",
    servicio_codigo: "SRV-WAN-001",
    servicio_nombre: "Enlace WAN Principal y Red",
    prioridad: "P3 - Media",
    prioridad_color: "#854d0e",
    estado: "Abierto",
    fecha: "Ayer 17:40",
  },
  {
    id: "4",
    codigo: "INC-2026-0845",
    titulo: "Falla de sincronización en réplica de Base de Datos SAP",
    servicio_codigo: "SRV-ERP-002",
    servicio_nombre: "Sistema de Gestión Financiera SAP",
    prioridad: "P1 - Crítica",
    prioridad_color: "#b91c1c",
    estado: "Bajo Diagnóstico",
    fecha: "Hoy 10:00",
  },
  {
    id: "5",
    codigo: "INC-2026-0850",
    titulo: "Demora en autenticación SSO en portal corporativo",
    servicio_codigo: "SRV-AUTH-003",
    servicio_nombre: "Directorio Activo y SSO",
    prioridad: "P3 - Media",
    prioridad_color: "#854d0e",
    estado: "Abierto",
    fecha: "Hoy 10:20",
  },
  {
    id: "6",
    codigo: "INC-2026-0862",
    titulo: "Latencia alta en consultas del servicio de facturación",
    servicio_codigo: "SRV-ERP-002",
    servicio_nombre: "Sistema de Gestión Financiera SAP",
    prioridad: "P2 - Alta",
    prioridad_color: "#c2410c",
    estado: "Asignado",
    fecha: "Hoy 11:05",
  },
];

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto,
  secciones = [],
  onCerrar,
}) => {
  const [subpestana, setSubpestana] = useState<"formulario" | "ticket">("formulario");
  const [urgencia, setUrgencia] = useState<number>(3);
  const [impacto, setImpacto] = useState<number>(3);
  const [incidentesVinculadosIds, setIncidentesVinculadosIds] = useState<string[]>(["1", "2", "3"]);
  const [modalIncidentesAbierto, setModalIncidentesAbierto] = useState<boolean>(false);
  const [busquedaIncidente, setBusquedaIncidente] = useState<string>("");
  const [filtroServicioInc, setFiltroServicioInc] = useState<string>("todos");

  if (!abierto) return null;

  function calcularPrioridad(imp: number, urg: number) {
    if (imp === 3 && urg === 3) return PRIORIDADES_PROBLEMA[0];
    if ((imp === 3 && urg === 2) || (imp === 2 && urg === 3)) return PRIORIDADES_PROBLEMA[1];
    if ((imp === 2 && urg === 2) || (imp === 3 && urg === 1) || (imp === 1 && urg === 3)) return PRIORIDADES_PROBLEMA[2];
    if ((imp === 2 && urg === 1) || (imp === 1 && urg === 2)) return PRIORIDADES_PROBLEMA[3];
    return PRIORIDADES_PROBLEMA[4];
  }

  const prioridadCalculada = calcularPrioridad(impacto, urgencia);

  const incidentesFiltrados = INCIDENTES_CATALOGO.filter((inc) => {
    const matchBusqueda =
      !busquedaIncidente.trim() ||
      inc.codigo.toLowerCase().includes(busquedaIncidente.toLowerCase()) ||
      inc.titulo.toLowerCase().includes(busquedaIncidente.toLowerCase());
    const matchServicio =
      filtroServicioInc === "todos" || inc.servicio_codigo === filtroServicioInc;
    return matchBusqueda && matchServicio;
  });

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
              Vista Previa en Vivo: Gestión de Problemas (ITIL v4)
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

        {/* Barra de Control del Simulador: Matriz Impacto x Urgencia */}
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
              Simulador de Severidad ITIL:
            </span>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <label style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Urgencia:</label>
              <select
                className="input-base"
                value={urgencia}
                onChange={(e) => setUrgencia(parseInt(e.target.value, 10))}
                style={{ fontSize: 11.5, padding: "3px 8px" }}
              >
                <option value={3}>3 - Alta (Crítica)</option>
                <option value={2}>2 - Media (Degradación)</option>
                <option value={1}>1 - Baja (Diferible)</option>
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
                <option value={3}>3 - Alto (+100 usuarios)</option>
                <option value={2}>2 - Medio (Departamento)</option>
                <option value={1}>1 - Bajo (Individual)</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600 }}>Prioridad Deducida:</span>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 6,
                  backgroundColor: prioridadCalculada.bg,
                  color: prioridadCalculada.color,
                  border: `1px solid ${prioridadCalculada.border}`,
                }}
              >
                {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
              </span>
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: "#64748b" }}>
            {subpestana === "formulario"
              ? "Evaluando presentación dinámica del formulario de captura"
              : "Evaluando visualización del ticket creado para especialistas y gestores"}
          </div>
        </div>

        {/* Contenedor con Scroll del Simulador */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, backgroundColor: "#f1f5f9" }}>
          {/* SUB-PESTAÑA 1: VISTA DE FORMULARIO DE PROBLEMA */}
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
                    Formulario de Registro de Problemas (ITIL v4)
                  </h4>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    Gestión reactiva y proactiva de causas de incidentes recurrentes
                  </span>
                </div>
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
                  Prioridad: {prioridadCalculada.codigo}
                </span>
              </div>

              {/* Cuerpo del formulario */}
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* 1. Código y Título */}
                <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Código de Problema *
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="PRB-2026-0042 (Autogenerado)"
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: "#334155",
                        cursor: "not-allowed",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Título del Problema *
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Resuma la causa o falla recurrente (ej. Caída intermitente en troncal MPLS sede central)..."
                      defaultValue="Pérdida intermitente de paquetes y latencia en enlace troncal MPLS"
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: "#0f172a",
                      }}
                    />
                  </div>
                </div>

                {/* 2. Descripción y Síntomas */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    Descripción Detallada y Síntomas Detectados *
                  </label>
                  <textarea
                    rows={3}
                    disabled
                    defaultValue="Múltiples sedes reportan degradación de enlace WAN entre las 08:00 y 11:30 hrs. Los paquetes ICMP registran hasta 28% de descarte y el túnel IPsec presenta renegociaciones cada 15 minutos."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      color: "#0f172a",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* 3. Categoría y Servicio */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Categoría del Problema *
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>Redes y Telecomunicaciones &gt; Enlaces WAN / MPLS</option>
                      <option>Sistemas &gt; Base de Datos Oracle</option>
                      <option>Hardware &gt; Servidores Virtuales Nutanix</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Servicio de Negocio Afectado *
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>SRV-WAN-001 · Enlace Principal WAN y Red Corporativa</option>
                      <option>SRV-ERP-002 · Sistema de Gestión Financiera SAP</option>
                    </select>
                  </div>
                </div>

                {/* 4. Elemento CI CMDB */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    Elemento de Configuración (CI CMDB) Afectado
                  </label>
                  <select
                    disabled
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      fontSize: 12,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                    }}
                  >
                    <option>SW-CORE-CISCO-9300 (Switch Capa 3 - Datacenter Sede Central)</option>
                    <option>SRV-PROD-DB01 (Servidor Físico Base de Datos)</option>
                  </select>
                </div>

                {/* 5. Urgencia, Impacto y Prioridad */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Nivel de Urgencia *
                    </label>
                    <div style={{ padding: "7px 10px", fontSize: 12, backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontWeight: 600 }}>
                      {urgencia === 3 ? "Alta - Labor crítica detenida" : urgencia === 2 ? "Media - Con bypass" : "Baja - Diferible"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Nivel de Impacto *
                    </label>
                    <div style={{ padding: "7px 10px", fontSize: 12, backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontWeight: 600 }}>
                      {impacto === 3 ? "Alto - Toda la entidad" : impacto === 2 ? "Medio - Departamento" : "Bajo - Reducido"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Prioridad Calculada *
                    </label>
                    <div
                      style={{
                        padding: "7px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: prioridadCalculada.bg,
                        color: prioridadCalculada.color,
                        border: `1px solid ${prioridadCalculada.border}`,
                        borderRadius: 6,
                        textAlign: "center",
                      }}
                    >
                      {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                    </div>
                  </div>
                </div>

                {/* 6. Grupo Asignado y Responsable */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Grupo Técnico Asignado *
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>Mesa de Telecomunicaciones y Conectividad N3</option>
                      <option>Administración de Servidores e Infraestructura</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Investigador / Responsable Asignado
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>Ing. Roberto Sánchez (Especialista N3 Redes)</option>
                      <option>Por asignar (Bandeja del grupo resolutor)</option>
                    </select>
                  </div>
                </div>

                {/* 7. Solución Temporal (Workaround) y Causa Raíz (RCA) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Solución Temporal (Workaround)
                    </label>
                    <textarea
                      rows={2}
                      disabled
                      defaultValue="Se habilitó temporalmente la ruta de contingencia por túnel IPsec secundario por proveedor B."
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: "#0f172a",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Causa Raíz / Análisis RCA Preliminar
                    </label>
                    <textarea
                      rows={2}
                      disabled
                      defaultValue="Degradación óptica en puerto SFP+ del switch core por acumulación térmica."
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: "#0f172a",
                      }}
                    />
                  </div>
                </div>

                {/* 8. Incidentes Asociados con selector interactivo */}
                <div
                  style={{
                    padding: "14px 16px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 12.5, color: "#166534" }}>
                          Incidentes Asociados al Problema
                        </strong>
                        <span
                          style={{
                            padding: "2px 8px",
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            border: "1px solid #86efac",
                          }}
                        >
                          {incidentesVinculadosIds.length} vinculados
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "#4b5563", marginTop: 2, display: "block" }}>
                        Seleccione fallas concurrentes para consolidar la investigación y notificar a los afectados.
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const idsServicio = INCIDENTES_CATALOGO
                            .filter((i) => i.servicio_codigo === "SRV-WAN-001")
                            .map((i) => i.id);
                          const combinados = Array.from(new Set([...incidentesVinculadosIds, ...idsServicio]));
                          setIncidentesVinculadosIds(combinados);
                        }}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: "1px solid #86efac",
                          backgroundColor: "#ffffff",
                          color: "#15803d",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title="Vincular automáticamente los incidentes abiertos del servicio SRV-WAN-001"
                      >
                        Sugerir por Servicio (3)
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalIncidentesAbierto(true)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          border: "none",
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        + Buscar y Vincular
                      </button>
                    </div>
                  </div>

                  {/* Lista de incidentes vinculados */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {incidentesVinculadosIds.map((id) => {
                      const inc = INCIDENTES_CATALOGO.find((i) => i.id === id);
                      if (!inc) return null;
                      return (
                        <div
                          key={inc.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "7px 10px",
                            backgroundColor: "#ffffff",
                            border: "1px solid #d1fae5",
                            borderRadius: 6,
                            fontSize: 11.5,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span
                              style={{
                                fontFamily: "monospace",
                                fontWeight: 700,
                                color: "#1e40af",
                                backgroundColor: "#eff6ff",
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontSize: 11,
                              }}
                            >
                              #{inc.codigo}
                            </span>
                            <strong style={{ color: "#0f172a" }}>{inc.titulo}</strong>
                            <span
                              style={{
                                fontSize: 10.5,
                                padding: "1px 6px",
                                borderRadius: 4,
                                backgroundColor: "#fef3c7",
                                color: "#92400e",
                                fontWeight: 600,
                              }}
                            >
                              {inc.prioridad}
                            </span>
                            <span style={{ color: "#64748b", fontSize: 11 }}>
                              · {inc.servicio_nombre} ({inc.fecha})
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIncidentesVinculadosIds((prev) => prev.filter((item) => item !== inc.id))}
                            className="boton-accion-icono boton-accion-peligro"
                            style={{ width: 24, height: 24 }}
                            title={`Desvincular #${inc.codigo}`}
                            aria-label={`Desvincular #${inc.codigo}`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
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
              {/* Cabecera del Ticket */}
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
                      #PRB-2026-0042
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
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 4,
                      backgroundColor: "#1e3a8a",
                      color: "#bfdbfe",
                    }}
                  >
                    Estado: Bajo Investigación
                  </span>
                </div>

                <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>
                  Pérdida intermitente de paquetes y latencia en enlace troncal MPLS sede central
                </h3>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Registrado el 03/10/2026 10:30 hrs por Carlos Mendoza (Gestor de Problemas) · Servicio: SRV-WAN-001
                </div>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* LÍNEA DE ESTADOS DEL CICLO DE VIDA ITIL (7 ESTADOS) */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 14 }}>
                    Ciclo de Vida ITIL: Flujo Estándar de Gestión de Problemas
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
                        width: "33%",
                        height: 3,
                        backgroundColor: "#2563eb",
                        zIndex: 2,
                      }}
                    />

                    {[
                      { num: 1, label: "Registrado", estado: "completado" },
                      { num: 2, label: "Asignado", estado: "completado" },
                      { num: 3, label: "Bajo Investigación", estado: "actual" },
                      { num: 4, label: "Causa Identificada", estado: "pendiente" },
                      { num: 5, label: "Solución Propuesta", estado: "pendiente" },
                      { num: 6, label: "Resuelto", estado: "pendiente" },
                      { num: 7, label: "Cerrado", estado: "pendiente" },
                    ].map((paso) => (
                      <div
                        key={paso.num}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: 3,
                          width: 80,
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

                {/* Tarjetas de Responsables */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Investigador Responsable
                    </span>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                      Ing. Roberto Sánchez
                    </strong>
                    <span style={{ fontSize: 11, color: "#2563eb" }}>
                      Mesa de Telecomunicaciones y Conectividad N3
                    </span>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#f8fafc",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Gestor del Problema (Registrador)
                    </span>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                      Carlos Mendoza
                    </strong>
                    <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>
                      Oficina de Gestión de Servicios TI
                    </span>
                  </div>
                </div>

                {/* Detalles Registrados */}
                <div
                  style={{
                    padding: 14,
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 10 }}>
                    Detalles Registrados en el Problema
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>Categoría ITIL:</span>{" "}
                      <strong>Redes y Telecomunicaciones &gt; Enlaces WAN</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Servicio de Negocio:</span>{" "}
                      <strong>SRV-WAN-001 (Red Corporativa)</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Activo CI CMDB:</span>{" "}
                      <strong>SW-CORE-CISCO-9300 (Switch Capa 3)</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Urgencia / Impacto:</span>{" "}
                      <strong>{urgencia === 3 ? "Alta" : urgencia === 2 ? "Media" : "Baja"} / {impacto === 3 ? "Alto" : impacto === 2 ? "Medio" : "Bajo"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Prioridad Deducida por Matriz:</span>{" "}
                      <strong style={{ color: prioridadCalculada.color }}>
                        {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Incidentes Vinculados:</span>{" "}
                      <strong style={{ color: "#16a34a" }}>{incidentesVinculadosIds.length} incidentes vinculados</strong>
                    </div>
                  </div>
                </div>

                {/* Workaround */}
                <div
                  style={{
                    padding: 14,
                    backgroundColor: "#f0fdf4",
                    borderRadius: 8,
                    border: "1px solid #bbf7d0",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", display: "block", marginBottom: 4 }}>
                    Workaround (Solución Temporal)
                  </span>
                  <p style={{ margin: 0, color: "#1e293b", lineHeight: 1.4, fontSize: 12 }}>
                    Se habilitó temporalmente la ruta de contingencia por túnel IPsec secundario a través del proveedor B. La degradación de ancho de banda bajó al 12%.
                  </p>
                </div>

                {/* Evidencias Técnicas */}
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 11.5,
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                    Archivos y Evidencias Técnicas Adjuntas (2 archivos)
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        color: "#334155",
                      }}
                    >
                      captura_alerta_snmp_core.png (850 KB)
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        color: "#334155",
                      }}
                    >
                      dump_trazas_bgp.log (3.4 MB)
                    </span>
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
            Los cambios en esta vista previa reflejan en tiempo real las reglas de obligatoriedad y orden configuradas.
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

      {/* MODAL SECUNDARIO: BUSCAR Y VINCULAR INCIDENTES */}
      {modalIncidentesAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e2e8f0",
              width: "100%",
              maxWidth: 720,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                  Vincular Incidentes Abiertos al Problema
                </h4>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>
                  Filtre por código, descripción o servicio para correlacionar eventos
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalIncidentesAbierto(false)}
                className="boton-accion-icono"
                title="Cerrar buscador"
                aria-label="Cerrar buscador"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ padding: "12px 20px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "flex", gap: 10 }}>
              <input
                type="text"
                className="input-base"
                placeholder="Buscar por código INC o título..."
                value={busquedaIncidente}
                onChange={(e) => setBusquedaIncidente(e.target.value)}
                style={{ flex: 1, fontSize: 12 }}
              />
              <select
                className="input-base"
                value={filtroServicioInc}
                onChange={(e) => setFiltroServicioInc(e.target.value)}
                style={{ width: 220, fontSize: 12 }}
              >
                <option value="todos">Todos los servicios</option>
                <option value="SRV-WAN-001">SRV-WAN-001 (Enlace WAN)</option>
                <option value="SRV-ERP-002">SRV-ERP-002 (SAP)</option>
                <option value="SRV-AUTH-003">SRV-AUTH-003 (SSO)</option>
              </select>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px", display: "flex", flexDirection: "column", gap: 6 }}>
              {incidentesFiltrados.length === 0 ? (
                <div style={{ textAlign: "center", padding: 30, color: "#64748b", fontSize: 12 }}>
                  No se encontraron incidentes con los criterios de búsqueda.
                </div>
              ) : (
                incidentesFiltrados.map((inc) => {
                  const yaEstaVinculado = incidentesVinculadosIds.includes(inc.id);
                  return (
                    <div
                      key={inc.id}
                      style={{
                        padding: "10px 12px",
                        border: `1px solid ${yaEstaVinculado ? "#86efac" : "#e2e8f0"}`,
                        backgroundColor: yaEstaVinculado ? "#f0fdf4" : "#ffffff",
                        borderRadius: 6,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#1e40af", fontSize: 11.5 }}>
                            #{inc.codigo}
                          </span>
                          <span style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 600 }}>
                            {inc.prioridad}
                          </span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>
                            {inc.servicio_nombre} · {inc.fecha}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                          {inc.titulo}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (yaEstaVinculado) {
                            setIncidentesVinculadosIds((prev) => prev.filter((id) => id !== inc.id));
                          } else {
                            setIncidentesVinculadosIds((prev) => [...prev, inc.id]);
                          }
                        }}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          border: yaEstaVinculado ? "1px solid #fca5a5" : "1px solid #86efac",
                          backgroundColor: yaEstaVinculado ? "#fee2e2" : "#dcfce7",
                          color: yaEstaVinculado ? "#991b1b" : "#166534",
                        }}
                      >
                        {yaEstaVinculado ? "Desvincular" : "+ Vincular"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", backgroundColor: "#f8fafc", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setModalIncidentesAbierto(false)}
                style={{
                  padding: "6px 16px",
                  fontSize: 12,
                  fontWeight: 600,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                Listo ({incidentesVinculadosIds.length} vinculados)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
