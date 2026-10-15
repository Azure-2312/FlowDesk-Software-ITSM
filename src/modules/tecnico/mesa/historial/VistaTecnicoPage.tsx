"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types";

export default function PaginaHistorialResueltos() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroSla, setFiltroSla] = useState("todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  async function cargarResueltos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets?vista=resueltos&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No se pudo obtener el historial de resueltos.");
        return;
      }
      setTickets(data.tickets || []);
    } catch {
      setError("Error de conexión al cargar el historial de resueltos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarResueltos();
  }, []);

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      if (filtroSla === "cumplido" && !t.sla_cumplido) return false;
      if (filtroSla === "incumplido" && t.sla_cumplido) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchCod = t.codigo_ticket?.toLowerCase().includes(q);
        const matchTit = t.titulo?.toLowerCase().includes(q);
        const matchSol = t.solicitante_nombre?.toLowerCase().includes(q);
        const matchRes = t.categoria_resolucion?.toLowerCase().includes(q);
        if (!matchCod && !matchTit && !matchSol && !matchRes) return false;
      }

      return true;
    });
  }, [tickets, filtroSla, busqueda]);

  const totalCumplidos = tickets.filter((t) => t.sla_cumplido).length;
  const porcentajeSla = tickets.length > 0 ? Math.round((totalCumplidos / tickets.length) * 100) : 100;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Historial de resueltos
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Registro histórico de tickets finalizados y cumplimiento de nivel de servicio ({ticketsFiltrados.length} tickets)
          </p>
        </div>

        <button
          type="button"
          onClick={cargarResueltos}
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

      {/* Barra de Búsqueda con Botón Filtro único */}
      <div style={{ display: "flex", gap: 10, marginBottom: mostrarFiltros ? 10 : 16 }}>
        <input
          type="text"
          placeholder="Buscar por código, título, solicitante o resolución..."
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
            backgroundColor: mostrarFiltros || filtroSla !== "todos" ? "#eff6ff" : "#ffffff",
            border: `1px solid ${mostrarFiltros || filtroSla !== "todos" ? "#2563eb" : "#cbd5e1"}`,
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            color: mostrarFiltros || filtroSla !== "todos" ? "#1d4ed8" : "#334155",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Filtro
          {filtroSla !== "todos" && (
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
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#475569" }}>Cumplimiento SLA:</span>
            <select
              value={filtroSla}
              onChange={(e) => setFiltroSla(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5 }}
            >
              <option value="todos">Todos los cumplimientos</option>
              <option value="cumplido">SLA Cumplido</option>
              <option value="incumplido">SLA Incumplido</option>
            </select>
          </div>

          {filtroSla !== "todos" && (
            <button
              type="button"
              onClick={() => setFiltroSla("todos")}
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
              Limpiar filtro
            </button>
          )}
        </div>
      )}

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: 14 }}>
          Cargando historial de resueltos...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && ticketsFiltrados.length === 0 && (
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
            No hay tickets en el historial
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No se encontraron tickets resueltos o cerrados con los filtros indicados.
          </p>
        </div>
      )}

      {!cargando && !error && ticketsFiltrados.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>ID</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tipo</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Código Resolución</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>SLA</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Fecha Resolución</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((t) => (
                <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    <Link href={`/tickets/${t.id_ticket}`}>{t.codigo_ticket}</Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {t.tipo_nombre || (t.id_tipo_ticket === 1 ? "Incidente" : "Solicitud")}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 280 }}>
                    <Link href={`/tickets/${t.id_ticket}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {t.titulo}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {t.solicitante_nombre || "Usuario"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#334155" }}>
                    {t.categoria_resolucion || "Solución aplicada"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: t.sla_cumplido ? "#ecfdf5" : "#fef2f2",
                        color: t.sla_cumplido ? "#065f46" : "#991b1b",
                      }}
                    >
                      {t.sla_cumplido ? "Cumplido" : "Incumplido"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#64748b" }}>
                    {t.fecha_resolucion
                      ? new Date(t.fecha_resolucion).toLocaleDateString("es-ES", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "Finalizado"}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href={`/tickets/${t.id_ticket}`}
                      style={{
                        padding: "4px 10px",
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontSize: 12,
                        color: "#1e293b",
                        textDecoration: "none",
                      }}
                    >
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
