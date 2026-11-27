"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { EquipoTICompleto } from "@/modules/cambios/services/cambiosEquipoService";

export default function VistaCambiosTodosEquipos() {
  const [equipos, setEquipos] = useState<EquipoTICompleto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal crear equipo
  const [modalCrear, setModalCrear] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDesc, setNuevaDesc] = useState("");
  const [creandoEquipo, setCreandoEquipo] = useState(false);

  async function cargarEquipos() {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/cambios/equipo?_t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        setEquipos(json.todosLosEquipos || []);
      } else {
        setError("No se pudieron cargar los equipos de trabajo.");
      }
    } catch {
      setError("Error de conexión al cargar equipos de cambios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarEquipos();
  }, []);

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
        await cargarEquipos();
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

  return (
    <div className="vista-contenedor" style={{ gap: 20 }}>
      {/* 1. Cabecera Principal */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <div>
          <h1 className="titulo-pagina">
            Todos los equipos de trabajo (Cambios)
          </h1>
          <p className="descripcion-pagina">
            Directorio institucional de departamentos y grupos resolutores encargados de la implementación de cambios RFC.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="boton-primario"
            type="button"
            onClick={() => setModalCrear(true)}
          >
            + Crear nuevo equipo
          </button>
          <Link
            href="/plataforma/cambios/equipo"
            className="boton-secundario"
          >
            Mi equipo
          </Link>
        </div>
      </div>

      {cargando && (
        <div style={{ padding: "32px 0", textAlign: "center", color: "#64748b" }}>
          Cargando directorio de equipos...
        </div>
      )}

      {error && (
        <div style={{ padding: 14, backgroundColor: "#fef2f2", color: "#991b1b", borderRadius: 6 }}>
          {error}
        </div>
      )}

      {!cargando && !error && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(380px, 100%), 1fr))", gap: 16 }}>
          {equipos.map((eq) => (
            <div
              key={eq.id_departamento}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 8,
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 6px", borderRadius: 4 }}>
                    {eq.codigo}
                  </span>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "4px 0 0" }}>
                    {eq.nombre}
                  </h3>
                </div>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    backgroundColor: "#ecfdf5",
                    color: "#065f46",
                  }}
                >
                  Activo
                </span>
              </div>

              {eq.descripcion && (
                <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.4 }}>
                  {eq.descripcion}
                </p>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, fontSize: 12 }}>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Supervisor:</span>
                  <strong style={{ color: "#1e293b" }}>{eq.supervisor_nombre || "No asignado"}</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Especialistas:</span>
                  <strong style={{ color: "#1e293b" }}>{eq.total_integrantes} miembros</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Cambios activos:</span>
                  <strong style={{ color: "#2563eb" }}>{eq.cambios_activos} RFCs</strong>
                </div>
                <div>
                  <span style={{ color: "#64748b", display: "block" }}>Estado operativo:</span>
                  <strong style={{ color: eq.cambios_activos > 0 ? "#059669" : "#64748b" }}>
                    {eq.cambios_activos > 0 ? "Con actividad" : "Disponible"}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Nuevo Equipo */}
      {modalCrear && (
        <div className="modal-overlay" onClick={() => setModalCrear(false)}>
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 480, padding: 24, backgroundColor: "#ffffff", borderRadius: 8 }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#0f172a" }}>
              Crear Nuevo Equipo de Cambios
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#64748b" }}>
              Registra un nuevo grupo técnico resolutor para asignación de cambios organizacionales.
            </p>

            <form onSubmit={crearEquipo}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Código identificador (ej: DEPT-REDES):
                </label>
                <input
                  type="text"
                  required
                  placeholder="DEPT-00X"
                  className="input-base"
                  value={nuevoCodigo}
                  onChange={(e) => setNuevoCodigo(e.target.value.toUpperCase())}
                  style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Nombre del equipo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Infraestructura y Servidores Cloud"
                  className="input-base"
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Descripción operativa:
                </label>
                <textarea
                  rows={3}
                  placeholder="Alcance técnico del equipo..."
                  className="input-base"
                  value={nuevaDesc}
                  onChange={(e) => setNuevaDesc(e.target.value)}
                  style={{ width: "100%", fontSize: 13, padding: "8px 10px" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button className="boton-secundario"
                  type="button"
                  onClick={() => setModalCrear(false)}
                >
                  Cancelar
                </button>
                <button className="boton-primario"
                  type="submit"
                  disabled={creandoEquipo}
                >
                  {creandoEquipo ? "Guardando..." : "Crear equipo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
