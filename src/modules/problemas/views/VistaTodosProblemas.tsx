"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ProblemaItem {
  id_problema: number;
  codigo_problema: string;
  titulo: string;
  descripcion: string;
  id_prioridad: number;
  prioridad_nombre: string;
  id_estado: number;
  estado_nombre: string;
  causa_raiz?: string;
  workaround?: string;
  es_error_conocido?: boolean;
  tecnico_asignado_nombre?: string;
  id_usuario_asignado?: number;
  id_departamento?: number;
  departamento_nombre?: string;
  fecha_creacion: string;
}

export default function VistaTodosProblemas() {
  const [problemas, setProblemas] = useState<ProblemaItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soloSinAsignar, setSoloSinAsignar] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Asignación de equipo y técnico
  const [modalAsignar, setModalAsignar] = useState<ProblemaItem | null>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [idDeptoSeleccionado, setIdDeptoSeleccionado] = useState<string>("");
  const [idTecnicoSeleccionado, setIdTecnicoSeleccionado] = useState<string>("");
  const [guardandoAsignacion, setGuardandoAsignacion] = useState(false);

  async function cargarProblemas() {
    setCargando(true);
    setError(null);
    try {
      const [resProb, resEq] = await Promise.all([
        fetch(`/api/problemas?vista=todos&_t=${Date.now()}`),
        fetch(`/api/problemas/equipo?_t=${Date.now()}`),
      ]);

      const dataProb = await resProb.json();
      if (resProb.ok) {
        setProblemas(Array.isArray(dataProb) ? dataProb : []);
      } else {
        setError("No se pudieron cargar los problemas.");
      }

      if (resEq.ok) {
        const dataEq = await resEq.json();
        setEquipos(dataEq.todosLosEquipos || []);
        setTecnicos(dataEq.tecnicosDisponibles || []);
      }
    } catch {
      setError("Error de conexión al cargar problemas.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarProblemas();
  }, []);

  async function ejecutarAsignacion() {
    if (!modalAsignar || !idDeptoSeleccionado) return;
    setGuardandoAsignacion(true);
    try {
      const res = await fetch("/api/problemas/equipo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "asignar",
          id_problema: modalAsignar.id_problema,
          id_departamento: Number(idDeptoSeleccionado),
          id_usuario_asignado: idTecnicoSeleccionado ? Number(idTecnicoSeleccionado) : undefined,
        }),
      });

      if (res.ok) {
        setModalAsignar(null);
        setIdDeptoSeleccionado("");
        setIdTecnicoSeleccionado("");
        await cargarProblemas();
      } else {
        const j = await res.json();
        alert(j.error || "No se pudo asignar el problema");
      }
    } catch {
      alert("Error de conexión al asignar problema");
    } finally {
      setGuardandoAsignacion(false);
    }
  }

  const problemasFiltrados = problemas.filter((p) => {
    if (soloSinAsignar && (p.id_usuario_asignado || p.tecnico_asignado_nombre)) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase().trim();
      const matchCod = p.codigo_problema?.toLowerCase().includes(q);
      const matchTit = p.titulo?.toLowerCase().includes(q);
      if (!matchCod && !matchTit) return false;
    }
    return true;
  });

  const conteoSinAsignar = problemas.filter((p) => !p.id_usuario_asignado && !p.tecnico_asignado_nombre).length;

  return (
    <div className="vista-contenedor">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 className="titulo-pagina">
            Todos los problemas
          </h1>
          <p className="descripcion-pagina">
            Supervisión integral de problemas organizacionales, análisis de causa raíz, soluciones de contorno (workarounds) y asignación de equipos.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/plataforma/problemas/crear"
            className="boton-primario"
          >
            Registrar problema
          </Link>
          <button className="boton-secundario"
            type="button"
            onClick={cargarProblemas}
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar problema por código o título..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "6px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: 6,
            fontSize: 13,
            width: 320,
            backgroundColor: "#ffffff",
          }}
        />

        <button
          type="button"
          onClick={() => setSoloSinAsignar(!soloSinAsignar)}
          className="boton-secundario boton-sm" aria-pressed={soloSinAsignar}
        >
          {soloSinAsignar ? "Mostrando sin asignar" : `Pendientes de asignar (${conteoSinAsignar})`}
        </button>

        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          {problemasFiltrados.length} {problemasFiltrados.length === 1 ? "problema" : "problemas"}
        </span>
      </div>

      {cargando && (
        <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
          Cargando registros de problemas...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left", color: "#64748b" }}>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Código</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Título</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Prioridad</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Responsable / Equipo</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Causa Raíz / Workaround</th>
                <th style={{ padding: "10px 14px", fontWeight: 600 }}>Estado</th>
                <th style={{ padding: "10px 14px", fontWeight: 600, textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {problemasFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="celda-vacia">
                    No se encontraron problemas con los criterios actuales.
                  </td>
                </tr>
              ) : (
                problemasFiltrados.map((p) => (
                  <tr key={p.id_problema} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 14px", fontWeight: 700, color: "#2563eb", fontFamily: "monospace" }}>
                      <Link href={`/plataforma/problemas/${p.id_problema}`} style={{ color: "#2563eb", textDecoration: "none" }}>
                        {p.codigo_problema}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 14px", color: "#1e293b", maxWidth: 280, fontWeight: 500 }}>
                      <Link href={`/plataforma/problemas/${p.id_problema}`} style={{ color: "#1e293b", textDecoration: "none" }}>
                        {p.titulo}
                      </Link>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: 11.5, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", color: "#475569" }}>
                        {p.prioridad_nombre || "Media"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      {p.tecnico_asignado_nombre ? (
                        <span style={{ fontSize: 12, color: "#1e293b" }}>{p.tecnico_asignado_nombre}</span>
                      ) : (
                        <button className="boton-peligro boton-sm"
                          type="button"
                          onClick={() => setModalAsignar(p)}
                        >
                          + Asignar equipo
                        </button>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "#475569", maxWidth: 220 }}>
                      {p.causa_raiz ? (
                        <span style={{ color: "#065f46", fontWeight: 500 }}>Causa identificada</span>
                      ) : p.workaround ? (
                        <span style={{ color: "#1d4ed8" }}>Workaround disponible</span>
                      ) : (
                        <span style={{ color: "#64748b" }}>En diagnóstico</span>
                      )}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 600,
                          backgroundColor: p.id_estado === 4 ? "#ecfdf5" : p.id_estado === 2 ? "#eff6ff" : "#f1f5f9",
                          color: p.id_estado === 4 ? "#065f46" : p.id_estado === 2 ? "#1d4ed8" : "#475569",
                        }}
                      >
                        {p.estado_nombre}
                      </span>
                    </td>
                    <td style={{ padding: "10px 14px", textAlign: "right" }}>
                      <Link
                        href={`/plataforma/problemas/${p.id_problema}`}
                        className="boton-secundario boton-sm"
                      >
                        Detalle
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Asignar Equipo y Especialista */}
      {modalAsignar && (
        <div className="modal-overlay" onClick={() => setModalAsignar(null)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>
              Asignar Equipo y Especialista al Problema
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#64748b" }}>
              Problema: <strong style={{ color: "#2563eb" }}>{modalAsignar.codigo_problema}</strong> · {modalAsignar.titulo}
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                Departamento / Equipo de Problemas *
              </label>
              <select
                className="input-base"
                style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                value={idDeptoSeleccionado}
                onChange={(e) => setIdDeptoSeleccionado(e.target.value)}
              >
                <option value="">-- Seleccionar equipo --</option>
                {equipos.map((eq) => (
                  <option key={eq.id_departamento} value={eq.id_departamento}>
                    {eq.nombre} ({eq.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                Especialista Técnico Responsable (opcional):
              </label>
              <select
                className="input-base"
                style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                value={idTecnicoSeleccionado}
                onChange={(e) => setIdTecnicoSeleccionado(e.target.value)}
              >
                <option value="">-- Sin asignar individualmente --</option>
                {tecnicos.map((t) => (
                  <option key={t.id_usuario} value={t.id_usuario}>
                    {t.nombre_completo} ({t.nivel_soporte_nombre || "Nivel 1"})
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
                disabled={!idDeptoSeleccionado || guardandoAsignacion}
              >
                {guardandoAsignacion ? "Asignando..." : "Confirmar asignación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
