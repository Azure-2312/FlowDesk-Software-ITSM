"use client";

import React, { useState } from "react";

interface EtapaResultado {
  etapa_id: string;
  nombre: string;
  modo?: "secuencial" | "paralelo";
  opcional_si?: string;
}

interface ReglaAutoridad {
  id: string;
  orden: number;
  nombre: string;
  activa: boolean;
  condiciones: {
    tipo_cambio?: string;
    nivel_riesgo?: string[];
    modelo_aprobado?: boolean;
    entorno?: string;
    criticidad_maxima?: string;
    requiere_interrupcion?: boolean;
    fuera_de_ventana?: boolean;
    dentro_congelamiento?: boolean;
  };
  sin_aprobacion: boolean;
  accion_especial?: string;
  etapas: EtapaResultado[];
}

interface PestanaMatrizAutoridadProps {
  config: {
    reglas: ReglaAutoridad[];
  };
  onChange: (nuevo: any) => void;
}

const ETAPAS_CATALOGO = [
  { id: "tecnica", nombre: "Evaluación Técnica (Supervisor del grupo)" },
  { id: "negocio", nombre: "Aprobación de Negocio (Gestor de Área)" },
  { id: "gestor_cambios", nombre: "Aprobación Gestor de Cambios" },
  { id: "cab", nombre: "Comité de Cambios (CAB)" },
  { id: "ecab", nombre: "Comité de Emergencia (ECAB)" },
  { id: "direccion", nombre: "Dirección Institucional" },
  { id: "excepcion_ventana", nombre: "Aprobación Excepción de Ventana" },
  { id: "excepcion_congelamiento", nombre: "Aprobación Excepción de Congelamiento" },
  { id: "cab_retroactivo", nombre: "Revisión Retroactiva por CAB" }
];

export const PestanaMatrizAutoridad: React.FC<PestanaMatrizAutoridadProps> = ({
  config,
  onChange
}) => {
  const reglas = config?.reglas || [];

  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalSimuladorAbierto, setModalSimuladorAbierto] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaAutoridad | null>(null);

  // Estados del Simulador
  const [simParams, setSimParams] = useState({
    tipo_cambio: "normal",
    nivel_riesgo: "medio",
    criticidad_maxima: "media",
    entorno: "produccion",
    requiere_interrupcion: false,
    fuera_de_ventana: false,
    dentro_congelamiento: false,
    modelo_aprobado: false
  });
  const [simResultado, setSimResultado] = useState<any>(null);
  const [simulando, setSimulando] = useState(false);

  const abrirCrearRegla = () => {
    const nuevoId = "regla_" + Date.now();
    const nuevaRegla: ReglaAutoridad = {
      id: nuevoId,
      orden: reglas.length + 1,
      nombre: "Nueva regla de autoridad",
      activa: true,
      condiciones: {
        tipo_cambio: "normal",
        nivel_riesgo: ["medio"]
      },
      sin_aprobacion: false,
      etapas: [
        { etapa_id: "tecnica", nombre: "Evaluación Técnica (Supervisor del grupo)", modo: "secuencial" },
        { etapa_id: "gestor_cambios", nombre: "Aprobación Gestor de Cambios", modo: "secuencial" }
      ]
    };
    setReglaEnEdicion(nuevaRegla);
    setModalEdicionAbierto(true);
  };

  const abrirEditarRegla = (r: ReglaAutoridad) => {
    setReglaEnEdicion(JSON.parse(JSON.stringify(r)));
    setModalEdicionAbierto(true);
  };

  const duplicarRegla = (r: ReglaAutoridad) => {
    const clon: ReglaAutoridad = {
      ...JSON.parse(JSON.stringify(r)),
      id: "regla_" + Date.now(),
      nombre: r.nombre + " (Copia)",
      orden: reglas.length + 1
    };
    onChange({
      ...config,
      reglas: [...reglas, clon]
    });
  };

  const eliminarRegla = (id: string) => {
    if (reglas.length <= 1) {
      alert("Debe mantenerse al menos una regla activa en la matriz de autoridad.");
      return;
    }
    if (!confirm("¿Deseas eliminar esta regla de autoridad?")) return;
    const filtradas = reglas.filter((r) => r.id !== id).map((r, i) => ({ ...r, orden: i + 1 }));
    onChange({
      ...config,
      reglas: filtradas
    });
  };

  const moverRegla = (index: number, direccion: "arriba" | "abajo") => {
    const nuevoIndex = direccion === "arriba" ? index - 1 : index + 1;
    if (nuevoIndex < 0 || nuevoIndex >= reglas.length) return;
    const clon = [...reglas];
    const temp = clon[index];
    clon[index] = clon[nuevoIndex];
    clon[nuevoIndex] = temp;
    const reordenadas = clon.map((r, i) => ({ ...r, orden: i + 1 }));
    onChange({
      ...config,
      reglas: reordenadas
    });
  };

  const guardarRegla = () => {
    if (!reglaEnEdicion) return;
    if (!reglaEnEdicion.nombre.trim()) {
      alert("El nombre de la regla es obligatorio.");
      return;
    }

    const index = reglas.findIndex((r) => r.id === reglaEnEdicion.id);
    let nuevasReglas = [...reglas];
    if (index >= 0) {
      nuevasReglas[index] = reglaEnEdicion;
    } else {
      nuevasReglas.push(reglaEnEdicion);
    }
    nuevasReglas = nuevasReglas.map((r, i) => ({ ...r, orden: i + 1 }));
    onChange({
      ...config,
      reglas: nuevasReglas
    });
    setModalEdicionAbierto(false);
    setReglaEnEdicion(null);
  };

  const ejecutarSimulacion = async () => {
    try {
      setSimulando(true);
      const res = await fetch("/api/admin/cambios/matriz-autoridad/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simParams)
      });
      const data = await res.json();
      setSimResultado(data);
    } catch (err: any) {
      alert("Error al simular: " + err.message);
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Barra de Herramientas Superior */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: "1px solid #cbd5e1"
        }}
      >
        <div>
          <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
            Matriz de Autoridad de Cambios (ITIL v4)
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Evaluación por orden de prioridad: gana la primera regla cuyas condiciones coincidan con la RFC.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => {
              setModalSimuladorAbierto(true);
              ejecutarSimulacion();
            }}
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: "#f1f5f9",
              color: "#334155",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Simulador de Autoridad
          </button>

          <button
            type="button"
            onClick={abrirCrearRegla}
            style={{
              padding: "7px 14px",
              fontSize: 12.5,
              fontWeight: 600,
              backgroundColor: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            + Nueva regla
          </button>
        </div>
      </div>

      {/* Tabla de Reglas */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
              <th style={{ padding: "10px 14px", color: "#475569", width: 70 }}>Prioridad</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 220 }}>Nombre de la Regla</th>
              <th style={{ padding: "10px 14px", color: "#475569" }}>Condiciones de Coincidencia</th>
              <th style={{ padding: "10px 14px", color: "#475569" }}>Secuencia de Etapas</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 70, textAlign: "center" }}>Activa</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 140, textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reglas.map((r, idx) => {
              const cond = r.condiciones || {};
              const esComodin = r.id === "regla_8" || idx === reglas.length - 1;

              return (
                <tr
                  key={r.id}
                  style={{
                    borderBottom: "1px solid #e2e8f0",
                    backgroundColor: r.activa ? "#ffffff" : "#f8fafc",
                    opacity: r.activa ? 1 : 0.6
                  }}
                >
                  <td style={{ padding: "10px 14px", fontWeight: 700, color: "#64748b" }}>
                    #{r.orden}
                  </td>

                  <td style={{ padding: "10px 14px", fontWeight: 600, color: "#1e293b" }}>
                    {r.nombre}
                  </td>

                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {cond.tipo_cambio && (
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#e2e8f0", color: "#334155", fontWeight: 600 }}>
                          Tipo: {cond.tipo_cambio}
                        </span>
                      )}
                      {cond.nivel_riesgo && cond.nivel_riesgo.length > 0 && (
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
                          Riesgo: {cond.nivel_riesgo.join(", ")}
                        </span>
                      )}
                      {cond.modelo_aprobado && (
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#dcfce7", color: "#166534", fontWeight: 600 }}>
                          Modelo Aprobado
                        </span>
                      )}
                      {Object.keys(cond).length === 0 && (
                        <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", color: "#64748b", fontStyle: "italic" }}>
                          Cualquier solicitud (Comodín)
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: "10px 14px" }}>
                    {r.sin_aprobacion ? (
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#16a34a", backgroundColor: "#dcfce7", padding: "3px 8px", borderRadius: 4 }}>
                        Sin aprobación (Preautorizado por modelo)
                      </span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        {(r.etapas || []).map((et, eIdx) => (
                          <React.Fragment key={et.etapa_id + eIdx}>
                            <span
                              style={{
                                fontSize: 11,
                                padding: "2px 6px",
                                borderRadius: 4,
                                backgroundColor: "#dbeafe",
                                color: "#1e40af",
                                fontWeight: 600
                              }}
                            >
                              {et.nombre}
                            </span>
                            {eIdx < (r.etapas || []).length - 1 && (
                              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>
                                {et.modo === "paralelo" ? "||" : "→"}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={r.activa}
                      disabled={esComodin}
                      onChange={(e) => {
                        const clon = [...reglas];
                        clon[idx].activa = e.target.checked;
                        onChange({ ...config, reglas: clon });
                      }}
                    />
                  </td>

                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 4 }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moverRegla(idx, "arriba")}
                        style={{ padding: "2px 6px", fontSize: 11, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", backgroundColor: "#ffffff" }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === reglas.length - 1}
                        onClick={() => moverRegla(idx, "abajo")}
                        style={{ padding: "2px 6px", fontSize: 11, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", backgroundColor: "#ffffff" }}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirEditarRegla(r)}
                        style={{ padding: "2px 6px", fontSize: 11, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", backgroundColor: "#ffffff" }}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicarRegla(r)}
                        style={{ padding: "2px 6px", fontSize: 11, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer", backgroundColor: "#ffffff" }}
                      >
                        Duplicar
                      </button>
                      {!esComodin && (
                        <button
                          type="button"
                          onClick={() => eliminarRegla(r.id)}
                          style={{ padding: "2px 6px", fontSize: 11, border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", backgroundColor: "#fff1f2", color: "#b91c1c" }}
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición de Regla */}
      {modalEdicionAbierto && reglaEnEdicion && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Editor de Regla de Autoridad #{reglaEnEdicion.orden}
              </h3>
              <button
                type="button"
                onClick={() => setModalEdicionAbierto(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Nombre descriptivo de la regla:
                </label>
                <input
                  type="text"
                  value={reglaEnEdicion.nombre}
                  onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, nombre: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              {/* Condiciones */}
              <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <span style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e293b", marginBottom: 10 }}>
                  Condiciones para que aplique esta regla:
                </span>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                      Tipo de cambio:
                    </label>
                    <select
                      value={reglaEnEdicion.condiciones?.tipo_cambio || "cualquiera"}
                      onChange={(e) =>
                        setReglaEnEdicion({
                          ...reglaEnEdicion,
                          condiciones: {
                            ...reglaEnEdicion.condiciones,
                            tipo_cambio: e.target.value === "cualquiera" ? undefined : e.target.value
                          }
                        })
                      }
                      style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                    >
                      <option value="cualquiera">Cualquiera</option>
                      <option value="estandar">Estándar</option>
                      <option value="normal">Normal</option>
                      <option value="emergencia">Emergencia</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                      Niveles de riesgo coincidentes:
                    </label>
                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                      {["bajo", "medio", "alto", "critico"].map((lvl) => {
                        const checked = (reglaEnEdicion.condiciones?.nivel_riesgo || []).includes(lvl);
                        return (
                          <label key={lvl} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "#334155" }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                const prev = reglaEnEdicion.condiciones?.nivel_riesgo || [];
                                const next = e.target.checked ? [...prev, lvl] : prev.filter((x) => x !== lvl);
                                setReglaEnEdicion({
                                  ...reglaEnEdicion,
                                  condiciones: {
                                    ...reglaEnEdicion.condiciones,
                                    nivel_riesgo: next
                                  }
                                });
                              }}
                            />
                            {lvl}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Etapas Resultantes */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>
                    Etapas de aprobación requeridas:
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#166534", fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={reglaEnEdicion.sin_aprobacion}
                      onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, sin_aprobacion: e.target.checked, etapas: [] })}
                    />
                    Sin aprobación previa (Preautorizado por modelo)
                  </label>
                </div>

                {!reglaEnEdicion.sin_aprobacion && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {(reglaEnEdicion.etapas || []).map((et, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 12px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: 6,
                          border: "1px solid #cbd5e1"
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 700, color: "#475569" }}>#{idx + 1}</span>
                        <select
                          value={et.etapa_id}
                          onChange={(e) => {
                            const found = ETAPAS_CATALOGO.find((x) => x.id === e.target.value);
                            const nuevasEtapas = [...reglaEnEdicion.etapas];
                            nuevasEtapas[idx] = {
                              ...nuevasEtapas[idx],
                              etapa_id: e.target.value,
                              nombre: found?.nombre || e.target.value
                            };
                            setReglaEnEdicion({ ...reglaEnEdicion, etapas: nuevasEtapas });
                          }}
                          style={{ flex: 1, padding: "5px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                        >
                          {ETAPAS_CATALOGO.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.nombre}
                            </option>
                          ))}
                        </select>

                        <select
                          value={et.modo || "secuencial"}
                          onChange={(e) => {
                            const nuevasEtapas = [...reglaEnEdicion.etapas];
                            nuevasEtapas[idx].modo = e.target.value as any;
                            setReglaEnEdicion({ ...reglaEnEdicion, etapas: nuevasEtapas });
                          }}
                          style={{ width: 120, padding: "5px 8px", fontSize: 11.5, border: "1px solid #cbd5e1", borderRadius: 4 }}
                        >
                          <option value="secuencial">Secuencial</option>
                          <option value="paralelo">En paralelo</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => {
                            const nuevas = reglaEnEdicion.etapas.filter((_, i) => i !== idx);
                            setReglaEnEdicion({ ...reglaEnEdicion, etapas: nuevas });
                          }}
                          style={{ padding: "4px 8px", fontSize: 11, border: "1px solid #fecaca", borderRadius: 4, backgroundColor: "#fff1f2", color: "#991b1b", cursor: "pointer" }}
                        >
                          Quitar
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const primera = ETAPAS_CATALOGO[0];
                        setReglaEnEdicion({
                          ...reglaEnEdicion,
                          etapas: [
                            ...(reglaEnEdicion.etapas || []),
                            { etapa_id: primera.id, nombre: primera.nombre, modo: "secuencial" }
                          ]
                        });
                      }}
                      style={{
                        alignSelf: "flex-start",
                        marginTop: 4,
                        padding: "5px 10px",
                        fontSize: 11.5,
                        fontWeight: 600,
                        backgroundColor: "#f8fafc",
                        border: "1px dashed #94a3b8",
                        borderRadius: 4,
                        cursor: "pointer",
                        color: "#2563eb"
                      }}
                    >
                      + Agregar etapa a la secuencia
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setModalEdicionAbierto(false)}
                style={{ padding: "7px 14px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6, backgroundColor: "#ffffff", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarRegla}
                style={{ padding: "7px 16px", fontSize: 12.5, fontWeight: 600, backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, cursor: "pointer" }}
              >
                Guardar regla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Simulador */}
      {modalSimuladorAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              maxWidth: 680,
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                Simulador de Matriz de Autoridad
              </h3>
              <button
                type="button"
                onClick={() => setModalSimuladorAbierto(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748b" }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                Introduce las variables técnicas de una RFC hipotética para ver qué regla de autoridad se activa y qué etapas se resolverían.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>
                    Tipo de cambio:
                  </label>
                  <select
                    value={simParams.tipo_cambio}
                    onChange={(e) => setSimParams({ ...simParams, tipo_cambio: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    <option value="estandar">Estándar</option>
                    <option value="normal">Normal</option>
                    <option value="emergencia">Emergencia</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>
                    Nivel de riesgo resultante:
                  </label>
                  <select
                    value={simParams.nivel_riesgo}
                    onChange={(e) => setSimParams({ ...simParams, nivel_riesgo: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    <option value="bajo">Bajo</option>
                    <option value="medio">Medio</option>
                    <option value="alto">Alto</option>
                    <option value="critico">Crítico</option>
                  </select>
                </div>

                {simParams.tipo_cambio === "estandar" && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#1e293b" }}>
                      <input
                        type="checkbox"
                        checked={simParams.modelo_aprobado}
                        onChange={(e) => setSimParams({ ...simParams, modelo_aprobado: e.target.checked })}
                      />
                      Cuenta con modelo de cambio estándar en estado APROBADO y vigente
                    </label>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={ejecutarSimulacion}
                disabled={simulando}
                style={{
                  padding: "8px 16px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                {simulando ? "Calculando..." : "Evaluar Matriz de Autoridad"}
              </button>

              {simResultado && (
                <div style={{ marginTop: 8, padding: 14, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
                      Regla Coincidente:
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 4, backgroundColor: "#dbeafe", color: "#1e40af" }}>
                      #{simResultado.regla?.orden} {simResultado.regla?.nombre}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#475569" }}>
                    {simResultado.explicacion}
                  </p>

                  <span style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                    Flujo de Autorización:
                  </span>
                  {simResultado.sin_aprobacion ? (
                    <div style={{ padding: 8, backgroundColor: "#dcfce7", color: "#166534", borderRadius: 4, fontWeight: 700, fontSize: 12 }}>
                      Preautorizado automáticamente por Modelo de Cambio Estándar (Sin intervención humana de aprobación).
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      {(simResultado.etapas_resultantes || []).map((et: any, idx: number) => (
                        <React.Fragment key={idx}>
                          <span style={{ padding: "4px 8px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 11.5, fontWeight: 600, color: "#1e293b" }}>
                            {et.nombre}
                          </span>
                          {idx < simResultado.etapas_resultantes.length - 1 && (
                            <span style={{ color: "#64748b", fontWeight: 700 }}>→</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setModalSimuladorAbierto(false)}
                style={{ padding: "6px 14px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 6, backgroundColor: "#ffffff", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
