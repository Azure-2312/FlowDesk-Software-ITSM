"use client";

import React, { useState, useMemo } from "react";

export interface ModalVistaPreviaProps {
  abierto?: boolean;
  secciones?: any[];
  onCerrar?: () => void;
  modoEmbebido?: boolean;
  tipoCambioProp?: "NORMAL" | "ESTANDAR" | "EMERGENCIA";
  subfaseProp?: string;
  onTipoCambioChange?: (tipo: "NORMAL" | "ESTANDAR" | "EMERGENCIA") => void;
}

const PRIORIDADES_CAMBIO = [
  { nivel: 1, codigo: "P1", nombre: "P1 - Crítica", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  { nivel: 2, codigo: "P2", nombre: "P2 - Alta", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  { nivel: 3, codigo: "P3", nombre: "P3 - Media", color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  { nivel: 4, codigo: "P4", nombre: "P4 - Baja", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
];

// Preguntas interactivas estándar del Cuestionario de Riesgo Ponderado (ITIL 4)
const PREGUNTAS_RIESGO_ITIL = [
  {
    id: "p1",
    titulo: "1. Redundancia del Servicio y Alta Disponibilidad",
    opciones: [
      { id: "p1_1", texto: "Sin redundancia activa (corte directo a usuarios si falla)", puntos: 4 },
      { id: "p1_2", texto: "Redundancia pasiva / conmutación manual (degradación momentánea)", puntos: 2 },
      { id: "p1_3", texto: "Clúster activo-activo con conmutación transparente sin corte", puntos: 0 },
    ],
  },
  {
    id: "p2",
    titulo: "2. Impacto en Ingresos y Transacciones Críticas",
    opciones: [
      { id: "p2_1", texto: "Afecta pasarela de pagos, facturación o canales de venta", puntos: 4 },
      { id: "p2_2", texto: "Afecta procesos de soporte interno o back-office secundario", puntos: 2 },
      { id: "p2_3", texto: "Sin afectación de transacciones ni canales comerciales", puntos: 0 },
    ],
  },
  {
    id: "p3",
    titulo: "3. Madurez y Validación del Plan de Rollback",
    opciones: [
      { id: "p3_1", texto: "Procedimiento de reversa no probado en laboratorio o inviable", puntos: 3 },
      { id: "p3_2", texto: "Plan de marcha atrás validado exitosamente en Staging", puntos: 1 },
      { id: "p3_3", texto: "Rollback automatizado vía script certificado por DevOps", puntos: 0 },
    ],
  },
  {
    id: "p4",
    titulo: "4. Complejidad Técnica e Interdependencias CMDB",
    opciones: [
      { id: "p4_1", texto: "Alta: múltiples CIs heterogéneos, vendors y esquemas de BD", puntos: 3 },
      { id: "p4_2", texto: "Media: componentes estándar con dependencias acotadas", puntos: 2 },
      { id: "p4_3", texto: "Baja: cambio modular aislado sin dependencias cruzadas", puntos: 1 },
    ],
  },
];

export const ModalVistaPrevia: React.FC<ModalVistaPreviaProps> = ({
  abierto = true,
  secciones = [],
  onCerrar,
  modoEmbebido = false,
  tipoCambioProp,
  onTipoCambioChange,
}) => {
  const [tipoCambio, setTipoCambio] = useState<"NORMAL" | "ESTANDAR" | "EMERGENCIA">(tipoCambioProp || "NORMAL");
  const [impacto, setImpacto] = useState<number>(2);
  const [urgencia, setUrgencia] = useState<number>(2);

  // Estado del Cuestionario Interactivo de Riesgo
  const [respuestasRiesgo, setRespuestasRiesgo] = useState<Record<string, number>>({
    p1: 4,
    p2: 2,
    p3: 1,
    p4: 2,
  });
  const [cuestionarioExpandido, setCuestionarioExpandido] = useState<boolean>(true);

  // Lista interactiva de activos CMDB afectados
  const [activosAfectados, setActivosAfectados] = useState<string[]>([
    "SW-CORE-CISCO-9300 (Switch Capa 3 Principal)",
  ]);
  const [activoParaAgregar, setActivoParaAgregar] = useState<string>("SRV-DB-PROD-01 (Cluster PostgreSQL)");

  // Fechas de ventana de mantenimiento
  const [fechaInicio, setFechaInicio] = useState("2026-10-24 23:00");
  const [fechaFin, setFechaFin] = useState("2026-10-25 03:00");
  const datePickerInicioRef = React.useRef<HTMLInputElement>(null);
  const datePickerFinRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (tipoCambioProp) {
      setTipoCambio(tipoCambioProp);
    }
  }, [tipoCambioProp]);

  if (!abierto) return null;

  const handleCambioTipo = (nuevoTipo: "NORMAL" | "ESTANDAR" | "EMERGENCIA") => {
    setTipoCambio(nuevoTipo);
    if (onTipoCambioChange) {
      onTipoCambioChange(nuevoTipo);
    }
  };

  const handleAgregarActivo = () => {
    if (activoParaAgregar && !activosAfectados.includes(activoParaAgregar)) {
      setActivosAfectados([...activosAfectados, activoParaAgregar]);
    }
  };

  const handleRemoverActivo = (activo: string) => {
    if (activosAfectados.length > 1) {
      setActivosAfectados(activosAfectados.filter((a) => a !== activo));
    }
  };

  // Cálculo del puntaje total de riesgo
  const puntajeTotalRiesgo = Object.values(respuestasRiesgo).reduce((a, b) => a + b, 0);

  const resolverNivelRiesgo = (puntaje: number) => {
    if (tipoCambio === "EMERGENCIA") {
      return { nivel: "Crítico (Crisis P1)", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5", recomendacion: "Comité de Emergencia ECAB Mandatorio" };
    }
    if (tipoCambio === "ESTANDAR") {
      return { nivel: "Bajo (Pre-Aprobado)", color: "#15803d", bg: "#dcfce7", border: "#86efac", recomendacion: "Aprobación Delegada por Catálogo" };
    }
    if (puntaje >= 11) {
      return { nivel: "Crítico", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5", recomendacion: "Requiere Quórum Pleno del Comité CAB y Director TI" };
    }
    if (puntaje >= 8) {
      return { nivel: "Alto", color: "#c2410c", bg: "#ffedd5", border: "#fed7aa", recomendacion: "Requiere Evaluación Formal del Comité CAB" };
    }
    if (puntaje >= 4) {
      return { nivel: "Medio", color: "#854d0e", bg: "#fef9c3", border: "#fde047", recomendacion: "Aprobación por Gestor de Cambios y Líder Técnico" };
    }
    return { nivel: "Bajo", color: "#15803d", bg: "#dcfce7", border: "#86efac", recomendacion: "Aprobación Delegada por Gestor de Cambios" };
  };

  const infoRiesgo = resolverNivelRiesgo(puntajeTotalRiesgo);

  // Mapa matricial de prioridad (Impacto × Urgencia) O(1)
  const MATRIZ_PRIORIDAD_CAMBIO: Record<string, typeof PRIORIDADES_CAMBIO[number]> = {
    "3-3": PRIORIDADES_CAMBIO[0], // P1
    "3-2": PRIORIDADES_CAMBIO[1], // P2
    "2-3": PRIORIDADES_CAMBIO[1], // P2
    "2-2": PRIORIDADES_CAMBIO[2], // P3
    "3-1": PRIORIDADES_CAMBIO[2], // P3
    "1-3": PRIORIDADES_CAMBIO[2], // P3
  };

  function calcularPrioridad(imp: number, urg: number) {
    if (tipoCambio === "EMERGENCIA") return PRIORIDADES_CAMBIO[0];
    return MATRIZ_PRIORIDAD_CAMBIO[`${imp}-${urg}`] || PRIORIDADES_CAMBIO[3];
  }

  const prioridadCalculada = calcularPrioridad(impacto, urgencia);

  // Mapa memorizado de campos indexados por código para acceso O(1)
  const mapaCampos = useMemo(() => {
    const mapa = new Map<string, any>();
    if (Array.isArray(secciones)) {
      for (const sec of secciones) {
        if (Array.isArray(sec.campos)) {
          for (const c of sec.campos) {
            if (c?.codigo) mapa.set(c.codigo, c);
          }
        }
      }
    }
    return mapa;
  }, [secciones]);

  const obtenerCampo = (codigo: string) => mapaCampos.get(codigo) || null;

  const esVisible = (codigo: string, defaultVisible = true) => {
    if (!secciones || secciones.length === 0) return defaultVisible;
    const c = obtenerCampo(codigo);
    if (!c) return false;
    return c.visible !== false;
  };

  const obtenerEtiqueta = (codigo: string, defaultEtiqueta: string) => {
    const c = obtenerCampo(codigo);
    return c?.etiqueta || defaultEtiqueta;
  };

  const esObligatorio = (codigo: string, defaultObligatorio = true) => {
    const c = obtenerCampo(codigo);
    if (!c) return defaultObligatorio;
    return c.obligatorio === "si";
  };

  const renderCamposPersonalizadosDeSeccion = (seccionId: string) => {
    if (!secciones || !Array.isArray(secciones)) return null;
    const sec = secciones.find((s: any) => s.id === seccionId);
    if (!sec || !Array.isArray(sec.campos)) return null;

    const personalizados = sec.campos.filter(
      (c: any) =>
        (c.es_personalizado || c.codigo?.startsWith("cf_")) &&
        c.visible !== false &&
        (!c.tipo_cambio_aplicable || c.tipo_cambio_aplicable === "TODOS" || c.tipo_cambio_aplicable === tipoCambio)
    );

    if (personalizados.length === 0) return null;

    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {personalizados.map((c: any) => (
          <div key={c.codigo}>
            <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
              {c.etiqueta} {c.obligatorio === "si" ? "*" : ""}{" "}
              <span style={{ fontSize: 9.5, color: "#64748b", fontWeight: 500 }}>(Personalizado)</span>
            </label>
            {c.tipo === "booleano" ? (
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer", marginTop: 6 }}>
                <input type="checkbox" defaultChecked />
                <span>Habilitar / Confirmar este requerimiento</span>
              </label>
            ) : c.tipo === "selector_simple" ? (
              <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                <option>Opción estándar preseleccionada</option>
              </select>
            ) : (
              <input
                type={c.tipo === "numero" ? "number" : "text"}
                disabled
                defaultValue={c.placeholder || `Valor de ejemplo para ${c.etiqueta}`}
                style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
              />
            )}
            {c.ayuda && <span style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, display: "block" }}>{c.ayuda}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: modoEmbebido ? "100%" : "auto",
        backgroundColor: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #cbd5e1",
        overflow: "hidden",
      }}
    >
      {/* Barra Superior con Selector de Tipo de Cambio */}
      <div
        style={{
          padding: "10px 16px",
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
            👁️ VISTA PREVIA DEL FORMULARIO
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>· Solicitud RFC</span>
        </div>

        {/* Selector de Tipo de Cambio para simular en tiempo real */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>Tipo de Cambio:</span>
          <div style={{ display: "flex", gap: 2, backgroundColor: "#e2e8f0", padding: 2, borderRadius: 6 }}>
            {(["NORMAL", "EMERGENCIA", "ESTANDAR"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleCambioTipo(t)}
                style={{
                  fontSize: 10.5,
                  padding: "3px 9px",
                  borderRadius: 4,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: tipoCambio === t ? "#ffffff" : "transparent",
                  color: tipoCambio === t ? "#0f172a" : "#64748b",
                  fontWeight: tipoCambio === t ? 700 : 500,
                  boxShadow: tipoCambio === t ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {!modoEmbebido && onCerrar && (
            <button
              type="button"
              onClick={onCerrar}
              className="boton-accion-icono"
              title="Cerrar vista previa"
              aria-label="Cerrar vista previa"
              style={{ marginLeft: 8 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Contenedor del Formulario Simulado */}
      <div style={{ padding: 16, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          {/* Encabezado del Formulario según Tipo de Cambio */}
          <div
            style={{
              backgroundColor: "#0f172a",
              color: "#ffffff",
              padding: "12px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>
                {tipoCambio === "NORMAL"
                  ? "Formulario de Solicitud de Cambio Normal (Alta RFC)"
                  : tipoCambio === "EMERGENCIA"
                  ? "Solicitud de Urgencia en Crisis (Intervención P1 Mandatoria)"
                  : "Formulario de Despliegue de Cambio Estándar (Pre-Aprobado)"}
              </h4>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>
                {tipoCambio === "NORMAL"
                  ? "Flujo completo ITIL v4: Identificación, Justificación, CMDB, Cuestionario de Riesgo y Ventana"
                  : tipoCambio === "EMERGENCIA"
                  ? "Flujo acelerado ECAB: Enlace a Incidente Mayor, Justificación de Crisis y Mitigación Inmediata"
                  : "Flujo homologado: Basado en modelo institucional pre-aprobado sin sesión deliberativa"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: tipoCambio === "ESTANDAR" ? "#14532d" : tipoCambio === "EMERGENCIA" ? "#7f1d1d" : "#1e3a8a",
                  color: tipoCambio === "ESTANDAR" ? "#bbf7d0" : tipoCambio === "EMERGENCIA" ? "#fecaca" : "#bfdbfe",
                }}
              >
                {tipoCambio}
              </span>
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: prioridadCalculada.bg,
                  color: prioridadCalculada.color,
                }}
              >
                {prioridadCalculada.codigo}
              </span>
            </div>
          </div>

          {/* Cuerpo del Formulario */}
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* ======================================================== */}
            {/* TIPO: CAMBIO NORMAL                                      */}
            {/* ======================================================== */}
            {tipoCambio === "NORMAL" && (
              <>
                {/* SECCIÓN A: IDENTIFICACIÓN GENERAL */}
                {esVisible("titulo") && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      {obtenerEtiqueta("titulo", "Título del Cambio")} {esObligatorio("titulo") ? "*" : ""}
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue="Actualización del Firmware Switch Core Datacenter Sede Central"
                      style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                    />
                  </div>
                )}

                {(esVisible("categoria_id") || esVisible("origen")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {esVisible("categoria_id") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("categoria_id", "Categoría del Cambio")} {esObligatorio("categoria_id") ? "*" : ""}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Redes y Comunicaciones &gt; Conmutadores Core (Cisco / Juniper)</option>
                        </select>
                      </div>
                    )}
                    {esVisible("origen") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("origen", "Origen del Cambio")} {esObligatorio("origen") ? "*" : ""}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Gestión de Problemas (#PRB-2026-0042)</option>
                          <option>Mantenimiento Preventivo</option>
                          <option>Proyecto Estratégico TI</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {esVisible("ticket_origen") && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      {obtenerEtiqueta("ticket_origen", "Ticket de Origen Vinculado")} {esObligatorio("ticket_origen", false) ? "*" : ""}
                    </label>
                    <input
                      type="text"
                      disabled
                      defaultValue="#PRB-2026-0042 · Fuga recurrente de memoria en conmutadores de borde"
                      style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, color: "#0f172a" }}
                    />
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_a")}

                {/* SECCIÓN B: JUSTIFICACIÓN Y DESCRIPCIÓN */}
                {(esVisible("motivo") || esVisible("consecuencia_no_hacer")) && (
                  <div style={{ display: "grid", gridTemplateColumns: esVisible("motivo") && esVisible("consecuencia_no_hacer") ? "1fr 1fr" : "1fr", gap: 14 }}>
                    {esVisible("motivo") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("motivo", "Motivo / Justificación de Negocio")} {esObligatorio("motivo") ? "*" : ""}
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="El switch de capa 3 presenta saturación de memoria no paginada al alcanzar 850 sesiones concurrentes, provocando latencia."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("consecuencia_no_hacer") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("consecuencia_no_hacer", "Consecuencia de NO Realizar el Cambio (Riesgo por Inacción)")} {esObligatorio("consecuencia_no_hacer") ? "*" : ""}
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Reinicio espontáneo del nodo durante el cierre de mes contable, impactando operaciones en línea y facturación."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {(esVisible("descripcion") || esVisible("beneficio")) && (
                  <div style={{ display: "grid", gridTemplateColumns: esVisible("descripcion") && esVisible("beneficio") ? "1.2fr 0.8fr" : "1fr", gap: 14 }}>
                    {esVisible("descripcion") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("descripcion", "Descripción Técnica Detallada")} {esObligatorio("descripcion") ? "*" : ""}
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Actualización de Cisco IOS XE de versión 17.3.4 a 17.9.4a recomendada por fabricante con parche de seguridad CVE-2026-1184."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("beneficio") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("beneficio", "Beneficio Esperado")} {esObligatorio("beneficio", false) ? "*" : ""}
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Estabilidad 99.99% en conmutación de tráfico, soporte TLS 1.3 y mitigación de vulnerabilidad crítica."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_b")}

                {/* SECCIÓN C: ALCANCE Y ELEMENTOS CI (CMDB) */}
                {(esVisible("entorno") || esVisible("areas_afectadas") || esVisible("usuarios_afectados")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                    {esVisible("entorno") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("entorno", "Entorno Operativo")} {esObligatorio("entorno") ? "*" : ""}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Producción (Datacenter Sede Central)</option>
                          <option>Pre-producción / Staging</option>
                          <option>Desarrollo / Testing</option>
                        </select>
                      </div>
                    )}
                    {esVisible("areas_afectadas") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("areas_afectadas", "Áreas / Departamentos Afectados")} {esObligatorio("areas_afectadas", false) ? "*" : ""}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Finanzas, Ventas y Operaciones TI</option>
                          <option>Todas las Áreas Corporativas</option>
                        </select>
                      </div>
                    )}
                    {esVisible("usuarios_afectados") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("usuarios_afectados", "Usuarios Afectados Estimados")} {esObligatorio("usuarios_afectados", false) ? "*" : ""}
                        </label>
                        <input
                          type="number"
                          disabled
                          defaultValue="850"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {(esVisible("servicios") || esVisible("ci_afectados")) && (
                  <div style={{ display: "grid", gridTemplateColumns: esVisible("servicios") && esVisible("ci_afectados") ? "1fr 1fr" : "1fr", gap: 14 }}>
                    {esVisible("servicios") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("servicios", "Servicio(s) Primario(s) Afectado(s)")} {esObligatorio("servicios") ? "*" : ""}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>SRV-WAN-001 · Red Corporativa y Conectividad Datacenter</option>
                          <option>SRV-ERP-002 · Sistema de Gestión SAP S/4HANA</option>
                        </select>
                      </div>
                    )}
                    {esVisible("ci_afectados") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("ci_afectados", "Activos / CIs Afectados (CMDB)")} {esObligatorio("ci_afectados") ? "*" : ""} ({activosAfectados.length} asociados)
                        </label>
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <select
                            value={activoParaAgregar}
                            onChange={(e) => setActivoParaAgregar(e.target.value)}
                            style={{ flex: 1, padding: "5px 8px", fontSize: 11.5, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                          >
                            <option value="SRV-DB-PROD-01 (Cluster PostgreSQL)">SRV-DB-PROD-01 (Cluster PostgreSQL)</option>
                            <option value="FW-EDGE-FORTINET (Firewall Perimetral DMZ)">FW-EDGE-FORTINET (Firewall Perimetral DMZ)</option>
                            <option value="SW-DIST-PISO2 (Switch Capa 2 Distribución)">SW-DIST-PISO2 (Switch Capa 2 Distribución)</option>
                          </select>
                          <button
                            type="button"
                            onClick={handleAgregarActivo}
                            style={{ backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, padding: "5px 10px", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}
                          >
                            + Agregar
                          </button>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {activosAfectados.map((activo, idx) => (
                            <span key={idx} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, padding: "3px 8px", borderRadius: 6, backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", color: "#0f172a", fontWeight: 600 }}>
                              <span>🖥️ {activo}</span>
                              {activosAfectados.length > 1 && (
                                <button type="button" onClick={() => handleRemoverActivo(activo)} style={{ border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", fontWeight: 700, padding: 0 }}>✕</button>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_c")}

                {/* SECCIÓN D: EVALUACIÓN DE PRIORIDAD Y CUESTIONARIO INTERACTIVO DE RIESGO */}
                {(esVisible("impacto") || esVisible("urgencia") || esVisible("prioridad")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {esVisible("impacto") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("impacto", "Impacto en el Negocio")} {esObligatorio("impacto") ? "*" : ""}
                        </label>
                        <select
                          value={impacto}
                          onChange={(e) => setImpacto(Number(e.target.value))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        >
                          <option value={3}>Alto · Interrupción de servicio crítico</option>
                          <option value={2}>Medio · Afectación parcial con workaround</option>
                          <option value={1}>Bajo · Sin afectación a usuarios</option>
                        </select>
                      </div>
                    )}
                    {esVisible("urgencia") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("urgencia", "Urgencia Temporal")} {esObligatorio("urgencia") ? "*" : ""}
                        </label>
                        <select
                          value={urgencia}
                          onChange={(e) => setUrgencia(Number(e.target.value))}
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        >
                          <option value={3}>Alta · Requiere atención inmediata</option>
                          <option value={2}>Media · Ventana regular programada</option>
                          <option value={1}>Baja · Puede postergarse sin penalidad</option>
                        </select>
                      </div>
                    )}
                    {esVisible("prioridad") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("prioridad", "Prioridad Matricial")}
                        </label>
                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            backgroundColor: prioridadCalculada.bg,
                            border: `1px solid ${prioridadCalculada.border}`,
                            color: prioridadCalculada.color,
                            fontWeight: 700,
                            fontSize: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{prioridadCalculada.nombre}</span>
                          <span style={{ fontSize: 10.5, opacity: 0.8 }}>(Calculada)</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CUESTIONARIO DE RIESGO PONDERADO INTERACTIVO */}
                {esVisible("riesgo_respuestas") && (
                  <div
                    style={{
                      border: `1px solid ${infoRiesgo.border}`,
                      borderRadius: 8,
                      backgroundColor: "#ffffff",
                      overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Cabecera del Cuestionario con Resultado y Puntaje Dinámico */}
                    <div
                      style={{
                        padding: "12px 16px",
                        backgroundColor: "#f8fafc",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>
                            📋 {obtenerEtiqueta("riesgo_respuestas", "Cuestionario de Riesgo Ponderado")}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: 4,
                              backgroundColor: infoRiesgo.bg,
                              color: infoRiesgo.color,
                              border: `1px solid ${infoRiesgo.border}`,
                            }}
                          >
                            Riesgo: {infoRiesgo.nivel} ({puntajeTotalRiesgo} pts)
                          </span>
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2 }}>
                          Gobernanza resultante: <strong>{infoRiesgo.recomendacion}</strong>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCuestionarioExpandido(!cuestionarioExpandido)}
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: "#2563eb",
                          backgroundColor: "#eff6ff",
                          border: "1px solid #bfdbfe",
                          padding: "4px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        {cuestionarioExpandido ? "▲ Contraer preguntas" : "▼ Resolver cuestionario (Interactivo)"}
                      </button>
                    </div>

                    {/* Preguntas Interactivas con Radio Buttons */}
                    {cuestionarioExpandido && (
                      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12, backgroundColor: "#fafbfc" }}>
                        <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
                          Prueba respondiendo las preguntas en esta vista previa para comprobar cómo se recalcula el riesgo y el dictamen CAB en tiempo real:
                        </span>

                        {PREGUNTAS_RIESGO_ITIL.map((pregunta) => (
                          <div
                            key={pregunta.id}
                            style={{
                              padding: "10px 14px",
                              backgroundColor: "#ffffff",
                              borderRadius: 6,
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 6 }}>
                              {pregunta.titulo}
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {pregunta.opciones.map((opcion) => {
                                const seleccionada = respuestasRiesgo[pregunta.id] === opcion.puntos;
                                return (
                                  <label
                                    key={opcion.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 8,
                                      fontSize: 11.5,
                                      color: seleccionada ? "#0f172a" : "#475569",
                                      fontWeight: seleccionada ? 600 : 400,
                                      cursor: "pointer",
                                      padding: "3px 6px",
                                      borderRadius: 4,
                                      backgroundColor: seleccionada ? "#f0fdf4" : "transparent",
                                    }}
                                  >
                                    <input
                                      type="radio"
                                      name={pregunta.id}
                                      checked={seleccionada}
                                      onChange={() =>
                                        setRespuestasRiesgo((prev) => ({
                                          ...prev,
                                          [pregunta.id]: opcion.puntos,
                                        }))
                                      }
                                    />
                                    <span>{opcion.texto}</span>
                                    <span style={{ fontSize: 10, color: "#64748b", marginLeft: "auto", fontFamily: "monospace" }}>
                                      +{opcion.puntos} pts
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_d")}

                {/* SECCIÓN E: PROGRAMACIÓN Y VENTANA PROPUESTA */}
                {(esVisible("fecha_inicio") || esVisible("fecha_fin") || esVisible("requiere_interrupcion") || esVisible("duracion_interrupcion")) && (
                  <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                      🕒 Programación Propuesta de Ventana de Mantenimiento
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      {esVisible("fecha_inicio") && (
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                            {obtenerEtiqueta("fecha_inicio", "Inicio Propuesto de Ventana")} {esObligatorio("fecha_inicio") ? "*" : ""}
                          </label>
                          <input
                            type="text"
                            disabled
                            defaultValue="2026-10-24 23:00"
                            style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                          />
                        </div>
                      )}
                      {esVisible("fecha_fin") && (
                        <div>
                          <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                            {obtenerEtiqueta("fecha_fin", "Fin Propuesto de Ventana")} {esObligatorio("fecha_fin") ? "*" : ""}
                          </label>
                          <input
                            type="text"
                            disabled
                            defaultValue="2026-10-25 03:00"
                            style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                          />
                        </div>
                      )}
                    </div>
                    {(esVisible("requiere_interrupcion") || esVisible("duracion_interrupcion")) && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        {esVisible("requiere_interrupcion") && (
                          <div>
                            <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                              {obtenerEtiqueta("requiere_interrupcion", "¿Requiere Interrupción de Servicio?")}
                            </label>
                            <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                              <option>Sí (Interrupción parcial / conmutación de tráfico)</option>
                              <option>No (Sin afectación)</option>
                            </select>
                          </div>
                        )}
                        {esVisible("duracion_interrupcion") && (
                          <div>
                            <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                              {obtenerEtiqueta("duracion_interrupcion", "Duración Estimada de Interrupción")}
                            </label>
                            <input
                              type="text"
                              disabled
                              defaultValue="45 minutos"
                              style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_e")}

                {/* SECCIÓN H: EVIDENCIAS Y DOCUMENTACIÓN TÉCNICA */}
                {esVisible("adjuntos") && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      {obtenerEtiqueta("adjuntos", "Evidencias y Documentación Técnica")} {esObligatorio("adjuntos", false) ? "*" : ""}
                    </label>
                    <div style={{ border: "2px dashed #cbd5e1", borderRadius: 8, padding: 14, textAlign: "center", backgroundColor: "#f8fafc" }}>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>
                        📎 Arrastra diagramas de red, memorias técnicas o scripts de validación (máx. 25 MB)
                      </span>
                      <div style={{ marginTop: 8, display: "flex", justifyContent: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", padding: "3px 8px", borderRadius: 4 }}>
                          📄 Cisco_IOS_XE_ReleaseNotes_17.9.4a.pdf
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_h")}
              </>
            )}

            {/* ======================================================== */}
            {/* TIPO: CAMBIO DE EMERGENCIA                               */}
            {/* ======================================================== */}
            {tipoCambio === "EMERGENCIA" && (
              <>
                {/* SECCIÓN G: DATOS DE LA CRISIS Y AUTORIZACIÓN ECAB */}
                {(esVisible("ticket_emergencia") || esVisible("medio_autorizacion_emergencia")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {esVisible("ticket_emergencia") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#b91c1c", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("ticket_emergencia", "Incidente Mayor Crítico Motivador (#INC)")} *
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="#INC-2026-8901 · Caída total del Switch Core Datacenter Sede Norte"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontWeight: 600 }}
                        />
                      </div>
                    )}
                    {esVisible("medio_autorizacion_emergencia") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("medio_autorizacion_emergencia", "Medio de Autorización Inmediata (ECAB)")} *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Sesión en Sala de Crisis Virtual (Teams / Grabación)</option>
                          <option>Autorización 1-Clic de Director TI vía App</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {(esVisible("justificacion_emergencia") || esVisible("consecuencia_emergencia")) && (
                  <div style={{ display: "grid", gridTemplateColumns: esVisible("justificacion_emergencia") && esVisible("consecuencia_emergencia") ? "1fr 1fr" : "1fr", gap: 14 }}>
                    {esVisible("justificacion_emergencia") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("justificacion_emergencia", "Justificación de Emergencia / Causa de Urgencia")} *
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Interrupción total de la red afectando 850 colaboradores y pasarela de cobros en hora pico de operaciones."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("consecuencia_emergencia") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("consecuencia_emergencia", "Consecuencia de no actuar de inmediato")} *
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Pérdidas estimadas en $25,000 USD/hora y posible daño colateral en la integridad del almacenamiento SAN."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {renderCamposPersonalizadosDeSeccion("sec_g")}

                {/* SECCIÓN A: IDENTIFICACIÓN RESUMIDA */}
                {(esVisible("titulo") || esVisible("categoria_id")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 14 }}>
                    {esVisible("titulo") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("titulo", "Título de la Intervención de Urgencia")} *
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="Hotfix de Emergencia y Conmutación de Enlace Troncal"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("categoria_id") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("categoria_id", "Categoría")} *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Redes y Comunicaciones</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN C: ALCANCE DE LA EMERGENCIA */}
                {(esVisible("entorno") || esVisible("servicios") || esVisible("ci_afectados")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {esVisible("entorno") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("entorno", "Entorno Afectado")} *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Producción</option>
                        </select>
                      </div>
                    )}
                    {esVisible("servicios") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("servicios", "Servicio Impactado")} *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>SRV-WAN-001 (Red Corporativa)</option>
                        </select>
                      </div>
                    )}
                    {esVisible("ci_afectados") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("ci_afectados", "CI Afectado")} *
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="SW-CORE-CISCO-9300"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN F: ACCIÓN INMEDIATA Y REVERSA RÁPIDA (SIN PLANES LARGOS DE FASE 2) */}
                {(esVisible("plan_implementacion") || esVisible("plan_rollback")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {esVisible("plan_implementacion") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("plan_implementacion", "Acción de Mitigación / Parche Inmediato")} *
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Aislamiento manual de interfaz GigabitEthernet 1/0/24 y conmutación de rutas hacia switch redundante B."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("plan_rollback") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("plan_rollback", "Plan de Reversión Rápida de Emergencia")} *
                        </label>
                        <textarea
                          rows={2}
                          disabled
                          defaultValue="Habilitar puerto anterior y reiniciar módulo de enrutamiento estático mediante consola out-of-band."
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN H: EVIDENCIAS DE CRISIS */}
                {esVisible("adjuntos") && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      {obtenerEtiqueta("adjuntos", "Logs y Evidencias del Incidente Mayor")}
                    </label>
                    <div style={{ border: "2px dashed #cbd5e1", borderRadius: 8, padding: 12, textAlign: "center", backgroundColor: "#f8fafc" }}>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>
                        📎 Capturas de error, volcados de memoria y logs de crisis adjuntos
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ======================================================== */}
            {/* TIPO: CAMBIO ESTÁNDAR                                    */}
            {/* ======================================================== */}
            {tipoCambio === "ESTANDAR" && (
              <>
                {/* SECCIÓN A: MODELO DE CAMBIO PRE-APROBADO Y DATOS */}
                {esVisible("modelo_id") && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#15803d", display: "block", marginBottom: 4 }}>
                      {obtenerEtiqueta("modelo_id", "Modelo de Cambio Estándar Homologado (Catálogo Pre-Aprobado)")} *
                    </label>
                    <select disabled style={{ width: "100%", padding: "8px 10px", fontSize: 12, backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: 6, color: "#166534", fontWeight: 700 }}>
                      <option>STD-NET-014 · Actualización rutinaria de firmware en conmutadores de borde con rollback probado</option>
                      <option>STD-DB-003 · Creación periódica de índices en base de datos secundaria</option>
                      <option>STD-SYS-008 · Parche mensual del sistema operativo en servidores de pruebas</option>
                    </select>
                    <span style={{ fontSize: 11, color: "#15803d", marginTop: 4, display: "block" }}>
                      ✓ Este cambio se ejecuta con procedimiento estándar previamente certificado por el Comité CAB.
                    </span>
                  </div>
                )}

                {(esVisible("titulo") || esVisible("categoria_id")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 14 }}>
                    {esVisible("titulo") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("titulo", "Título de la Tarea Programada")} *
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="Mantenimiento Mensual Switch Acceso Piso 2 Sede Principal"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("categoria_id") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("categoria_id", "Categoría")} *
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Redes y Comunicaciones &gt; Conmutadores de Acceso</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN C: ALCANCE */}
                {(esVisible("entorno") || esVisible("servicios") || esVisible("ci_afectados")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                    {esVisible("entorno") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("entorno", "Entorno")}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>Producción</option>
                        </select>
                      </div>
                    )}
                    {esVisible("servicios") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("servicios", "Servicio Afectado")}
                        </label>
                        <select disabled style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}>
                          <option>SRV-WAN-001 (Red Corporativa)</option>
                        </select>
                      </div>
                    )}
                    {esVisible("ci_afectados") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("ci_afectados", "Activo CI")}
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="SW-ACC-PISO2-01"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN E: VENTANA PROGRAMADA */}
                {(esVisible("fecha_inicio") || esVisible("fecha_fin")) && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    {esVisible("fecha_inicio") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("fecha_inicio", "Inicio de Ventana")} *
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="2026-10-24 23:00"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                    {esVisible("fecha_fin") && (
                      <div>
                        <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {obtenerEtiqueta("fecha_fin", "Fin de Ventana")} *
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue="2026-10-25 01:00"
                          style={{ width: "100%", padding: "7px 10px", fontSize: 12, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6 }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN H: DOCUMENTACIÓN ASOCIADA */}
                {esVisible("adjuntos") && (
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      {obtenerEtiqueta("adjuntos", "Checklist y Procedimiento Asociado")}
                    </label>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 12px", backgroundColor: "#f8fafc", fontSize: 11.5, color: "#475569" }}>
                      📋 Checklist homologado: 4 pasos verificados según estándar ISO/IEC 20000.
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* Pie Informativo */}
        <div style={{ padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>
            ✓ Vista previa en vivo sincronizada 1:1 con las secciones y campos configurados a la izquierda.
          </span>
          <span style={{ fontWeight: 600, color: "#2563eb" }}>ITIL v4 Change Enablement</span>
        </div>
      </div>
    </div>
  );
};

export const SimuladorCambiosEnVivo: React.FC<Omit<ModalVistaPreviaProps, "abierto"> & { abierto?: boolean }> = (props) => {
  return <ModalVistaPrevia {...props} abierto={true} modoEmbebido={true} />;
};
