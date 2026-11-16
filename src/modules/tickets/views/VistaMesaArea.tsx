"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Ticket } from "@/types";

export default function PaginaTicketsArea() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");

  async function cargarTicketsArea() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tickets?vista=departamento&_t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "No se pudieron obtener los tickets del área.");
        return;
      }
      setTickets(data.tickets || []);
    } catch {
      setError("Error de conexión al cargar los tickets del área.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTicketsArea();
  }, []);

  const ticketsFiltrados = useMemo(() => {
    return tickets.filter((t) => {
      if (filtroTipo === "incidentes" && t.id_tipo_ticket !== 1) return false;
      if (filtroTipo === "solicitudes" && t.id_tipo_ticket !== 2) return false;
      if (filtroPrioridad !== "todos" && t.prioridad_codigo !== filtroPrioridad) return false;

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchCod = t.codigo_ticket?.toLowerCase().includes(q);
        const matchTit = t.titulo?.toLowerCase().includes(q);
        const matchTec = t.tecnico_nombre?.toLowerCase().includes(q);
        const matchSol = t.solicitante_nombre?.toLowerCase().includes(q);
        if (!matchCod && !matchTit && !matchTec && !matchSol) return false;
      }

      return true;
    });
  }, [tickets, filtroTipo, filtroPrioridad, busqueda]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Tickets de mi área técnica
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Visibilidad global y colaborativa de todos los casos del departamento ({ticketsFiltrados.length} tickets)
          </p>
        </div>

        <button
          type="button"
          onClick={cargarTicketsArea}
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

      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Buscar por código, título, especialista o solicitante..."
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

        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        >
          <option value="todos">Todos los tipos</option>
          <option value="incidentes">Incidentes</option>
          <option value="solicitudes">Solicitudes</option>
        </select>

        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          style={{
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
          }}
        >
          <option value="todos">Todas las prioridades</option>
          <option value="P1">P1 - Crítica</option>
          <option value="P2">P2 - Alta</option>
          <option value="P3">P3 - Media</option>
          <option value="P4">P4 - Baja</option>
        </select>
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: 14 }}>
          Cargando tickets del área técnica...
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
            No se encontraron tickets en el departamento
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            No hay registros abiertos que coincidan con los filtros aplicados.
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
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Especialista Asignado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Solicitante</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {ticketsFiltrados.map((t) => (
                <tr key={t.id_ticket} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#2563eb" }}>
                    <Link href={`/plataforma/tickets/${t.id_ticket}`}>{t.codigo_ticket}</Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#475569" }}>
                    {t.tipo_nombre || (t.id_tipo_ticket === 1 ? "Incidente" : "Solicitud")}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#1e293b", fontWeight: 500, maxWidth: 300 }}>
                    <Link href={`/plataforma/tickets/${t.id_ticket}`} style={{ textDecoration: "none", color: "inherit" }}>
                      {t.titulo}
                    </Link>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#0f172a", fontWeight: 500 }}>
                    {t.tecnico_nombre ? t.tecnico_nombre : <span style={{ color: "#d97706" }}>Sin asignar</span>}
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
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        color: "#334155",
                      }}
                    >
                      {t.estado_nombre || "Abierto"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <Link
                      href={`/plataforma/tickets/${t.id_ticket}`}
                      style={{
                        display: "inline-block",
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
