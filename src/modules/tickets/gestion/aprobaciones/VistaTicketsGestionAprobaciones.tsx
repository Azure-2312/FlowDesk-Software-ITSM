"use client";

import { useEffect, useState } from "react";
import { Ticket } from "@/types";
import ModalDetalleTicket from "@/modules/tickets/components/ModalDetalleTicket";

export default function PaginaAprobaciones({ apiBase = "/api/aprobaciones" }: { apiBase?: string } = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [ticketSeleccionadoId, setTicketSeleccionadoId] = useState<number | null>(null);
  const [ticketRechazandoId, setTicketRechazandoId] = useState<number | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [idUsuarioActual, setIdUsuarioActual] = useState<number | null>(null);

  async function cargarAprobaciones() {
    setCargando(true);
    setError(null);
    try {
      const urlConsulta = apiBase.includes("aprobaciones") ? apiBase : `${apiBase}?vista=aprobaciones`;
      const res = await fetch(urlConsulta);
      const datos = await res.json();
      setTickets(datos.tickets || []);
      if (datos.id_usuario_actual) {
        setIdUsuarioActual(datos.id_usuario_actual);
      }
    } catch {
      setError("Error al cargar las solicitudes pendientes de aprobación");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarAprobaciones();
  }, []);

  async function manejarAprobar(idTicket: number) {
    if (!confirm("¿Confirmas la aprobación formal de este requerimiento?")) return;
    setProcesandoId(idTicket);
    try {
      const res = await fetch("/api/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ticket: idTicket,
          decision_aprobacion: "APROBADO",
          comentario_aprobacion: "Solicitud aprobada formalmente por la Jefatura de Área. Derivada a la Mesa de TI.",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo aprobar la solicitud");
        return;
      }
      setMensajeExito("Solicitud aprobada satisfactoriamente y derivada a la Mesa de TI.");
      setTimeout(() => setMensajeExito(null), 4000);
      cargarAprobaciones();
    } catch {
      alert("Error de conexión al aprobar la solicitud");
    } finally {
      setProcesandoId(null);
    }
  }

  async function manejarRechazar(e: React.FormEvent) {
    e.preventDefault();
    if (!ticketRechazandoId) return;
    if (!motivoRechazo.trim()) {
      alert("Es obligatorio especificar el motivo de la denegación.");
      return;
    }

    setProcesandoId(ticketRechazandoId);
    try {
      const res = await fetch("/api/aprobaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_ticket: ticketRechazandoId,
          decision_aprobacion: "RECHAZADO",
          comentario_aprobacion: motivoRechazo.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo registrar la denegación");
        return;
      }
      setTicketRechazandoId(null);
      setMotivoRechazo("");
      setMensajeExito("Solicitud denegada y notificada al colaborador.");
      setTimeout(() => setMensajeExito(null), 4000);
      cargarAprobaciones();
    } catch {
      alert("Error de conexión al denegar la solicitud");
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Bandeja de Aprobaciones de Negocio</h1>
          <p>
            Gobernanza ITIL v4 e ISO 27001: Autoriza o rechaza solicitudes de equipamiento, licencias o accesos emitidas por colaboradores de tu departamento.
          </p>
        </div>
        <button
          className="boton-mini"
          onClick={cargarAprobaciones}
          disabled={cargando}
          title="Actualizar bandeja"
          aria-label="Actualizar bandeja"
          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {cargando ? (
        <p className="descripcion">Cargando requerimientos pendientes de aprobación...</p>
      ) : tickets.length === 0 ? (
        <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#475569", fontSize: 14 }}>
            No tienes solicitudes pendientes de aprobación en este momento.
          </p>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            Cuando un colaborador de tu departamento solicite un recurso con impacto de seguridad o costo, aparecerá aquí para tu autorización.
          </span>
        </div>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Solicitante</th>
                <th>Requerimiento</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Límite SLA</th>
                <th style={{ textAlign: "center", width: 110 }}>Decisión</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id_ticket}>
                  <td style={{ fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>{t.codigo_ticket}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#0f172a", fontSize: 12.5 }}>{t.solicitante_nombre}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.solicitante_correo}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{t.titulo}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{t.categoria_nombre}</div>
                  </td>
                  <td>
                    <span className={`badge-itil badge-prioridad-${t.prioridad_codigo?.toLowerCase()}`}>
                      {t.prioridad_codigo}
                    </span>
                  </td>
                  <td>
                    <span
                      className="badge-itil"
                      style={{ backgroundColor: `${t.estado_color}20`, color: t.estado_color, border: `1px solid ${t.estado_color}` }}
                    >
                      {t.estado_nombre}
                    </span>
                  </td>
                  <td style={{ fontSize: 11.5 }}>
                    {new Date(t.fecha_limite_sla).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {t.id_usuario_solicitante === idUsuarioActual ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <span
                          className="badge-itil"
                          style={{
                            backgroundColor: "#fef2f2",
                            color: "#991b1b",
                            border: "1px solid #fecaca",
                            fontSize: 10.5,
                            fontWeight: 700,
                            padding: "2px 6px",
                          }}
                          title="Restricción SoD (ISO 27001): Usted es el solicitante registrado. No puede autoaprobar su propio requerimiento."
                        >
                          Autoexclusión SoD
                        </span>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => setTicketSeleccionadoId(t.id_ticket)}
                          title="Ver detalle del expediente"
                          style={{ fontSize: 11, padding: "2px 6px" }}
                        >
                          Ver Detalle
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, justifyContent: "center", alignItems: "center" }}>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => setTicketSeleccionadoId(t.id_ticket)}
                          title="Ver detalle completo"
                          aria-label="Ver detalle completo"
                          style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="boton-mini"
                          style={{ backgroundColor: "#10b981", color: "#ffffff", borderColor: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                          onClick={() => manejarAprobar(t.id_ticket)}
                          disabled={procesandoId === t.id_ticket}
                          title="Aprobar formalmente"
                          aria-label="Aprobar formalmente"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="boton-mini"
                          style={{ backgroundColor: "#fef2f2", color: "#b91c1c", borderColor: "#fecaca", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "6px 8px" }}
                          onClick={() => {
                            setTicketRechazandoId(t.id_ticket);
                            setMotivoRechazo("");
                          }}
                          disabled={procesandoId === t.id_ticket}
                          title="Denegar / Rechazar"
                          aria-label="Denegar / Rechazar"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para ingresar motivo de rechazo */}
      {ticketRechazandoId !== null && (
        <div className="modal-overlay" onClick={() => setTicketRechazandoId(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, padding: 24, backgroundColor: "#ffffff" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <h3 style={{ margin: "0 0 4px 0", color: "#111827", fontSize: 16 }}>
                  Denegar Solicitud de Servicio
                </h3>
                <p className="descripcion" style={{ margin: 0, fontSize: 12.5 }}>
                  Según las políticas de gobernanza e ISO 27001, debes fundamentar el motivo por el cual no autorizas este requerimiento.
                </p>
              </div>
              <button
                type="button"
                className="modal-cerrar-boton"
                onClick={() => setTicketRechazandoId(null)}
                aria-label="Cerrar modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={manejarRechazar}>
              <div className="campo" style={{ marginBottom: 16 }}>
                <label htmlFor="motivoRechazo">Motivo de la denegación *</label>
                <textarea
                  id="motivoRechazo"
                  rows={4}
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Ejemplo: No corresponde al perfil del puesto o el presupuesto del trimestre ya fue asignado."
                  required
                  style={{ width: "100%", padding: "8px 10px", fontSize: 13, borderRadius: 6, border: "1px solid #cbd5e1" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  className="boton-texto"
                  onClick={() => setTicketRechazandoId(null)}
                  disabled={procesandoId !== null}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  style={{ width: "auto", backgroundColor: "#dc2626", borderColor: "#b91c1c" }}
                  disabled={procesandoId !== null}
                >
                  {procesandoId !== null ? "Denegando..." : "Confirmar Denegación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle */}
      {ticketSeleccionadoId !== null && (
        <ModalDetalleTicket
          idTicket={ticketSeleccionadoId}
          apiBase={apiBase}
          onCerrar={() => setTicketSeleccionadoId(null)}
          onActualizado={cargarAprobaciones}
        />
      )}
    </div>
  );
}
