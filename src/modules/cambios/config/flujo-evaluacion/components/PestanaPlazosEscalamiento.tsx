"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Clock, Play, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from "@/shared/components/ui/Iconos";

interface PlazoPrioridad {
  prioridad_id: string;
  prioridad_nombre: string;
  primera_respuesta_horas: number;
  evaluacion_horas: number;
  autorizacion_total_horas: number;
  plazo_por_etapa_horas: number;
}

interface ReglaEscalamiento {
  id: string;
  nombre: string;
  objetivo: "primera_respuesta" | "evaluacion" | "autorizacion" | "etapa";
  prioridades: string[];
  umbral_tipo: "porcentaje_plazo" | "vencido_horas";
  umbral_valor: number;
  accion: string;
  destinatarios: string[];
  etiqueta?: string;
  mensaje: string;
  repetir_cada_horas: number;
  max_repeticiones: number;
  activa: boolean;
}

interface PlazosEscalamientoConfig {
  plazos_por_prioridad?: PlazoPrioridad[];
  parametros_adicionales?: {
    horas_diferencia_reprogramacion_reautorizar: number;
    tolerancia_inicio_minutos: number;
    vigencia_autorizacion_dias: {
      normal: number;
      estandar: number;
      emergencia: number;
    };
    tipo_computo_tiempo: "horas_habiles" | "horas_corridas";
  };
  reglas_escalamiento?: ReglaEscalamiento[];
}

interface PestanaPlazosEscalamientoProps {
  snapshot: PlazosEscalamientoConfig;
  onChange: (nuevoSnapshot: PlazosEscalamientoConfig) => void;
  disabled?: boolean;
}

export const PestanaPlazosEscalamiento: React.FC<PestanaPlazosEscalamientoProps> = ({ snapshot, onChange, disabled }) => {
  const plazos: PlazoPrioridad[] = snapshot?.plazos_por_prioridad || [
    { prioridad_id: "p1", prioridad_nombre: "P1 - Crítica", primera_respuesta_horas: 0.5, evaluacion_horas: 2, autorizacion_total_horas: 2, plazo_por_etapa_horas: 1 },
    { prioridad_id: "p2", prioridad_nombre: "P2 - Alta", primera_respuesta_horas: 2, evaluacion_horas: 12, autorizacion_total_horas: 24, plazo_por_etapa_horas: 8 },
    { prioridad_id: "p3", prioridad_nombre: "P3 - Media", primera_respuesta_horas: 8, evaluacion_horas: 48, autorizacion_total_horas: 72, plazo_por_etapa_horas: 24 },
    { prioridad_id: "p4", prioridad_nombre: "P4 - Baja", primera_respuesta_horas: 24, evaluacion_horas: 72, autorizacion_total_horas: 120, plazo_por_etapa_horas: 48 }
  ];

  const parametros = snapshot?.parametros_adicionales || {
    horas_diferencia_reprogramacion_reautorizar: 24,
    tolerancia_inicio_minutos: 30,
    vigencia_autorizacion_dias: { normal: 7, estandar: 30, emergencia: 1 },
    tipo_computo_tiempo: "horas_habiles"
  };

  const reglas: ReglaEscalamiento[] = snapshot?.reglas_escalamiento || [];

  const [modalReglaAbierto, setModalReglaAbierto] = useState(false);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<Partial<ReglaEscalamiento>>({});
  const [errorRegla, setErrorRegla] = useState<string | null>(null);

  // Modal simulador de escalamiento
  const [modalSimuladorAbierto, setModalSimuladorAbierto] = useState(false);
  const [simParams, setSimParams] = useState({
    prioridad: "p2",
    tipo_cambio: "normal",
    fase: "autorizacion",
    horas_transcurridas: 18
  });
  const [simResultado, setSimResultado] = useState<any>(null);
  const [simulando, setSimulando] = useState(false);

  const handleUpdatePlazo = (index: number, campo: keyof PlazoPrioridad, valor: number) => {
    const nuevos = [...plazos];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    onChange({ ...snapshot, plazos_por_prioridad: nuevos });
  };

  const handleUpdateParametros = (modificado: any) => {
    onChange({ ...snapshot, parametros_adicionales: { ...parametros, ...modificado } });
  };

  const abrirModalCrearRegla = () => {
    setReglaEnEdicion({
      id: "esc_" + Date.now(),
      nombre: "Nueva Regla de Escalamiento",
      objetivo: "autorizacion",
      prioridades: ["p1", "p2", "p3", "p4"],
      umbral_tipo: "porcentaje_plazo",
      umbral_valor: 80,
      accion: "notificar",
      destinatarios: ["aprobador_pendiente", "gestor_cambios"],
      etiqueta: "En riesgo",
      mensaje: "Aviso de escalamiento por consumo de plazo.",
      repetir_cada_horas: 0,
      max_repeticiones: 1,
      activa: true
    });
    setErrorRegla(null);
    setModalReglaAbierto(true);
  };

  const abrirModalEditarRegla = (r: ReglaEscalamiento) => {
    setReglaEnEdicion({ ...r });
    setErrorRegla(null);
    setModalReglaAbierto(true);
  };

  const handleGuardarRegla = () => {
    if (!reglaEnEdicion.nombre?.trim()) {
      setErrorRegla("El nombre de la regla es obligatorio.");
      return;
    }

    const existe = reglas.some(r => r.id === reglaEnEdicion.id);
    let nuevas: ReglaEscalamiento[] = [];
    if (existe) {
      nuevas = reglas.map(r => r.id === reglaEnEdicion.id ? (reglaEnEdicion as ReglaEscalamiento) : r);
    } else {
      nuevas = [...reglas, reglaEnEdicion as ReglaEscalamiento];
    }

    onChange({ ...snapshot, reglas_escalamiento: nuevas });
    setModalReglaAbierto(false);
  };

  const handleEliminarRegla = (id: string) => {
    if (confirm("¿Confirma eliminar esta regla de escalamiento?")) {
      onChange({ ...snapshot, reglas_escalamiento: reglas.filter(r => r.id !== id) });
    }
  };

  // Simulación
  const ejecutarSimulacion = async () => {
    try {
      setSimulando(true);
      const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/simular-escalamiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...simParams, parametros_custom: snapshot })
      });
      const data = await res.json();
      setSimResultado(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Plazos Operativos y Reglas de Escalamiento
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Tiempos máximos de respuesta, evaluación y autorización por prioridad, y protocolos de alerta y escalamiento jerárquico.
          </p>
        </div>

        <button
          onClick={() => {
            setModalSimuladorAbierto(true);
            ejecutarSimulacion();
          }}
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #cbd5e1",
            color: "#1e293b",
            padding: "8px 14px",
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Play size={15} style={{ color: "#2563eb" }} />
          Simular Escalamiento
        </button>
      </div>

      {/* Matriz de Plazos por Prioridad */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px", overflowX: "auto" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Matriz Institucional de Plazos por Prioridad (Horas)
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "10px 12px" }}>Nivel de Prioridad</th>
              <th style={{ padding: "10px 12px" }}>1ª Respuesta (Horas)</th>
              <th style={{ padding: "10px 12px" }}>Evaluación Técnica (Horas)</th>
              <th style={{ padding: "10px 12px" }}>Autorización Total (Horas)</th>
              <th style={{ padding: "10px 12px" }}>Plazo por Etapa (Horas)</th>
            </tr>
          </thead>
          <tbody>
            {plazos.map((p, idx) => (
              <tr key={p.prioridad_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e293b" }}>
                  {p.prioridad_nombre}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <input
                    type="number"
                    step="0.5"
                    value={p.primera_respuesta_horas}
                    onChange={e => handleUpdatePlazo(idx, "primera_respuesta_horas", Number(e.target.value))}
                    disabled={disabled}
                    style={{ width: "90px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <input
                    type="number"
                    value={p.evaluacion_horas}
                    onChange={e => handleUpdatePlazo(idx, "evaluacion_horas", Number(e.target.value))}
                    disabled={disabled}
                    style={{ width: "90px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <input
                    type="number"
                    value={p.autorizacion_total_horas}
                    onChange={e => handleUpdatePlazo(idx, "autorizacion_total_horas", Number(e.target.value))}
                    disabled={disabled}
                    style={{ width: "90px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <input
                    type="number"
                    value={p.plazo_por_etapa_horas}
                    onChange={e => handleUpdatePlazo(idx, "plazo_por_etapa_horas", Number(e.target.value))}
                    disabled={disabled}
                    style={{ width: "90px", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Parámetros Adicionales de Vigencia y Cómputo */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Parámetros de Reprogramación y Vigencia de Autorizaciones
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Umbral Reprogramación para Reautorizar (Horas)
            </label>
            <input
              type="number"
              value={parametros.horas_diferencia_reprogramacion_reautorizar}
              onChange={e => handleUpdateParametros({ horas_diferencia_reprogramacion_reautorizar: Number(e.target.value) })}
              disabled={disabled}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Si la nueva fecha difiere más de este valor, invalida aprobaciones</span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Tolerancia de Inicio Fuera de Ventana (Minutos)
            </label>
            <input
              type="number"
              value={parametros.tolerancia_inicio_minutos}
              onChange={e => handleUpdateParametros({ tolerancia_inicio_minutos: Number(e.target.value) })}
              disabled={disabled}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Caducidad de la Autorización (Días)
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                type="number"
                title="Normal"
                value={parametros.vigencia_autorizacion_dias.normal}
                onChange={e => handleUpdateParametros({ vigencia_autorizacion_dias: { ...parametros.vigencia_autorizacion_dias, normal: Number(e.target.value) } })}
                style={{ width: "33%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
              <input
                type="number"
                title="Estándar"
                value={parametros.vigencia_autorizacion_dias.estandar}
                onChange={e => handleUpdateParametros({ vigencia_autorizacion_dias: { ...parametros.vigencia_autorizacion_dias, estandar: Number(e.target.value) } })}
                style={{ width: "33%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
              <input
                type="number"
                title="Emergencia"
                value={parametros.vigencia_autorizacion_dias.emergencia}
                onChange={e => handleUpdateParametros({ vigencia_autorizacion_dias: { ...parametros.vigencia_autorizacion_dias, emergencia: Number(e.target.value) } })}
                style={{ width: "33%", padding: "6px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
            </div>
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Normal (7d) / Estándar (30d) / Emergencia (1d)</span>
          </div>
        </div>
      </div>

      {/* Reglas de Escalamiento */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Reglas de Alerta y Escalamiento Jerárquico ({reglas.length})
            </h3>
            <span style={{ fontSize: "0.75rem", color: "#b91c1c", fontWeight: 600 }}>
              Restricción de Seguridad: Nunca se permite la aprobación automática por vencimiento de plazo.
            </span>
          </div>

          <button
            onClick={abrirModalCrearRegla}
            disabled={disabled}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Plus size={14} />
            Nueva Regla
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "8px 12px" }}>Regla / Umbral</th>
              <th style={{ padding: "8px 12px" }}>Fase Objetivo</th>
              <th style={{ padding: "8px 12px" }}>Acción Disparada</th>
              <th style={{ padding: "8px 12px" }}>Destinatarios Notificados</th>
              <th style={{ padding: "8px 12px" }}>Estado</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reglas.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{r.nombre}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Umbral: {r.umbral_tipo === "porcentaje_plazo" ? `${r.umbral_valor}% del plazo` : `Vencido +${r.umbral_valor}h`}
                  </div>
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <span style={{ padding: "2px 6px", backgroundColor: "#f1f5f9", borderRadius: "3px", fontSize: "0.75rem", textTransform: "capitalize" }}>
                    {r.objetivo}
                  </span>
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <span style={{ fontWeight: 600, color: "#2563eb", fontSize: "0.8rem" }}>{r.accion}</span>
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <div style={{ fontSize: "0.75rem", color: "#475569" }}>
                    {r.destinatarios?.join(", ")}
                  </div>
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <span style={{ color: r.activa ? "#16a34a" : "#94a3b8", fontWeight: 600, fontSize: "0.75rem" }}>
                    {r.activa ? "Activa" : "Inactiva"}
                  </span>
                </td>

                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      onClick={() => abrirModalEditarRegla(r)}
                      disabled={disabled}
                      style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleEliminarRegla(r.id)}
                      disabled={disabled}
                      style={{ padding: "4px 8px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer", color: "#b91c1c" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL SIMULADOR DE ESCALAMIENTO */}
      {modalSimuladorAbierto && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "650px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              Simulador de Plazos SLA y Disparo de Escalamientos
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Prioridad
                </label>
                <select
                  value={simParams.prioridad}
                  onChange={e => setSimParams({ ...simParams, prioridad: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                >
                  <option value="p1">P1 - Crítica</option>
                  <option value="p2">P2 - Alta</option>
                  <option value="p3">P3 - Media</option>
                  <option value="p4">P4 - Baja</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Fase del Ciclo
                </label>
                <select
                  value={simParams.fase}
                  onChange={e => setSimParams({ ...simParams, fase: e.target.value })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                >
                  <option value="primera_respuesta">Primera Respuesta</option>
                  <option value="evaluacion">Evaluación Técnica</option>
                  <option value="autorizacion">Autorización Total</option>
                  <option value="etapa">Plazo por Etapa Individual</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Horas Transcurridas
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={simParams.horas_transcurridas}
                  onChange={e => setSimParams({ ...simParams, horas_transcurridas: Number(e.target.value) })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
              <button
                onClick={ejecutarSimulacion}
                disabled={simulando}
                style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
              >
                {simulando ? "Calculando..." : "Calcular Estado SLA"}
              </button>
            </div>

            {simResultado && (
              <div style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Consumo de Plazo:</span>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: simResultado.color_sla }}>
                      {simResultado.horas_transcurridas}h / {simResultado.plazo_limite_horas}h ({simResultado.porcentaje_consumido}%)
                    </div>
                  </div>

                  <span style={{ padding: "4px 10px", borderRadius: "4px", backgroundColor: simResultado.color_sla, color: "#ffffff", fontWeight: 700, fontSize: "0.8rem" }}>
                    {simResultado.estado_sla}
                  </span>
                </div>

                <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                  {simResultado.es_vencido ? (
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>Plazo vencido por {simResultado.horas_vencido} horas.</span>
                  ) : (
                    <span>Tiempo restante: {simResultado.horas_restantes} horas.</span>
                  )}
                </div>

                <div>
                  <strong style={{ fontSize: "0.85rem", color: "#1e293b" }}>
                    Reglas de Escalamiento Disparadas ({simResultado.reglas_disparadas?.length || 0}):
                  </strong>
                  {simResultado.reglas_disparadas?.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                      {simResultado.reglas_disparadas.map((r: any, i: number) => (
                        <div key={i} style={{ padding: "8px", backgroundColor: "#ffffff", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}>
                          <span style={{ fontWeight: 600, color: "#2563eb" }}>{r.nombre}:</span> {r.mensaje}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>
                      No se activa ningún escalamiento en este punto.
                    </div>
                  )}
                </div>

                <div style={{ padding: "8px 12px", backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "4px", fontSize: "0.75rem", color: "#1e40af" }}>
                  {simResultado.regla_seguridad}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                onClick={() => setModalSimuladorAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Cerrar Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
