"use client";

import { useEffect, useState } from "react";
import { Ticket } from "@/types";
import ModalDetalleTicket from "@/modules/tickets/components/ModalDetalleTicket";

interface Props {
  vistaInicial?: "pendientes" | "historial";
}

export default function VistaCentroAprobacionesSolicitudes({ vistaInicial = "pendientes" }: Props) {
  const [vista, setVista] = useState<"pendientes" | "historial">(vistaInicial);
  const [tickets, setTickets] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modales
  const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState<number | null>(null);
  const [ticketAccion, setTicketAccion] = useState<{ id: number; decision: "APROBADO" | "RECHAZADO" } | null>(null);
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

  return (
    <div className="espacio-y-4">
      {/* Cabecera Corporativa */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Mesa de Servicio · Solicitudes de Requerimiento
          </span>
          <h1 className="text-xl font-bold text-slate-900 m-0">Centro de Aprobaciones</h1>
          <p className="text-sm text-slate-600 mt-1 mb-0">
            Control jerárquico de requerimientos corporativos, autorizaciones de acceso y dotación de servicios.
          </p>
        </div>
      </div>

      {mensajeExito && (
        <div style={{ padding: "12px 16px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {cargando ? (
          <div style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 13 }}>
            Cargando solicitudes...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 48, textAlign: "center", color: "#64748b" }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
              {vista === "pendientes"
                ? "No hay solicitudes pendientes de aprobación en tu departamento."
                : "No se registran decisiones históricas de aprobación en tu departamento."}
            </p>
          </div>
        ) : vista === "pendientes" ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título / Requerimiento</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Solicitud</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                    {t.codigo_ticket}
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 300 }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{t.titulo}</div>
                    <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>{t.categoria_nombre}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>
                    <div>{t.solicitante_nombre}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.solicitante_correo}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                    {formatearFecha(t.fecha_creacion)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, backgroundColor: "#f1f5f9", color: "#475569" }}>
                      {t.prioridad_codigo}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => setTicketSeleccionadoId(t.id_ticket)}
                        style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#334155", cursor: "pointer", fontWeight: 500 }}
                      >
                        Ver detalle
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketAccion({ id: t.id_ticket, decision: "APROBADO" })}
                        style={{ padding: "6px 12px", fontSize: 12, borderRadius: 6, border: "1px solid #059669", backgroundColor: "#059669", color: "#ffffff", cursor: "pointer", fontWeight: 600 }}
                      >
                        Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketAccion({ id: t.id_ticket, decision: "RECHAZADO" })}
                        style={{ padding: "6px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #fca5a5", backgroundColor: "#ffffff", color: "#dc2626", cursor: "pointer", fontWeight: 600 }}
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Decisión</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Requerimiento</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Decisión</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Aprobador</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Comentario</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Expediente</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12 }}>
                    {formatearFecha(t.fecha_decision || t.fecha_creacion)}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                    {t.codigo_ticket}
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: 220, fontWeight: 500, color: "#1e293b" }}>
                    {t.titulo}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>
                    {t.solicitante_nombre}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: t.estado_aprobacion === "APROBADO" ? "#ecfdf5" : "#fef2f2",
                        color: t.estado_aprobacion === "APROBADO" ? "#065f46" : "#991b1b",
                      }}
                    >
                      {t.estado_aprobacion}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {t.aprobador_nombre || "Jefatura de Área"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b", fontSize: 12, maxWidth: 240 }}>
                    {t.comentario_decision || "Sin observaciones registradas."}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setTicketSeleccionadoId(t.id_ticket)}
                      style={{ padding: "4px 8px", fontSize: 11.5, borderRadius: 4, border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", color: "#1e293b", cursor: "pointer" }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Confirmación de Decisión */}
      {ticketAccion && (
        <div className="modal-overlay" onClick={() => !procesando && setTicketAccion(null)}>
          <div className="modal-contenido" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: ticketAccion.decision === "APROBADO" ? "#065f46" : "#991b1b" }}>
              {ticketAccion.decision === "APROBADO" ? "Aprobar requerimiento de servicio" : "Rechazar requerimiento de servicio"}
            </h3>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 14px", lineHeight: 1.4 }}>
              {ticketAccion.decision === "APROBADO"
                ? "Al conceder el visto bueno formal, la solicitud pasará al equipo de TI para su atención y provisión."
                : "Indica el motivo por el cual se deniega esta solicitud. El solicitante será notificado formalmente."}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Observaciones o justificación {ticketAccion.decision === "RECHAZADO" ? "(obligatorio)" : "(opcional)"}:
              </label>
              <textarea
                rows={3}
                className="input-base"
                style={{ width: "100%", fontSize: 12.5 }}
                placeholder={ticketAccion.decision === "APROBADO" ? "Nota de conformidad..." : "Motivo del rechazo..."}
                value={comentarioAccion}
                onChange={(e) => setComentarioAccion(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "6px 14px", fontSize: 12.5 }}
                onClick={() => setTicketAccion(null)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario"
                style={{
                  width: "auto",
                  padding: "6px 18px",
                  fontSize: 12.5,
                  backgroundColor: ticketAccion.decision === "APROBADO" ? "#059669" : "#dc2626",
                  borderColor: ticketAccion.decision === "APROBADO" ? "#047857" : "#b91c1c",
                }}
                onClick={ejecutarDecision}
                disabled={procesando}
              >
                {procesando ? "Procesando..." : ticketAccion.decision === "APROBADO" ? "Confirmar Aprobación" : "Confirmar Rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Ticket */}
      {ticketSeleccionadoId !== null && (
        <ModalDetalleTicket
          idTicket={ticketSeleccionadoId}
          apiBase="/api/solicitudes"
          onCerrar={() => setTicketSeleccionadoId(null)}
          onActualizado={cargarDatos}
        />
      )}
    </div>
  );
}
