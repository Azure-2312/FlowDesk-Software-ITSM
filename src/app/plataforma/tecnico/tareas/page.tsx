"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";

interface TareaItem {
  id: string | number;
  titulo: string;
  descripcion?: string;
  origenTipo: "Ticket" | "Cambio RFC" | "Problema" | "Recordatorio";
  origenCodigo: string;
  origenUrl?: string;
  fechaVencimiento: string;
  completada: boolean;
  esPersonal: boolean;
}

export default function PaginaMisTareas() {
  const [tareas, setTareas] = useState<TareaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [segmento, setSegmento] = useState<"hoy" | "semana" | "vencidas" | "todas">("todas");
  const [busqueda, setBusqueda] = useState("");

  // Modal Nuevo Recordatorio
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState(() => new Date().toISOString().slice(0, 16));
  const [guardando, setGuardando] = useState(false);

  async function cargarTareas() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/tecnico/recordatorios?_t=${Date.now()}`);
      const data = await res.json();
      const recs: any[] = data.recordatorios || [];

      // Mapear recordatorios a la lista única de tareas
      const lista: TareaItem[] = recs.map((r) => ({
        id: r.id_recordatorio,
        titulo: r.titulo,
        descripcion: r.descripcion,
        origenTipo: "Recordatorio",
        origenCodigo: `REC-${r.id_recordatorio}`,
        origenUrl: "/tecnico/agenda",
        fechaVencimiento: r.fecha_hora,
        completada: r.completado,
        esPersonal: true,
      }));

      setTareas(lista);
    } catch {
      setError("Error de conexión al cargar las tareas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTareas();
  }, []);

  async function toggleCompletada(id: string | number, estadoActual: boolean) {
    try {
      await fetch("/api/tecnico/recordatorios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_recordatorio: id, completado: !estadoActual }),
      });
      cargarTareas();
    } catch (e) {
      console.error("Error al actualizar tarea:", e);
    }
  }

  async function crearRecordatorio(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoTitulo.trim()) return;

    setGuardando(true);
    try {
      const res = await fetch("/api/tecnico/recordatorios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: nuevoTitulo.trim(),
          descripcion: nuevaDescripcion.trim() || null,
          fecha_hora: nuevaFecha,
        }),
      });
      if (res.ok) {
        setModalNuevo(false);
        setNuevoTitulo("");
        setNuevaDescripcion("");
        cargarTareas();
      }
    } catch (e) {
      console.error("Error al crear recordatorio:", e);
    } finally {
      setGuardando(false);
    }
  }

  const ahora = new Date();
  const finDeHoy = new Date();
  finDeHoy.setHours(23, 59, 59, 999);
  const finDeSemana = new Date();
  finDeSemana.setDate(finDeSemana.getDate() + 7);

  const tareasFiltradas = useMemo(() => {
    return tareas.filter((t) => {
      const f = new Date(t.fechaVencimiento);

      if (segmento === "hoy") {
        if (f > finDeHoy || t.completada) return false;
      } else if (segmento === "semana") {
        if (f > finDeSemana || t.completada) return false;
      } else if (segmento === "vencidas") {
        if (f >= ahora || t.completada) return false;
      }

      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim();
        const matchTit = t.titulo.toLowerCase().includes(q);
        const matchCod = t.origenCodigo.toLowerCase().includes(q);
        if (!matchTit && !matchCod) return false;
      }

      return true;
    });
  }, [tareas, segmento, busqueda, ahora, finDeHoy, finDeSemana]);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Mis tareas unificadas
          </h1>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: "4px 0 0" }}>
            Lista consolidada de tareas operativas y recordatorios ({tareasFiltradas.length} tareas)
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
            onClick={cargarTareas}
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

      {/* Segmentos */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
        <button
          type="button"
          onClick={() => setSegmento("todas")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "todas" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "todas" ? "#2563eb" : "transparent",
            color: segmento === "todas" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => setSegmento("hoy")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "hoy" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "hoy" ? "#2563eb" : "transparent",
            color: segmento === "hoy" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Para hoy
        </button>
        <button
          type="button"
          onClick={() => setSegmento("semana")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "semana" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "semana" ? "#2563eb" : "transparent",
            color: segmento === "semana" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Esta semana
        </button>
        <button
          type="button"
          onClick={() => setSegmento("vencidas")}
          style={{
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: segmento === "vencidas" ? 600 : 500,
            border: "none",
            backgroundColor: segmento === "vencidas" ? "#dc2626" : "transparent",
            color: segmento === "vencidas" ? "#ffffff" : "#64748b",
            cursor: "pointer",
          }}
        >
          Vencidas
        </button>
      </div>

      {/* Buscador */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Filtrar tareas por título o código de origen..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            backgroundColor: "#ffffff",
            boxSizing: "border-box",
          }}
        />
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: 14 }}>
          Cargando tareas...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && tareasFiltradas.length === 0 && (
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
            No tienes tareas pendientes en esta vista
          </div>
          <p style={{ fontSize: 13.5, color: "#64748b", margin: 0 }}>
            Puedes registrar un recordatorio personal para tus actividades operativas.
          </p>
        </div>
      )}

      {!cargando && !error && tareasFiltradas.length > 0 && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "12px 16px", width: 40 }}>Estado</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Tarea</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Origen</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Vence</th>
                <th style={{ padding: "12px 16px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {tareasFiltradas.map((t) => {
                const vencida = !t.completada && new Date(t.fechaVencimiento) < new Date();

                return (
                  <tr
                    key={t.id}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      backgroundColor: t.completada ? "#f8fafc" : vencida ? "#fef2f2" : "transparent",
                    }}
                  >
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <input
                        type="checkbox"
                        checked={t.completada}
                        onChange={() => toggleCompletada(t.id, t.completada)}
                        style={{ cursor: "pointer" }}
                      />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: t.completada ? "#94a3b8" : "#0f172a",
                          textDecoration: t.completada ? "line-through" : "none",
                        }}
                      >
                        {t.titulo}
                      </div>
                      {t.descripcion && (
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                          {t.descripcion}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#475569" }}>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: "#e2e8f0",
                          color: "#334155",
                          marginRight: 6,
                        }}
                      >
                        {t.origenTipo}
                      </span>
                      <span>{t.origenCodigo}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: vencida ? "#dc2626" : "#475569" }}>
                      {new Date(t.fechaVencimiento).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {vencida && <span style={{ fontWeight: 600, marginLeft: 6 }}>(Vencida)</span>}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => toggleCompletada(t.id, t.completada)}
                        style={{
                          padding: "4px 10px",
                          backgroundColor: "#ffffff",
                          border: "1px solid #cbd5e1",
                          borderRadius: 4,
                          fontSize: 12,
                          color: "#334155",
                          cursor: "pointer",
                        }}
                      >
                        {t.completada ? "Reabrir" : "Completar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
              maxWidth: 460,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Nuevo recordatorio personal
            </h3>

            <form onSubmit={crearRecordatorio}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Título del recordatorio *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Revisar log del servidor de correo..."
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
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

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Fecha y hora límite
                </label>
                <input
                  type="datetime-local"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
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

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#475569", marginBottom: 6 }}>
                  Descripción u observaciones (opcional)
                </label>
                <textarea
                  placeholder="Detalles adicionales..."
                  value={nuevaDescripcion}
                  onChange={(e) => setNuevaDescripcion(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
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
                  {guardando ? "Guardando..." : "Crear recordatorio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
