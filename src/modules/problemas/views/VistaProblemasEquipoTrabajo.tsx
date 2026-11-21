"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DatosEquipoProblemas, EquipoProblemasCompleto } from "@/modules/problemas/services/problemasEquipoService";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface Props {
  datos: DatosEquipoProblemas;
}

function formatearFecha(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("es-PE", { dateStyle: "short" });
}

export default function VistaProblemasEquipoTrabajo({ datos }: Props) {
  const [pestana, setPestana] = useState<"mi_equipo" | "todos_equipos" | "asignacion">("mi_equipo");

  // Datos extendidos desde API
  const [todosEquipos, setTodosEquipos] = useState<EquipoProblemasCompleto[]>([]);
  const [problemasSinAsignar, setProblemasSinAsignar] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [cargandoExt, setCargandoExt] = useState(false);

  // Asignaciones
  const [asignacionesDepto, setAsignacionesDepto] = useState<Record<number, number>>({});
  const [asignacionesTecnico, setAsignacionesTecnico] = useState<Record<number, number>>({});
  const [asignandoId, setAsignandoId] = useState<number | null>(null);

  // Modal crear equipo
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");
  const [creandoEquipo, setCreandoEquipo] = useState(false);

  async function cargarDatosExtendidos() {
    setCargandoExt(true);
    try {
      const res = await fetch(`/api/problemas/equipo?_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setTodosEquipos(json.todosLosEquipos || []);
        setProblemasSinAsignar(json.problemasSinAsignar || []);
        setDepartamentos(json.departamentos || []);
        setTecnicos(json.tecnicos || []);
      }
    } catch (e) {
      console.error("Error al cargar equipos de problemas:", e);
    } finally {
      setCargandoExt(false);
    }
  }

  useEffect(() => {
    cargarDatosExtendidos();
  }, []);

  async function ejecutarAsignacion(idProblema: number) {
    const idDepto = asignacionesDepto[idProblema];
    const idTecnico = asignacionesTecnico[idProblema];
    if (!idDepto) {
      alert("Seleccione al menos un departamento/equipo para asignar el problema");
      return;
    }

    setAsignandoId(idProblema);
    try {
      const res = await fetch("/api/problemas/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "asignar",
          id_problema: idProblema,
          id_departamento: idDepto,
          id_usuario_asignado: idTecnico || undefined,
        }),
      });
      if (res.ok) {
        await cargarDatosExtendidos();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo asignar el problema");
      }
    } catch {
      alert("Error de conexión al asignar");
    } finally {
      setAsignandoId(null);
    }
  }

  async function crearEquipo(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoCodigo.trim() || !nuevoNombre.trim()) return;

    setCreandoEquipo(true);
    try {
      const res = await fetch("/api/problemas/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "crear_equipo",
          codigo: nuevoCodigo.trim(),
          nombre: nuevoNombre.trim(),
          descripcion: nuevaDesc.trim(),
        }),
      });
      if (res.ok) {
        setModalCrear(false);
        setNuevoCodigo("");
        setNuevoNombre("");
        setNuevaDesc("");
        await cargarDatosExtendidos();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo crear el equipo");
      }
    } catch {
      alert("Error de conexión al crear equipo");
    } finally {
      setCreandoEquipo(false);
    }
  }

  const { nombreEquipo, integrantes, problemasActivos, historialResueltos } = datos;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 20 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#fef3c7",
              color: "#92400e",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Gestión de Problemas · Trabajo Colaborativo (ITIL v4)
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Equipos de Trabajo & Causa Raíz (RCA)
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Investigación técnica conjunta, análisis de causa raíz y soluciones de contingencia entre especialistas del departamento.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setModalCrear(true)}
            className="boton-primario"
            style={{ fontSize: 13, padding: "8px 16px", cursor: "pointer", backgroundColor: "#059669" }}
          >
            + Crear nuevo equipo
          </button>
          <Link
            href="/plataforma/problemas/mios"
            className="boton-secundario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 16px" }}
          >
            Mis problemas
          </Link>
          <Link
            href="/plataforma/problemas/crear"
            className="boton-primario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 18px" }}
          >
            + Registrar problema
          </Link>
        </div>
      </div>

      {/* 2. Pestañas de Vista */}
      <div style={{ display: "flex", gap: 10, borderBottom: "1px solid #cbd5e1", paddingBottom: 8 }}>
        <button
          type="button"
          onClick={() => setPestana("mi_equipo")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            backgroundColor: pestana === "mi_equipo" ? "#2563eb" : "#f1f5f9",
            color: pestana === "mi_equipo" ? "#ffffff" : "#475569",
          }}
        >
          👥 Mi equipo de trabajo ({nombreEquipo})
        </button>
        <button
          type="button"
          onClick={() => setPestana("todos_equipos")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            backgroundColor: pestana === "todos_equipos" ? "#2563eb" : "#f1f5f9",
            color: pestana === "todos_equipos" ? "#ffffff" : "#475569",
          }}
        >
          🌐 Todos los equipos de problemas ({todosEquipos.length})
        </button>
        <button
          type="button"
          onClick={() => setPestana("asignacion")}
          style={{
            padding: "8px 16px",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            backgroundColor: pestana === "asignacion" ? "#2563eb" : "#f1f5f9",
            color: pestana === "asignacion" ? "#ffffff" : "#475569",
          }}
        >
          📋 Asignación de problemas pendientes ({problemasSinAsignar.length})
        </button>
      </div>

      {/* 3. Contenido de Pestaña */}
      {pestana === "mi_equipo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Casos Activos */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                1. Problemas Activos en Análisis de Causa Raíz ({nombreEquipo})
              </h2>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {problemasActivos.length} casos en investigación
              </span>
            </div>

            {problemasActivos.length === 0 ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px dashed #cbd5e1",
                  borderRadius: 12,
                  padding: "36px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", margin: "0 0 6px" }}>
                  Sin problemas activos en curso
                </h3>
                <p style={{ fontSize: 13, color: "#64748b", maxWidth: 540, margin: "0 auto", lineHeight: 1.5 }}>
                  No hay incidentes mayores o casos de causa raíz bajo investigación activa en este departamento técnico. Puedes registrar uno nuevo o consultar la base de errores conocidos.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {problemasActivos.map((p) => (
                  <div
                    key={p.id_problema}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #fed7aa",
                      borderRadius: 12,
                      padding: "20px 24px",
                      boxShadow: "0 2px 6px rgba(234, 88, 12, 0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 14 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span
                            style={{
                              backgroundColor: p.color_estado || "#f97316",
                              color: "#ffffff",
                              padding: "2px 10px",
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            {p.estado_nombre}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#c2410c" }}>
                            {p.codigo_problema}
                          </span>
                        </div>
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {p.titulo}
                        </h3>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 12, color: "#64748b" }}>Especialista asignado</div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{p.tecnico_asignado}</div>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px", lineHeight: 1.5 }}>{p.descripcion}</p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, padding: "12px 16px", backgroundColor: "#fffbeb", borderRadius: 8, fontSize: 12 }}>
                      <div><strong>Método análisis:</strong> {p.metodo_analisis || "5 Porqués"}</div>
                      <div><strong>Fecha registro:</strong> {formatearFecha(p.fecha_creacion)}</div>
                      {p.workaround && (
                        <div style={{ gridColumn: "1 / -1" }}><strong>Workaround (Solución temporal):</strong> {p.workaround}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Integrantes del departamento */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
              2. Especialistas en Investigación de Problemas ({integrantes.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {integrantes.map((i) => (
                <div key={i.id_usuario} style={{ padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "#ffffff" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>{i.nombre_completo}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{i.correo}</div>
                  <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#92400e" }}>
                    {i.cargo || "Especialista RCA"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial Resueltos */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
              3. Historial de Problemas Resueltos y Causa Raíz Cerrada ({historialResueltos.length})
            </h2>
            {historialResueltos.length === 0 ? (
              <div style={{ backgroundColor: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                Sin historial de problemas resueltos en este equipo.
              </div>
            ) : (
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                      <th style={{ padding: "10px 14px" }}>Código</th>
                      <th style={{ padding: "10px 14px" }}>Título</th>
                      <th style={{ padding: "10px 14px" }}>Estado</th>
                      <th style={{ padding: "10px 14px" }}>Causa Raíz</th>
                      <th style={{ padding: "10px 14px" }}>Especialista</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historialResueltos.map((h) => (
                      <tr key={h.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700 }}>{h.codigo_problema}</td>
                        <td style={{ padding: "10px 14px" }}>{h.titulo}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700, backgroundColor: h.color_estado, color: "#fff" }}>
                            {h.estado_nombre}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px", fontSize: 12, color: "#475569" }}>{h.causa_raiz || "—"}</td>
                        <td style={{ padding: "10px 14px" }}>{h.tecnico_asignado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {pestana === "todos_equipos" && (
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
            Directorio Institucional de Equipos de Gestión de Problemas
          </h2>

          {cargandoExt ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando equipos...</div>
          ) : todosEquipos.length === 0 ? (
            <div style={{ padding: 30, textAlign: "center", color: "#64748b" }}>No hay equipos registrados.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
              {todosEquipos.map((eq) => (
                <div
                  key={eq.id_departamento}
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#d97706", backgroundColor: "#fef3c7", padding: "2px 6px", borderRadius: 4 }}>
                        {eq.codigo}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: eq.problemas_activos > 0 ? "#b45309" : "#16a34a" }}>
                        {eq.problemas_activos} casos activos
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 4px" }}>{eq.nombre}</h3>
                    <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 8px", lineHeight: 1.4 }}>{eq.descripcion}</p>
                    <div style={{ fontSize: 12, color: "#334155" }}>
                      <strong>Supervisor:</strong> {eq.supervisor_nombre}
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", marginBottom: 6 }}>
                      Integrantes ({eq.integrantes.length}):
                    </div>
                    {eq.integrantes.length === 0 ? (
                      <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Sin técnicos asignados</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {eq.integrantes.map((i) => (
                          <span
                            key={i.id_usuario}
                            style={{
                              fontSize: 11,
                              padding: "2px 6px",
                              backgroundColor: "#f8fafc",
                              border: "1px solid #e2e8f0",
                              borderRadius: 4,
                              color: "#1e293b",
                            }}
                          >
                            {i.nombre}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {pestana === "asignacion" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Problemas Pendientes de Asignación de Equipo / Técnico
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "4px 0 0" }}>
                Asigne departamento resolutor y técnico especialista a los problemas huérfanos.
              </p>
            </div>
          </div>

          {cargandoExt ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando problemas...</div>
          ) : problemasSinAsignar.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 40, textAlign: "center", color: "#16a34a", fontWeight: 600 }}>
              ✅ Todos los problemas cuentan con un equipo y responsable técnico asignado.
            </div>
          ) : (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "12px 14px" }}>Código</th>
                    <th style={{ padding: "12px 14px" }}>Título & Causa</th>
                    <th style={{ padding: "12px 14px" }}>Prioridad</th>
                    <th style={{ padding: "12px 14px" }}>Equipo / Departamento</th>
                    <th style={{ padding: "12px 14px" }}>Técnico Especialista</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {problemasSinAsignar.map((p) => (
                    <tr key={p.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{p.codigo_problema}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600 }}>{p.titulo}</div>
                        {p.descripcion && <div style={{ fontSize: 11.5, color: "#64748b" }}>{p.descripcion.substring(0, 70)}...</div>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>{p.prioridad_nombre || "Media"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <select
                          value={asignacionesDepto[p.id_problema] || ""}
                          onChange={(e) => setAsignacionesDepto((prev) => ({ ...prev, [p.id_problema]: Number(e.target.value) }))}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5, backgroundColor: "#ffffff" }}
                        >
                          <option value="">-- Asignar departamento --</option>
                          {departamentos.map((d) => (
                            <option key={d.id_departamento} value={d.id_departamento}>
                              {d.nombre} ({d.codigo})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <select
                          value={asignacionesTecnico[p.id_problema] || ""}
                          onChange={(e) => setAsignacionesTecnico((prev) => ({ ...prev, [p.id_problema]: Number(e.target.value) }))}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5, backgroundColor: "#ffffff" }}
                        >
                          <option value="">-- Técnico (Opcional) --</option>
                          {tecnicos.map((t) => (
                            <option key={t.id_usuario} value={t.id_usuario}>
                              {t.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button
                          type="button"
                          disabled={!asignacionesDepto[p.id_problema] || asignandoId === p.id_problema}
                          onClick={() => ejecutarAsignacion(p.id_problema)}
                          style={{
                            padding: "6px 14px",
                            backgroundColor: asignacionesDepto[p.id_problema] ? "#2563eb" : "#94a3b8",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: asignacionesDepto[p.id_problema] ? "pointer" : "not-allowed",
                          }}
                        >
                          {asignandoId === p.id_problema ? "Asignando..." : "Asignar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal Crear Equipo */}
      {modalCrear && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div style={{ backgroundColor: "#ffffff", borderRadius: 10, maxWidth: 500, width: "100%", padding: 24, boxShadow: "0 20px 25px rgba(0,0,0,0.15)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: "0 0 16px" }}>
              Crear Nuevo Equipo de Trabajo de Problemas
            </h3>
            <form onSubmit={crearEquipo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Código del Equipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. EQ-RCA, EQ-DATABASE, EQ-TELCO"
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Equipo de Causa Raíz y Base de Datos"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Descripción Operativa
                </label>
                <textarea
                  rows={3}
                  placeholder="Alcance, funciones y responsabilidades del equipo de investigación..."
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13 }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setModalCrear(false)}
                  style={{ padding: "8px 14px", border: "1px solid #cbd5e1", borderRadius: 6, backgroundColor: "#ffffff", fontSize: 13, cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creandoEquipo}
                  style={{ padding: "8px 18px", backgroundColor: "#059669", color: "#ffffff", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                >
                  {creandoEquipo ? "Creando..." : "Crear Equipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
