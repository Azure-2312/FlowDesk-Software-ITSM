"use client";

import { useEffect, useState } from "react";

interface TicketRef {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  fecha: string | null;
}

interface Candidato {
  id_regla: number | null;
  regla: string | null;
  dimension: string;
  valor: string;
  total: number;
  tickets: TicketRef[];
}

interface Regla {
  id_regla: number;
  nombre: string;
  agrupar_por: string | null;
  umbral_incidentes: number | null;
  ventana_horas: number | null;
  activa: boolean;
}

interface Simple {
  id: number;
  nombre: string;
}

export default function VistaCandidatosProblemas() {
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [prioridades, setPrioridades] = useState<Simple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [procesandoClave, setProcesandoClave] = useState<string | null>(null);

  // Modal para editar candidato antes de aprobarlo
  const [candidatoEditando, setCandidatoEditando] = useState<Candidato | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editPrioridad, setEditPrioridad] = useState("");

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/problemas/gestion/candidatos?_t=${Date.now()}`);
      const json = await res.json();
      if (res.ok) {
        setCandidatos(Array.isArray(json?.candidatos) ? json.candidatos : []);
        setReglas(Array.isArray(json?.reglas) ? json.reglas : []);
        setPrioridades(Array.isArray(json?.prioridades) ? json.prioridades : []);
      } else {
        setError(json.error ?? "No se pudieron cargar los candidatos a problema.");
      }
    } catch {
      setError("Error de conexión al cargar candidatos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const claveDe = (c: Candidato) => `${c.dimension}:${c.valor}`;

  function abrirEdicion(c: Candidato) {
    setCandidatoEditando(c);
    setEditTitulo(`Problema recurrente: ${c.valor}`);
    setEditDescripcion(`Candidato detectado por regla de umbral agrupando por ${c.dimension} ("${c.valor}"). Incidentes asociados: ${c.tickets.map((t) => t.codigo_ticket).join(", ")}.`);
    setEditPrioridad(prioridades[1]?.id ? String(prioridades[1].id) : "2");
  }

  async function aprobarCandidato(c: Candidato, tituloCustom?: string, descCustom?: string, prioridadCustom?: string) {
    const clave = claveDe(c);
    setProcesandoClave(clave);
    setError(null);
    setOk(null);

    const tituloFinal = tituloCustom || `Problema recurrente: ${c.valor}`;
    const descFinal = descCustom || `Detectado por la regla "${c.regla ?? "automática"}" agrupando por ${c.dimension} ("${c.valor}").`;

    try {
      const res = await fetch("/api/problemas/gestion/candidatos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tituloFinal,
          descripcion: descFinal,
          ids_tickets: c.tickets.map((t) => t.id_ticket),
          id_prioridad: prioridadCustom ? Number(prioridadCustom) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "No se pudo aprobar y registrar el problema.");
      } else {
        setOk(`Candidato aprobado exitosamente. Se generó el problema ${json.codigo_problema}.`);
        setCandidatoEditando(null);
        await cargar();
      }
    } catch {
      setError("Error de conexión al aprobar el candidato.");
    } finally {
      setProcesandoClave(null);
    }
  }

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box" }}>
      {/* 1. Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>
            Candidatos a problema
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            Incidentes agrupados que superan los umbrales de recurrencia. Revisa, edita y aprueba su promoción a problema formal.
          </p>
        </div>

        <button
          type="button"
          onClick={cargar}
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

      {ok && (
        <div style={{ padding: "10px 14px", backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", borderRadius: 6, marginBottom: 14, fontSize: 13, fontWeight: 600 }}>
          {ok}
        </div>
      )}

      {error && (
        <div style={{ padding: "10px 14px", backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b", borderRadius: 6, marginBottom: 14, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Reglas de umbral informativas */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 18 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
          Reglas de umbral activas en el sistema:
        </span>
        {reglas.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "#64748b", margin: 0 }}>No hay reglas de umbral activas configuradas.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {reglas.map((r) => (
              <span
                key={r.id_regla}
                style={{
                  fontSize: 11.5,
                  padding: "3px 10px",
                  borderRadius: 4,
                  backgroundColor: r.activa ? "#f1f5f9" : "#fafafa",
                  color: "#334155",
                  border: "1px solid #e2e8f0",
                }}
              >
                {r.nombre} (por {r.agrupar_por ?? "servicio"} · ≥ {r.umbral_incidentes ?? 3} en {Math.round((r.ventana_horas ?? 720) / 24)}d)
              </span>
            ))}
          </div>
        )}
      </div>

      {cargando ? (
        <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
          Analizando incidentes y candidatos...
        </div>
      ) : candidatos.length === 0 ? (
        <div style={{ padding: "32px 20px", backgroundColor: "#ffffff", borderRadius: 8, border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b", fontSize: 13 }}>
          No se detectaron grupos de incidentes recurrentes que superen los umbrales configurados.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {candidatos.map((c) => {
            const clave = claveDe(c);
            const esProcesando = procesandoClave === clave;

            return (
              <div
                key={clave}
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 14,
                }}
              >
                <div style={{ flex: "1 1 500px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: 4, textTransform: "uppercase" }}>
                      {c.dimension}
                    </span>
                    <strong style={{ fontSize: 15, color: "#0f172a" }}>{c.valor}</strong>
                    <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>
                      ({c.total} incidentes asociados)
                    </span>
                  </div>

                  <p style={{ fontSize: 12.5, color: "#64748b", margin: "4px 0 8px" }}>
                    Regla de detección: <strong>{c.regla ?? "Umbral automático"}</strong>
                  </p>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {c.tickets.map((t) => (
                      <span
                        key={t.id_ticket}
                        style={{
                          fontSize: 11.5,
                          backgroundColor: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 4,
                          padding: "2px 6px",
                          color: "#334155",
                        }}
                        title={t.titulo}
                      >
                        {t.codigo_ticket}: {t.titulo.substring(0, 32)}...
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => abrirEdicion(c)}
                    disabled={esProcesando}
                    style={{
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => aprobarCandidato(c)}
                    disabled={esProcesando}
                    style={{
                      padding: "6px 16px",
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#2563eb",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#ffffff",
                      cursor: esProcesando ? "not-allowed" : "pointer",
                      opacity: esProcesando ? 0.6 : 1,
                    }}
                  >
                    {esProcesando ? "Aprobando..." : "Aprobar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Edición y Aprobación */}
      {candidatoEditando && (
        <div className="modal-overlay" onClick={() => setCandidatoEditando(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 540, padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}
          >
            <h3 style={{ margin: "0 0 6px", fontSize: 16, color: "#0f172a" }}>
              Editar y Aprobar Candidato a Problema
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#64748b" }}>
              Agrupación por {candidatoEditando.dimension}: <strong>{candidatoEditando.valor}</strong> ({candidatoEditando.total} incidentes)
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                aprobarCandidato(candidatoEditando, editTitulo, editDescripcion, editPrioridad);
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Título del problema *
                </label>
                <input
                  type="text"
                  required
                  className="input-base"
                  value={editTitulo}
                  onChange={(e) => setEditTitulo(e.target.value)}
                  style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Prioridad del problema:
                </label>
                <select
                  className="input-base"
                  value={editPrioridad}
                  onChange={(e) => setEditPrioridad(e.target.value)}
                  style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                >
                  {prioridades.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Descripción / Alcance del problema:
                </label>
                <textarea
                  rows={3}
                  className="input-base"
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setCandidatoEditando(null)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 6,
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    fontSize: 13,
                    color: "#475569",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={Boolean(procesandoClave)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    backgroundColor: "#2563eb",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#ffffff",
                    cursor: "pointer",
                  }}
                >
                  {procesandoClave ? "Aprobando..." : "Aprobar y registrar problema"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
