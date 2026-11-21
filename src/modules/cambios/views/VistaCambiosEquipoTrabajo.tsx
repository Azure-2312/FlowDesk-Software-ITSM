"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DatosEquipoTrabajo, EquipoTICompleto } from "@/modules/cambios/services/cambiosEquipoService";
import { TablaDobleScroll } from "@/shared/components/ui/TablaDobleScroll";

interface Props {
  datos: DatosEquipoTrabajo;
}

function formatearFecha(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

export default function VistaCambiosEquipoTrabajo({ datos }: Props) {
  const [pestana, setPestana] = useState<"mi_equipo" | "todos_equipos" | "asignacion">("mi_equipo");

  // Datos extendidos desde API
  const [todosEquipos, setTodosEquipos] = useState<EquipoTICompleto[]>([]);
  const [cambiosSinAsignar, setCambiosSinAsignar] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [cargandoExt, setCargandoExt] = useState(false);

  // Asignación rápida
  const [asignaciones, setAsignaciones] = useState<Record<number, number>>({});
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
      const res = await fetch(`/api/cambios/equipo?_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setTodosEquipos(json.todosLosEquipos || []);
        setCambiosSinAsignar(json.cambiosSinAsignar || []);
        setTecnicos(json.tecnicosDisponibles || []);
      }
    } catch (e) {
      console.error("Error al cargar equipos de cambios:", e);
    } finally {
      setCargandoExt(false);
    }
  }

  useEffect(() => {
    cargarDatosExtendidos();
  }, []);

  async function ejecutarAsignacion(idCambio: number) {
    const idResponsable = asignaciones[idCambio];
    if (!idResponsable) return;

    setAsignandoId(idCambio);
    try {
      const res = await fetch("/api/cambios/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "asignar",
          id_cambio: idCambio,
          id_usuario_responsable: idResponsable,
        }),
      });
      if (res.ok) {
        await cargarDatosExtendidos();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo asignar el cambio");
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
      const res = await fetch("/api/cambios/equipo", {
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

  const { nombreEquipo, integrantes, cambioActivo, historial } = datos;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 20 }}>
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 6,
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              padding: "2px 8px",
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            Gestión de Cambios · Equipos Técnicos ITIL v4
          </span>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Equipos de Trabajo de Cambios RFC
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "4px 0 0" }}>
            Supervisión operativa de equipos, técnicos especialistas y asignación de cambios pendientes.
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
            href="/plataforma/cambios/mis-cambios"
            className="boton-secundario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 16px" }}
          >
            Mis cambios
          </Link>
          <Link
            href="/plataforma/cambios/nuevo"
            className="boton-primario"
            style={{ textDecoration: "none", width: "auto", fontSize: 13, padding: "8px 18px" }}
          >
            + Solicitar cambio
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
          🌐 Todos los equipos de cambios ({todosEquipos.length})
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
          📋 Asignación de cambios pendientes ({cambiosSinAsignar.length})
        </button>
      </div>

      {/* 3. Contenido según pestaña */}
      {pestana === "mi_equipo" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Cambio Activo */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                1. Cambio RFC Activo Asignado a Mi Equipo
              </h2>
              <span style={{ fontSize: 12, color: "#64748b" }}>
                {cambioActivo ? "1 cambio activo en curso" : "Sin ejecución activa"}
              </span>
            </div>

            {cambioActivo ? (
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "20px 24px",
                  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.05)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          backgroundColor: cambioActivo.color_estado || "#2563eb",
                          color: "#ffffff",
                          padding: "2px 10px",
                          borderRadius: 12,
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        {cambioActivo.nombre_estado}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#1e40af" }}>
                        {cambioActivo.codigo_cambio}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                      {cambioActivo.titulo}
                    </h3>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Responsable asignado</div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>{cambioActivo.responsable}</div>
                  </div>
                </div>
                {cambioActivo.descripcion && (
                  <p style={{ fontSize: 13, color: "#475569", margin: "0 0 16px" }}>{cambioActivo.descripcion}</p>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, padding: "12px 16px", backgroundColor: "#f8fafc", borderRadius: 8, fontSize: 12 }}>
                  <div><strong>Ventana inicio:</strong> {formatearFecha(cambioActivo.ventana_inicio)}</div>
                  <div><strong>Ventana fin:</strong> {formatearFecha(cambioActivo.ventana_fin)}</div>
                  <div><strong>Elemento CI:</strong> {cambioActivo.codigo_ci || "—"} {cambioActivo.nombre_ci ? `(${cambioActivo.nombre_ci})` : ""}</div>
                  <div><strong>Solicitante:</strong> {cambioActivo.solicitante}</div>
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "32px", textAlign: "center", color: "#64748b" }}>
                No hay ningún cambio RFC en ejecución activa en este momento para tu equipo.
              </div>
            )}
          </div>

          {/* Integrantes del equipo */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
              2. Especialistas Técnicos del Departamento ({integrantes.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {integrantes.map((i) => (
                <div key={i.id_usuario} style={{ padding: "14px 16px", border: "1px solid #e2e8f0", borderRadius: 8, backgroundColor: "#ffffff" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a" }}>{i.nombre_completo}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{i.correo}</div>
                  <span style={{ display: "inline-block", marginTop: 6, fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4, backgroundColor: "#eff6ff", color: "#1d4ed8" }}>
                    {i.cargo || "Técnico"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Historial de cambios resueltos */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 12px" }}>
              3. Historial Reciente de Cambios Resueltos ({historial.length})
            </h2>
            {historial.length === 0 ? (
              <div style={{ backgroundColor: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "24px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
                Sin historial reciente de cambios en este equipo.
              </div>
            ) : (
              <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#475569" }}>
                      <th style={{ padding: "10px 14px" }}>Código</th>
                      <th style={{ padding: "10px 14px" }}>Título</th>
                      <th style={{ padding: "10px 14px" }}>Tipo</th>
                      <th style={{ padding: "10px 14px" }}>Estado</th>
                      <th style={{ padding: "10px 14px" }}>Responsable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h) => (
                      <tr key={h.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "10px 14px", fontWeight: 700 }}>{h.codigo_cambio}</td>
                        <td style={{ padding: "10px 14px" }}>{h.titulo}</td>
                        <td style={{ padding: "10px 14px" }}>{h.tipo_cambio}</td>
                        <td style={{ padding: "10px 14px" }}>
                          <span style={{ padding: "2px 6px", borderRadius: 4, fontSize: 11, fontWeight: 700, backgroundColor: h.color_estado, color: "#fff" }}>
                            {h.nombre_estado}
                          </span>
                        </td>
                        <td style={{ padding: "10px 14px" }}>{h.responsable}</td>
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
            Directorio Institucional de Equipos Técnicos de Cambios
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
                      <span style={{ fontSize: 11, fontWeight: 800, color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>
                        {eq.codigo}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: eq.cambios_activos > 0 ? "#b45309" : "#16a34a" }}>
                        {eq.cambios_activos} cambios activos
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
                Cambios RFC Pendientes de Asignación de Equipo
              </h2>
              <p style={{ fontSize: 12.5, color: "#64748b", margin: "4px 0 0" }}>
                Seleccione el técnico/responsable para cada solicitud de cambio registrada.
              </p>
            </div>
          </div>

          {cargandoExt ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Cargando solicitudes...</div>
          ) : cambiosSinAsignar.length === 0 ? (
            <div style={{ backgroundColor: "#ffffff", border: "1px dashed #cbd5e1", borderRadius: 8, padding: 40, textAlign: "center", color: "#16a34a", fontWeight: 600 }}>
              ✅ Todos los cambios RFC cuentan con un equipo y responsable asignado.
            </div>
          ) : (
            <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                    <th style={{ padding: "12px 14px" }}>Código</th>
                    <th style={{ padding: "12px 14px" }}>Título</th>
                    <th style={{ padding: "12px 14px" }}>Tipo</th>
                    <th style={{ padding: "12px 14px" }}>Prioridad</th>
                    <th style={{ padding: "12px 14px" }}>Solicitante</th>
                    <th style={{ padding: "12px 14px" }}>Asignar Responsable</th>
                    <th style={{ padding: "12px 14px", textAlign: "right" }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cambiosSinAsignar.map((c) => (
                    <tr key={c.id_cambio} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a" }}>{c.codigo_cambio}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ fontWeight: 600 }}>{c.titulo}</div>
                        {c.descripcion && <div style={{ fontSize: 11.5, color: "#64748b" }}>{c.descripcion.substring(0, 70)}...</div>}
                      </td>
                      <td style={{ padding: "12px 14px" }}>{c.tipo_cambio}</td>
                      <td style={{ padding: "12px 14px" }}>{c.prioridad_nombre || "Media"}</td>
                      <td style={{ padding: "12px 14px" }}>{c.solicitante_nombre || "Sistema"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <select
                          value={asignaciones[c.id_cambio] || ""}
                          onChange={(e) => setAsignaciones((prev) => ({ ...prev, [c.id_cambio]: Number(e.target.value) }))}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12.5, backgroundColor: "#ffffff" }}
                        >
                          <option value="">-- Seleccionar especialista --</option>
                          {tecnicos.map((t) => (
                            <option key={t.id_usuario} value={t.id_usuario}>
                              {t.nombre} ({t.departamento_nombre || "TI"})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button
                          type="button"
                          disabled={!asignaciones[c.id_cambio] || asignandoId === c.id_cambio}
                          onClick={() => ejecutarAsignacion(c.id_cambio)}
                          style={{
                            padding: "6px 14px",
                            backgroundColor: asignaciones[c.id_cambio] ? "#2563eb" : "#94a3b8",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: asignaciones[c.id_cambio] ? "pointer" : "not-allowed",
                          }}
                        >
                          {asignandoId === c.id_cambio ? "Asignando..." : "Asignar"}
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
              Crear Nuevo Equipo de Trabajo
            </h3>
            <form onSubmit={crearEquipo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Código del Equipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. EQ-INFRA, EQ-CLOUD, EQ-SOP"
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
                  placeholder="Ej. Infraestructura Cloud y Redes"
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
                  placeholder="Alcance, funciones y responsabilidades del equipo técnico..."
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
