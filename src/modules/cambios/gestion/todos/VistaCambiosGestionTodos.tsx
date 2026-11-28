"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cambio } from "@/types";
import { ACCIONES } from "@/shared/lib/capacidades";
import { usePuede } from "@/shared/components/layout/PermisosProvider";

export default function PaginaTodosCambios() {
  const puedeRfc = usePuede(ACCIONES.CAMBIO_RFC_REGISTRAR);
  const puedeAsignar = usePuede(ACCIONES.CAMBIO_EQUIPO_ASIGNAR);
  const [cambios, setCambios] = useState<Cambio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>("TODOS");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [soloSinAsignar, setSoloSinAsignar] = useState(false);
  const [cambioSeleccionado, setCambioSeleccionado] = useState<Cambio | null>(null);

  // Asignación de equipo y técnico
  const [modalAsignar, setModalAsignar] = useState<Cambio | null>(null);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [idTecnicoSeleccionado, setIdTecnicoSeleccionado] = useState<string>("");
  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);

  async function cargarCambios() {
    setCargando(true);
    try {
      const url = new URL("/api/cambios", window.location.origin);
      if (filtroTipo !== "TODOS") url.searchParams.set("tipo", filtroTipo);
      if (filtroEstado !== "TODOS") url.searchParams.set("estado", filtroEstado);

      const [resCambios, resEquipo] = await Promise.all([
        fetch(url.toString()),
        fetch(`/api/cambios/equipo?_t=${Date.now()}`),
      ]);

      const data = await resCambios.json();
      if (Array.isArray(data)) {
        setCambios(data);
      }

      if (resEquipo.ok) {
        const dataEq = await resEquipo.json();
        setTecnicos(dataEq.tecnicosDisponibles || []);
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

  async function ejecutarAsignacion() {
    if (!modalAsignar || !idTecnicoSeleccionado) return;
    setGuardandoAsignacion(true);
    try {
      const res = await fetch("/api/cambios/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "asignar",
          id_cambio: modalAsignar.id_cambio,
          id_usuario_responsable: Number(idTecnicoSeleccionado),
        }),
      });
      if (res.ok) {
        setModalAsignar(null);
        setIdTecnicoSeleccionado("");
        await cargarCambios();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo asignar el cambio");
      }
    } catch {
      alert("Error de conexión al asignar");
    } finally {
      setGuardandoAsignacion(false);
    }
  }

  const cambiosFiltrados = cambios.filter((c: any) => {
    if (soloSinAsignar && (c.id_usuario_responsable || c.responsable_nombre)) return false;
    return true;
  });

  const conteoSinAsignar = cambios.filter((c: any) => !c.id_usuario_responsable && !c.responsable_nombre).length;

  return (
    <div className="vista-contenedor">
      <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 className="titulo-pagina">
            Todos los cambios RFC
          </h1>
          <p className="descripcion-pagina">
            Supervisión integral de todas las solicitudes de cambio organizacionales, trazabilidad en workflow y asignación de equipos técnicos.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {puedeRfc && (<>
          <Link href="/plataforma/cambios/nuevo" className="boton-primario" >

            Nueva Solicitud RFC
          </Link>
          </>)}
        </div>
      </div>

      {/* Barra de Filtros y Alcance */}
      <div className="barra-filtros" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
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

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 8 }}>
          <button
            type="button"
            onClick={() => setSoloSinAsignar(!soloSinAsignar)}
            className="boton-secundario boton-sm" aria-pressed={soloSinAsignar}
          >
            {soloSinAsignar ? "Mostrando sin asignar" : `Pendientes de asignar (${conteoSinAsignar})`}
          </button>
        </div>

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          {cambiosFiltrados.length} {cambiosFiltrados.length === 1 ? "cambio registrado" : "cambios registrados"}
        </span>
      </div>

      {cargando ? (
        <div style={{ padding: 32, textAlign: "center", color: "#2563eb", fontWeight: 600 }}>
          Cargando registros RFC desde la base de datos...
        </div>
      ) : cambiosFiltrados.length === 0 ? (
        <div style={{ padding: 32, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1" }}>
          <p style={{ margin: "0 0 10px 0", color: "#64748b", fontWeight: 500 }}>
            {soloSinAsignar
              ? "No hay cambios pendientes de asignación de equipo o especialista."
              : "No se encontraron solicitudes de cambio que coincidan con los filtros seleccionados."}
          </p>
          {puedeRfc && (<>
          <Link href="/plataforma/cambios/nuevo" className="boton-secundario boton-sm" >
            Registrar la primera RFC
          </Link>
          </>)}
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
                <th>Responsable / Equipo</th>
                <th>Ventana Propuesta</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cambiosFiltrados.map((c: any) => (
                <tr key={c.id_cambio}>
                  <td>
                    <Link
                      href={`/plataforma/cambios/gestion/${c.id_cambio}`}
                      style={{ fontFamily: "monospace", fontWeight: 700, color: "#2563eb", textDecoration: "none" }}
                      title="Abrir vista formal del ticket RFC"
                    >
                      {c.codigo_cambio}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 280 }}>
                    <Link
                      href={`/plataforma/cambios/gestion/${c.id_cambio}`}
                      style={{ color: "#1e293b", textDecoration: "none" }}
                    >
                      {c.titulo}
                    </Link>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: c.tipo_cambio === "EMERGENCIA" ? "#fee2e2" : c.tipo_cambio === "NORMAL" ? "#eff6ff" : "#f1f5f9",
                        color: c.tipo_cambio === "EMERGENCIA" ? "#991b1b" : c.tipo_cambio === "NORMAL" ? "#1d4ed8" : "#334155",
                        border: `1px solid ${c.tipo_cambio === "EMERGENCIA" ? "#fca5a5" : c.tipo_cambio === "NORMAL" ? "#bfdbfe" : "#cbd5e1"}`,
                      }}
                    >
                      {c.tipo_cambio}
                    </span>
                  </td>
                  <td>{c.prioridad_nombre || "Media"}</td>
                  <td>
                    {c.responsable_nombre ? (
                      <span style={{ fontSize: 12, color: "#1e293b" }}>{c.responsable_nombre}</span>
                    ) : !puedeAsignar ? (
                      <span style={{ fontSize: 12, color: "#6b7280" }}>Sin asignar</span>
                    ) : (
                      <button className="boton-peligro boton-sm"
                        type="button"
                        onClick={() => setModalAsignar(c)}
                      >
                        + Asignar equipo
                      </button>
                    )}
                  </td>
                  <td style={{ fontSize: 11.5 }}>
                    {c.ventana_inicio ? new Date(c.ventana_inicio).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "—"}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: c.id_estado === 3 ? "#ecfdf5" : c.id_estado === 2 ? "#fffbeb" : "#f1f5f9",
                        color: c.id_estado === 3 ? "#065f46" : c.id_estado === 2 ? "#92400e" : "#475569",
                        border: `1px solid ${c.id_estado === 3 ? "#a7f3d0" : c.id_estado === 2 ? "#fde68a" : "#cbd5e1"}`,
                      }}
                    >
                      {c.estado_nombre}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", width: 110 }}>
                    <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                      <Link
                        href={`/plataforma/cambios/gestion/${c.id_cambio}`}
                        className="boton-secundario boton-sm"
                        title="Ver detalle del workflow"
                      >
                        Detalle
                      </Link>
                      <button
                        type="button"
                        className="boton-secundario boton-sm"
                        onClick={() => setCambioSeleccionado(c)}
                        title="Vista rápida"
                        aria-label="Vista rápida"
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

      {/* Modal Asignar Equipo y Técnico */}
      {modalAsignar && (
        <div className="modal-overlay" onClick={() => setModalAsignar(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>
              Asignar Especialista Responsable
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#64748b" }}>
              RFC: <strong style={{ color: "#2563eb" }}>{modalAsignar.codigo_cambio}</strong> · {modalAsignar.titulo}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 6 }}>
                Seleccionar Especialista Técnico:
              </label>
              <select
                className="input-base"
                style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                value={idTecnicoSeleccionado}
                onChange={(e) => setIdTecnicoSeleccionado(e.target.value)}
              >
                <option value="">-- Seleccionar especialista --</option>
                {tecnicos.map((t) => (
                  <option key={t.id_usuario} value={t.id_usuario}>
                    {t.nombre_completo} ({t.departamento_nombre || "Mesa TI"} - {t.nivel_soporte_nombre || "Nivel 1"})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="boton-secundario"
                type="button"
                onClick={() => setModalAsignar(null)}
              >
                Cancelar
              </button>
              <button className="boton-primario"
                type="button"
                onClick={ejecutarAsignacion}
                disabled={!idTecnicoSeleccionado || guardandoAsignacion}
              >
                {guardandoAsignacion ? "Asignando..." : "Confirmar asignación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle Rápido de RFC */}
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
                className="boton-icono"
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
          </div>
        </div>
      )}
    </div>
  );
}
