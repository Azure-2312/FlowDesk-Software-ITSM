"use client";

import React, { useState } from "react";

interface ReglaClasificacion {
  id: string;
  orden: number;
  nombre: string;
  activa: boolean;
  cuando: "al_enviar" | "al_cambiar_tipo" | "al_cambiar_riesgo" | "al_cambiar_fechas" | "al_agregar_ci";
  condiciones: {
    tipo_cambio?: string;
    riesgo_mayor_que?: string;
    criticidad_ci_en?: string[];
    fuera_anticipacion_minima?: boolean;
    entorno?: string;
    fuera_de_ventana?: boolean;
    dentro_congelamiento?: boolean;
  };
  accion: "reclasificar_tipo" | "sugerir_tipo" | "agregar_etapa_aprobacion" | "bloquear_con_mensaje" | "advertir_con_mensaje" | "etiquetar_y_notificar";
  tipo_destino?: string;
  etapa_a_agregar?: string;
  etiqueta?: string;
  notificar_roles?: string[];
  mensaje: string;
  veces_aplicada: number;
}

interface PestanaReglasClasificacionProps {
  config: {
    estrategia_evaluacion?: "todas" | "primera";
    riesgo_maximo_modelo_estandar?: string;
    reglas: ReglaClasificacion[];
  };
  onChange: (nuevo: any) => void;
}

export const PestanaReglasClasificacion: React.FC<PestanaReglasClasificacionProps> = ({
  config,
  onChange
}) => {
  const reglas = config?.reglas || [];
  const estrategia = config?.estrategia_evaluacion || "todas";

  const [modalEdicionAbierto, setModalEdicionAbierto] = useState(false);
  const [modalSimuladorAbierto, setModalSimuladorAbierto] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<ReglaClasificacion | null>(null);

  // Estados del Simulador
  const [simParams, setSimParams] = useState({
    tipo_cambio: "estandar",
    nivel_riesgo: "medio",
    criticidad_ci: "media",
    entorno: "produccion",
    horas_anticipacion: 12,
    fuera_de_ventana: false,
    dentro_congelamiento: false
  });
  const [simResultado, setSimResultado] = useState<any>(null);
  const [simulando, setSimulando] = useState(false);

  const cambiarEstrategia = (val: "todas" | "primera") => {
    onChange({
      ...config,
      estrategia_evaluacion: val
    });
  };

  const abrirCrearRegla = () => {
    const nuevaRegla: ReglaClasificacion = {
      id: "regla_clasif_" + Date.now(),
      orden: reglas.length + 1,
      nombre: "Nueva regla de clasificación",
      activa: true,
      cuando: "al_enviar",
      condiciones: {
        tipo_cambio: "estandar"
      },
      accion: "advertir_con_mensaje",
      mensaje: "Verificación automática de condiciones del cambio.",
      veces_aplicada: 0
    };
    setReglaEnEdicion(nuevaRegla);
    setModalEdicionAbierto(true);
  };

  const abrirEditarRegla = (r: ReglaClasificacion) => {
    setReglaEnEdicion(JSON.parse(JSON.stringify(r)));
    setModalEdicionAbierto(true);
  };

  const duplicarRegla = (r: ReglaClasificacion) => {
    const clon: ReglaClasificacion = {
      ...JSON.parse(JSON.stringify(r)),
      id: "regla_clasif_" + Date.now(),
      nombre: r.nombre + " (Copia)",
      orden: reglas.length + 1
    };
    onChange({
      ...config,
      reglas: [...reglas, clon]
    });
  };

  const eliminarRegla = (id: string) => {
    if (!confirm("¿Deseas eliminar esta regla de clasificación?")) return;
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
    if (!reglaEnEdicion.mensaje.trim() || reglaEnEdicion.mensaje.trim().length < 5) {
      alert("El mensaje explicativo al usuario debe tener al menos 5 caracteres.");
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
      const res = await fetch("/api/cambios/configuracion/reglas-clasificacion/simular", {
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
      {/* Barra de Herramientas y Parámetros Globales */}
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
            Reglas Automáticas de Clasificación y Elevación (ITIL v4)
          </h3>
          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
            Supervisan la consistencia de tipos de cambio, aplican reclasificaciones forzadas o incorporan etapas adicionales.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#475569" }}>
            <span style={{ fontWeight: 600 }}>Estrategia:</span>
            <select
              value={estrategia}
              onChange={(e) => cambiarEstrategia(e.target.value as any)}
              style={{ padding: "5px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
            >
              <option value="todas">Aplicar todas las coincidentes</option>
              <option value="primera">Detener en la primera coincidencia</option>
            </select>
          </div>

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
            Simulador de Reglas
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
              <th style={{ padding: "10px 14px", color: "#475569", width: 70 }}>Orden</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 240 }}>Nombre y Disparador</th>
              <th style={{ padding: "10px 14px", color: "#475569" }}>Condiciones</th>
              <th style={{ padding: "10px 14px", color: "#475569" }}>Acción Técnica</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 80, textAlign: "center" }}>Activa</th>
              <th style={{ padding: "10px 14px", color: "#475569", width: 140, textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reglas.map((r, idx) => (
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

                <td style={{ padding: "10px 14px" }}>
                  <strong style={{ color: "#1e293b", display: "block" }}>{r.nombre}</strong>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    Evalúa: <strong>{r.cuando}</strong>
                  </span>
                </td>

                <td style={{ padding: "10px 14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {r.condiciones?.tipo_cambio && (
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#e2e8f0", color: "#334155", fontWeight: 600 }}>
                        Tipo: {r.condiciones.tipo_cambio}
                      </span>
                    )}
                    {r.condiciones?.riesgo_mayor_que && (
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#fee2e2", color: "#991b1b", fontWeight: 600 }}>
                        Riesgo &gt; {r.condiciones.riesgo_mayor_que}
                      </span>
                    )}
                    {r.condiciones?.criticidad_ci_en && (
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#92400e", fontWeight: 600 }}>
                        CI Crítico: {r.condiciones.criticidad_ci_en.join(", ")}
                      </span>
                    )}
                    {r.condiciones?.fuera_anticipacion_minima && (
                      <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4, backgroundColor: "#f1f5f9", color: "#64748b" }}>
                        Fuera de anticipación
                      </span>
                    )}
                  </div>
                </td>

                <td style={{ padding: "10px 14px" }}>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 4,
                      backgroundColor:
                        r.accion === "bloquear_con_mensaje"
                          ? "#fee2e2"
                          : r.accion === "reclasificar_tipo"
                          ? "#dbeafe"
                          : "#f1f5f9",
                      color:
                        r.accion === "bloquear_con_mensaje"
                          ? "#991b1b"
                          : r.accion === "reclasificar_tipo"
                          ? "#1e40af"
                          : "#334155"
                    }}
                  >
                    {r.accion}
                    {r.tipo_destino ? ` → ${r.tipo_destino}` : ""}
                    {r.etapa_a_agregar ? ` + ${r.etapa_a_agregar}` : ""}
                  </span>
                </td>

                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={r.activa}
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
                    <button
                      type="button"
                      onClick={() => eliminarRegla(r.id)}
                      style={{ padding: "2px 6px", fontSize: 11, border: "1px solid #fecaca", borderRadius: 4, cursor: "pointer", backgroundColor: "#fff1f2", color: "#b91c1c" }}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Edición de Regla de Clasificación */}
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
              maxWidth: 680,
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
                Editor de Regla de Clasificación #{reglaEnEdicion.orden}
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
                  Nombre de la regla:
                </label>
                <input
                  type="text"
                  value={reglaEnEdicion.nombre}
                  onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, nombre: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                    ¿Cuándo se evalúa esta regla?
                  </label>
                  <select
                    value={reglaEnEdicion.cuando}
                    onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, cuando: e.target.value as any })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    <option value="al_enviar">Al enviar solicitud</option>
                    <option value="al_cambiar_tipo">Al cambiar tipo de cambio</option>
                    <option value="al_cambiar_riesgo">Al cambiar resultado de riesgo</option>
                    <option value="al_cambiar_fechas">Al modificar fechas de ventana</option>
                    <option value="al_agregar_ci">Al agregar activos / CIs</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                    Acción técnica a ejecutar:
                  </label>
                  <select
                    value={reglaEnEdicion.accion}
                    onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, accion: e.target.value as any })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    <option value="reclasificar_tipo">Reclasificar a otro tipo</option>
                    <option value="sugerir_tipo">Sugerir tipo de cambio</option>
                    <option value="agregar_etapa_aprobacion">Agregar etapa de aprobación</option>
                    <option value="bloquear_con_mensaje">Bloquear con mensaje de impedimento</option>
                    <option value="advertir_con_mensaje">Advertir al solicitante</option>
                    <option value="etiquetar_y_notificar">Etiquetar y notificar</option>
                  </select>
                </div>
              </div>

              {reglaEnEdicion.accion === "reclasificar_tipo" && (
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>
                    Tipo de destino forzado:
                  </label>
                  <select
                    value={reglaEnEdicion.tipo_destino || "normal"}
                    onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, tipo_destino: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    <option value="normal">Normal</option>
                    <option value="emergencia">Emergencia</option>
                    <option value="estandar">Estándar</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Mensaje explicativo para la persona usuaria (5–250 caracteres):
                </label>
                <textarea
                  rows={3}
                  value={reglaEnEdicion.mensaje}
                  onChange={(e) => setReglaEnEdicion({ ...reglaEnEdicion, mensaje: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
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

      {/* Modal Simulador de Reglas de Clasificación */}
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
                Simulador de Reglas de Clasificación y Elevación
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>
                    Tipo seleccionado:
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
                    Nivel de riesgo evaluado:
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

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>
                    Criticidad de los CI:
                  </label>
                  <select
                    value={simParams.criticidad_ci}
                    onChange={(e) => setSimParams({ ...simParams, criticidad_ci: e.target.value })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#334155", marginBottom: 2 }}>
                    Horas de anticipación a la ventana:
                  </label>
                  <input
                    type="number"
                    value={simParams.horas_anticipacion}
                    onChange={(e) => setSimParams({ ...simParams, horas_anticipacion: Number(e.target.value) })}
                    style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #cbd5e1", borderRadius: 4 }}
                  />
                </div>
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
                {simulando ? "Evaluando reglas..." : "Simular Clasificación"}
              </button>

              {simResultado && (
                <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>
                      Resultado de la Simulación:
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: 4,
                        backgroundColor: simResultado.bloqueado ? "#fee2e2" : "#dbeafe",
                        color: simResultado.bloqueado ? "#991b1b" : "#1e40af"
                      }}
                    >
                      Tipo resultante: {simResultado.tipo_resultante}
                    </span>
                  </div>

                  <p style={{ margin: "0 0 6px 0", fontSize: 12, color: "#475569" }}>
                    Reglas disparadas: <strong>{simResultado.total_reglas_disparadas}</strong>
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {(simResultado.reglas_disparadas || []).map((r: any) => (
                      <div key={r.id} style={{ padding: 8, backgroundColor: "#ffffff", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <strong style={{ fontSize: 12, color: "#1e293b" }}>#{r.orden} {r.nombre}</strong>
                          <span style={{ fontSize: 11, color: "#64748b" }}>{r.accion}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 11.5, color: "#475569" }}>{r.mensaje}</p>
                      </div>
                    ))}
                  </div>
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
