"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cambio } from "@/types";

export default function PaginaTodosCambios() {
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [cambioSeleccionado, setCambioSeleccionado] = useState<Cambio | null>(null);

  async function cargarCambios() {
    setCargando(true);
    try {
      const url = new URL("/api/cambios", window.location.origin);
      if (filtroTipo !== "TODOS") url.searchParams.set("tipo", filtroTipo);
      if (filtroEstado !== "TODOS") url.searchParams.set("estado", filtroEstado);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) {
        setCambios(data);
      }
    } catch (err) {
      console.error("Error al cargar cambios:", err);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCambios();
  }, [filtroTipo, filtroEstado]);

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1>Historial Consolidado de Solicitudes de Cambio (RFC)</h1>
          <p>
            Trazabilidad integral ITIL v4: Flujo de aprobación CAB, CIs afectados, ventanas de ejecución y revisión post-implementación (PIR).
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/cambios/gestion/crear" className="boton-primario" style={{ width: "auto", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nueva Solicitud RFC
          </Link>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="barra-filtros" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Tipo:</span>
          <select
            className="input-base"
            style={{ width: "auto", fontSize: 12, padding: "4px 8px" }}
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="TODOS">Todos los tipos</option>
            <option value="NORMAL">Normal (CAB)</option>
            <option value="ESTANDAR">Estándar</option>
            <option value="EMERGENCIA">Emergencia (ECAB)</option>
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Estado:</span>
          <select
            className="input-base"
            style={{ width: "auto", fontSize: 12, padding: "4px 8px" }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="TODOS">Todos los estados</option>
            <option value="2">En Evaluación CAB</option>
            <option value="3">Aprobado</option>
            <option value="5">En Ejecución</option>
            <option value="6">Exitoso</option>
            <option value="7">Fallido</option>
            <option value="8">Cancelado</option>
          </select>
        </div>

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          {cambios.length} {cambios.length === 1 ? "cambio registrado" : "cambios registrados"}
        </span>
      </div>

      {cargando ? (
        <div style={{ padding: 32, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Cargando registros RFC desde la base de datos...
        </div>
      ) : cambios.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: "0 0 10px 0", color: "#64748b", fontWeight: 500 }}>
            No se encontraron solicitudes de cambio que coincidan con los filtros seleccionados.
          </p>
          <Link href="/cambios/gestion/crear" className="boton-mini" style={{ textDecoration: "none" }}>
            Registrar la primera RFC
          </Link>
        </div>
      ) : (
        <div className="contenedor-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th>Código RFC</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Prioridad</th>
                <th>CI Afectado</th>
                <th>Solicitante</th>
                <th>Ventana Propuesta</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cambios.map((c) => (
                <tr key={c.id_cambio}>
                  <td>
                    <Link
                      href={`/cambios/gestion/${c.id_cambio}`}
                      style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}
                      title="Abrir vista formal del ticket RFC"
                    >
                      {c.codigo_cambio}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 300 }}>
                    <Link
                      href={`/cambios/gestion/${c.id_cambio}`}
                      style={{ color: "#1e293b", textDecoration: "none" }}
                    >
                      {c.titulo}
                    </Link>
                  </td>
                  <td>
                    <span
                      className="badge-itil"
                      style={{
                        backgroundColor: c.tipo_cambio === "EMERGENCIA" ? "#fee2e2" : c.tipo_cambio === "NORMAL" ? "#eff6ff" : "#f1f5f9",
                        color: c.tipo_cambio === "EMERGENCIA" ? "#991b1b" : c.tipo_cambio === "NORMAL" ? "#1d4ed8" : "#334155",
                        border: `1px solid ${c.tipo_cambio === "EMERGENCIA" ? "#fca5a5" : c.tipo_cambio === "NORMAL" ? "#bfdbfe" : "#cbd5e1"}`,
                      }}
                    >
                      {c.tipo_cambio}
                    </span>
                  </td>
                  <td>{c.prioridad_nombre || "Media"}</td>
                  <td>{c.ci_codigo ? `[${c.ci_codigo}] ${c.ci_nombre}` : "No asignado"}</td>
                  <td>{c.solicitante_nombre || "Especialista TI"}</td>
                  <td style={{ fontSize: 11.5 }}>
                    {new Date(c.ventana_inicio).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </td>
                  <td>
                    <span
                      className="badge-itil"
                      style={{
                        backgroundColor: c.id_estado === 3 ? "#ecfdf5" : c.id_estado === 2 ? "#fffbeb" : "#f1f5f9",
                        color: c.id_estado === 3 ? "#065f46" : c.id_estado === 2 ? "#92400e" : "#475569",
                        border: `1px solid ${c.id_estado === 3 ? "#a7f3d0" : c.id_estado === 2 ? "#fde68a" : "#cbd5e1"}`,
                      }}
                    >
                      {c.estado_nombre}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", width: 80 }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <Link
                        href={`/cambios/gestion/${c.id_cambio}`}
                        className="boton-mini"
                        style={{ textDecoration: "none", padding: "4px 8px", fontSize: 11 }}
                        title="Ver ticket completo"
                      >
                        Abrir
                      </Link>
                      <button
                        type="button"
                        className="boton-mini"
                        onClick={() => setCambioSeleccionado(c)}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 6px" }}
                        title="Vista rápida modal"
                        aria-label="Vista rápida modal"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detalle de RFC */}
      {cambioSeleccionado && (
        <div className="modal-overlay" onClick={() => setCambioSeleccionado(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 700, maxHeight: "90vh", overflowY: "auto", padding: 24, backgroundColor: "#ffffff" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "monospace", color: "#2563eb" }}>
                  {cambioSeleccionado.codigo_cambio}
                </span>
                <h3 style={{ margin: "4px 0", fontSize: 18, color: "#0f172a" }}>{cambioSeleccionado.titulo}</h3>
              </div>
              <button
                type="button"
                className="modal-cerrar-boton"
                onClick={() => setCambioSeleccionado(null)}
                aria-label="Cerrar modal"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16, backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, fontSize: 12.5 }}>
              <div><strong>Tipo:</strong> {cambioSeleccionado.tipo_cambio}</div>
              <div><strong>Estado:</strong> {cambioSeleccionado.estado_nombre}</div>
              <div><strong>Solicitante:</strong> {cambioSeleccionado.solicitante_nombre}</div>
              <div><strong>CI Afectado:</strong> {cambioSeleccionado.ci_codigo ? `[${cambioSeleccionado.ci_codigo}] ${cambioSeleccionado.ci_nombre}` : "N/A"}</div>
              <div><strong>Ventana Inicio:</strong> {new Date(cambioSeleccionado.ventana_inicio).toLocaleString()}</div>
              <div><strong>Ventana Fin:</strong> {new Date(cambioSeleccionado.ventana_fin).toLocaleString()}</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 4 }}>Justificación del Negocio:</strong>
              <div style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 6, fontSize: 12.5, lineHeight: 1.5 }}>
                {cambioSeleccionado.justificacion}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 4 }}>Plan de Implementación Paso a Paso:</strong>
              <div style={{ padding: 10, backgroundColor: "#f1f5f9", borderRadius: 6, fontSize: 12.5, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                {cambioSeleccionado.plan_implementacion}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong style={{ fontSize: 12.5, color: "#991b1b", display: "block", marginBottom: 4 }}>Plan de Contingencia / Rollback:</strong>
              <div style={{ padding: 10, backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 6, fontSize: 12.5, whiteSpace: "pre-wrap", lineHeight: 1.5, color: "#7f1d1d" }}>
                {cambioSeleccionado.plan_rollback}
              </div>
            </div>

            {cambioSeleccionado.plan_pruebas && (
              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 12.5, color: "#166534", display: "block", marginBottom: 4 }}>Plan de Pruebas Post-Cambio:</strong>
                <div style={{ padding: 10, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, fontSize: 12.5, color: "#14532d" }}>
                  {cambioSeleccionado.plan_pruebas}
                </div>
              </div>
            )}

            {cambioSeleccionado.resultado_pir && (
              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 12.5, color: "#1e293b", display: "block", marginBottom: 4 }}>Revisión Post-Implementación (PIR):</strong>
                <div style={{ padding: 10, backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 12.5 }}>
                  {cambioSeleccionado.resultado_pir} (Incidentes inducidos: {cambioSeleccionado.incidentes_inducidos})
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
