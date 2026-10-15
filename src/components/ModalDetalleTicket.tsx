"use client";

import { useEffect, useState } from "react";
import { Ticket, ComentarioTicket, CatalogosTickets, SesionUsuario } from "@/types";
import { resolverArquetipoVista } from "./ticket-detail/tipos";
import VistaTicketConsumidor from "./ticket-detail/presentadores/VistaTicketConsumidor";
import VistaTicketOperador from "./ticket-detail/presentadores/VistaTicketOperador";
import VistaTicketSupervisor from "./ticket-detail/presentadores/VistaTicketSupervisor";
import VistaTicketGobernanza from "./ticket-detail/presentadores/VistaTicketGobernanza";
import VistaTicketAdministrador from "./ticket-detail/presentadores/VistaTicketAdministrador";
import PresentadorAuditor from "@/modules/tickets/presentadores/PresentadorAuditor";
import PresentadorGestorArea from "@/modules/tickets/presentadores/PresentadorGestorArea";
import PresentadorAprobador from "@/modules/tickets/presentadores/PresentadorAprobador";
import PresentadorRfcEvaluador from "@/modules/tickets/presentadores/PresentadorRfcEvaluador";
import PresentadorActivoGestor from "@/modules/tickets/presentadores/PresentadorActivoGestor";
import PresentadorProblemaGestor from "@/modules/tickets/presentadores/PresentadorProblemaGestor";

interface Props {
  idTicket: number;
  apiBase?: string;
  onCerrar: () => void;
  onActualizado: () => void;
}

export default function ModalDetalleTicket({ idTicket, apiBase = "/api/tickets", onCerrar, onActualizado }: Props) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioTicket[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosTickets | null>(null);
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de carga de acciones
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [elevandoProblema, setElevandoProblema] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [resTicket, resCat, resSesion] = await Promise.all([
        fetch(`${apiBase}/${idTicket}`).then((r) => r.json()),
        fetch("/api/tickets/catalogos").then((r) => r.json()),
        fetch("/api/menu").then((r) => r.json()),
      ]);

      if (resTicket.error) {
        setError(resTicket.error);
      } else {
        setTicket(resTicket.ticket);
        setComentarios(resTicket.comentarios || []);
      }

      setCatalogos(resCat);
      setSesion(resSesion.sesion);
    } catch {
      setError("Error al cargar los datos del ticket");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, [idTicket]);

  async function ejecutarTransicion(payload: any) {
    setEjecutandoAccion(true);
    try {
      const res = await fetch(`${apiBase}/${idTicket}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const d = await res.json();
      if (!res.ok) {
        alert(d.error || "Error al actualizar el ticket");
        return;
      }

      await cargarDatos();
      onActualizado();
    } catch {
      alert("Error de conexion al ejecutar accion");
    } finally {
      setEjecutandoAccion(false);
    }
  }

  async function manejarEnviarComentario(comentario: string, esInterno: boolean) {
    if (!comentario.trim()) return;

    setEnviandoComentario(true);
    try {
      const res = await fetch(`${apiBase}/${idTicket}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comentario: comentario.trim(),
          es_interno: esInterno,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        alert(d.error || "Error al enviar comentario");
        return;
      }

      await cargarDatos();
      onActualizado();
    } catch {
      alert("Error de conexion al enviar comentario");
    } finally {
      setEnviandoComentario(false);
    }
  }

  async function elevarAProblema() {
    if (!ticket) return;
    if (!confirm(`¿Deseas formalizar la creacion de un nuevo Problema ITIL vinculado a este incidente?`)) {
      return;
    }

    setElevandoProblema(true);
    try {
      const res = await fetch("/api/problemas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: `Problema: ${ticket.titulo}`,
          descripcion: `Problema ITIL derivado del incidente ${ticket.codigo_ticket}:\n\n${ticket.descripcion}`,
          id_impacto: ticket.id_impacto,
          id_urgencia: ticket.id_urgencia,
          id_prioridad: ticket.id_prioridad,
          id_ci: ticket.id_ci || null,
          id_ticket_origen: ticket.id_ticket,
        }),
      });

      const d = await res.json();
      if (!res.ok) {
        alert(d.error || "Error al elevar a problema");
        return;
      }

      alert(`Se creo exitosamente el Problema con codigo: ${d.problema.codigo_problema}`);
      await cargarDatos();
      onActualizado();
    } catch {
      alert("Error al elevar a problema");
    } finally {
      setElevandoProblema(false);
    }
  }

  if (cargando) {
    return (
      <div className="modal-overlay" onClick={onCerrar}>
        <div className="modal-contenido modal-ticket-contenedor" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: 40, textAlign: "center" }}>
            <p className="descripcion">Cargando informacion del ticket...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket || !sesion) {
    return (
      <div className="modal-overlay" onClick={onCerrar}>
        <div className="modal-contenido modal-ticket-contenedor" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: 30, textAlign: "center" }}>
            <div className="mensaje-error">{error || "No se pudo cargar el ticket"}</div>
            <button type="button" className="boton-mini" onClick={onCerrar} style={{ marginTop: 16 }}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const idPerfil = sesion.perfilActivo?.id_perfil;
  const arquetipo = resolverArquetipoVista(idPerfil);

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div
        className="modal-contenido modal-ticket-contenedor"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: arquetipo === "CONSUMIDOR" ? 820 : 1060 }}
      >
        {/* Encabezado del Modal con Divulgacion Progresiva */}
        <div className="modal-ticket-cabecera" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#334155",
                  fontFamily: "monospace",
                  letterSpacing: "0.03em",
                }}
              >
                {ticket.codigo_ticket}
              </span>

              <span
                className={`badge-itil ${
                  ticket.tipo_codigo === "INCIDENTE" ? "badge-tipo-incidente" : "badge-tipo-solicitud"
                }`}
              >
                {ticket.tipo_nombre}
              </span>

              <span
                className="badge-itil"
                style={{
                  backgroundColor: `${ticket.estado_color}20`,
                  color: ticket.estado_color,
                  border: `1px solid ${ticket.estado_color}`,
                  fontWeight: 700,
                }}
              >
                {ticket.estado_nombre}
              </span>

              {/* Badges Adicionales segun Arquetipo */}
              {arquetipo !== "CONSUMIDOR" && (
                <>
                  <span className={`badge-itil badge-prioridad-${ticket.prioridad_codigo?.toLowerCase()}`}>
                    {ticket.prioridad_codigo} - {ticket.prioridad_nombre}
                  </span>

                  {ticket.servicio_nombre && (
                    <span className="badge-itil" style={{ backgroundColor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>
                      Servicio: {ticket.servicio_codigo ? `[${ticket.servicio_codigo}] ` : ""}{ticket.servicio_nombre}
                    </span>
                  )}

                  {ticket.departamento_nombre && (
                    <span className="badge-itil" style={{ backgroundColor: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
                      Area: {ticket.departamento_nombre}
                    </span>
                  )}

                  {ticket.ci_codigo && (
                    <span className="badge-itil" style={{ backgroundColor: "#f3e8ff", color: "#6b21a8", border: "1px solid #d8b4fe" }}>
                      CI: [{ticket.ci_codigo}] {ticket.ci_nombre || ""}
                    </span>
                  )}

                  {ticket.problema_codigo && (
                    <span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }}>
                      Problema: [{ticket.problema_codigo}]
                    </span>
                  )}
                </>
              )}

              {ticket.estado_aprobacion === "PENDIENTE_APROBACION" && (
                <span className="badge-itil" style={{ backgroundColor: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" }}>
                  Aprobacion Pendiente
                </span>
              )}
            </div>

            <h2
              style={{
                fontSize: 17,
                fontWeight: 700,
                margin: 0,
                color: "#0f172a",
                lineHeight: 1.35,
                wordBreak: "break-word",
              }}
            >
              {ticket.titulo}
            </h2>
          </div>

          {/* Botones de Cabecera: Abrir Workspace y Cerrar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a
              href={`/tickets/${ticket.id_ticket}`}
              className="boton-mini"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 600,
                padding: "6px 12px",
                borderRadius: 6,
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                color: "#1e293b",
              }}
              title="Abrir vista completa del ticket"
            >
              Workspace completo
            </a>
            <button
              type="button"
              className="modal-cerrar-boton"
              onClick={onCerrar}
              title="Cerrar modal"
              aria-label="Cerrar modal"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Cuerpo Scrollable: Delegacion Polimorfica al Presentador del Arquetipo */}
        <div className="modal-ticket-cuerpo">
          {arquetipo === "CONSUMIDOR" && (
            <VistaTicketConsumidor
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "OPERADOR_TECNICO" && (
            <VistaTicketOperador
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              onElevarAProblema={elevarAProblema}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              elevandoProblema={elevandoProblema}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "SUPERVISOR_OPERATIVO" && (
            <VistaTicketSupervisor
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              onElevarAProblema={elevarAProblema}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              elevandoProblema={elevandoProblema}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "GESTOR_AREA" && (
            <PresentadorGestorArea
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "AUDITORIA_FORENSE" && (
            <PresentadorAuditor
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "APROBADOR_CAB" && (
            <PresentadorAprobador
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "GESTOR_CAMBIOS" && (
            <PresentadorRfcEvaluador
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "GESTOR_ACTIVOS" && (
            <PresentadorActivoGestor
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "GESTOR_PROBLEMAS" && (
            <PresentadorProblemaGestor
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              onElevarAProblema={elevarAProblema}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              elevandoProblema={elevandoProblema}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "GOBERNANZA_NEGOCIO" && (
            <VistaTicketGobernanza
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}

          {arquetipo === "ADMINISTRADOR_SISTEMA" && (
            <VistaTicketAdministrador
              ticket={ticket}
              comentarios={comentarios}
              catalogos={catalogos}
              sesion={sesion}
              onEjecutarAccion={ejecutarTransicion}
              onEnviarComentario={manejarEnviarComentario}
              ejecutandoAccion={ejecutandoAccion}
              enviandoComentario={enviandoComentario}
              onCerrarModal={onCerrar}
              onActualizado={onActualizado}
            />
          )}
        </div>
      </div>
    </div>
  );
}
