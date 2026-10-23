"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { Ticket, ComentarioTicket, Usuario, CatalogosTickets } from "@/types";
import { validarTexto } from "@/shared/lib/validaciones";

interface CampoConfigurado {
  id: string;
  etiqueta: string;
  descripcion?: string;
  tipo: "texto" | "area" | "numero" | "fecha" | "lista" | "casilla";
  habilitado: boolean;
  obligatorio: boolean;
  prioridad_minima: number;
  opciones?: string;
}

const NIVELES_PRIORIDAD_MAP: Record<number, { nombre: string; color: string; bg: string }> = {
  1: { nombre: "Prioridad VIP", color: "#7c3aed", bg: "#f3e8ff" },
  2: { nombre: "Prioridad Ejecutiva", color: "#2563eb", bg: "#eff6ff" },
  3: { nombre: "Prioridad Preferente", color: "#0891b2", bg: "#ecfeff" },
  4: { nombre: "Prioridad Operativa", color: "#059669", bg: "#ecfdf5" },
  5: { nombre: "Prioridad Estándar", color: "#475569", bg: "#f1f5f9" },
};

export default function PaginaDetalleTicket({
  apiBase = "/api/tickets",
  tipoEsperado,
  rutaLista = "/plataforma/solicitudes/mios",
  etiquetaVolver = "Volver a Mis tickets",
}: {
  apiBase?: string;
  tipoEsperado?: 1 | 2;
  rutaLista?: string;
  etiquetaVolver?: string;
} = {}) {
  const params = useParams();
  const router = useRouter();
  const idTicket = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comentarios, setComentarios] = useState<ComentarioTicket[]>([]);
  const [catalogos, setCatalogos] = useState<CatalogosTickets | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [perfilesIds, setPerfilesIds] = useState<number[]>([]);
  const [camposConfig, setCamposConfig] = useState<Record<string, CampoConfigurado[]>>({
    incidente: [],
    solicitud: [],
  });

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Acciones operativas ITIL
  const [ejecutandoAccion, setEjecutandoAccion] = useState(false);
  const [modalOperativo, setModalOperativo] = useState<"ninguno" | "espera" | "resolver" | "cancelar" | "reabrir" | "asignar">("ninguno");
  const [motivoEsperaId, setMotivoEsperaId] = useState<number>(1);
  const [solucionTexto, setSolucionTexto] = useState("");
  const [categoriaResolucion, setCategoriaResolucion] = useState("Solución definitiva");
  const [motivoCancelacionTexto, setMotivoCancelacionTexto] = useState("");
  const [motivoReaperturaTexto, setMotivoReaperturaTexto] = useState("");
  const [tecnicoSeleccionadoId, setTecnicoSeleccionadoId] = useState<number | "">("");
  const [errorOperativo, setErrorOperativo] = useState<string | null>(null);

  // Pestañas principales
  const [pestanaActiva, setPestanaActiva] = useState<"informacion" | "comunicacion" | "interna">("informacion");

  // Envío de mensajes
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null);

  // Encuesta CSAT
  const [csatRating, setCsatRating] = useState<number>(0);
  const [csatComentario, setCsatComentario] = useState<string>("");
  const [guardandoCsat, setGuardandoCsat] = useState(false);
  const [csatEnviado, setCsatEnviado] = useState(false);

  // Visor modal de evidencias
  const [imagenSeleccionada, setImagenSeleccionada] = useState<{ url: string; nombre: string } | null>(null);

  async function cargarTicketYDatos() {
    setCargando(true);
    setError(null);
    try {
      const [resTicket, resUser, resConfig, resCat] = await Promise.all([
        fetch(`${apiBase}/${idTicket}`).then((r) => r.json()),
        fetch("/api/mi-cuenta").then((r) => r.json()),
        fetch("/api/operacion/configuracion?clave=formularios_solicitante_config").then((r) => r.json()),
        fetch("/api/tickets/catalogos").then((r) => r.json()).catch(() => null),
      ]);

      if (resTicket.error) {
        setError(resTicket.error);
        return;
      }

      if (tipoEsperado && Number(resTicket.ticket?.id_tipo_ticket) !== tipoEsperado) {
        setError("El codigo solicitado no corresponde a este modulo.");
        return;
      }

      setTicket(resTicket.ticket);
      setComentarios(resTicket.comentarios || []);

      if (resCat) {
        setCatalogos(resCat);
      }

      if (resTicket.ticket?.calificacion_csat) {
        setCsatRating(resTicket.ticket.calificacion_csat);
        setCsatComentario(resTicket.ticket.comentario_csat || "");
        setCsatEnviado(true);
      }

      if (resUser.usuario) {
        setUsuarioActual(resUser.usuario);
      }

      if (resUser.perfiles) {
        setPerfilesIds(resUser.perfiles.map((p: any) => p.id_perfil));
      }

      if (resConfig.configuracion?.valor) {
        setCamposConfig(resConfig.configuracion.valor);
      }
    } catch {
      setError("Error al cargar la información del ticket.");
    } finally {
      setCargando(false);
    }
  }

  async function ejecutarAccion(payload: any) {
    setEjecutandoAccion(true);
    setErrorOperativo(null);
    try {
      const res = await fetch(`${apiBase}/${idTicket}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorOperativo(data.error || "No fue posible actualizar el ticket.");
        return;
      }
      setModalOperativo("ninguno");
      setSolucionTexto("");
      setMotivoCancelacionTexto("");
      setMotivoReaperturaTexto("");
      await cargarTicketYDatos();
    } catch {
      setErrorOperativo("Error de conexión al actualizar el ticket.");
    } finally {
      setEjecutandoAccion(false);
    }
  }

  useEffect(() => {
    if (idTicket) {
      cargarTicketYDatos();
    }
  }, [idTicket]);

  // Regla de acceso a Comunicación interna:
  // Como mínimo prioridad ejecutiva (nivel_prioridad <= 2: VIP=1, Ejecutiva=2) o personal técnico/TI
  const esPersonalTI = perfilesIds.some((id) => [1, 2, 4, 6, 8, 9, 10].includes(id));
  const nivelPrioridad = Number(usuarioActual?.nivel_prioridad || 5);
  const infoPrioridad = NIVELES_PRIORIDAD_MAP[nivelPrioridad] || NIVELES_PRIORIDAD_MAP[5];
  const camposAdicionales = (ticket?.campos_adicionales as Record<string, any>) || {};
  const tienePermisoInterno = nivelPrioridad <= 2 || esPersonalTI;

  // Redirigir a información si no tiene acceso a la pestaña interna
  useEffect(() => {
    if (!cargando && !tienePermisoInterno && pestanaActiva === "interna") {
      setPestanaActiva("informacion");
    }
  }, [cargando, tienePermisoInterno, pestanaActiva]);

  // Filtrar comentarios
  const comentariosPublicos = comentarios.filter((c) => !c.es_interno);
  const comentariosInternos = comentarios.filter((c) => c.es_interno);

  async function enviarComentario(esInterno: boolean) {
    const vCom = validarTexto(nuevoMensaje, 2, 2000, "El mensaje", true);
    if (!vCom.valido) {
      setErrorMensaje(vCom.mensaje!);
      return;
    }
    setEnviandoMensaje(true);
    setErrorMensaje(null);

    try {
      const res = await fetch(`${apiBase}/${idTicket}/comentarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comentario: nuevoMensaje.trim(),
          es_interno: esInterno,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMensaje(data.error || "No se pudo enviar el mensaje.");
        return;
      }

      setNuevoMensaje("");
      // Recargar comentarios
      const resActualizado = await fetch(`${apiBase}/${idTicket}`);
      const dataActualizada = await resActualizado.json();
      if (dataActualizada.comentarios) {
        setComentarios(dataActualizada.comentarios);
      }
    } catch {
      setErrorMensaje("Error de conexión al enviar el mensaje.");
    } finally {
      setEnviandoMensaje(false);
    }
  }

  async function guardarEncuestaCsat(e: FormEvent) {
    e.preventDefault();
    if (!csatRating) {
      alert("Por favor seleccione una calificación en estrellas.");
      return;
    }

    setGuardandoCsat(true);
    try {
      const res = await fetch(`${apiBase}/${idTicket}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calificacion_csat: csatRating,
          comentario_csat: csatComentario.trim() || null,
        }),
      });

      if (res.ok) {
        setCsatEnviado(true);
        if (ticket) {
          setTicket({ ...ticket, calificacion_csat: csatRating, comentario_csat: csatComentario });
        }
      } else {
        alert("No se pudo guardar la calificación.");
      }
    } catch {
      alert("Error de conexión al guardar la calificación.");
    } finally {
      setGuardandoCsat(false);
    }
  }

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ color: "#2563eb", fontWeight: 600, fontSize: 14 }}>
          Cargando información del ticket...
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="vista-contenedor" style={{ maxWidth: 700, margin: "40px auto", textAlign: "center" }}>
        <div style={{ padding: 32, backgroundColor: "#ffffff", borderRadius: 12, border: "1px solid #fee2e2" }}>
          <h2 style={{ fontSize: 18, color: "#991b1b", marginBottom: 8 }}>No se pudo cargar el ticket</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            {error || "El ticket solicitado no existe o no tienes autorización para visualizarlo."}
          </p>
          <button
            type="button"
            className="boton-primario"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push(rutaLista);
              }
            }}
          >
            {etiquetaVolver}
          </button>
        </div>
      </div>
    );
  }

  const esIncidente = ticket.id_tipo_ticket === 1;
  const esFinalizado = [5, 6, 7].includes(ticket.id_estado); // Resuelto, Cerrado, Cancelado

  // Mapeo de estado para la línea de tiempo operativa ITIL (5 puntos)
  const estadoNum =
    ticket.id_estado === 1 ? 1 :
    [2, 3].includes(ticket.id_estado) ? 2 :
    ticket.id_estado === 4 ? 3 :
    [5, 6].includes(ticket.id_estado) ? 4 :
    ticket.id_estado === 7 ? 5 : 2;

  const pasosLineaTiempo = [
    { num: 1, label: "Abierto" },
    { num: 2, label: "Asignado" },
    { num: 3, label: "En Pausa" },
    { num: 4, label: "Terminado" },
    { num: 5, label: "Cancelado" },
  ];

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Navegación superior */}
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push(rutaLista);
            }
          }}
          className="boton-texto"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#2563eb",
            fontWeight: 600,
            fontSize: 13,
            padding: 0,
            marginBottom: 10,
            cursor: "pointer",
            background: "none",
            border: "none",
          }}
        >
          {etiquetaVolver}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 14,
                fontWeight: 700,
                color: "#0f172a",
                backgroundColor: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: 6,
                border: "1px solid #cbd5e1",
              }}
            >
              {ticket.codigo_ticket}
            </span>
            <span
              className={`badge-itil ${esIncidente ? "badge-tipo-incidente" : "badge-tipo-solicitud"}`}
              style={{ fontSize: 11 }}
            >
              {ticket.tipo_nombre || (esIncidente ? "Incidente" : "Solicitud de Servicio")}
            </span>
            <span
              className="badge-itil"
              style={{
                backgroundColor: ticket.estado_color ? `${ticket.estado_color}20` : "#f1f5f9",
                color: ticket.estado_color || "#334155",
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              {ticket.estado_nombre}
            </span>
          </div>

          <div style={{ fontSize: 11.5, color: "#64748b" }}>
            Registrado: <strong>{new Date(ticket.fecha_creacion).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: 20,
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setPestanaActiva("informacion")}
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: pestanaActiva === "informacion" ? 700 : 500,
            color: pestanaActiva === "informacion" ? "#2563eb" : "#64748b",
            borderBottom: pestanaActiva === "informacion" ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: -2,
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          Información
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva("comunicacion")}
          style={{
            padding: "10px 16px",
            fontSize: 13,
            fontWeight: pestanaActiva === "comunicacion" ? 700 : 500,
            color: pestanaActiva === "comunicacion" ? "#2563eb" : "#64748b",
            borderBottom: pestanaActiva === "comunicacion" ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: -2,
            background: "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            transition: "all 0.15s ease",
          }}
        >
          Comunicación
          {comentariosPublicos.length > 0 && (
            <span
              style={{
                backgroundColor: pestanaActiva === "comunicacion" ? "#2563eb" : "#e2e8f0",
                color: pestanaActiva === "comunicacion" ? "#ffffff" : "#475569",
                fontSize: 10.5,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 10,
              }}
            >
              {comentariosPublicos.length}
            </span>
          )}
        </button>

        {tienePermisoInterno && (
          <button
            type="button"
            onClick={() => setPestanaActiva("interna")}
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: pestanaActiva === "interna" ? 700 : 500,
              color: pestanaActiva === "interna" ? "#2563eb" : "#64748b",
              borderBottom: pestanaActiva === "interna" ? "2px solid #2563eb" : "2px solid transparent",
              marginBottom: -2,
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all 0.15s ease",
            }}
          >
            Comunicación interna
            {comentariosInternos.length > 0 && (
              <span
                style={{
                  backgroundColor: pestanaActiva === "interna" ? "#7c3aed" : "#f1f5f9",
                  color: pestanaActiva === "interna" ? "#ffffff" : "#64748b",
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: 10,
                }}
              >
                {comentariosInternos.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* CONTENIDO PESTAÑA 1: INFORMACIÓN (IDÉNTICO A LA VISTA PREVIA DEL ADMINISTRADOR) */}
      {pestanaActiva === "informacion" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden", backgroundColor: "#f8fafc" }}>
            {/* Cabecera del Ticket */}
            <div
              style={{
                backgroundColor: "#0f172a",
                color: "#ffffff",
                padding: "14px 18px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>
                    #{ticket.codigo_ticket}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: 4,
                      backgroundColor: infoPrioridad.bg,
                      color: infoPrioridad.color,
                    }}
                  >
                    {infoPrioridad.nombre}
                  </span>
                </div>
                <span className="badge-itil" style={{ backgroundColor: "#1e3a8a", color: "#bfdbfe", fontSize: 11 }}>
                  {esIncidente
                    ? (ticket.prioridad_codigo ? `${ticket.prioridad_codigo} - ${ticket.prioridad_nombre}` : "P3 - Media")
                    : (ticket.fecha_limite_sla
                        ? `SLA: Límite ${new Date(ticket.fecha_limite_sla).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : "SLA Estándar")}
                </span>
              </div>

              <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700 }}>
                {ticket.titulo}
              </h3>
              <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                Servicio: {ticket.servicio_codigo ? `[${ticket.servicio_codigo}] ` : ""}{ticket.servicio_nombre || "Servicio General"} - Registrado {new Date(ticket.fecha_creacion).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Línea de Tiempo de Estados ITIL (5 Puntos Secuenciales) */}
              <div style={{ padding: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 12 }}>
                  Estado del {esIncidente ? "Incidente" : "Requerimiento"} (Línea de Tiempo Operativa)
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                  <div style={{ position: "absolute", top: 12, left: 18, right: 18, height: 3, backgroundColor: "#e2e8f0", zIndex: 1 }} />
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      left: 18,
                      width: `${Math.min(100, Math.max(0, ((estadoNum - 1) / 4) * (100 - 4)))}%`,
                      height: 3,
                      backgroundColor: ticket.id_estado === 7 ? "#dc2626" : "#2563eb",
                      zIndex: 2,
                      transition: "width 0.3s ease",
                    }}
                  />

                  {pasosLineaTiempo.map((paso) => {
                    const esActual = paso.num === estadoNum;
                    const esCompletado = paso.num < estadoNum;
                    const esCancelado = ticket.id_estado === 7 && paso.num === 5;

                    return (
                      <div key={paso.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3 }}>
                        <div
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            backgroundColor: esCancelado ? "#dc2626" : esActual ? "#2563eb" : esCompletado ? "#16a34a" : "#ffffff",
                            border: esCancelado ? "2px solid #dc2626" : esActual || esCompletado ? "2px solid #2563eb" : "2px solid #cbd5e1",
                            color: esCompletado || esActual || esCancelado ? "#ffffff" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {esCancelado ? "X" : esCompletado ? "OK" : paso.num}
                        </div>
                        <span
                          style={{
                            fontSize: 10.5,
                            fontWeight: esActual ? 700 : 500,
                            color: esCancelado ? "#dc2626" : esActual ? "#1e40af" : esCompletado ? "#16a34a" : "#64748b",
                            marginTop: 4,
                          }}
                        >
                          {paso.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Barra de Acciones Operativas ITIL (para Técnicos, Supervisores y Administradores) */}
              {esPersonalTI && (
                <div
                  style={{
                    padding: 14,
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#166534", display: "block" }}>
                        Acciones Operativas ITIL
                      </span>
                      <span style={{ fontSize: 11, color: "#15803d" }}>
                        Estado actual: {ticket.estado_nombre} · Transición directa sobre el flujo de atención
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      {/* CASO 1: TICKET SIN RESPONSABLE ASIGNADO */}
                      {!ticket.es_terminal && !ticket.id_usuario_asignado && (
                        <>
                          {/* Atender ticket: técnicos, supervisores y administradores */}
                          <button
                            type="button"
                            onClick={() => ejecutarAccion({ id_usuario_asignado: usuarioActual?.id_usuario, id_estado: 3 })}
                            disabled={ejecutandoAccion}
                            className="boton-primario"
                            style={{ fontSize: 12, padding: "6px 14px", width: "auto", backgroundColor: "#2563eb" }}
                          >
                            {ejecutandoAccion ? "Asignando..." : "Atender ticket"}
                          </button>

                          {/* Asignar ticket: SOLO supervisores y administradores */}
                          {(perfilesIds.includes(1) || perfilesIds.includes(4)) && (
                            <button
                              type="button"
                              onClick={() => {
                                setTecnicoSeleccionadoId("");
                                setModalOperativo("asignar");
                              }}
                              disabled={ejecutandoAccion}
                              className="boton-secundario"
                              style={{ fontSize: 12, padding: "6px 14px", width: "auto" }}
                            >
                              Asignar ticket
                            </button>
                          )}

                          {/* Cancelar ticket: SOLO supervisores y administradores */}
                          {(perfilesIds.includes(1) || perfilesIds.includes(4)) && (
                            <button
                              type="button"
                              onClick={() => setModalOperativo("cancelar")}
                              disabled={ejecutandoAccion}
                              className="boton-secundario"
                              style={{ fontSize: 12, padding: "6px 12px", width: "auto", color: "#dc2626", borderColor: "#fca5a5" }}
                            >
                              Cancelar ticket
                            </button>
                          )}
                        </>
                      )}

                      {/* CASO 2: TICKET CON TÉCNICO YA ASIGNADO */}
                      {!ticket.es_terminal && ticket.id_usuario_asignado && (
                        <>
                          {/* Iniciar atención si está en estado 2 (Asignado) */}
                          {ticket.id_estado === 2 && (ticket.id_usuario_asignado === usuarioActual?.id_usuario || perfilesIds.includes(1) || perfilesIds.includes(4)) && (
                            <button
                              type="button"
                              onClick={() => ejecutarAccion({ id_estado: 3 })}
                              disabled={ejecutandoAccion}
                              className="boton-primario"
                              style={{ fontSize: 12, padding: "6px 14px", width: "auto", backgroundColor: "#d97706" }}
                            >
                              Iniciar atención
                            </button>
                          )}

                          {/* En proceso (3) -> Poner en espera o Resolver */}
                          {ticket.id_estado === 3 && (ticket.id_usuario_asignado === usuarioActual?.id_usuario || perfilesIds.includes(1) || perfilesIds.includes(4)) && (
                            <>
                              <button
                                type="button"
                                onClick={() => setModalOperativo("espera")}
                                disabled={ejecutandoAccion}
                                className="boton-secundario"
                                style={{ fontSize: 12, padding: "6px 14px", width: "auto" }}
                              >
                                Poner en espera
                              </button>
                              <button
                                type="button"
                                onClick={() => setModalOperativo("resolver")}
                                disabled={ejecutandoAccion}
                                className="boton-primario"
                                style={{ fontSize: 12, padding: "6px 16px", width: "auto", backgroundColor: "#16a34a" }}
                              >
                                Resolver ticket
                              </button>
                            </>
                          )}

                          {/* En espera (4) -> Reanudar atención */}
                          {ticket.id_estado === 4 && (ticket.id_usuario_asignado === usuarioActual?.id_usuario || perfilesIds.includes(1) || perfilesIds.includes(4)) && (
                            <button
                              type="button"
                              onClick={() => ejecutarAccion({ id_estado: 3 })}
                              disabled={ejecutandoAccion}
                              className="boton-primario"
                              style={{ fontSize: 12, padding: "6px 16px", width: "auto", backgroundColor: "#2563eb" }}
                            >
                              Reanudar atención
                            </button>
                          )}

                          {/* Reasignar y Cancelar: exclusivo de supervisores y administradores */}
                          {(perfilesIds.includes(1) || perfilesIds.includes(4)) && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setTecnicoSeleccionadoId(ticket.id_usuario_asignado || "");
                                  setModalOperativo("asignar");
                                }}
                                disabled={ejecutandoAccion}
                                className="boton-secundario"
                                style={{ fontSize: 12, padding: "6px 14px", width: "auto" }}
                              >
                                Reasignar ticket
                              </button>
                              <button
                                type="button"
                                onClick={() => setModalOperativo("cancelar")}
                                disabled={ejecutandoAccion}
                                className="boton-secundario"
                                style={{ fontSize: 12, padding: "6px 12px", width: "auto", color: "#dc2626", borderColor: "#fca5a5" }}
                              >
                                Cancelar ticket
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {/* CASO 3: TICKET RESUELTO (5) -> Reabrir */}
                      {ticket.id_estado === 5 && (perfilesIds.includes(1) || perfilesIds.includes(4) || ticket.id_usuario_solicitante === usuarioActual?.id_usuario) && (
                        <button
                          type="button"
                          onClick={() => setModalOperativo("reabrir")}
                          disabled={ejecutandoAccion}
                          className="boton-secundario"
                          style={{ fontSize: 12, padding: "6px 14px", width: "auto" }}
                        >
                          Reabrir ticket
                        </button>
                      )}
                    </div>
                  </div>

                  {errorOperativo && (
                    <div style={{ color: "#dc2626", fontSize: 12, fontWeight: 600 }}>
                      {errorOperativo}
                    </div>
                  )}
                </div>
              )}

              {/* Espacio para Técnico Asignado y Datos del Solicitante */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                    Técnico Asignado
                  </span>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                    {ticket.tecnico_nombre || "Mesa de Ayuda (Pendiente de Asignación)"}
                  </strong>
                  <span style={{ fontSize: 11, color: "#2563eb" }}>
                    {ticket.departamento_nombre || "Soporte TI General"}
                  </span>
                </div>

                <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                    Usuario Solicitante
                  </span>
                  <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                    {ticket.solicitante_nombre || usuarioActual?.nombres || "Usuario Institucional"}
                  </strong>
                  <span style={{ fontSize: 11, color: infoPrioridad.color, fontWeight: 600 }}>
                    {infoPrioridad.nombre} ({ticket.departamento_empresa_nombre || "Sede Institucional"})
                  </span>
                </div>
              </div>

              {/* En solicitudes: Beneficiario y Aprobador */}
              {!esIncidente && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Usuario Beneficiario
                    </span>
                    <strong style={{ fontSize: 12.5, color: "#0f172a", display: "block", marginTop: 2 }}>
                      {camposAdicionales.en_nombre_de_otro_valor || ticket.solicitante_nombre || "Mismo Solicitante"}
                    </strong>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      {camposAdicionales.en_nombre_de_otro_valor ? "Registrado a nombre de tercero" : "Usuario solicitante directo"}
                    </span>
                  </div>

                  <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Aprobador Designado
                    </span>
                    <strong
                      style={{
                        fontSize: 12.5,
                        color:
                          ticket.estado_aprobacion === "APROBADO"
                            ? "#15803d"
                            : ticket.estado_aprobacion === "PENDIENTE_APROBACION"
                            ? "#d97706"
                            : ticket.estado_aprobacion === "RECHAZADO"
                            ? "#dc2626"
                            : "#475569",
                        display: "block",
                        marginTop: 2,
                      }}
                    >
                      {ticket.estado_aprobacion === "APROBADO"
                        ? "Aprobado por Jefatura"
                        : ticket.estado_aprobacion === "PENDIENTE_APROBACION"
                        ? "Pendiente de Aprobación"
                        : ticket.estado_aprobacion === "RECHAZADO"
                        ? "Rechazado por Jefatura"
                        : "Pre-aprobado por Catálogo"}
                    </strong>
                    <span style={{ fontSize: 11, color: "#64748b" }}>Gestión y Control Jerárquico</span>
                  </div>
                </div>
              )}

              {/* Resumen de Información Registrada del Formulario (Detalles Registrados en el Ticket) */}
              <div style={{ padding: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 8 }}>
                  Detalles Registrados en el Ticket
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <span style={{ color: "#64748b" }}>Elemento CMDB:</span>{" "}
                    <strong>{camposAdicionales.elemento_cmdb || "No asignado"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Evidencias:</span>{" "}
                    <strong>
                      {ticket.adjuntos && ticket.adjuntos.length > 0
                        ? `${ticket.adjuntos.length} archivo(s) adjunto(s)`
                        : "Sin evidencias adjuntas"}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>Registrado en nombre de:</span>{" "}
                    <strong>{camposAdicionales.en_nombre_de_otro_valor || "No configurado"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>SLA Respuesta:</span>{" "}
                    <strong>{(ticket as any).sla_horas_respuesta ? `${(ticket as any).sla_horas_respuesta}h` : "2h"}</strong>
                  </div>
                  <div>
                    <span style={{ color: "#64748b" }}>SLA Solución:</span>{" "}
                    <strong>{ticket.tiempo_resolucion_horas ? `${ticket.tiempo_resolucion_horas}h` : (ticket as any).sla_horas_resolucion ? `${(ticket as any).sla_horas_resolucion}h` : "24h"}</strong>
                  </div>
                  {esIncidente ? (
                    <>
                      <div>
                        <span style={{ color: "#64748b" }}>Urgencia / Impacto:</span>{" "}
                        <strong>{ticket.urgencia_nombre || "Media"} / {ticket.impacto_nombre || "Media"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Prioridad Deducida:</span>{" "}
                        <strong style={{ color: ticket.prioridad_color || "#2563eb" }}>
                          {ticket.prioridad_codigo ? `${ticket.prioridad_codigo} - ` : ""}{ticket.prioridad_nombre || "Media"}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span style={{ color: "#64748b" }}>Justificación:</span>{" "}
                        <strong>{camposAdicionales.justificacion || "Requerimiento operativo"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Fecha Límite:</span>{" "}
                        <strong>{camposAdicionales.fecha_limite_deseada || "Estándar según SLA"}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* DESCRIPCIÓN DEL REPORTE */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <span style={{ display: "block", color: "#64748b", fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
                  DESCRIPCIÓN DEL REPORTE
                </span>
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    fontSize: 12.5,
                    lineHeight: 1.55,
                    color: "#1e293b",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {ticket.descripcion}
                </div>
              </div>

              {/* SECCIÓN DE EVIDENCIAS Y ARCHIVOS ADJUNTOS */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                  <span style={{ color: "#64748b", fontSize: 11.5, fontWeight: 700 }}>
                    EVIDENCIAS Y ARCHIVOS ADJUNTOS ({ticket.adjuntos?.length || 0})
                  </span>
                  {ticket.adjuntos && ticket.adjuntos.length > 0 && (
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      Haz clic en una evidencia para ver la foto o descargar el archivo
                    </span>
                  )}
                </div>

                {(!ticket.adjuntos || ticket.adjuntos.length === 0) ? (
                  <div
                    style={{
                      padding: "12px 14px",
                      backgroundColor: "#f8fafc",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      color: "#94a3b8",
                      fontSize: 12,
                      fontStyle: "italic",
                    }}
                  >
                    No se adjuntaron archivos o capturas de evidencia al registrar este ticket.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {ticket.adjuntos.map((adj) => {
                      const esImagen =
                        adj.tipo_mime?.startsWith("image/") ||
                        /\.(png|jpe?g|gif|webp|svg)$/i.test(adj.nombre_archivo);

                      return (
                        <div
                          key={adj.id_adjunto}
                          onClick={() => {
                            if (esImagen && adj.datos_base64) {
                              setImagenSeleccionada({ url: adj.datos_base64, nombre: adj.nombre_archivo });
                            } else if (adj.datos_base64) {
                              const link = document.createElement("a");
                              link.href = adj.datos_base64;
                              link.download = adj.nombre_archivo;
                              link.click();
                            }
                          }}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 6,
                            overflow: "hidden",
                            backgroundColor: "#f8fafc",
                            cursor: "pointer",
                            transition: "transform 0.15s ease, box-shadow 0.15s ease",
                          }}
                          title="Haz clic para ver o descargar"
                        >
                          {esImagen && adj.datos_base64 ? (
                            <div
                              style={{
                                height: 130,
                                backgroundColor: "#0f172a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={adj.datos_base64}
                                alt={adj.nombre_archivo}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                height: 90,
                                backgroundColor: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#64748b",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Archivo Adjunto
                            </div>
                          )}
                          <div style={{ padding: "8px 10px" }}>
                            <strong
                              style={{
                                fontSize: 12,
                                color: "#0f172a",
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {adj.nombre_archivo}
                            </strong>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 4,
                                fontSize: 10.5,
                                color: "#64748b",
                              }}
                            >
                              <span>{adj.tamano_bytes ? `${Math.round(adj.tamano_bytes / 1024)} KB` : "Archivo"}</span>
                              <span style={{ color: "#2563eb", fontWeight: 700 }}>
                                {esImagen ? "Ver foto" : "Descargar"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SOLUCIÓN TÉCNICA APLICADA (SI EL TICKET ESTÁ RESUELTO) */}
              {ticket.solucion_aplicada && (
                <div
                  style={{
                    backgroundColor: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    borderRadius: 8,
                    padding: 14,
                  }}
                >
                  <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#065f46", marginBottom: 6 }}>
                    Solución Técnica Aplicada
                  </span>
                  <p style={{ fontSize: 12.5, color: "#047857", lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap" }}>
                    {ticket.solucion_aplicada}
                  </p>
                  {ticket.fecha_resolucion && (
                    <div style={{ fontSize: 11, color: "#059669", marginTop: 6 }}>
                      Fecha de resolución: {new Date(ticket.fecha_resolucion).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </div>
                  )}
                </div>
              )}

              {/* ENCUESTA DE SATISFACCIÓN CSAT SI ESTÁ RESUELTO */}
              {esFinalizado && (
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 16,
                  }}
                >
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
                    Calificación del Servicio (Encuesta de Satisfacción)
                  </h3>
                  <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 12px 0" }}>
                    Tu opinión es fundamental para mejorar la calidad y rapidez de la atención técnica de TI.
                  </p>

                  {csatEnviado ? (
                    <div style={{ padding: 12, backgroundColor: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe", color: "#1e40af", fontSize: 12.5 }}>
                      <div>¡Gracias por calificar la atención! Calificación registrada: <strong>{csatRating} de 5</strong></div>
                      {csatComentario && (
                        <div style={{ fontSize: 11.5, marginTop: 4, color: "#3b82f6" }}>
                          Comentario: &ldquo;{csatComentario}&rdquo;
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={guardarEncuestaCsat} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                          ¿Qué tan satisfecho estás con la solución brindada? *
                        </label>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1, 2, 3, 4, 5].map((estrella) => (
                            <button
                              key={estrella}
                              type="button"
                              onClick={() => setCsatRating(estrella)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: 6,
                                border: csatRating === estrella ? "2px solid #2563eb" : "1px solid #cbd5e1",
                                backgroundColor: csatRating === estrella ? "#eff6ff" : "#ffffff",
                                color: csatRating === estrella ? "#1d4ed8" : "#475569",
                                fontWeight: 700,
                                fontSize: 12,
                                cursor: "pointer",
                              }}
                            >
                              {estrella} de 5
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                          Comentario u observaciones (Opcional)
                        </label>
                        <textarea
                          rows={2}
                          className="input-base"
                          placeholder="Deja un comentario sobre la atención recibida..."
                          value={csatComentario}
                          onChange={(e) => setCsatComentario(e.target.value)}
                          style={{ fontSize: 12 }}
                        />
                      </div>

                      <div>
                        <button
                          type="submit"
                          disabled={guardandoCsat || !csatRating}
                          className="boton-primario"
                          style={{ width: "auto", fontSize: 12.5, padding: "7px 16px" }}
                        >
                          {guardandoCsat ? "Enviando..." : "Enviar Calificación"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* CONTENIDO PESTAÑA 2: COMUNICACIÓN (PÚBLICA) */}
      {pestanaActiva === "comunicacion" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              padding: 20,
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
              Canal de Comunicación con el Técnico Asignado
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
              Los mensajes registrados aquí son visibles tanto para ti como para el personal técnico asignado.
            </p>

            {/* Listado de Comentarios */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
              {comentariosPublicos.length === 0 ? (
                <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>
                  Aún no hay mensajes en este canal. Escribe abajo para comunicarte con el soporte.
                </div>
              ) : (
                comentariosPublicos.map((c) => {
                  const esMio = c.id_usuario === usuarioActual?.id_usuario;
                  return (
                    <div
                      key={c.id_comentario}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: esMio ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "85%",
                          backgroundColor: esMio ? "#eff6ff" : "#f8fafc",
                          border: esMio ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                          borderRadius: 10,
                          padding: "12px 16px",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
                          <strong style={{ fontSize: 12, color: esMio ? "#1e40af" : "#0f172a" }}>
                            {c.autor_nombre} ({c.autor_perfil || "Usuario"})
                          </strong>
                          <span style={{ fontSize: 10.5, color: "#64748b" }}>
                            {new Date(c.fecha_creacion).toLocaleDateString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#334155", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                          {c.comentario}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Formulario de Envío de Mensaje Público */}
            {!esFinalizado && (
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                {errorMensaje && (
                  <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>
                    {errorMensaje}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    rows={3}
                    className="input-base"
                    placeholder="Escribe tu mensaje o consulta para el técnico..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    style={{ fontSize: 12.5 }}
                  />
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      disabled={enviandoMensaje || !nuevoMensaje.trim()}
                      onClick={() => enviarComentario(false)}
                      className="boton-primario"
                      style={{ width: "auto", fontSize: 13, padding: "8px 20px" }}
                    >
                      {enviandoMensaje ? "Enviando..." : "Enviar Mensaje"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENIDO PESTAÑA 3: COMUNICACIÓN INTERNA (SOLO SI TIENE PERMISO) */}
      {pestanaActiva === "interna" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!tienePermisoInterno ? (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #fee2e2",
                borderRadius: 10,
                padding: 32,
                textAlign: "center",
              }}
            >
              <h2 style={{ fontSize: 16, color: "#991b1b", margin: "0 0 6px 0" }}>
                Acceso Reservado a Notas Internas
              </h2>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>
                La comunicación interna está reservada exclusivamente para el equipo técnico y usuarios con prioridad institucional ejecutiva o VIP.
              </p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 20,
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    backgroundColor: "#f3e8ff",
                    color: "#7c3aed",
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 6,
                  }}
                >
                  Canal Privado
                </span>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Notas Técnicas y Coordinación Interna
                </h2>
              </div>
              <p style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
                Este espacio contiene notas de diagnóstico, derivaciones y discusiones reservadas del equipo de especialistas de TI.
              </p>

              {/* Listado de Comentarios Internos */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {comentariosInternos.length === 0 ? (
                  <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8", fontSize: 13, fontStyle: "italic" }}>
                    No hay notas internas registradas en este ticket.
                  </div>
                ) : (
                  comentariosInternos.map((c) => (
                    <div
                      key={c.id_comentario}
                      style={{
                        backgroundColor: "#faf5ff",
                        border: "1px solid #e9d5ff",
                        borderRadius: 10,
                        padding: "12px 16px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed" }}>[NOTA INTERNA]</span>
                          <strong style={{ fontSize: 12, color: "#581c87" }}>
                            {c.autor_nombre} ({c.autor_perfil || "Especialista TI"})
                          </strong>
                        </div>
                        <span style={{ fontSize: 10.5, color: "#64748b" }}>
                          {new Date(c.fecha_creacion).toLocaleDateString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: 12.5, color: "#3b0764", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {c.comentario}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario de Envío de Nota Interna */}
              {!esFinalizado && (
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
                  {errorMensaje && (
                    <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>
                      {errorMensaje}
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <textarea
                      rows={3}
                      className="input-base"
                      placeholder="Registrar nota técnica o de coordinación interna..."
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      style={{ fontSize: 12.5, backgroundColor: "#faf5ff" }}
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        disabled={enviandoMensaje || !nuevoMensaje.trim()}
                        onClick={() => enviarComentario(true)}
                        className="boton-primario"
                        style={{ width: "auto", fontSize: 13, padding: "8px 20px", backgroundColor: "#7c3aed" }}
                      >
                        {enviandoMensaje ? "Registrando..." : "Registrar Nota Interna"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Acción Operativa ITIL */}
      {modalOperativo !== "ninguno" && (
        <div
          onClick={() => setModalOperativo("ninguno")}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              maxWidth: 520,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontSize: 15, color: "#0f172a" }}>
                {modalOperativo === "espera" && "Poner Ticket en Espera (Pausar SLA)"}
                {modalOperativo === "resolver" && "Registrar Solución Técnica y Resolver"}
                {modalOperativo === "cancelar" && "Cancelar Ticket"}
                {modalOperativo === "reabrir" && "Reabrir Ticket"}
                {modalOperativo === "asignar" && "Asignar Especialista Técnico"}
              </strong>
              <button
                type="button"
                onClick={() => setModalOperativo("ninguno")}
                style={{ background: "none", border: "none", fontSize: 18, color: "#64748b", cursor: "pointer", fontWeight: 700 }}
              >
                X
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {errorOperativo && (
                <div style={{ padding: 10, backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12.5 }}>
                  {errorOperativo}
                </div>
              )}

              {modalOperativo === "espera" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Motivo de Espera *
                    </label>
                    <select
                      className="input-base"
                      value={motivoEsperaId}
                      onChange={(e) => setMotivoEsperaId(Number(e.target.value))}
                      style={{ fontSize: 13 }}
                    >
                      {(catalogos?.motivosEspera || [
                        { id_motivo_espera: 1, nombre: "En espera de respuesta del usuario" },
                        { id_motivo_espera: 2, nombre: "En espera de tercero o proveedor" },
                        { id_motivo_espera: 3, nombre: "En espera de repuestos o equipamiento" },
                      ]).map((m) => (
                        <option key={m.id_motivo_espera} value={m.id_motivo_espera}>
                          {m.nombre}
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                      El reloj del SLA se pausará temporalmente mientras el ticket permanezca en espera.
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setModalOperativo("ninguno")}
                      className="boton-secundario"
                      style={{ width: "auto", fontSize: 12.5 }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={ejecutandoAccion}
                      onClick={() => ejecutarAccion({ id_estado: 4, id_motivo_espera: motivoEsperaId })}
                      className="boton-primario"
                      style={{ width: "auto", fontSize: 12.5, backgroundColor: "#d97706" }}
                    >
                      {ejecutandoAccion ? "Pausando..." : "Confirmar Pausa"}
                    </button>
                  </div>
                </>
              )}

              {modalOperativo === "resolver" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Categoría de Solución *
                    </label>
                    <select
                      className="input-base"
                      value={categoriaResolucion}
                      onChange={(e) => setCategoriaResolucion(e.target.value)}
                      style={{ fontSize: 13 }}
                    >
                      <option value="Solución definitiva">Solución definitiva</option>
                      <option value="Solución temporal / Workaround">Solución temporal / Workaround</option>
                      <option value="Configuración aplicada">Configuración aplicada</option>
                      <option value="Asesoría / Capacitación al usuario">Asesoría / Capacitación al usuario</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Detalle de la Solución Técnica Aplicada *
                    </label>
                    <textarea
                      rows={4}
                      className="input-base"
                      placeholder="Describe la causa diagnosticada y los pasos técnicos realizados para resolver el caso..."
                      value={solucionTexto}
                      onChange={(e) => setSolucionTexto(e.target.value)}
                      style={{ fontSize: 12.5 }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setModalOperativo("ninguno")}
                      className="boton-secundario"
                      style={{ width: "auto", fontSize: 12.5 }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={ejecutandoAccion || solucionTexto.trim().length < 10}
                      onClick={() =>
                        ejecutarAccion({
                          id_estado: 5,
                          solucion_aplicada: solucionTexto.trim(),
                          categoria_resolucion: categoriaResolucion,
                        })
                      }
                      className="boton-primario"
                      style={{ width: "auto", fontSize: 12.5, backgroundColor: "#16a34a" }}
                    >
                      {ejecutandoAccion ? "Guardando..." : "Confirmar Resolución"}
                    </button>
                  </div>
                </>
              )}

              {modalOperativo === "cancelar" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Motivo de Cancelación *
                    </label>
                    <textarea
                      rows={3}
                      className="input-base"
                      placeholder="Indica la razón de la cancelación (duplicado, error de usuario, requerimiento desistido)..."
                      value={motivoCancelacionTexto}
                      onChange={(e) => setMotivoCancelacionTexto(e.target.value)}
                      style={{ fontSize: 12.5 }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setModalOperativo("ninguno")}
                      className="boton-secundario"
                      style={{ width: "auto", fontSize: 12.5 }}
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      disabled={ejecutandoAccion || motivoCancelacionTexto.trim().length < 5}
                      onClick={() =>
                        ejecutarAccion({
                          id_estado: 7,
                          motivo_cancelacion: motivoCancelacionTexto.trim(),
                        })
                      }
                      className="boton-primario"
                      style={{ width: "auto", fontSize: 12.5, backgroundColor: "#dc2626" }}
                    >
                      {ejecutandoAccion ? "Cancelando..." : "Confirmar Cancelación"}
                    </button>
                  </div>
                </>
              )}

              {modalOperativo === "reabrir" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Motivo de Reapertura *
                    </label>
                    <textarea
                      rows={3}
                      className="input-base"
                      placeholder="Indica por qué se reabre el ticket (la falla persiste, solución no efectiva)..."
                      value={motivoReaperturaTexto}
                      onChange={(e) => setMotivoReaperturaTexto(e.target.value)}
                      style={{ fontSize: 12.5 }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setModalOperativo("ninguno")}
                      className="boton-secundario"
                      style={{ width: "auto", fontSize: 12.5 }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={ejecutandoAccion || motivoReaperturaTexto.trim().length < 5}
                      onClick={() =>
                        ejecutarAccion({
                          id_estado: 3,
                          es_reapertura: true,
                          motivo_reapertura: motivoReaperturaTexto.trim(),
                        })
                      }
                      className="boton-primario"
                      style={{ width: "auto", fontSize: 12.5, backgroundColor: "#2563eb" }}
                    >
                      {ejecutandoAccion ? "Reabriendo..." : "Confirmar Reapertura"}
                    </button>
                  </div>
                </>
              )}

              {modalOperativo === "asignar" && (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 4 }}>
                      Seleccionar Especialista Técnico *
                    </label>
                    <select
                      className="input-base"
                      value={tecnicoSeleccionadoId}
                      onChange={(e) => setTecnicoSeleccionadoId(e.target.value ? Number(e.target.value) : "")}
                      style={{ fontSize: 13 }}
                    >
                      <option value="">Seleccione un especialista...</option>
                      {(catalogos?.tecnicos || []).map((tec) => (
                        <option key={tec.id_usuario} value={tec.id_usuario}>
                          {tec.nombre} ({tec.correo})
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
                      El ticket será asignado directamente a este especialista y cambiará a estado Asignado.
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setModalOperativo("ninguno")}
                      className="boton-secundario"
                      style={{ width: "auto", fontSize: 12.5 }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={ejecutandoAccion || !tecnicoSeleccionadoId}
                      onClick={() =>
                        ejecutarAccion({
                          id_usuario_asignado: Number(tecnicoSeleccionadoId),
                          id_estado: 2,
                        })
                      }
                      className="boton-primario"
                      style={{ width: "auto", fontSize: 12.5, backgroundColor: "#2563eb" }}
                    >
                      {ejecutandoAccion ? "Asignando..." : "Confirmar Asignación"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Visor de Evidencias */}
      {imagenSeleccionada && (
        <div
          onClick={() => setImagenSeleccionada(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              maxWidth: "92vw",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#ffffff",
              }}
            >
              <strong style={{ fontSize: 13, color: "#0f172a" }}>{imagenSeleccionada.nombre}</strong>
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={imagenSeleccionada.url}
                  download={imagenSeleccionada.nombre}
                  className="boton-secundario"
                  style={{ textDecoration: "none", fontSize: 12, padding: "5px 12px", width: "auto" }}
                >
                  Descargar
                </a>
                <button
                  type="button"
                  onClick={() => setImagenSeleccionada(null)}
                  className="boton-primario"
                  style={{ fontSize: 12, padding: "5px 14px", width: "auto" }}
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div
              style={{
                padding: 16,
                overflow: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0f172a",
              }}
            >
              <img
                src={imagenSeleccionada.url}
                alt={imagenSeleccionada.nombre}
                style={{ maxWidth: "100%", maxHeight: "78vh", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
