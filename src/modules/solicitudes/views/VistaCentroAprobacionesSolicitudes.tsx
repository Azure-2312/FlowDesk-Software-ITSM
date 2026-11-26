"use client";

import { useRouter } from "next/navigation";

import { useEffect, useState, useMemo } from "react";
import { rutaDetalleTicket } from "@/modules/tickets/rutas";
import TablaDobleScroll from "@/shared/components/ui/TablaDobleScroll";
import { Eye, Check, X, Clock, CheckCircle2, AlertCircle, RefreshCw, FileText } from "@/shared/components/ui/Iconos";

interface Props {
  vistaInicial?: "pendientes" | "historial";
}

function obtenerIniciales(nombre?: string): string {
  if (!nombre) return "U";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export default function VistaCentroAprobacionesSolicitudes({ vistaInicial = "pendientes" }: Props) {
  const router = useRouter();
  const [vista, setVista] = useState<"pendientes" | "historial">(vistaInicial);
  const [tickets, setTickets] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modales
  const [ticketAccion, setTicketAccion] = useState<{ id: number; decision: "APROBADO" | "RECHAZADO"; codigo?: string } | null>(null);
  const [comentarioAccion, setComentarioAccion] = useState("");
  const [procesando, setProcesando] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/aprobaciones?vista=${vista}&_t=${Date.now()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No fue posible cargar las solicitudes de aprobación.");
      } else {
        setTickets(data.tickets || []);
      }
    } catch {
      setError("Error de comunicación al consultar el servicio de aprobaciones.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (vistaInicial) {
      setVista(vistaInicial);
    }
  }, [vistaInicial]);

  useEffect(() => {
    cargarDatos();
  }, [vista]);

  async function ejecutarDecision() {
    if (!ticketAccion) return;
    if (ticketAccion.decision === "RECHAZADO" && comentarioAccion.trim().length < 5) {
      alert("Por favor ingrese el motivo del rechazo (mínimo 5 caracteres).");
      return;
    }

    setProcesando(true);
    try {
      const res = await fetch("/api/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ticket: ticketAccion.id,
          decision_aprobacion: ticketAccion.decision,
          comentario_aprobacion:
            comentarioAccion.trim() ||
            (ticketAccion.decision === "APROBADO"
              ? "Aprobación formal concedida por la Jefatura de Área."
              : "Requerimiento rechazado por la Jefatura de Área."),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No fue posible registrar la decisión.");
        return;
      }

      setMensajeExito(
        ticketAccion.decision === "APROBADO"
          ? "Solicitud aprobada formalmente y transferida a Mesa de Servicio."
          : "Solicitud rechazada y notificada al solicitante."
      );
      setTimeout(() => setMensajeExito(null), 4000);
      setTicketAccion(null);
      setComentarioAccion("");
      await cargarDatos();
    } catch {
      alert("Error de red al procesar la aprobación.");
    } finally {
      setProcesando(false);
    }
  }

  function formatearFecha(f: string | null) {
    if (!f) return "—";
    const d = new Date(f);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function renderBadgePrioridad(codigo?: string) {
    const p = (codigo || "P3").toUpperCase();
    let claseP = "badge-prioridad-p3";
    let etiqueta = "P3 - Media";
    if (p.includes("1")) {
      claseP = "badge-prioridad-p1";
      etiqueta = "P1 - Crítica";
    } else if (p.includes("2")) {
      claseP = "badge-prioridad-p2";
      etiqueta = "P2 - Alta";
    } else if (p.includes("4")) {
      claseP = "badge-prioridad-p4";
      etiqueta = "P4 - Baja";
    }
    return (
      <span className={`badge-prioridad ${claseP}`} title={`Nivel de prioridad ${etiqueta}`}>
        <span className="badge-prioridad-dot" />
        <span>{p}</span>
      </span>
    );
  }

  return (
    <div className="vista-contenedor" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Cabecera Corporativa de Aprobaciones */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "20px 24px",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#2563eb",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Mesa de Servicio · Solicitudes de Requerimiento
          </span>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
            Centro de Aprobaciones
          </h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Control jerárquico de requerimientos corporativos, autorizaciones de acceso y dotación de servicios.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {vista === "pendientes" ? (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                backgroundColor: tickets.length > 0 ? "#eff6ff" : "#f8fafc",
                border: `1px solid ${tickets.length > 0 ? "#bfdbfe" : "#e2e8f0"}`,
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: tickets.length > 0 ? "#1d4ed8" : "#64748b",
              }}
            >
              <Clock size={14} style={{ color: tickets.length > 0 ? "#2563eb" : "#94a3b8" }} />
              <span>{tickets.length} {tickets.length === 1 ? "solicitud pendiente" : "solicitudes pendientes"}</span>
            </div>
          ) : (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: "#475569",
              }}
            >
              <FileText size={14} style={{ color: "#64748b" }} />
              <span>{tickets.length} {tickets.length === 1 ? "registro histórico" : "registros históricos"}</span>
            </div>
          )}

          <button
            type="button"
            onClick={cargarDatos}
            disabled={cargando}
            title="Actualizar listado"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "7px 12px",
              height: "34px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "12.5px",
              fontWeight: 600,
              color: "#334155",
              cursor: cargando ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >

            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {mensajeExito && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{mensajeExito}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: "8px",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Tarjeta de Tabla de Datos */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        {cargando ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "#64748b", fontSize: "13.5px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <RefreshCw size={16} style={{ animation: "spin 1s linear infinite", color: "#2563eb" }} />
              <span>Cargando solicitudes de aprobación...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center", color: "#64748b" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "#f1f5f9",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94a3b8",
                marginBottom: "12px",
              }}
            >
              <CheckCircle2 size={24} />
            </div>
            <p style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: 600, color: "#1e293b" }}>
              {vista === "pendientes"
                ? "Sin requerimientos pendientes de aprobación"
                : "Sin historial de decisiones de aprobación"}
            </p>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#64748b" }}>
              {vista === "pendientes"
                ? "Todos los requerimientos dirigidos a tu departamento han sido tramitados."
                : "No se registran resoluciones previas en este período."}
            </p>
          </div>
        ) : vista === "pendientes" ? (
          <TablaDobleScroll minWidth={960}>
            <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "960px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "130px" }}>Código</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569" }}>Título / Requerimiento</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "220px" }}>Solicitante</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "170px" }}>Fecha Solicitud</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "95px" }}>Prioridad</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", textAlign: "right", width: "260px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span className="codigo-pill">{t.codigo_ticket}</span>
                    </td>

                    <td style={{ padding: "12px 16px", maxWidth: "340px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px", lineHeight: 1.35 }}>
                        {t.titulo}
                      </div>
                      {t.categoria_nombre && (
                        <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "3px", fontWeight: 500 }}>
                          {t.categoria_nombre}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="avatar-iniciales">{obtenerIniciales(t.solicitante_nombre)}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "12.5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {t.solicitante_nombre || "Solicitante"}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {t.solicitante_correo || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#475569", fontSize: "12.5px" }}>
                      {formatearFecha(t.fecha_creacion)}
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      {renderBadgePrioridad(t.prioridad_codigo)}
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", gap: "6px", alignItems: "center", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          className="boton-tabla-detalle"
                          onClick={() => router.push(rutaDetalleTicket({ id_ticket: t.id_ticket, id_tipo_ticket: 2 }))}
                          title="Consultar expediente completo"
                        >

                          <span>Ver detalle</span>
                        </button>

                        <button
                          type="button"
                          className="boton-tabla-aprobar"
                          onClick={() => setTicketAccion({ id: t.id_ticket, decision: "APROBADO", codigo: t.codigo_ticket })}
                          title="Conceder autorización"
                        >

                          <span>Aprobar</span>
                        </button>

                        <button
                          type="button"
                          className="boton-tabla-rechazar"
                          onClick={() => setTicketAccion({ id: t.id_ticket, decision: "RECHAZADO", codigo: t.codigo_ticket })}
                          title="Denegar requerimiento"
                        >

                          <span>Rechazar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaDobleScroll>
        ) : (
          <TablaDobleScroll minWidth={1000}>
            <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", minWidth: "1000px" }}>
              <thead>
                <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "160px" }}>Fecha Decisión</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "130px" }}>Código</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569" }}>Requerimiento</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "180px" }}>Solicitante</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "110px" }}>Decisión</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", width: "170px" }}>Aprobador</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", maxWidth: "240px" }}>Comentario</th>
                  <th style={{ padding: "12px 16px", fontWeight: 600, color: "#475569", textAlign: "right", width: "100px" }}>Expediente</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px", color: "#475569", fontSize: "12.5px", whiteSpace: "nowrap" }}>
                      {formatearFecha(t.fecha_decision || t.fecha_creacion)}
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span className="codigo-pill">{t.codigo_ticket}</span>
                    </td>

                    <td style={{ padding: "12px 16px", maxWidth: "260px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{t.titulo}</div>
                      {t.categoria_nombre && (
                        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{t.categoria_nombre}</div>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px", color: "#334155", fontSize: "12.5px" }}>
                      {t.solicitante_nombre || "—"}
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span
                        className={`badge-estado ${
                          t.estado_aprobacion === "APROBADO" ? "badge-estado-aprobado" : "badge-estado-rechazado"
                        }`}
                      >
                        {t.estado_aprobacion === "APROBADO" ? "Aprobado" : "Rechazado"}
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", color: "#475569", fontSize: "12.5px" }}>
                      {t.aprobador_nombre || "Jefatura de Área"}
                    </td>

                    <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "12px", maxWidth: "240px" }}>
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {t.comentario_decision || "Sin observaciones registradas."}
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        className="boton-tabla-detalle"
                        onClick={() => router.push(rutaDetalleTicket({ id_ticket: t.id_ticket, id_tipo_ticket: 2 }))}
                        title="Ver detalle"
                      >

                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TablaDobleScroll>
        )}

        {/* Barra de Resumen Inferior */}
        {!cargando && tickets.length > 0 && (
          <div
            style={{
              padding: "10px 16px",
              backgroundColor: "#f8fafc",
              borderTop: "1px solid #e2e8f0",
              fontSize: "12px",
              color: "#64748b",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              Mostrando <strong>{tickets.length}</strong> {vista === "pendientes" ? "solicitudes pendientes" : "decisiones históricas"}
            </span>
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>FlowDesk ITSM · Centro de Aprobaciones</span>
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Decisión */}
      {ticketAccion && (
        <div className="modal-overlay" onClick={() => !procesando && setTicketAccion(null)}>
          <div className="modal-contenido" style={{ maxWidth: "480px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: ticketAccion.decision === "APROBADO" ? "#ecfdf5" : "#fef2f2",
                  color: ticketAccion.decision === "APROBADO" ? "#059669" : "#dc2626",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {ticketAccion.decision === "APROBADO" ? <Check size={20} /> : <X size={20} />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                  {ticketAccion.decision === "APROBADO" ? "Aprobar requerimiento de servicio" : "Rechazar requerimiento de servicio"}
                </h3>
                {ticketAccion.codigo && (
                  <span style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
                    {ticketAccion.codigo}
                  </span>
                )}
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.45 }}>
              {ticketAccion.decision === "APROBADO"
                ? "Al conceder el visto bueno formal, la solicitud pasará al equipo de TI para su atención y provisión."
                : "Indica el motivo por el cual se deniega esta solicitud. El solicitante será notificado formalmente."}
            </p>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Observaciones o justificación {ticketAccion.decision === "RECHAZADO" ? "(obligatorio)" : "(opcional)"}:
              </label>
              <textarea
                rows={3}
                className="input-base"
                style={{ width: "100%", fontSize: "13px", resize: "vertical" }}
                placeholder={ticketAccion.decision === "APROBADO" ? "Nota de conformidad..." : "Motivo formal de la denegación..."}
                value={comentarioAccion}
                onChange={(e) => setComentarioAccion(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ padding: "8px 16px", fontSize: "13px" }}
                onClick={() => setTicketAccion(null)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={ticketAccion.decision === "APROBADO" ? "boton-tabla-aprobar" : "boton-tabla-rechazar"}
                style={{ height: "36px", padding: "0 18px", fontSize: "13px" }}
                onClick={ejecutarDecision}
                disabled={procesando}
              >
                {procesando ? "Procesando..." : ticketAccion.decision === "APROBADO" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
