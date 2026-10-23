"use client";

import React, { useState } from "react";

interface OpcionRiesgo {
  valor: string;
  texto: string;
  puntaje: number;
  eleva_minimo: string | null;
}

interface PreguntaRiesgo {
  id: number;
  orden: number;
  texto: string;
  peso: number;
  fuente: string;
  aplica_a: string[];
  activa: boolean;
  opciones: OpcionRiesgo[];
}

interface NivelRiesgo {
  id: string;
  nombre: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  border: string;
  descripcion: string;
}

interface PestanaCuestionarioRiesgoProps {
  config: {
    activo: boolean;
    puntaje_maximo_posible: number;
    niveles: NivelRiesgo[];
    reglas: {
      aplicar_regla_elevacion: boolean;
      permitir_ajuste_manual: boolean;
      perfiles_ajuste_manual: number[];
      riesgo_fijo_estandar: boolean;
      cuestionario_abreviado_emergencia: boolean;
      preguntas_emergencia: number[];
    };
    preguntas: PreguntaRiesgo[];
  };
  onChangeConfig: (nuevaConfig: any) => void;
}

export const PestanaCuestionarioRiesgo: React.FC<PestanaCuestionarioRiesgoProps> = ({
  config,
  onChangeConfig,
}) => {
  const [modalSimuladorAbierto, setModalSimuladorAbierto] = useState(false);
  const [modalEditarPreguntaAbierto, setModalEditarPreguntaAbierto] = useState(false);
  const [preguntaEditar, setPreguntaEditar] = useState<PreguntaRiesgo | null>(null);

  // Estados del Simulador
  const [respuestasSimulador, setRespuestasSimulador] = useState<Record<number, string>>({});
  const [resultadoSimulador, setResultadoSimulador] = useState<any>(null);
  const [evaluando, setEvaluando] = useState(false);

  const preguntas = config.preguntas || [];
  const niveles = config.niveles || [];
  const reglas = config.reglas || {
    aplicar_regla_elevacion: true,
    permitir_ajuste_manual: true,
    perfiles_ajuste_manual: [1, 8],
    riesgo_fijo_estandar: true,
    cuestionario_abreviado_emergencia: true,
    preguntas_emergencia: [1, 2, 3, 6, 8],
  };

  // Calcular puntaje máximo posible sumando la opción de mayor puntaje por pregunta activa
  const puntajeMaximoCalculado = preguntas.reduce((sum, p) => {
    if (!p.activa) return sum;
    const maxOpc = Math.max(...p.opciones.map((o) => o.puntaje), 0);
    return sum + maxOpc * (p.peso || 1);
  }, 0);

  const alternarActivaPregunta = (id: number) => {
    const nuevas = preguntas.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p));
    onChangeConfig({ ...config, preguntas: nuevas });
  };

  const abrirEditarPregunta = (p: PreguntaRiesgo) => {
    setPreguntaEditar(JSON.parse(JSON.stringify(p)));
    setModalEditarPreguntaAbierto(true);
  };

  const guardarPreguntaEditada = () => {
    if (!preguntaEditar) return;
    const nuevas = preguntas.map((p) => (p.id === preguntaEditar.id ? preguntaEditar : p));
    onChangeConfig({ ...config, preguntas: nuevas });
    setModalEditarPreguntaAbierto(false);
  };

  const abrirSimulador = () => {
    const iniciales: Record<number, string> = {};
    for (const p of preguntas) {
      if (p.activa && p.opciones.length > 0) {
        iniciales[p.id] = p.opciones[0].valor;
      }
    }
    setRespuestasSimulador(iniciales);
    setResultadoSimulador(null);
    setModalSimuladorAbierto(true);
  };

  const ejecutarSimulacion = async () => {
    try {
      setEvaluando(true);
      const res = await fetch("/api/cambios/configuracion/cuestionario-riesgo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          respuestas: respuestasSimulador,
          valores_formulario: {},
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultadoSimulador(data);
      }
    } catch (err) {
      console.error("Error al simular riesgo:", err);
    } finally {
      setEvaluando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Cabecera y Resumen de Métricas de Riesgo */}
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "16px 20px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
            Cuestionario Ponderado de Evaluación de Riesgo (ITIL 4 / COBIT BAI06)
          </h3>
          <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0 0" }}>
            El nivel de riesgo gobierna la matriz de autoridad y determina si una RFC requiere dictamen colegiado del CAB o aprobación técnica delegada.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className="boton-primario"
            onClick={abrirSimulador}
            style={{ fontSize: 12, padding: "8px 14px", backgroundColor: "#0284c7" }}
          >
            ⚡ Probar Simulador de Riesgo
          </button>
        </div>
      </div>

      {/* Bloque 2: Niveles de Riesgo y Umbrales (Sección 6.4) */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Bloque 2 — Niveles de Riesgo y Escala de Puntajes
            </h4>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              Puntaje máximo configurable posible: <strong>{puntajeMaximoCalculado} puntos</strong>
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {niveles.map((niv) => (
            <div
              key={niv.id}
              style={{
                backgroundColor: niv.bg || "#f8fafc",
                border: `1.5px solid ${niv.border || "#cbd5e1"}`,
                borderRadius: 8,
                padding: 14,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 800, fontSize: 14, color: niv.color }}>
                  {niv.nombre}
                </span>
                <span
                  style={{
                    backgroundColor: "#ffffff",
                    border: `1px solid ${niv.border}`,
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontSize: 11,
                    fontWeight: 700,
                    color: niv.color,
                  }}
                >
                  {niv.min} – {niv.max} pts
                </span>
              </div>
              <p style={{ fontSize: 11.5, color: "#475569", margin: 0, lineHeight: 1.4 }}>
                {niv.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bloque 3: Reglas Especiales de Elevación y Ajuste Manual */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Bloque 3 — Parámetros de Gobierno y Elevación Automática
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="chk-elevacion"
              checked={reglas.aplicar_regla_elevacion}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  reglas: { ...reglas, aplicar_regla_elevacion: e.target.checked },
                })
              }
              style={{ marginTop: 2 }}
            />
            <div>
              <label htmlFor="chk-elevacion" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                Aplicar Regla de Elevación de Riesgo
              </label>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Si una respuesta marca "Eleva a nivel mínimo X" (ej. Varios servicios críticos afectados), el nivel final no podrá ser menor al indicado aunque el puntaje numérico sea bajo.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="chk-ajuste-manual"
              checked={reglas.permitir_ajuste_manual}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  reglas: { ...reglas, permitir_ajuste_manual: e.target.checked },
                })
              }
              style={{ marginTop: 2 }}
            />
            <div>
              <label htmlFor="chk-ajuste-manual" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                Permitir Ajuste Manual de Riesgo (Evaluador)
              </label>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Permite al Gestor de Cambios o evaluador asignado ajustar el nivel calculado justificando técnicamente (mínimo 15 caracteres). Ambos niveles quedan auditados.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="chk-estandar-fijo"
              checked={reglas.riesgo_fijo_estandar}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  reglas: { ...reglas, riesgo_fijo_estandar: e.target.checked },
                })
              }
              style={{ marginTop: 2 }}
            />
            <div>
              <label htmlFor="chk-estandar-fijo" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                Riesgo Fijo para Cambios Estándar
              </label>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Para solicitudes de tipo Estándar con modelo preautorizado, el nivel de riesgo lo provee directamente el modelo aprobado (típicamente Bajo) sin responder el cuestionario.
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="chk-emergencia-abreviado"
              checked={reglas.cuestionario_abreviado_emergencia}
              onChange={(e) =>
                onChangeConfig({
                  ...config,
                  reglas: { ...reglas, cuestionario_abreviado_emergencia: e.target.checked },
                })
              }
              style={{ marginTop: 2 }}
            />
            <div>
              <label htmlFor="chk-emergencia-abreviado" style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                Cuestionario Abreviado para Emergencia
              </label>
              <span style={{ fontSize: 11, color: "#64748b" }}>
                En RFCs de Emergencia solo son obligatorias las preguntas clave (1, 2, 3, 6 y 8) para acelerar la convocatoria del ECAB.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 1: Tabla de Preguntas del Cuestionario */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Bloque 1 — Preguntas y Opciones de Ponderación ({preguntas.length})
          </h4>
        </div>

        <div className="contenedor-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: 40, textAlign: "center" }}>#</th>
                <th>Pregunta</th>
                <th style={{ width: 160 }}>Fuente de Respuesta</th>
                <th style={{ width: 140 }}>Aplica a Tipos</th>
                <th>Opciones y Puntos</th>
                <th style={{ width: 70, textAlign: "center" }}>Peso</th>
                <th style={{ width: 80 }}>Estado</th>
                <th style={{ width: 80 }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map((preg) => (
                <tr key={preg.id}>
                  <td style={{ textAlign: "center", fontWeight: 700, color: "#64748b" }}>{preg.orden}</td>
                  <td style={{ fontWeight: 600, color: "#1e293b" }}>{preg.texto}</td>
                  <td>
                    <span
                      className="badge-itil"
                      style={{
                        backgroundColor: preg.fuente.startsWith("auto") ? "#ecfeff" : "#f1f5f9",
                        color: preg.fuente.startsWith("auto") ? "#0891b2" : "#475569",
                        border: `1px solid ${preg.fuente.startsWith("auto") ? "#a5f3fc" : "#cbd5e1"}`,
                        fontSize: 10.5,
                      }}
                    >
                      {preg.fuente === "manual" ? "Manual" : `Auto (${preg.fuente.replace("auto_", "")})`}
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: "#475569" }}>{preg.aplica_a.join(", ")}</td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {preg.opciones.map((opc, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: 10.5,
                            padding: "2px 6px",
                            backgroundColor: opc.eleva_minimo ? "#fff1f2" : "#f8fafc",
                            border: `1px solid ${opc.eleva_minimo ? "#fecdd3" : "#e2e8f0"}`,
                            borderRadius: 4,
                            color: opc.eleva_minimo ? "#be123c" : "#334155",
                          }}
                          title={opc.eleva_minimo ? `Eleva riesgo automáticamente a mínimo ${opc.eleva_minimo}` : ""}
                        >
                          {opc.texto} ({opc.puntaje} pts{opc.eleva_minimo ? ` ⚠️ Mínimo ${opc.eleva_minimo}` : ""})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: "center", fontWeight: 700 }}>x{preg.peso || 1}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => alternarActivaPregunta(preg.id)}
                      style={{
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 11,
                        color: preg.activa ? "#16a34a" : "#94a3b8",
                      }}
                    >
                      {preg.activa ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="boton-mini"
                      onClick={() => abrirEditarPregunta(preg)}
                      style={{ fontSize: 11, padding: "3px 8px" }}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Simulador de Riesgo */}
      {modalSimuladorAbierto && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }} onClick={() => setModalSimuladorAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 840, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <span className="badge-itil" style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontWeight: 700 }}>
                  SIMULADOR EN TIEMPO REAL
                </span>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "4px 0 0 0" }}>
                  Simulador de Respuestas y Ponderación de Riesgo
                </h3>
              </div>
              <button type="button" className="modal-cerrar-boton" onClick={() => setModalSimuladorAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#64748b" }}>
                ✕
              </button>
            </div>

            {/* Listado de preguntas para responder en el simulador */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              {preguntas.filter((p) => p.activa).map((preg) => (
                <div key={preg.id} style={{ backgroundColor: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
                      {preg.orden}. {preg.texto}
                    </span>
                    <span style={{ fontSize: 10.5, color: "#64748b" }}>Fuente: {preg.fuente}</span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {preg.opciones.map((opc) => {
                      const seleccionada = respuestasSimulador[preg.id] === opc.valor;
                      return (
                        <button
                          key={opc.valor}
                          type="button"
                          onClick={() => setRespuestasSimulador({ ...respuestasSimulador, [preg.id]: opc.valor })}
                          style={{
                            fontSize: 11.5,
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: `1px solid ${seleccionada ? "#0284c7" : "#cbd5e1"}`,
                            backgroundColor: seleccionada ? "#e0f2fe" : "#ffffff",
                            color: seleccionada ? "#0369a1" : "#334155",
                            fontWeight: seleccionada ? 700 : 500,
                            cursor: "pointer",
                          }}
                        >
                          {opc.texto} ({opc.puntaje} pts{opc.eleva_minimo ? ` ⚠️ Mínimo ${opc.eleva_minimo}` : ""})
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Resultado de la simulación */}
            {resultadoSimulador && (
              <div
                style={{
                  backgroundColor: resultadoSimulador.nivel_final.bg || "#f8fafc",
                  border: `2px solid ${resultadoSimulador.nivel_final.border || "#cbd5e1"}`,
                  borderRadius: 10,
                  padding: 18,
                  marginBottom: 16,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                    Resultado del Algoritmo ITIL v4:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: resultadoSimulador.nivel_final.color }}>
                      Nivel {resultadoSimulador.nivel_final.nombre}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                      ({resultadoSimulador.puntaje_total} puntos acumulados)
                    </span>
                  </div>
                  {resultadoSimulador.hubo_elevacion && (
                    <span style={{ fontSize: 11.5, color: "#b91c1c", fontWeight: 700, display: "block", marginTop: 4 }}>
                      ⚠️ Regla de Elevación Aplicada: Puntaje base calculaba nivel {resultadoSimulador.nivel_calculado.nombre}, pero una respuesta crítica forzó elevación a {resultadoSimulador.nivel_final.nombre}.
                    </span>
                  )}
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "#64748b" }}>Autoridad requerida:</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    {resultadoSimulador.nivel_final.id === "bajo"
                      ? "Aprobación Técnica Delegada"
                      : resultadoSimulador.nivel_final.id === "medio"
                      ? "Gestor de Cambios"
                      : resultadoSimulador.nivel_final.id === "alto"
                      ? "Comité Asesor CAB"
                      : "Comité CAB Pleno + Dirección"}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalSimuladorAbierto(false)}>
                Cerrar
              </button>
              <button
                type="button"
                className="boton-primario"
                onClick={ejecutarSimulacion}
                disabled={evaluando}
                style={{ backgroundColor: "#0284c7" }}
              >
                {evaluando ? "Calculando..." : "Calcular Puntaje y Nivel de Riesgo"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Pregunta */}
      {modalEditarPreguntaAbierto && preguntaEditar && (
        <div className="modal-overlay" style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }} onClick={() => setModalEditarPreguntaAbierto(false)}>
          <div className="modal-contenido" style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 540, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: "0 0 14px 0" }}>
              Editar Pregunta #{preguntaEditar.orden}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                  Texto de la pregunta
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={preguntaEditar.texto}
                  onChange={(e) => setPreguntaEditar({ ...preguntaEditar, texto: e.target.value })}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Fuente de respuesta
                  </label>
                  <select
                    className="input-base"
                    value={preguntaEditar.fuente}
                    onChange={(e) => setPreguntaEditar({ ...preguntaEditar, fuente: e.target.value })}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="manual">Manual (Especialista responde)</option>
                    <option value="auto_criticidad">Automática: Criticidad de CIs/Servicios</option>
                    <option value="auto_usuarios">Automática: Usuarios afectados</option>
                    <option value="auto_interrupcion">Automática: Interrupción de servicio</option>
                    <option value="auto_entorno">Automática: Entorno destino</option>
                    <option value="auto_calendario">Automática: Ventana de calendario</option>
                    <option value="auto_historial">Automática: Antecedentes de fallo</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Multiplicador / Peso
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    className="input-base"
                    value={preguntaEditar.peso}
                    onChange={(e) => setPreguntaEditar({ ...preguntaEditar, peso: Number(e.target.value) || 1 })}
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>
              </div>

              {/* Opciones de Respuesta */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#334155", marginBottom: 6 }}>
                  Opciones de Respuesta y Puntajes (0–10 pts):
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {preguntaEditar.opciones.map((opc, idx) => (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "2fr 70px 1fr", gap: 8, alignItems: "center" }}>
                      <input
                        type="text"
                        className="input-base"
                        value={opc.texto}
                        onChange={(e) => {
                          const nuevas = [...preguntaEditar.opciones];
                          nuevas[idx].texto = e.target.value;
                          setPreguntaEditar({ ...preguntaEditar, opciones: nuevas });
                        }}
                        style={{ fontSize: 11.5 }}
                      />
                      <input
                        type="number"
                        min={0}
                        max={10}
                        className="input-base"
                        value={opc.puntaje}
                        onChange={(e) => {
                          const nuevas = [...preguntaEditar.opciones];
                          nuevas[idx].puntaje = Number(e.target.value) || 0;
                          setPreguntaEditar({ ...preguntaEditar, opciones: nuevas });
                        }}
                        style={{ fontSize: 11.5, textAlign: "center" }}
                      />
                      <select
                        className="input-base"
                        value={opc.eleva_minimo || ""}
                        onChange={(e) => {
                          const nuevas = [...preguntaEditar.opciones];
                          nuevas[idx].eleva_minimo = e.target.value ? e.target.value : null;
                          setPreguntaEditar({ ...preguntaEditar, opciones: nuevas });
                        }}
                        style={{ fontSize: 11 }}
                      >
                        <option value="">Sin elevación</option>
                        <option value="medio">Eleva a Medio</option>
                        <option value="alto">Eleva a Alto</option>
                        <option value="critico">Eleva a Crítico</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="boton-secundario" onClick={() => setModalEditarPreguntaAbierto(false)}>
                Cancelar
              </button>
              <button type="button" className="boton-primario" onClick={guardarPreguntaEditada} style={{ backgroundColor: "#2563eb" }}>
                Guardar Pregunta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
