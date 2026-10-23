"use client";

import React, { useState, useEffect } from "react";

interface PlantillaRFC {
  id_plantilla: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_cambio: string;
  id_categoria?: number | null;
  categoria_nombre?: string;
  campos_prellenados?: any;
  campos_bloqueados?: string[];
  pasos_implementacion?: any[];
  tareas_paquete?: any[];
  veces_usada: number;
  activo: boolean;
}

export const PestanaPlantillas: React.FC = () => {
  const [plantillas, setPlantillas] = useState<PlantillaRFC[]>([]);
  const [cargando, setCargando] = useState(false);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [modalEditorAbierto, setModalEditorAbierto] = useState(false);
  const [pestañaModal, setPestañaModal] = useState<"general" | "prellenado" | "pasos" | "vista">("general");
  const [errorModal, setErrorModal] = useState("");
  const [guardando, setGuardando] = useState(false);

  // Estado de edición / creación
  const [plantillaActiva, setPlantillaActiva] = useState<Partial<PlantillaRFC>>({
    codigo: "",
    nombre: "",
    descripcion: "",
    tipo_cambio: "NORMAL",
    campos_prellenados: {},
    campos_bloqueados: [],
    pasos_implementacion: [],
  });

  const cargarPlantillas = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/cambios/configuracion/plantillas");
      const data = await res.json();
      if (data.ok && Array.isArray(data.plantillas)) {
        setPlantillas(data.plantillas);
      }
    } catch (err) {
      console.error("Error al cargar plantillas:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPlantillas();
  }, []);

  const abrirCrear = () => {
    setPlantillaActiva({
      codigo: "",
      nombre: "",
      descripcion: "",
      tipo_cambio: "NORMAL",
      campos_prellenados: {
        motivo: "",
        plan_implementacion: "",
        plan_rollback: "",
        requiere_interrupcion: false,
      },
      campos_bloqueados: ["tipo_cambio"],
      pasos_implementacion: [],
    });
    setPestañaModal("general");
    setErrorModal("");
    setModalEditorAbierto(true);
  };

  const abrirEditar = (p: PlantillaRFC) => {
    setPlantillaActiva(JSON.parse(JSON.stringify(p)));
    setPestañaModal("general");
    setErrorModal("");
    setModalEditorAbierto(true);
  };

  const alternarActivo = async (p: PlantillaRFC) => {
    try {
      const res = await fetch("/api/cambios/configuracion/plantillas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_plantilla: p.id_plantilla, activo: !p.activo }),
      });
      if (res.ok) cargarPlantillas();
    } catch (err) {
      console.error("Error al alternar estado:", err);
    }
  };

  const eliminarPlantilla = async (p: PlantillaRFC) => {
    if (!confirm(`¿Desea eliminar la plantilla "${p.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/cambios/configuracion/plantillas?id_plantilla=${p.id_plantilla}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        cargarPlantillas();
      } else {
        alert(data.error || "No se pudo eliminar.");
      }
    } catch (err) {
      console.error("Error al eliminar plantilla:", err);
    }
  };

  const guardarPlantilla = async () => {
    if (!plantillaActiva.nombre?.trim() || (!plantillaActiva.id_plantilla && !plantillaActiva.codigo?.trim())) {
      setErrorModal("El nombre y código son obligatorios.");
      return;
    }

    try {
      setGuardando(true);
      setErrorModal("");
      const esEdicion = !!plantillaActiva.id_plantilla;
      const res = await fetch("/api/cambios/configuracion/plantillas", {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(plantillaActiva),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorModal(data.error || "Error al guardar plantilla.");
        return;
      }

      setModalEditorAbierto(false);
      cargarPlantillas();
    } catch (err: any) {
      setErrorModal(err.message || "Error al conectar.");
    } finally {
      setGuardando(false);
    }
  };

  const plantillasFiltradas = plantillas.filter((p) => {
    if (!filtroTexto) return true;
    const txt = filtroTexto.toLowerCase();
    return p.nombre.toLowerCase().includes(txt) || p.codigo.toLowerCase().includes(txt) || (p.descripcion && p.descripcion.toLowerCase().includes(txt));
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Cabecera */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "14px 18px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Plantillas Predefinidas de Solicitud RFC
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "2px 0 0 0" }}>
            Agilizan el registro prellenando campos y pasos técnicos (a diferencia de los modelos estándar, las plantillas no confieren preautorización).
          </p>
        </div>

        <button
          type="button"
          className="boton-primario"
          onClick={abrirCrear}
          style={{ fontSize: 12, padding: "7px 14px", backgroundColor: "#2563eb" }}
        >
          + Nueva Plantilla RFC
        </button>
      </div>

      {/* Filtro */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          className="input-base"
          placeholder="Buscar plantilla por nombre o descripción..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
          style={{ maxWidth: 360, fontSize: 12 }}
        />
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>
          {plantillasFiltradas.length} plantilla(s) registradas
        </span>
      </div>

      {/* Tabla de Plantillas */}
      <div className="contenedor-tabla">
        {cargando ? (
          <div style={{ textAlign: "center", padding: 32, color: "#2563eb" }}>Cargando plantillas...</div>
        ) : (
          <table className="tabla">
            <thead>
              <tr>
                <th>Nombre de la Plantilla</th>
                <th>Código</th>
                <th>Tipo Sugerido</th>
                <th>Descripción</th>
                <th style={{ width: 80, textAlign: "center" }}>Usos</th>
                <th style={{ width: 90 }}>Estado</th>
                <th style={{ width: 140 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plantillasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#64748b" }}>
                    No se encontraron plantillas de cambio configuradas.
                  </td>
                </tr>
              ) : (
                plantillasFiltradas.map((p) => (
                  <tr key={p.id_plantilla}>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>{p.nombre}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11.5, color: "#64748b" }}>{p.codigo}</td>
                    <td>
                      <span
                        className="badge-itil"
                        style={{
                          backgroundColor: p.tipo_cambio === "EMERGENCIA" ? "#fee2e2" : p.tipo_cambio === "ESTANDAR" ? "#f1f5f9" : "#eff6ff",
                          color: p.tipo_cambio === "EMERGENCIA" ? "#991b1b" : p.tipo_cambio === "ESTANDAR" ? "#334155" : "#1d4ed8",
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        {p.tipo_cambio}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "#475569" }}>{p.descripcion || "—"}</td>
                    <td style={{ textAlign: "center", fontWeight: 700, color: p.veces_usada > 0 ? "#2563eb" : "#94a3b8" }}>
                      {p.veces_usada}
                    </td>
                    <td>
                      <span
                        className="badge-itil"
                        style={{
                          backgroundColor: p.activo ? "#dcfce7" : "#f1f5f9",
                          color: p.activo ? "#166534" : "#64748b",
                          border: `1px solid ${p.activo ? "#86efac" : "#cbd5e1"}`,
                          fontSize: 10.5,
                          fontWeight: 700,
                        }}
                      >
                        {p.activo ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => abrirEditar(p)}
                          style={{ fontSize: 11, padding: "2px 6px" }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => alternarActivo(p)}
                          style={{ fontSize: 11, padding: "2px 6px" }}
                        >
                          {p.activo ? "Desact" : "Act"}
                        </button>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => eliminarPlantilla(p)}
                          style={{ fontSize: 11, padding: "2px 6px", color: "#dc2626" }}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Editor de Plantilla RFC */}
      {modalEditorAbierto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={() => setModalEditorAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 760, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                {plantillaActiva.id_plantilla ? `Editar Plantilla: ${plantillaActiva.nombre}` : "Nueva Plantilla RFC"}
              </h3>
              <button type="button" className="modal-cerrar-boton" onClick={() => setModalEditorAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}>
                ✕
              </button>
            </div>

            {/* Pestañas internas del Editor de Plantilla (Sección 6.6) */}
            <div style={{ display: "flex", gap: 6, borderBottom: "1px solid #e2e8f0", marginBottom: 16 }}>
              {[
                { id: "general", label: "1. Datos Generales" },
                { id: "prellenado", label: "2. Valores Prellenados" },
                { id: "pasos", label: "3. Pasos y Tareas" },
                { id: "vista", label: "4. Vista Previa" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPestañaModal(tab.id as any)}
                  style={{
                    padding: "8px 14px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    color: pestañaModal === tab.id ? "#2563eb" : "#64748b",
                    borderBottom: `2px solid ${pestañaModal === tab.id ? "#2563eb" : "transparent"}`,
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido según pestaña interna */}
            {pestañaModal === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Nombre de la Plantilla <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={plantillaActiva.nombre || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPlantillaActiva({
                        ...plantillaActiva,
                        nombre: v,
                        codigo: plantillaActiva.codigo ? plantillaActiva.codigo : `plt_${v.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30)}`,
                      });
                    }}
                    style={{ width: "100%", fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Código Identificador <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={plantillaActiva.codigo || ""}
                    onChange={(e) => setPlantillaActiva({ ...plantillaActiva, codigo: e.target.value.toLowerCase() })}
                    disabled={!!plantillaActiva.id_plantilla}
                    style={{ width: "100%", fontSize: 12, fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Tipo de Cambio Sugerido
                  </label>
                  <select
                    className="input-base"
                    value={plantillaActiva.tipo_cambio || "NORMAL"}
                    onChange={(e) => setPlantillaActiva({ ...plantillaActiva, tipo_cambio: e.target.value })}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="NORMAL">Normal (Evaluación CAB estándar)</option>
                    <option value="ESTANDAR">Estándar (Procedimiento rutinario)</option>
                    <option value="EMERGENCIA">Emergencia (Convocatoria ECAB)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Descripción o Propósito
                  </label>
                  <textarea
                    className="input-base"
                    rows={3}
                    value={plantillaActiva.descripcion || ""}
                    onChange={(e) => setPlantillaActiva({ ...plantillaActiva, descripcion: e.target.value })}
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>
              </div>
            )}

            {pestañaModal === "prellenado" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Motivo / Justificación Prellenada
                  </label>
                  <textarea
                    className="input-base"
                    rows={2}
                    value={plantillaActiva.campos_prellenados?.motivo || ""}
                    onChange={(e) =>
                      setPlantillaActiva({
                        ...plantillaActiva,
                        campos_prellenados: { ...plantillaActiva.campos_prellenados, motivo: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Plan de Rollback Predefinido
                  </label>
                  <textarea
                    className="input-base"
                    rows={3}
                    value={plantillaActiva.campos_prellenados?.plan_rollback || ""}
                    onChange={(e) =>
                      setPlantillaActiva({
                        ...plantillaActiva,
                        campos_prellenados: { ...plantillaActiva.campos_prellenados, plan_rollback: e.target.value },
                      })
                    }
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    id="plt-interrupcion"
                    checked={!!plantillaActiva.campos_prellenados?.requiere_interrupcion}
                    onChange={(e) =>
                      setPlantillaActiva({
                        ...plantillaActiva,
                        campos_prellenados: { ...plantillaActiva.campos_prellenados, requiere_interrupcion: e.target.checked },
                      })
                    }
                  />
                  <label htmlFor="plt-interrupcion" style={{ fontSize: 12, color: "#334155" }}>
                    ¿Predefinir que requiere interrupción del servicio?
                  </label>
                </div>
              </div>
            )}

            {pestañaModal === "pasos" && (
              <div style={{ padding: 20, backgroundColor: "#f8fafc", borderRadius: 8, textAlign: "center", color: "#64748b" }}>
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Paquete de Tareas Preconfiguradas</p>
                <p style={{ fontSize: 11.5, margin: "4px 0 0 0" }}>
                  Los pasos técnicos registrados aquí se convertirán automáticamente en subtareas de implementación al programar la RFC.
                </p>
              </div>
            )}

            {pestañaModal === "vista" && (
              <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                <div><strong>Nombre:</strong> {plantillaActiva.nombre}</div>
                <div><strong>Código:</strong> <code>{plantillaActiva.codigo}</code></div>
                <div><strong>Tipo sugerido:</strong> {plantillaActiva.tipo_cambio}</div>
                <div><strong>Motivo prellenado:</strong> {plantillaActiva.campos_prellenados?.motivo || "—"}</div>
                <div><strong>Rollback prellenado:</strong> {plantillaActiva.campos_prellenados?.plan_rollback || "—"}</div>
              </div>
            )}

            {errorModal && (
              <div style={{ marginTop: 12, padding: "8px 12px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, color: "#991b1b", fontSize: 12 }}>
                {errorModal}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalEditorAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarPlantilla} disabled={guardando} style={{ backgroundColor: "#2563eb" }}>
                {guardando ? "Guardando..." : "Guardar Plantilla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
