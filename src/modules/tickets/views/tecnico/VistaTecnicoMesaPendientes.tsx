"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Ticket } from "@/types";

export default function PaginaBandejaPendientes() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [tomandoId, setTomandoId] = useState<number | null>(null);

  // Filtros
  const [segmento, setSegmento] = useState<"todos" | "incidentes" | "solicitudes" | "criticos">("todos");
  const [busqueda, setBusqueda] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  async function cargarPendientes() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets?vista=bandeja&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No se pudo obtener la bandeja de pendientes.");
        return;
      }
      setTickets(data.tickets || []);
    } catch {
      setError("Error de conexión al cargar la bandeja de pendientes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarPendientes();
  }, []);

  async function tomarTicket(idTicket: number) {
    setTomandoId(idTicket);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/tickets/mesa/tomar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_ticket: idTicket }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No fue posible tomar el ticket.");
        cargarPendientes();
        return;
      }
      setMensajeExito(data.mensaje || "Ticket tomado correctamente.");
      setTimeout(() => {
        router.push(`/tickets/${idTicket}`);
      }, 700);
    } catch {
      setError("Error de conexión al intentar tomar el ticket.");
    } finally {
      setTomandoId(null);
    }
  }

  const ticketsFiltrados = useMemo(() => {
    return tickets
      .filter((t) => {
        if (segmento === "incidentes" && t.id_tipo_ticket !== 1) return false;
        if (segmento === "solicitudes" && t.id_tipo_ticket !== 2) return false;
        if (segmento === "criticos" && !["P1", "P2"].includes(t.prioridad_codigo || "")) return false;

        if (busqueda.trim()) {
          const q = busqueda.toLowerCase().trim();
          const matchCod = t.codigo_ticket?.toLowerCase().includes(q);
          const matchTit = t.titulo?.toLowerCase().includes(q);
          const matchSol = t.solicitante_nombre?.toLowerCase().includes(q);
          if (!matchCod && !matchTit && !matchSol) return false;
        }

        if (filtroPrioridad !== "todos" && t.prioridad_codigo !== filtroPrioridad) return false;

        return true;
      })
      .sort((a, b) => {
        // P1/P2 primero, luego antigüedad
        const prioRank: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
        const aPrio = prioRank[a.prioridad_codigo || "P4"] || 5;
        const bPrio = prioRank[b.prioridad_codigo || "P4"] || 5;
        if (aPrio !== bPrio) return aPrio - bPrio;

        return new Date(a.fecha_creacion).getTime() - new Date(b.fecha_creacion).getTime();
      });
  }, [tickets, segmento, busqueda, filtroPrioridad]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Bandeja de pendientes
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Tickets sin especialista asignado en tu grupo de soporte ({ticketsFiltrados.length} en cola)
          </p>
        </div>

        <button
          type="button"
          onClick={cargarPendientes}
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

      {mensajeExito && (
        <div style={{ padding: 14, backgroundColor: "#ecfdf5", color: "#065f46", borderRadius: 6, marginBottom: 16 }}>
          {mensajeExito} Redirigiendo al espacio de trabajo...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Barra de Búsqueda con Botón Filtro único */}
      <div style={{ display: "flex", gap: 10, marginBottom: mostrarFiltros ? 10 : 16 }}>
        <input
          type="text"
          placeholder="Buscar por código, título o solicitante..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        />

        <button
          type="button"
          onClick={() => setMostrarFiltros((prev) => !prev)}
          style={{
            padding: "8px 16px",
            backgroundColor: mostrarFiltros || (segmento !== "todos" || filtroPrioridad !== "todos") ? "#eff6ff" : "#ffffff",
            border: `1px solid ${mostrarFiltros || (segmento !== "todos" || filtroPrioridad !== "todos") ? "#2563eb" : "#cbd5e1"}`,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            color: mostrarFiltros || (segmento !== "todos" || filtroPrioridad !== "todos") ? "#1d4ed8" : "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Filtro
          {(segmento !== "todos" || filtroPrioridad !== "todos") && (
            <span
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "50%",
                width: 16,
                height: 16,
                fontSize: 10.5,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              !
            </span>
          )}
        </button>
      </div>

      {/* Panel Desplegable de Filtro */}
      {mostrarFiltros && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Tipo:</span>
            <select
              value={segmento}
              onChange={(e) => setSegmento(e.target.value as any)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
            >
              <option value="todos">Todos</option>
              <option value="criticos">Críticos P1 y P2</option>
              <option value="incidentes">Incidentes</option>
              <option value="solicitudes">Solicitudes</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Prioridad:</span>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
            >
              <option value="todos">Todas las prioridades</option>
              <option value="P1">P1 - Crítica</option>
              <option value="P2">P2 - Alta</option>
              <option value="P3">P3 - Media</option>
              <option value="P4">P4 - Baja</option>
            </select>
          </div>

          {(segmento !== "todos" || filtroPrioridad !== "todos") && (
            <button
              type="button"
              onClick={() => {
                setSegmento("todos");
                setFiltroPrioridad("todos");
              }}
              style={{
                fontSize: 12,
                color: "#dc2626",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: 14 }}>
          Cargando bandeja de pendientes...
        </div>
      )}

      {!cargando && ticketsFiltrados.length === 0 && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1e293b", marginBottom: 6 }}>
            No hay tickets pendientes en tu grupo
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Todos los expedientes de tu área están actualmente asignados o resueltos.
          </p>
        </div>
      )}

      {!cargando && ticketsFiltrados.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Ingreso</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((t) => {
                const esCritico = ["P1", "P2"].includes(t.prioridad_codigo || "");
                return (
                  <tr
                    key={t.id_ticket}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: esCritico ? "#fffbeb" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                      <Link href={`/tickets/${t.id_ticket}`}>{t.codigo_ticket}</Link>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>
                      {t.tipo_nombre || (t.id_tipo_ticket === 1 ? "Incidente" : "Solicitud")}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 320 }}>
                      <Link href={`/tickets/${t.id_ticket}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {t.titulo}
                      </Link>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>
                      {t.solicitante_nombre || "Usuario"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          backgroundColor:
                            t.prioridad_codigo === "P1"
                              ? "#fecaca"
                              : t.prioridad_codigo === "P2"
                              ? "#fed7aa"
                              : t.prioridad_codigo === "P3"
                              ? "#fef08a"
                              : "#e2e8f0",
                          color:
                            t.prioridad_codigo === "P1"
                              ? "#991b1b"
                              : t.prioridad_codigo === "P2"
                              ? "#9a3412"
                              : t.prioridad_codigo === "P3"
                              ? "#854d0e"
                              : "#334155",
                        }}
                      >
                        {t.prioridad_codigo || "P4"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#64748b" }}>
                      {new Date(t.fecha_creacion).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <Link
                          href={`/tickets/${t.id_ticket}`}
                          style={{
                            display: "inline-block",
                            padding: "5px 10px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #cbd5e1",
                            borderRadius: 4,
                            fontSize: 12,
                            color: "#1e293b",
                            textDecoration: "none",
                          }}
                        >
                          Ver
                        </Link>
                        <button
                          type="button"
                          disabled={tomandoId === t.id_ticket}
                          onClick={() => tomarTicket(t.id_ticket)}
                          style={{
                            padding: "5px 12px",
                            backgroundColor: "#2563eb",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#ffffff",
                            cursor: tomandoId === t.id_ticket ? "not-allowed" : "pointer",
                          }}
                        >
                          {tomandoId === t.id_ticket ? "Tomando..." : "Tomar ticket"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
