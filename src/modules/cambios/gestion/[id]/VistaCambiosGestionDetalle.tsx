"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Cambio, SesionUsuario } from "@/types";
import PresentadorRfcAprobador, { DecisionRfc } from "@/modules/tickets/presentadores/PresentadorRfcAprobador";
import { PERFILES } from "@/shared/lib/capacidades";

export default function PaginaDetalleTicketRFC() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [cambio, setCambio] = useState<Cambio | null>(null);
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pestanaActiva, setPestanaActiva] = useState<string>("solicitud");
  const [procesandoDecision, setProcesandoDecision] = useState(false);

  async function cargarTicket() {
    setCargando(true);
    setError(null);
    try {
      const [resCambio, resMenu] = await Promise.all([
        fetch(`/api/cambios/${id}`),
        fetch("/api/menu"),
      ]);

      const dataCambio = await resCambio.json();
      const dataMenu = await resMenu.json();

      if (!resCambio.ok) {
        setError(dataCambio.error || "No se pudo cargar la RFC.");
        return;
      }

      setCambio(dataCambio);
      if (dataMenu?.sesion) setSesion(dataMenu.sesion);
    } catch (err: any) {
      console.error("Error al cargar ticket RFC:", err);
      setError("Error de conexión al cargar la RFC.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (id) cargarTicket();
  }, [id]);

  async function decidirCambio(decision: DecisionRfc, comentario: string) {
    if (!cambio) return;
    if (comentario.trim().length < 3) {
      alert("El sustento del dictamen es obligatorio (mínimo 3 caracteres).");
      return;
    }
    setProcesandoDecision(true);
    try {
      const res = await fetch("/api/aprobador/cambios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_cambio: cambio.id_cambio,
          decision,
          comentario: comentario.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo registrar el dictamen.");
        return;
      }
      await cargarTicket();
    } catch {
      alert("Error de conexión al registrar el dictamen.");
    } finally {
      setProcesandoDecision(false);
    }
  }

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: 48, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
        Cargando ticket de cambio {id}...
      </div>
    );
  }

  if (error || !cambio) {
    return (
      <div className="vista-contenedor" style={{ padding: 32, textAlign: "center" }}>
        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, padding: 20, color: "#991b1b", maxWidth: 500, margin: "0 auto" }}>
          <h3 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Error al abrir la RFC</h3>
          <p style={{ margin: "0 0 16px 0", fontSize: 13 }}>{error || "El ticket solicitado no existe."}</p>
          <Link href="/cambios/gestion/todos" className="boton-primario" style={{ fontSize: 12, textDecoration: "none" }}>
            Volver al Historial de Cambios
          </Link>
        </div>
      </div>
    );
  }

  const colorTipo =
    cambio.tipo_cambio === "EMERGENCIA"
      ? { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" }
      : cambio.tipo_cambio === "ESTANDAR"
      ? { bg: "#f1f5f9", text: "#334155", border: "#cbd5e1" }
      : { bg: "#eff6ff", text: "#1d4ed8", border: "#bfdbfe" };

  // El perfil Aprobador (CAB) consume una vista de dictamen dedicada y de solo lectura.
  if (sesion?.perfilActivo?.id_perfil === PERFILES.APROBADOR) {
    return (
      <div className="vista-contenedor" style={{ paddingBottom: 60 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", marginBottom: 12 }}>
          <Link href="/cambios" style={{ color: "#64748b", textDecoration: "none" }}>Gestión de cambios</Link>
          <span>›</span>
          <Link href="/cambios/gestion/todos" style={{ color: "#64748b", textDecoration: "none" }}>Historial consolidado</Link>
          <span>›</span>
          <span style={{ color: "#0f172a", fontWeight: 700, fontFamily: "monospace" }}>{cambio.codigo_cambio}</span>
        </div>

        <PresentadorRfcAprobador
          cambio={cambio}
          sesion={sesion}
          onDecidir={decidirCambio}
          procesando={procesandoDecision}
        />
      </div>
    );
  }

  return (
    <div className="vista-contenedor" style={{ paddingBottom: 60 }}>
      {/* 1. Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#64748b", marginBottom: 12 }}>
        <Link href="/cambios" style={{ color: "#64748b", textDecoration: "none" }}>Gestión de cambios</Link>
        <span>›</span>
        <Link href="/cambios/gestion/todos" style={{ color: "#64748b", textDecoration: "none" }}>Historial consolidado</Link>
        <span>›</span>
        <span style={{ color: "#0f172a", fontWeight: 700, fontFamily: "monospace" }}>{cambio.codigo_cambio}</span>
      </div>

      {/* 2. Cabecera Fija del Ticket RFC (Sección 5.1) */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          padding: "16px 22px",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "monospace", color: "#2563eb", letterSpacing: 0.5 }}>
                {cambio.codigo_cambio}
              </span>

              <span
                className="badge-itil"
                style={{
                  backgroundColor: colorTipo.bg,
                  color: colorTipo.text,
                  border: `1px solid ${colorTipo.border}`,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {cambio.tipo_cambio}
              </span>

              <span
                className="badge-itil"
                style={{
                  backgroundColor: cambio.id_estado === 3 ? "#ecfdf5" : cambio.id_estado === 2 ? "#fffbeb" : "#f1f5f9",
                  color: cambio.id_estado === 3 ? "#065f46" : cambio.id_estado === 2 ? "#92400e" : "#475569",
                  border: `1px solid ${cambio.id_estado === 3 ? "#a7f3d0" : cambio.id_estado === 2 ? "#fde68a" : "#cbd5e1"}`,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                {cambio.estado_nombre || "Registrado"}
              </span>

              <span
                className="badge-itil"
                style={{
                  backgroundColor: "#fef3c7",
                  color: "#92400e",
                  border: "1px solid #fde68a",
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                Prioridad: {cambio.prioridad_nombre || "Media"}
              </span>

              <span
                className="badge-itil"
                style={{
                  backgroundColor: cambio.tipo_cambio === "EMERGENCIA" ? "#fee2e2" : "#fef3c7",
                  color: cambio.tipo_cambio === "EMERGENCIA" ? "#991b1b" : "#92400e",
                  border: `1px solid ${cambio.tipo_cambio === "EMERGENCIA" ? "#fca5a5" : "#fde68a"}`,
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                Riesgo: {cambio.tipo_cambio === "EMERGENCIA" ? "Crítico (ECAB)" : "Medio (Evaluación CAB)"}
              </span>
            </div>

            <h1 style={{ fontSize: 19, fontWeight: 800, color: "#0f172a", margin: "8px 0 4px 0" }}>
              {cambio.titulo}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#64748b" }}>
              <span>Solicitado por: <strong style={{ color: "#334155" }}>{cambio.solicitante_nombre || "Especialista TI"}</strong></span>
              <span>•</span>
              <span>
                Ventana programada:{" "}
                <strong style={{ color: "#334155" }}>
                  {new Date(cambio.ventana_inicio).toLocaleString([], { dateStyle: "short", timeStyle: "short" })} –{" "}
                  {new Date(cambio.ventana_fin).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                </strong>
              </span>
            </div>
          </div>

          {/* Barra de Acciones del Ticket (Sección 5.2) */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link
              href="/cambios/gestion/cab"
              className="boton-secundario"
              style={{ fontSize: 12, textDecoration: "none" }}
            >
              Comité CAB
            </Link>
            <Link
              href="/cambios/gestion/calendario"
              className="boton-secundario"
              style={{ fontSize: 12, textDecoration: "none" }}
            >
              Ver en Calendario
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Estructura Principal: Pestañas + Panel Lateral (Sección 5.3 y 5.4) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        {/* Lado Izquierdo: Pestañas del Ticket RFC */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Navegación de Pestañas */}
          <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", gap: 6, overflowX: "auto" }}>
            {[
              { id: "solicitud", label: "5.4.1 Solicitud" },
              { id: "evaluacion", label: "5.4.2 Evaluación & Riesgo" },
              { id: "aprobaciones", label: "5.4.3 Aprobaciones CAB" },
              { id: "planificacion", label: "5.4.4 Planificación" },
              { id: "implementacion", label: "5.4.5 Implementación" },
              { id: "pir", label: "5.4.6 Revisión PIR" },
              { id: "relacionados", label: "5.4.7 Relacionados" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setPestanaActiva(t.id)}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: pestanaActiva === t.id ? 700 : 600,
                  color: pestanaActiva === t.id ? "#2563eb" : "#475569",
                  borderBottom: `3px solid ${pestanaActiva === t.id ? "#2563eb" : "transparent"}`,
                  marginBottom: -2,
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Contenido de Pestañas */}
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
            {/* 5.4.1 Solicitud */}
            {pestanaActiva === "solicitud" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#2563eb", margin: "0 0 6px 0", textTransform: "uppercase" }}>
                    Motivo / Justificación de Negocio
                  </h4>
                  <p style={{ fontSize: 12.5, color: "#1e293b", margin: 0, lineHeight: 1.5, backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    {cambio.justificacion || "Sin justificación registrada."}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0891b2", margin: "0 0 6px 0", textTransform: "uppercase" }}>
                    Descripción Técnica del Cambio
                  </h4>
                  <p style={{ fontSize: 12.5, color: "#1e293b", margin: 0, lineHeight: 1.5, backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    {cambio.descripcion || "Sin descripción técnica registrada."}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#059669", margin: "0 0 6px 0", textTransform: "uppercase" }}>
                      Plan de Implementación
                    </h4>
                    <div style={{ fontSize: 12, color: "#334155", backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0", minHeight: 100, whiteSpace: "pre-wrap" }}>
                      {cambio.plan_implementacion || "No especificado."}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", margin: "0 0 6px 0", textTransform: "uppercase" }}>
                      Plan de Rollback (Reversión)
                    </h4>
                    <div style={{ fontSize: 12, color: "#334155", backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0", minHeight: 100, whiteSpace: "pre-wrap" }}>
                      {cambio.plan_rollback || "No especificado."}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "#475569", margin: "0 0 6px 0", textTransform: "uppercase" }}>
                    Plan de Pruebas / QA Previo
                  </h4>
                  <div style={{ fontSize: 12, color: "#334155", backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0", whiteSpace: "pre-wrap" }}>
                    {cambio.plan_pruebas || "Validación estándar en ambiente de pruebas."}
                  </div>
                </div>
              </div>
            )}

            {/* 5.4.2 Evaluación */}
            {pestanaActiva === "evaluacion" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: 14, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                    Evaluación de Impacto y Urgencia (Matriz Institucional)
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b" }}>Impacto Técnico:</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{cambio.impacto_nombre || "Media"}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b" }}>Urgencia Operativa:</span>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{cambio.urgencia_nombre || "Media"}</div>
                    </div>
                    <div>
                      <span style={{ fontSize: 11, color: "#64748b" }}>Prioridad Técnica Resuelta:</span>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#2563eb" }}>{cambio.prioridad_nombre || "Media"}</div>
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: "#f8fafc", borderRadius: 8, padding: 14, border: "1px solid #e2e8f0" }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 8px 0" }}>
                    Evaluación Ponderada de Riesgo
                  </h4>
                  <p style={{ fontSize: 12, color: "#475569", margin: "0 0 8px 0" }}>
                    Cuestionario de 10 factores ITIL v4: nivel de riesgo evaluado en categoría <strong>Media (18 puntos)</strong>.
                  </p>
                  <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
                    Autoridad delegada requerida: Gestor de Cambios / CAB
                  </span>
                </div>
              </div>
            )}

            {/* 5.4.3 Aprobaciones CAB */}
            {pestanaActiva === "aprobaciones" && (
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 12px 0" }}>
                  Etapas de Aprobación Formal (Matriz de Autoridad)
                </h4>
                <div className="contenedor-tabla">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Etapa</th>
                        <th>Autoridad</th>
                        <th>Regla</th>
                        <th>Plazo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600 }}>1. Evaluación Técnica</td>
                        <td>Supervisor del Grupo</td>
                        <td>Cualquiera</td>
                        <td>24 h</td>
                        <td>
                          <span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#166534", fontWeight: 700 }}>
                            Aprobada
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600 }}>2. Aprobación CAB</td>
                        <td>Comité Asesor CAB</td>
                        <td>Mayoría Simple</td>
                        <td>168 h</td>
                        <td>
                          <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 700 }}>
                            En Evaluación
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5.4.4 Planificación */}
            {pestanaActiva === "planificacion" && (
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 12px 0" }}>
                  Checklist Go / No-Go Pre-Implementación
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    "Aprobaciones completas y condiciones técnicas satisfechas",
                    "Respaldo (backup) verificado antes de la apertura de ventana",
                    "Plan de rollback revisado con recursos de contingencia",
                    "Ventana confirmada en calendario institucional sin colisiones",
                    "Especialista implementador y equipo de soporte disponibles",
                  ].map((item, idx) => (
                    <label key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#334155" }}>
                      <input type="checkbox" defaultChecked={idx < 2} />
                      {item}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 5.4.5 Implementación */}
            {pestanaActiva === "implementacion" && (
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                  Bitácora de Ejecución de la Ventana
                </h4>
                <p style={{ fontSize: 12, color: "#64748b" }}>
                  Registro cronológico paso a paso durante el despliegue técnico.
                </p>
                <div style={{ padding: 16, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b", fontSize: 12 }}>
                  La bitácora se habilitará cuando la RFC avance al estado <strong>En Ejecución</strong>.
                </div>
              </div>
            )}

            {/* 5.4.6 Revisión PIR */}
            {pestanaActiva === "pir" && (
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                  Revisión Post-Implementación (PIR - ITIL v4)
                </h4>
                <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>
                  Verificación de cumplimiento de objetivos, criterios de éxito e incidentes inducidos en la ventana de observación.
                </p>
                <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: 12, color: "#334155" }}>
                    <strong>Resultado PIR:</strong> {cambio.resultado_pir || "Pendiente de ejecución post-ventana."}
                  </div>
                  <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
                    <strong>Incidentes inducidos registrados:</strong> {cambio.incidentes_inducidos || 0}
                  </div>
                </div>
              </div>
            )}

            {/* 5.4.7 Relacionados */}
            {pestanaActiva === "relacionados" && (
              <div>
                <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
                  Tickets Relacionados
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cambio.codigo_problema && (
                    <div style={{ padding: 12, backgroundColor: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", fontSize: 12.5 }}>
                      <strong>Problema Origen:</strong> {cambio.codigo_problema}
                    </div>
                  )}
                  {cambio.incidente_codigo && (
                    <div style={{ padding: 12, backgroundColor: "#fff7ed", borderRadius: 6, border: "1px solid #fed7aa", fontSize: 12.5 }}>
                      <strong>Incidente Origen:</strong> {cambio.incidente_codigo}
                    </div>
                  )}
                  {!cambio.codigo_problema && !cambio.incidente_codigo && (
                    <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 12 }}>
                      No hay incidentes ni problemas asociados a esta RFC.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Panel Lateral de Resumen (Sección 5.3) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, border: "1px solid #e2e8f0", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
              Atributos de Gobernanza
            </h4>

            <div>
              <span style={{ fontSize: 11, color: "#64748b" }}>Elemento de Configuración (CI):</span>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", marginTop: 2 }}>
                {cambio.ci_codigo ? `[${cambio.ci_codigo}] ${cambio.ci_nombre}` : "No asignado"}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: "#64748b" }}>Especialista Responsable:</span>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#1e293b", marginTop: 2 }}>
                {cambio.responsable_nombre || "Por asignar"}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: "#64748b" }}>Fecha de Registro:</span>
              <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
                {cambio.fecha_creacion ? new Date(cambio.fecha_creacion).toLocaleString() : "—"}
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: "#64748b" }}>Cumplimiento de Ventana:</span>
              <div style={{ fontSize: 12, color: "#16a34a", fontWeight: 700, marginTop: 2 }}>
                ✓ En ventana de mantenimiento estándar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
