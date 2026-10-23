"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types";

interface Recordatorio {
  id_recordatorio: number;
  titulo: string;
  fecha_hora: string;
  completado?: boolean;
}

export default function PaginaAgendaDisponibilidad() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState<"agenda" | "semana">("agenda");

  // Modal Recordatorio personal
  const [modalNuevo, setModalNuevo] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fechaHora, setFechaHora] = useState(() => new Date().toISOString().slice(0, 16));
  const [guardando, setGuardando] = useState(false);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [resTickets, resRec] = await Promise.all([
        fetch(`/api/tickets?vista=asignados&_t=${Date.now()}`).then((r) => r.json()).catch(() => ({ tickets: [] })),
        fetch(`/api/operacion/recordatorios?_t=${Date.now()}`).then((r) => r.json()).catch(() => ({ recordatorios: [] })),
      ]);
      setTickets(resTickets.tickets || []);
      setRecordatorios(resRec.recordatorios || []);
    } catch (e) {
      console.error("Error al cargar agenda:", e);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarDatos();
  }, []);

  async function crearRecordatorio(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo.trim()) return;

    setGuardando(true);
    try {
      const res = await fetch("/api/operacion/recordatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          fecha_hora: fechaHora,
        }),
      });
      if (res.ok) {
        setModalNuevo(false);
        setTitulo("");
        cargarDatos();
      }
    } catch (e) {
      console.error("Error al crear recordatorio:", e);
    } finally {
      setGuardando(false);
    }
  }

  // 1. Cálculo de Estado Operativo y Capacidad (ITIL)
  const ticketsActivos = useMemo(() => {
    return tickets.filter((t) => !t.es_terminal);
  }, [tickets]);

  const capacidadMaxima = 10;
  const tieneCriticoP1 = ticketsActivos.some((t) => t.prioridad_codigo === "P1");
  const estaSaturado = ticketsActivos.length >= capacidadMaxima;

  const estadoOperativo = estaSaturado
    ? { etiqueta: "Ocupado (Capacidad Máxima)", color: "#dc2626", bg: "#fef2f2" }
    : tieneCriticoP1
    ? { etiqueta: "Ocupado (Atendiendo Incidente P1 Crítico)", color: "#d97706", bg: "#fffbeb" }
    : { etiqueta: "Disponible para Asignación", color: "#16a34a", bg: "#ecfdf5" };

  // 2. Unificación de Actividades (Tickets con SLA límite + Recordatorios)
  const itemsAgenda = useMemo(() => {
    const lista: Array<{
      id: string;
      tipo: "ticket" | "recordatorio";
      titulo: string;
      fecha: string;
      codigo?: string;
      id_ticket?: number;
      prioridad?: string;
      sla_vencido?: boolean;
      estado_nombre?: string;
    }> = [];

    // Agregar tickets asignados
    ticketsActivos.forEach((t) => {
      lista.push({
        id: `ticket-${t.id_ticket}`,
        tipo: "ticket",
        titulo: t.titulo,
        fecha: t.fecha_limite_sla || t.fecha_creacion,
        codigo: t.codigo_ticket,
        id_ticket: t.id_ticket,
        prioridad: t.prioridad_codigo,
        sla_vencido: t.sla_vencido,
        estado_nombre: t.estado_nombre,
      });
    });

    // Agregar recordatorios
    recordatorios.forEach((r) => {
      lista.push({
        id: `rec-${r.id_recordatorio}`,
        tipo: "recordatorio",
        titulo: r.titulo,
        fecha: r.fecha_hora,
      });
    });

    // Ordenar cronológicamente
    return lista.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }, [ticketsActivos, recordatorios]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Mi agenda y compromisos de SLA
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Cronograma de vencimiento de tickets asignados, ventanas de atención y recordatorios de turno
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => setModalNuevo(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#2563eb",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Nuevo recordatorio
          </button>

          <button
            type="button"
            onClick={cargarDatos}
            style={{
              padding: "8px 14px",
              backgroundColor: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              fontSize: 13,
              color: "#334155",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Bloque de Disponibilidad Operativa Calculada Automáticamente */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#475569" }}>
              Estado operativo en sistema:
            </span>
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 6,
                backgroundColor: estadoOperativo.bg,
                color: estadoOperativo.color,
                border: `1px solid ${estadoOperativo.color}40`,
              }}
            >
              {estadoOperativo.etiqueta}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 4 }}>
            Gobernado automáticamente por tu carga activa: {ticketsActivos.length} tickets asignados de un umbral máximo sugerido de {capacidadMaxima}.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
              Tickets Activos
            </span>
            <strong style={{ fontSize: 18, color: "#0f172a" }}>{ticketsActivos.length}</strong>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 11, color: "#64748b", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
              SLA en Riesgo / Vencidos
            </span>
            <strong style={{ fontSize: 18, color: ticketsActivos.filter((t) => t.sla_vencido).length > 0 ? "#dc2626" : "#16a34a" }}>
              {ticketsActivos.filter((t) => t.sla_vencido).length}
            </strong>
          </div>
        </div>
      </div>

      {/* Selector de Vista */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setVista("agenda")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: vista === "agenda" ? 600 : 500,
            border: "none",
            backgroundColor: vista === "agenda" ? "#2563eb" : "#f1f5f9",
            color: vista === "agenda" ? "#ffffff" : "#475569",
            cursor: "pointer",
          }}
        >
          Vista Agenda ({itemsAgenda.length})
        </button>
        <button
          type="button"
          onClick={() => setVista("semana")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: vista === "semana" ? 600 : 500,
            border: "none",
            backgroundColor: vista === "semana" ? "#2563eb" : "#f1f5f9",
            color: vista === "semana" ? "#ffffff" : "#475569",
            cursor: "pointer",
          }}
        >
          Vista Semanal
        </button>
      </div>

      {/* Lista de Agenda de Tickets y Actividades */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 20 }}>
        {cargando ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "#64748b" }}>Cargando agenda...</div>
        ) : itemsAgenda.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
              No tienes tickets pendientes ni actividades agendadas
            </div>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
              Cuando se te asignen tickets en la mesa de servicio, aparecerán aquí con sus límites de SLA.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {itemsAgenda.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: item.sla_vencido ? "#fef2f2" : "#f8fafc",
                  borderRadius: 6,
                  border: `1px solid ${item.sla_vencido ? "#fca5a5" : "#e2e8f0"}`,
                  gap: 14,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 3 }}>
                    {item.tipo === "ticket" && (
                      <>
                        <Link
                          href={`/tickets/${item.id_ticket}`}
                          style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            color: "#2563eb",
                            textDecoration: "none",
                            fontSize: 13,
                          }}
                        >
                          {item.codigo}
                        </Link>
                        <span
                          style={{
                            padding: "2px 6px",
                            borderRadius: 4,
                            fontSize: 10.5,
                            fontWeight: 700,
                            backgroundColor:
                              item.prioridad === "P1"
                                ? "#fee2e2"
                                : item.prioridad === "P2"
                                ? "#ffedd5"
                                : "#fef9c3",
                            color:
                              item.prioridad === "P1"
                                ? "#991b1b"
                                : item.prioridad === "P2"
                                ? "#9a3412"
                                : "#854d0e",
                          }}
                        >
                          {item.prioridad || "P4"}
                        </span>
                        <span style={{ fontSize: 11, color: "#64748b" }}>
                          Estado: {item.estado_nombre}
                        </span>
                      </>
                    )}
                    {item.tipo === "recordatorio" && (
                      <span
                        style={{
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontSize: 10.5,
                          fontWeight: 700,
                          backgroundColor: "#f3e8ff",
                          color: "#7e22ce",
                        }}
                      >
                        Recordatorio
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                    {item.tipo === "ticket" ? (
                      <Link
                        href={`/tickets/${item.id_ticket}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {item.titulo}
                      </Link>
                    ) : (
                      item.titulo
                    )}
                  </div>

                  <div style={{ fontSize: 11.5, color: item.sla_vencido ? "#dc2626" : "#64748b", marginTop: 4 }}>
                    {item.tipo === "ticket" ? "Compromiso de resolución (SLA): " : "Programado para: "}
                    <strong>
                      {new Date(item.fecha).toLocaleDateString("es-ES", {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </strong>
                    {item.sla_vencido && " (SLA Vencido)"}
                  </div>
                </div>

                {item.tipo === "ticket" && (
                  <Link
                    href={`/tickets/${item.id_ticket}`}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1e293b",
                      textDecoration: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ver ticket
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Nuevo Recordatorio */}
      {modalNuevo && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setModalNuevo(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              width: "100%",
              maxWidth: 440,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Nuevo recordatorio de turno
            </h3>

            <form onSubmit={crearRecordatorio}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Título de la actividad *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Revisión programada de backups, reunión..."
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={fechaHora}
                  onChange={(e) => setFechaHora(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 13.5,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalNuevo(false)}
                  style={{
                    padding: "8px 14px",
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    fontSize: 13,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: guardando ? "not-allowed" : "pointer",
                  }}
                >
                  {guardando ? "Guardando..." : "Guardar recordatorio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
