"use client";

import React, { useState } from "react";

export interface PestanaElemento {
  id: string;
  nombre: string;
  visible: boolean;
  fijo: boolean;
  orden: number;
  visible_desde: string;
  editable_en: string[];
  permite_pdf?: boolean;
  permite_texto?: boolean;
  modo_entrega?: "texto" | "pdf" | "ambos";
}

export interface CampoTicketElemento {
  id: string;
  etiqueta: string;
  tipo: string;
  modo_entrega?: "texto" | "pdf" | "ambos";
  obligatorio: "si" | "no" | "segun_tipo";
  etapa: "planificacion" | "aprobacion" | "ejecucion" | "pir";
  visible: boolean;
  ayuda?: string;
}

export interface BotonAccionTicket {
  id: string;
  etiqueta: string;
  visible: boolean;
  color: string;
  confirmar?: boolean;
  rol_requerido?: string;
  exige_catalogo?: string;
  descripcion: string;
}

interface PestanaVistaTicketProps {
  config: {
    pestanas: PestanaElemento[];
    campos_ticket?: CampoTicketElemento[];
    botones_accion?: BotonAccionTicket[];
  };
  onChangeConfig: (nuevaConfig: any) => void;
  seccionesFormulario?: any[];
  tipoCambio?: "NORMAL" | "EMERGENCIA" | "ESTANDAR";
}

const CAMPOS_TICKET_DEFECTO: CampoTicketElemento[] = [
  { id: "plan_implementacion", etiqueta: "Plan detallado de implementación paso a paso", tipo: "area_enriquecida", modo_entrega: "ambos", obligatorio: "si", etapa: "planificacion", visible: true, ayuda: "Permite carga en texto enriquecido o documento PDF técnico." },
  { id: "plan_rollback", etiqueta: "Plan de rollback (Marcha atrás / Reversión)", tipo: "area_enriquecida", modo_entrega: "ambos", obligatorio: "si", etapa: "planificacion", visible: true, ayuda: "Procedimiento de retorno seguro ante contingencias." },
  { id: "punto_no_retorno", etiqueta: "Punto de no retorno (Forward-Fix Boundary)", tipo: "texto", obligatorio: "si", etapa: "planificacion", visible: true, ayuda: "Hito temporal tras el cual no es viable revertir." },
  { id: "plan_pruebas", etiqueta: "Plan de pruebas y validación post-cambio", tipo: "area_enriquecida", obligatorio: "si", etapa: "planificacion", visible: true, ayuda: "Validaciones y pruebas funcionales de aceptación." },
  { id: "criterios_exito", etiqueta: "Criterios de éxito y aceptación", tipo: "area_enriquecida", obligatorio: "si", etapa: "planificacion", visible: true, ayuda: "Métricas cuantitativas verificables para el comité." },
  { id: "grupo_implementador_id", etiqueta: "Grupo implementador asignado", tipo: "selector_grupo", obligatorio: "si", etapa: "planificacion", visible: true, ayuda: "Equipo técnico asignado para la ejecución." },
  { id: "implementador_id", etiqueta: "Especialista técnico responsable", tipo: "selector_tecnico", obligatorio: "segun_tipo", etapa: "planificacion", visible: true, ayuda: "Ingeniero especialista responsable de la intervención." },
  { id: "causa_raiz_tecnica", etiqueta: "Causa raíz técnica de la falla (Ficha PIR)", tipo: "area_enriquecida", obligatorio: "si", etapa: "pir", visible: true, ayuda: "Análisis técnico de origen (5 Porqués / Ishikawa)." },
  { id: "tiempo_downtime_real", etiqueta: "Tiempo real de indisponibilidad (minutos)", tipo: "numero", obligatorio: "si", etapa: "pir", visible: true, ayuda: "Minutos de caída real del servicio durante la ventana." },
  { id: "incidente_colateral", etiqueta: "¿Provocó incidentes secundarios no deseados?", tipo: "booleano", obligatorio: "si", etapa: "pir", visible: true, ayuda: "Indica si generó fallas adicionales." },
  { id: "lecciones_aprendidas", etiqueta: "Lecciones aprendidas y mejoras de prevención", tipo: "area_enriquecida", obligatorio: "si", etapa: "pir", visible: true, ayuda: "Acciones para prevenir recurrencia." },
];

const BOTONES_ACCION_DEFECTO: BotonAccionTicket[] = [
  { id: "aprobar_cab", etiqueta: "Aprobar CAB", visible: true, rol_requerido: "Comité CAB / Gestor de Cambios", color: "#16a34a", confirmar: true, descripcion: "Emite dictamen favorable en la evaluación técnica." },
  { id: "rechazar_cab", etiqueta: "Rechazar RFC", visible: true, exige_catalogo: "Motivos de Rechazo", color: "#dc2626", confirmar: true, descripcion: "Rechaza el cambio exigiendo seleccionar un motivo del catálogo." },
  { id: "solicitar_info", etiqueta: "Solicitar Aclaración", visible: true, color: "#d97706", confirmar: false, descripcion: "Devuelve el cambio para que el especialista aclare observaciones." },
  { id: "iniciar_ejecucion", etiqueta: "Iniciar Ejecución", visible: true, color: "#2563eb", confirmar: true, descripcion: "Marca el inicio formal de la ventana de trabajo en caliente." },
  { id: "ejecutar_rollback", etiqueta: "Ejecutar Rollback", visible: true, color: "#b91c1c", confirmar: true, descripcion: "Activa el procedimiento de emergencia para abortar la intervención." },
  { id: "registrar_pir", etiqueta: "Registrar Post-Mortem (PIR)", visible: true, color: "#9333ea", confirmar: false, descripcion: "Abre la ficha de revisión post-implementación para documentar resultados." },
  { id: "cerrar_rfc", etiqueta: "Cerrar RFC", visible: true, exige_catalogo: "Códigos de Cierre", color: "#0f172a", confirmar: true, descripcion: "Cierre definitivo del ticket con código institucional." },
];

export const PestanaVistaTicket: React.FC<PestanaVistaTicketProps> = ({
  config,
  onChangeConfig,
  tipoCambio = "NORMAL",
}) => {
  const [subpestanaActiva, setSubpestanaActiva] = useState<"campos" | "pestanas" | "botones">("campos");

  const pestanas = config.pestanas || [];
  const camposTicket = config.campos_ticket && config.campos_ticket.length > 0 ? config.campos_ticket : CAMPOS_TICKET_DEFECTO;
  const botonesAccion = config.botones_accion && config.botones_accion.length > 0 ? config.botones_accion : BOTONES_ACCION_DEFECTO;

  // Filtrado de campos técnicos según el tipo de cambio activo
  const camposFiltradosPorTipo = camposTicket.filter((c) => {
    if (tipoCambio === "EMERGENCIA") {
      // En emergencia solo aplican planes inmediatos y PIR post-mortem
      return ["plan_implementacion", "plan_rollback", "causa_raiz_tecnica", "tiempo_downtime_real", "incidente_colateral", "lecciones_aprendidas"].includes(c.id);
    }
    if (tipoCambio === "ESTANDAR") {
      // En estándar el procedimiento ya está homologado; solo aplican criterios de ejecución
      return ["criterios_exito", "implementador_id"].includes(c.id);
    }
    return true; // NORMAL: muestra todos los campos técnicos adicionales
  });

  const alternarVisiblePestana = (id: string) => {
    const nuevas = pestanas.map((p) => (p.id === id && !p.fijo ? { ...p, visible: !p.visible } : p));
    onChangeConfig({ ...config, pestanas: nuevas, campos_ticket: camposTicket, botones_accion: botonesAccion });
  };

  const cambiarModoEntregaPestana = (id: string, nuevoModo: "texto" | "pdf" | "ambos") => {
    const nuevas = pestanas.map((p) => {
      if (p.id !== id) return p;
      return {
        ...p,
        modo_entrega: nuevoModo,
        permite_texto: nuevoModo === "texto" || nuevoModo === "ambos",
        permite_pdf: nuevoModo === "pdf" || nuevoModo === "ambos",
      };
    });
    onChangeConfig({ ...config, pestanas: nuevas, campos_ticket: camposTicket, botones_accion: botonesAccion });
  };

  const actualizarCampoTicket = (id: string, patch: Partial<CampoTicketElemento>) => {
    const nuevos = camposTicket.map((c) => (c.id === id ? { ...c, ...patch } : c));
    onChangeConfig({ ...config, pestanas, campos_ticket: nuevos, botones_accion: botonesAccion });
  };

  const alternarBotonAccion = (id: string) => {
    const nuevos = botonesAccion.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b));
    onChangeConfig({ ...config, pestanas, campos_ticket: camposTicket, botones_accion: nuevos });
  };

  const actualizarBotonAccion = (id: string, patch: Partial<BotonAccionTicket>) => {
    const nuevos = botonesAccion.map((b) => (b.id === id ? { ...b, ...patch } : b));
    onChangeConfig({ ...config, pestanas, campos_ticket: camposTicket, botones_accion: nuevos });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Selector de Configuración del Ticket (Sin bloques 1 ni 2) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "12px 16px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
            Configuración del Ticket RFC ({tipoCambio})
          </span>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "2px 0 0 0" }}>
            Información Técnica a Agregar y Botones
          </h3>
        </div>

        <div style={{ display: "flex", gap: 4, backgroundColor: "#f1f5f9", padding: 3, borderRadius: 8 }}>
          <button
            type="button"
            onClick={() => setSubpestanaActiva("campos")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              border: "none",
              backgroundColor: subpestanaActiva === "campos" ? "#ffffff" : "transparent",
              color: subpestanaActiva === "campos" ? "#2563eb" : "#64748b",
              fontWeight: subpestanaActiva === "campos" ? 700 : 500,
              boxShadow: subpestanaActiva === "campos" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            📝 Campos Técnicos Adicionales
          </button>
          <button
            type="button"
            onClick={() => setSubpestanaActiva("pestanas")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              border: "none",
              backgroundColor: subpestanaActiva === "pestanas" ? "#ffffff" : "transparent",
              color: subpestanaActiva === "pestanas" ? "#2563eb" : "#64748b",
              fontWeight: subpestanaActiva === "pestanas" ? 700 : 500,
              boxShadow: subpestanaActiva === "pestanas" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            📑 Pestañas del Ticket ({pestanas.filter((p) => p.visible).length})
          </button>
          <button
            type="button"
            onClick={() => setSubpestanaActiva("botones")}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
              border: "none",
              backgroundColor: subpestanaActiva === "botones" ? "#ffffff" : "transparent",
              color: subpestanaActiva === "botones" ? "#2563eb" : "#64748b",
              fontWeight: subpestanaActiva === "botones" ? 700 : 500,
              boxShadow: subpestanaActiva === "botones" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
            }}
          >
            🔘 Botones de Acción ({botonesAccion.filter((b) => b.visible).length})
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. CAMPOS TÉCNICOS ADICIONALES A COMPLETAR EN EL TICKET  */}
      {/* ======================================================== */}
      {subpestanaActiva === "campos" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Campos y Entregables Técnicos que se Agregan en el Ticket
            </h4>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
              Define los entregables técnicos que los ingenieros cargan tras el alta (planes paso a paso, reversa en <strong>texto o PDF</strong>, pruebas y ficha post-mortem PIR).
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {camposFiltradosPorTipo.map((campo) => {
              const tieneFormatoEntrega = campo.id === "plan_implementacion" || campo.id === "plan_rollback";
              return (
                <div
                  key={campo.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    backgroundColor: campo.visible ? "#ffffff" : "#f8fafc",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: campo.visible ? "#1e293b" : "#94a3b8" }}>
                        {campo.etiqueta}
                      </span>
                      <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, backgroundColor: "#eff6ff", color: "#1d4ed8", fontWeight: 700, textTransform: "uppercase" }}>
                        {campo.etapa}
                      </span>
                    </div>
                    {campo.ayuda && (
                      <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2 }}>
                        {campo.ayuda}
                      </span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {/* Formato de Entrega (Texto / PDF / Ambos) */}
                    {tieneFormatoEntrega && (
                      <select
                        className="input-base"
                        value={campo.modo_entrega || "ambos"}
                        onChange={(e) => actualizarCampoTicket(campo.id, { modo_entrega: e.target.value as any })}
                        style={{ fontSize: 11, padding: "3px 6px", width: 140 }}
                      >
                        <option value="ambos">📄 Ambos (Texto + PDF)</option>
                        <option value="pdf">📎 Solo PDF Adjunto</option>
                        <option value="texto">✏️ Solo Texto</option>
                      </select>
                    )}

                    {/* Obligatoriedad */}
                    <select
                      className="input-base"
                      value={campo.obligatorio}
                      onChange={(e) => actualizarCampoTicket(campo.id, { obligatorio: e.target.value as any })}
                      style={{ fontSize: 11, padding: "3px 6px", width: 115 }}
                    >
                      <option value="si">Obligatorio</option>
                      <option value="segun_tipo">Según Tipo</option>
                      <option value="no">Opcional</option>
                    </select>

                    {/* Botón Visibilidad */}
                    <button
                      type="button"
                      onClick={() => actualizarCampoTicket(campo.id, { visible: !campo.visible })}
                      className="boton-accion-icono"
                      style={{
                        width: 28,
                        height: 28,
                        color: campo.visible ? "#16a34a" : "#94a3b8",
                        borderColor: campo.visible ? "#bbf7d0" : "#e2e8f0",
                        backgroundColor: campo.visible ? "#f0fdf4" : "#f8fafc",
                      }}
                      title={campo.visible ? "Campo visible en el ticket" : "Campo oculto"}
                    >
                      {campo.visible ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. PESTAÑAS OPERATIVAS DEL CICLO DE VIDA DEL TICKET      */}
      {/* ======================================================== */}
      {subpestanaActiva === "pestanas" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Pestañas de Gestión Operativa del Ticket
            </h4>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
              Organizan los procesos de gobernanza, dictamen CAB, monitoreo de ejecución y auditoría histórica.
            </p>
          </div>

          <div className="contenedor-tabla">
            <table className="tabla" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ width: 35, textAlign: "center", padding: "8px 10px", fontSize: 11, color: "#64748b" }}>#</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "#64748b" }}>Pestaña del Ticket</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "#64748b" }}>Formato de Entrega</th>
                  <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, color: "#64748b" }}>Visible Desde</th>
                  <th style={{ textAlign: "center", width: 80, padding: "8px 10px", fontSize: 11, color: "#64748b" }}>Estado</th>
                  <th style={{ textAlign: "center", width: 80, padding: "8px 10px", fontSize: 11, color: "#64748b" }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pestanas.map((p) => {
                  const tieneFormatoEntrega = p.id === "planificacion" || p.id === "pir";
                  const modoActual = p.modo_entrega || "ambos";

                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#64748b", padding: "8px" }}>
                        {p.orden}
                      </td>
                      <td style={{ padding: "8px 10px" }}>
                        <span style={{ fontWeight: 600, color: "#1e293b", fontSize: 12 }}>
                          {p.nombre}
                        </span>
                        {p.fijo && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: "#d97706", fontWeight: 700 }}>
                            🔒 [Fijo]
                          </span>
                        )}
                        <span style={{ display: "block", fontSize: 10.5, color: "#64748b", marginTop: 1 }}>
                          {p.id === "planificacion"
                            ? "Planes técnicos, rollback, forward-fix y pruebas"
                            : p.id === "aprobaciones"
                            ? "Quórum CAB, votaciones individuales y actas"
                            : p.id === "ejecucion"
                            ? "Monitoreo en caliente, telemetría y rollback"
                            : p.id === "pir"
                            ? "Downtime real, causa raíz y lecciones aprendidas"
                            : "Historial inmutable de auditoría"}
                        </span>
                      </td>

                      <td style={{ padding: "8px 10px" }}>
                        {tieneFormatoEntrega ? (
                          <select
                            value={modoActual}
                            onChange={(e) => cambiarModoEntregaPestana(p.id, e.target.value as any)}
                            style={{
                              fontSize: 11,
                              padding: "3px 6px",
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              color: "#0f172a",
                              fontWeight: 600,
                            }}
                          >
                            <option value="ambos">📄 Ambos (Texto + PDF)</option>
                            <option value="pdf">📎 Solo Documento PDF</option>
                            <option value="texto">✏️ Solo Texto</option>
                          </select>
                        ) : (
                          <span style={{ fontSize: 11, color: "#64748b" }}>Interactivo</span>
                        )}
                      </td>

                      <td style={{ padding: "8px 10px", fontSize: 11, color: "#2563eb", fontWeight: 600, textTransform: "capitalize" }}>
                        {p.visible_desde.replace("_", " ")}
                      </td>

                      <td style={{ textAlign: "center", padding: "8px" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 6px",
                            borderRadius: 4,
                            backgroundColor: p.visible ? "#dcfce7" : "#f1f5f9",
                            color: p.visible ? "#166534" : "#64748b",
                            fontWeight: 700,
                            fontSize: 10,
                            border: `1px solid ${p.visible ? "#86efac" : "#cbd5e1"}`,
                          }}
                        >
                          {p.visible ? "Visible" : "Oculta"}
                        </span>
                      </td>

                      <td style={{ textAlign: "center", padding: "8px" }}>
                        {!p.fijo ? (
                          <button
                            type="button"
                            onClick={() => alternarVisiblePestana(p.id)}
                            style={{
                              padding: "3px 8px",
                              fontSize: 10.5,
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              color: p.visible ? "#dc2626" : "#2563eb",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            {p.visible ? "Ocultar" : "Mostrar"}
                          </button>
                        ) : (
                          <span style={{ fontSize: 10.5, color: "#94a3b8" }}>Inmutable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BOTONES DE ACCIÓN OPERATIVA DEL TICKET                */}
      {/* ======================================================== */}
      {subpestanaActiva === "botones" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Botones de Acción Operativa del Ticket
            </h4>
            <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
              Configura los botones de acción disponibles en la cabecera del ticket para técnicos, gestores y comités.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {botonesAccion.map((btn) => (
              <div
                key={btn.id}
                style={{
                  padding: "10px 14px",
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  backgroundColor: btn.visible ? "#ffffff" : "#f8fafc",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: btn.color || "#2563eb",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong style={{ fontSize: 12.5, color: "#0f172a" }}>{btn.etiqueta}</strong>
                      {btn.rol_requerido && (
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1" }}>
                          Rol: {btn.rol_requerido}
                        </span>
                      )}
                      {btn.exige_catalogo && (
                        <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
                          Exige: {btn.exige_catalogo}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2 }}>
                      {btn.descripcion}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <input
                    type="text"
                    value={btn.etiqueta}
                    onChange={(e) => actualizarBotonAccion(btn.id, { etiqueta: e.target.value })}
                    style={{ width: 140, padding: "4px 8px", fontSize: 11, borderRadius: 4, border: "1px solid #cbd5e1" }}
                    placeholder="Etiqueta del botón"
                  />

                  <button
                    type="button"
                    onClick={() => alternarBotonAccion(btn.id)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${btn.visible ? "#86efac" : "#cbd5e1"}`,
                      backgroundColor: btn.visible ? "#dcfce7" : "#f1f5f9",
                      color: btn.visible ? "#166534" : "#64748b",
                    }}
                  >
                    {btn.visible ? "Habilitado" : "Deshabilitado"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
