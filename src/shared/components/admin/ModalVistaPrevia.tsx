"use client";

import React, { useState } from "react";

export interface ModalVistaPreviaProps {
  abierto: boolean;
  secciones?: any[];
  tituloModulo?: string;
  modulo?: "problemas" | "cambios" | "activos" | "cmdb";
  onCerrar: () => void;
}

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto,
  secciones = [],
  tituloModulo = "Formulario ITSM",
  modulo = "problemas",
  onCerrar,
}) => {
  const [subpestana, setSubpestana] = useState<"formulario" | "ticket">("formulario");
  const [impacto, setImpacto] = useState("3");
  const [urgencia, setUrgencia] = useState("3");
  const [perfilSimulado, setPerfilSimulado] = useState("Administrador");
  const [fichaPestanaActiva, setFichaPestanaActiva] = useState("general");

  if (!abierto) return null;

  const calcularPrioridad = (imp: string, urg: string) => {
    const i = parseInt(imp, 10);
    const u = parseInt(urg, 10);
    if (i === 3 && u === 3) return { codigo: "P1", nombre: "P1 - Crítica", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" };
    if ((i === 3 && u === 2) || (i === 2 && u === 3)) return { codigo: "P2", nombre: "P2 - Alta", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" };
    if ((i === 2 && u === 2) || (i === 3 && u === 1) || (i === 1 && u === 3)) return { codigo: "P3", nombre: "P3 - Media", color: "#854d0e", bg: "#fef9c3", border: "#fde047" };
    return { codigo: "P4", nombre: "P4 - Baja", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" };
  };

  const prioridadObj = calcularPrioridad(impacto, urgencia);

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
          maxWidth: 1050,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Cabecera */}
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
              Vista Previa en Vivo: {tituloModulo}
            </h3>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Sub-Pestañas */}
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
                {modulo === "activos" || modulo === "cmdb" ? "Vista de Formulario de Alta" : "Vista de Formulario"}
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
                {modulo === "activos" || modulo === "cmdb" ? "Vista de Ficha de Activo" : "Vista de Ticket Creado"}
              </button>
            </div>

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

        {/* Barra de Simulación */}
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
          {modulo === "activos" || modulo === "cmdb" ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155" }}>Probar como perfil:</label>
                <select
                  className="input-base"
                  value={perfilSimulado}
                  onChange={(e) => setPerfilSimulado(e.target.value)}
                  style={{ fontSize: 11.5, padding: "2px 8px" }}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Gestor de Activos">Gestor de Activos</option>
                  <option value="Técnico de Campo">Técnico de Campo</option>
                  <option value="Auditor de TI">Auditor de TI</option>
                  <option value="Solicitante">Solicitante (Custodio)</option>
                </select>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                }}
              >
                Modo: Simulación de Inventario ITAM / CMDB
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                Cálculo de Prioridad:
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11.5, color: "#64748b" }}>Urgencia:</label>
                <select
                  className="input-base"
                  value={urgencia}
                  onChange={(e) => setUrgencia(e.target.value)}
                  style={{ fontSize: 11.5, padding: "2px 6px" }}
                >
                  <option value="3">3 - Alta</option>
                  <option value="2">2 - Media</option>
                  <option value="1">1 - Baja</option>
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <label style={{ fontSize: 11.5, color: "#64748b" }}>Impacto:</label>
                <select
                  className="input-base"
                  value={impacto}
                  onChange={(e) => setImpacto(e.target.value)}
                  style={{ fontSize: 11.5, padding: "2px 6px" }}
                >
                  <option value="3">3 - Alto</option>
                  <option value="2">2 - Medio</option>
                  <option value="1">1 - Bajo</option>
                </select>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: prioridadObj.bg,
                  color: prioridadObj.color,
                  border: `1px solid ${prioridadObj.border}`,
                }}
              >
                {prioridadObj.codigo} - {prioridadObj.nombre}
              </span>
            </div>
          )}

          <span style={{ fontSize: 11.5, color: "#64748b" }}>
            {secciones && secciones.length > 0
              ? `${secciones.reduce((acc, s) => acc + (s.campos?.filter((c: any) => c.visible !== false)?.length || 0), 0)} campos configurados`
              : "Modelo de datos homologado"}
          </span>
        </div>

        {/* Contenido con scroll */}
        <div style={{ flex: 1, overflowY: "auto", padding: 20, backgroundColor: "#f1f5f9" }}>
          {subpestana === "formulario" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 940, margin: "0 auto" }}>
              {secciones.map((sec) => (
                <div
                  key={sec.id}
                  style={{
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 16px",
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      borderLeft: `4px solid ${sec.color || "#2563eb"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{sec.titulo}</span>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      {sec.campos?.filter((c: any) => c.visible).length || 0} campos visibles
                    </span>
                  </div>

                  <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {sec.campos
                      ?.filter((c: any) => c.visible)
                      .map((campo: any) => (
                        <div
                          key={campo.codigo || campo.id}
                          style={{
                            gridColumn: campo.ancho === "completo" ? "span 2" : "span 1",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                          }}
                        >
                          <label style={{ fontSize: 11.5, fontWeight: 600, color: "#334155", display: "flex", justifyContent: "space-between" }}>
                            <span>{campo.etiqueta || campo.nombre}</span>
                            {campo.obligatorio === "si" && <span style={{ color: "#dc2626", fontWeight: 700 }}>*</span>}
                          </label>
                          <input
                            type="text"
                            disabled
                            placeholder={campo.placeholder || campo.ayuda || "Ejemplo de valor"}
                            style={{
                              width: "100%",
                              padding: "7px 10px",
                              fontSize: 12,
                              backgroundColor: "#f8fafc",
                              border: "1px solid #cbd5e1",
                              borderRadius: 6,
                              color: "#64748b",
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : modulo === "activos" || modulo === "cmdb" ? (
            /* Vista de Ficha Técnica Patrimonial de Activo */
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
                maxWidth: 940,
                margin: "0 auto",
              }}
            >
              {/* Cabecera Fija del Activo (Patrón 5.1) */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#60a5fa" }}>
                      ACT-2026-0089
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: "#dcfce7",
                        color: "#166534",
                      }}
                    >
                      En Operación (Asignado)
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: 4,
                        backgroundColor: "#1e293b",
                        color: "#94a3b8",
                      }}
                    >
                      CI CMDB Vinculado
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: "#94a3b8", fontFamily: "monospace" }}>
                    SN: DELL-LAT-5440-PE-8849
                  </span>
                </div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>
                  Dell Latitude 5440 Intel Core i7 32GB 1TB SSD
                </h3>
                <div style={{ fontSize: 11.5, color: "#cbd5e1", display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <span>Custodio: <strong>Ing. Carlos Mendoza</strong> (Tecnologías de Información)</span>
                  <span>Ubicación: <strong>Sede Central &gt; Edificio A &gt; Piso 4 &gt; TI-02</strong></span>
                  <span>Garantía: <strong>Vigente (36 meses)</strong></span>
                </div>
              </div>

              {/* Barra de 11 Pestañas de la Ficha del Activo (1.5.1.8) */}
              <div style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", padding: "4px 8px", overflowX: "auto" }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { id: "general", label: "1. Datos Generales" },
                    { id: "especificaciones", label: "2. Especificaciones" },
                    { id: "partes", label: "3. Componentes" },
                    { id: "software", label: "4. Licencias" },
                    { id: "custodia", label: "5. Custodias" },
                    { id: "mantenimiento", label: "6. Mantenimiento" },
                    { id: "tickets", label: "7. Incidentes/RFC" },
                    { id: "auditoria", label: "8. Auditorías" },
                    { id: "contratos", label: "9. Garantías" },
                    { id: "documentos", label: "10. Actas" },
                    { id: "cmdb", label: "11. CMDB" },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFichaPestanaActiva(p.id)}
                      style={{
                        padding: "4px 8px",
                        fontSize: 11,
                        fontWeight: fichaPestanaActiva === p.id ? 700 : 500,
                        backgroundColor: fichaPestanaActiva === p.id ? "#ffffff" : "transparent",
                        color: fichaPestanaActiva === p.id ? "#2563eb" : "#64748b",
                        border: "1px solid",
                        borderColor: fichaPestanaActiva === p.id ? "#cbd5e1" : "transparent",
                        borderRadius: 4,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contenido de la Ficha */}
              <div style={{ padding: 20 }}>
                {fichaPestanaActiva === "general" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 12 }}>
                    <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                      <strong style={{ display: "block", marginBottom: 6, color: "#334155" }}>Gobernanza Patrimonial</strong>
                      <div>Clase: <strong>Hardware &gt; Portátil Corporativo</strong></div>
                      <div>Marca / Modelo: <strong>Dell / Latitude 5440</strong></div>
                      <div>Vida Útil Restante: <strong>28 meses</strong></div>
                      <div>Valor Residual: <strong>S/. 3,450.00</strong></div>
                    </div>
                    <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                      <strong style={{ display: "block", marginBottom: 6, color: "#334155" }}>Custodia y Control Físico</strong>
                      <div>Asignado a: <strong>Carlos Mendoza (DNI: 47891234)</strong></div>
                      <div>Acta de Entrega: <strong>ACTA-2026-041 (Firmada)</strong></div>
                      <div>Condición Física: <strong>Excelente / Operativo</strong></div>
                      <div>Último Inventario: <strong>15/09/2026 (Auditado)</strong></div>
                    </div>
                  </div>
                )}
                {fichaPestanaActiva === "especificaciones" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                    <div>Hostname: <strong>PC-CMENDOZA-01.corp.local</strong></div>
                    <div>Procesador: <strong>Intel Core i7-1365U vPro</strong></div>
                    <div>Memoria RAM: <strong>32 GB DDR5 5200MHz</strong></div>
                    <div>Almacenamiento: <strong>1 TB NVMe SSD SED (Cifrado)</strong></div>
                    <div>Dirección MAC: <strong>00:1A:2B:3C:4D:5E</strong></div>
                    <div>Dirección IPv4: <strong>10.20.4.155 (DHCP Corp)</strong></div>
                  </div>
                )}
                {fichaPestanaActiva !== "general" && fichaPestanaActiva !== "especificaciones" && (
                  <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 12, backgroundColor: "#f8fafc", borderRadius: 6 }}>
                    Registro histórico y trazabilidad de la pestaña <strong>{fichaPestanaActiva}</strong> sincronizado con el modelo de datos ITIL v4.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Vista de Ticket Creado */
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #cbd5e1",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
                maxWidth: 940,
                margin: "0 auto",
              }}
            >
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
                      #TICKET-2026-0042
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: prioridadObj.bg,
                        color: prioridadObj.color,
                      }}
                    >
                      {prioridadObj.codigo} - {prioridadObj.nombre}
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
                    Estado: En Gestión Activa
                  </span>
                </div>
                <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>
                  Intervención y Diagnóstico Institucional ITIL v4
                </h3>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Registrado el día de hoy por Especialista TI · Categoría: Infraestructura y Redes
                </div>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 8 }}>
                    Resumen de Campos Registrados
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12 }}>
                    <div><span style={{ color: "#64748b" }}>Prioridad Asignada:</span> <strong>{prioridadObj.nombre}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Flujo Normativo:</span> <strong>ITIL 4 / ISO 20000</strong></div>
                    <div><span style={{ color: "#64748b" }}>Urgencia Operativa:</span> <strong>Nivel {urgencia}</strong></div>
                    <div><span style={{ color: "#64748b" }}>Impacto Organizacional:</span> <strong>Nivel {impacto}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: "#ffffff",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
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
    </div>
  );
};
