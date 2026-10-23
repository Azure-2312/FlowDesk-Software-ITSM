"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Shield, Play, Lock, CheckCircle2, AlertTriangle, Users, Clock } from "@/shared/components/ui/Iconos";

interface EtapaConfig {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo_aprobador: "perfil" | "usuarios_concretos" | "rol_contextual" | "comite" | "sistema";
  id_perfil_aprobador?: string;
  rol_contextual?: string;
  id_comite?: string;
  regla_decision: "cualquiera" | "todos" | "mayoria_simple" | "minimo_n" | "segun_comite" | "automatica";
  minimo_n_votos?: number;
  plazo_horas_p1: number;
  plazo_horas_p2: number;
  plazo_horas_p3: number;
  plazo_horas_p4: number;
  acciones_permitidas: {
    aprobar: boolean;
    aprobar_con_condiciones: boolean;
    rechazar: boolean;
    solicitar_informacion: boolean;
    delegar: boolean;
    abstenerse: boolean;
  };
  delegacion_permitida: boolean;
  duracion_max_delegacion_dias: number;
  invalidar_si_cambia: string[];
  modo_relativo_defecto: "secuencial" | "paralelo";
  activa: boolean;
  orden: number;
}

interface SegregacionConfig {
  solicitante_no_aprueba: boolean;
  implementador_no_aprueba: boolean;
  no_dos_etapas_misma_persona: boolean;
  retroactivo_no_autoaprueba: boolean;
  aprobador_respaldo_activo: boolean;
  perfil_respaldo: string;
}

interface PestanaEtapasProps {
  snapshot: {
    etapas?: EtapaConfig[];
    segregacion_funciones?: SegregacionConfig;
  };
  catalogoUsuarios?: any[];
  catalogoDepartamentos?: any[];
  onChange: (nuevoSnapshot: { etapas: EtapaConfig[]; segregacion_funciones: SegregacionConfig }) => void;
  disabled?: boolean;
}

const CAMPOS_CRITICOS_INVALIDACION = [
  { id: "fechas_propuestas", label: "Fechas propuestas de inicio o fin" },
  { id: "servicio_id", label: "Servicios afectados" },
  { id: "ci_ids", label: "Elementos de Configuración (CIs)" },
  { id: "tipo_cambio", label: "Tipo de cambio" },
  { id: "nivel_riesgo", label: "Nivel de riesgo evaluado" },
  { id: "plan_implementacion", label: "Plan de implementación" },
  { id: "plan_rollback", label: "Plan de rollback o reversión" },
  { id: "requiere_interrupcion", label: "Interrupción de servicio" }
];

export const PestanaEtapasAprobacion: React.FC<PestanaEtapasProps> = ({ snapshot, catalogoUsuarios, catalogoDepartamentos, onChange, disabled }) => {
  const etapas: EtapaConfig[] = (snapshot?.etapas || []).slice().sort((a, b) => a.orden - b.orden);
  const sod: SegregacionConfig = snapshot?.segregacion_funciones || {
    solicitante_no_aprueba: true,
    implementador_no_aprueba: true,
    no_dos_etapas_misma_persona: true,
    retroactivo_no_autoaprueba: true,
    aprobador_respaldo_activo: true,
    perfil_respaldo: "gestor_cambios"
  };

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<"crear" | "editar">("crear");
  const [etapaActual, setEtapaActual] = useState<Partial<EtapaConfig>>({});
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Modal simulador de etapas
  const [modalSimuladorAbierto, setModalSimuladorAbierto] = useState(false);
  const [simParams, setSimParams] = useState({
    tipo_cambio: "normal",
    nivel_riesgo: "medio",
    solicitante_id: 6,
    implementador_id: 5,
    supervisor_id: 7,
    fuera_de_ventana: false,
    dentro_congelamiento: false
  });
  const [simResultado, setSimResultado] = useState<any>(null);
  const [simulando, setSimulando] = useState(false);

  const abrirModalCrear = () => {
    setModoEdicion("crear");
    setEtapaActual({
      id: "etapa_" + Date.now(),
      codigo: "nueva_etapa",
      nombre: "Nueva Etapa de Aprobación",
      descripcion: "",
      tipo_aprobador: "rol_contextual",
      rol_contextual: "supervisor_grupo_implementador",
      regla_decision: "cualquiera",
      plazo_horas_p1: 2,
      plazo_horas_p2: 8,
      plazo_horas_p3: 24,
      plazo_horas_p4: 48,
      acciones_permitidas: {
        aprobar: true,
        aprobar_con_condiciones: true,
        rechazar: true,
        solicitar_informacion: true,
        delegar: true,
        abstenerse: false
      },
      delegacion_permitida: true,
      duracion_max_delegacion_dias: 7,
      invalidar_si_cambia: ["fechas_propuestas", "plan_rollback"],
      modo_relativo_defecto: "secuencial",
      activa: true,
      orden: etapas.length + 1
    });
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (e: EtapaConfig) => {
    setModoEdicion("editar");
    setEtapaActual({ ...e });
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const handleGuardarEtapa = () => {
    if (!etapaActual.nombre?.trim()) {
      setErrorValidacion("El nombre de la etapa es obligatorio.");
      return;
    }
    if (!etapaActual.codigo?.trim()) {
      setErrorValidacion("El código identificador es obligatorio.");
      return;
    }

    let nuevas: EtapaConfig[] = [];
    if (modoEdicion === "crear") {
      nuevas = [...etapas, etapaActual as EtapaConfig];
    } else {
      nuevas = etapas.map(e => e.id === etapaActual.id ? (etapaActual as EtapaConfig) : e);
    }

    onChange({ etapas: nuevas, segregacion_funciones: sod });
    setModalAbierto(false);
  };

  const handleEliminarEtapa = (e: EtapaConfig) => {
    if (confirm(`¿Confirma eliminar la etapa '${e.nombre}'?`)) {
      onChange({ etapas: etapas.filter(item => item.id !== e.id), segregacion_funciones: sod });
    }
  };

  const handleToggleSoD = (key: keyof SegregacionConfig) => {
    if (disabled) return;
    const nuevoSoD = { ...sod, [key]: !sod[key] };
    onChange({ etapas, segregacion_funciones: nuevoSoD as SegregacionConfig });
  };

  // Simular etapas
  const handleEjecutarSimulacion = async () => {
    try {
      setSimulando(true);
      const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/simular-etapas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(simParams)
      });
      const data = await res.json();
      setSimResultado(data);
    } catch (err: any) {
      alert("Error en simulación: " + err.message);
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
            1.3.3.3.3 Catálogo de Etapas de Aprobación y Reglas de Decisión
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Definición de las etapas de control, reglas de decisión colegiada y segregación obligatoria de funciones (SoD).
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => {
              setModalSimuladorAbierto(true);
              handleEjecutarSimulacion();
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
            Simulador de Etapas
          </button>

          <button
            onClick={abrirModalCrear}
            disabled={disabled}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: disabled ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Plus size={16} />
            Nueva Etapa
          </button>
        </div>
      </div>

      {/* Panel de Segregación de Funciones (SoD) */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Shield size={18} style={{ color: "#2563eb" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Segregación de Funciones Institucional (Control COBIT BAI06 / ISO 20000)
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="sod_solicitante"
              checked={sod.solicitante_no_aprueba}
              onChange={() => handleToggleSoD("solicitante_no_aprueba")}
              disabled={disabled}
              style={{ marginTop: "2px" }}
            />
            <label htmlFor="sod_solicitante" style={{ fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
              <strong>El Solicitante no puede aprobar</strong> su propia RFC bajo ninguna circunstancia.
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="sod_implementador"
              checked={sod.implementador_no_aprueba}
              onChange={() => handleToggleSoD("implementador_no_aprueba")}
              disabled={disabled}
              style={{ marginTop: "2px" }}
            />
            <label htmlFor="sod_implementador" style={{ fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
              <strong>El Implementador no puede aprobar</strong> la RFC que va a ejecutar.
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="sod_dos_etapas"
              checked={sod.no_dos_etapas_misma_persona}
              onChange={() => handleToggleSoD("no_dos_etapas_misma_persona")}
              disabled={disabled}
              style={{ marginTop: "2px" }}
            />
            <label htmlFor="sod_dos_etapas" style={{ fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
              <strong>Una misma persona no puede aprobar dos etapas</strong> distintas de la misma RFC.
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="sod_retroactivo"
              checked={sod.retroactivo_no_autoaprueba}
              onChange={() => handleToggleSoD("retroactivo_no_autoaprueba")}
              disabled={disabled}
              style={{ marginTop: "2px" }}
            />
            <label htmlFor="sod_retroactivo" style={{ fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
              <strong>Quien registra una emergencia retroactiva</strong> no puede dictaminar su autorización retroactiva.
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
            <input
              type="checkbox"
              id="sod_respaldo"
              checked={sod.aprobador_respaldo_activo}
              onChange={() => handleToggleSoD("aprobador_respaldo_activo")}
              disabled={disabled}
              style={{ marginTop: "2px" }}
            />
            <label htmlFor="sod_respaldo" style={{ fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
              <strong>Aprobador de respaldo automático</strong> si una etapa no tiene aprobador elegible por conflicto SoD.
            </label>
          </div>
        </div>
      </div>

      {/* Tabla de catálogo de etapas */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "10px 12px", width: "40px" }}>#</th>
              <th style={{ padding: "10px 12px" }}>Etapa / Código</th>
              <th style={{ padding: "10px 12px" }}>Tipo de Aprobador</th>
              <th style={{ padding: "10px 12px" }}>Regla de Decisión</th>
              <th style={{ padding: "10px 12px" }}>Plazos (P1 / P2 / P3 / P4)</th>
              <th style={{ padding: "10px 12px" }}>Acciones Habilitadas</th>
              <th style={{ padding: "10px 12px" }}>Delegación</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {etapas.map((e, idx) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{e.nombre}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>{e.codigo}</div>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span style={{ padding: "3px 8px", borderRadius: "4px", backgroundColor: "#eff6ff", color: "#1e40af", fontSize: "0.75rem", fontWeight: 600 }}>
                    {e.tipo_aprobador === "rol_contextual" ? `Contextual: ${e.rol_contextual}` : e.tipo_aprobador === "comite" ? `Comité: ${e.id_comite?.toUpperCase()}` : e.tipo_aprobador}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 500, textTransform: "capitalize" }}>
                    {e.regla_decision.replace("_", " ")}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#475569", fontFamily: "monospace" }}>
                    {e.plazo_horas_p1}h / {e.plazo_horas_p2}h / {e.plazo_horas_p3}h / {e.plazo_horas_p4}h
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", fontSize: "0.7rem" }}>
                    {e.acciones_permitidas?.aprobar && <span style={{ padding: "2px 5px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "3px" }}>Aprobar</span>}
                    {e.acciones_permitidas?.aprobar_con_condiciones && <span style={{ padding: "2px 5px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "3px" }}>Condiciones</span>}
                    {e.acciones_permitidas?.rechazar && <span style={{ padding: "2px 5px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: "3px" }}>Rechazar</span>}
                    {e.acciones_permitidas?.solicitar_informacion && <span style={{ padding: "2px 5px", backgroundColor: "#f1f5f9", color: "#475569", borderRadius: "3px" }}>Pedir Info</span>}
                  </div>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {e.delegacion_permitida ? (
                    <span style={{ color: "#16a34a", fontSize: "0.75rem", fontWeight: 600 }}>Sí ({e.duracion_max_delegacion_dias}d)</span>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>No</span>
                  )}
                </td>

                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      onClick={() => abrirModalEditar(e)}
                      disabled={disabled}
                      style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                      title="Editar etapa"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleEliminarEtapa(e)}
                      disabled={disabled}
                      style={{ padding: "4px 8px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer", color: "#b91c1c" }}
                      title="Eliminar etapa"
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

      {/* MODAL SIMULADOR DE ETAPAS */}
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
            maxWidth: "750px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              Simulador de Resolución de Aprobadores y Segregación SoD
            </h3>

            {/* Parámetros de simulación */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Tipo de Cambio
                </label>
                <select
                  value={simParams.tipo_cambio}
                  onChange={e => setSimParams({ ...simParams, tipo_cambio: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.8rem" }}
                >
                  <option value="estandar">Estándar</option>
                  <option value="normal">Normal</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Nivel de Riesgo
                </label>
                <select
                  value={simParams.nivel_riesgo}
                  onChange={e => setSimParams({ ...simParams, nivel_riesgo: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.8rem" }}
                >
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                  <option value="critico">Crítico</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
                  Solicitante
                </label>
                <select
                  value={simParams.solicitante_id}
                  onChange={e => setSimParams({ ...simParams, solicitante_id: Number(e.target.value) })}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.8rem" }}
                >
                  {(catalogoUsuarios || []).map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.perfil})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "0.8rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={simParams.fuera_de_ventana}
                  onChange={e => setSimParams({ ...simParams, fuera_de_ventana: e.target.checked })}
                />
                Fuera de ventana de mantenimiento
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={simParams.dentro_congelamiento}
                  onChange={e => setSimParams({ ...simParams, dentro_congelamiento: e.target.checked })}
                />
                Dentro de período de congelamiento
              </label>

              <button
                onClick={handleEjecutarSimulacion}
                disabled={simulando}
                style={{ marginLeft: "auto", padding: "6px 14px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}
              >
                {simulando ? "Calculando..." : "Recalcular"}
              </button>
            </div>

            {/* Resultado de la simulación */}
            {simResultado && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
                    Cadena de Etapas Resuelta ({simResultado.total_etapas} etapas):
                  </span>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: simResultado.segregacion_valida ? "#dcfce7" : "#fee2e2",
                    color: simResultado.segregacion_valida ? "#166534" : "#991b1b"
                  }}>
                    {simResultado.segregacion_valida ? "SoD Válida / Resuelta" : "Conflicto SoD No Resuelto"}
                  </span>
                </div>

                {simResultado.advertencias_sod?.length > 0 && (
                  <div style={{ padding: "8px 12px", backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: "6px", fontSize: "0.75rem", color: "#92400e" }}>
                    <strong>Alertas de Segregación detectadas:</strong>
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px" }}>
                      {simResultado.advertencias_sod.map((adv: string, i: number) => (
                        <li key={i}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {simResultado.etapas?.map((et: any, index: number) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#ffffff", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>
                          Etapa {index + 1}: {et.etapa_nombre}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                          {et.detalle_asignacion}
                        </div>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#2563eb" }}>
                          {et.aprobador_resuelto?.nombre_completo || "Pendiente"}
                        </div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {et.aprobador_resuelto?.correo_electronico}
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* MODAL EDITOR DE ETAPA */}
      {modalAbierto && (
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
              {modoEdicion === "crear" ? "Nueva Etapa de Aprobación" : `Editar Etapa: ${etapaActual.nombre}`}
            </h3>

            {errorValidacion && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "0.85rem", marginBottom: "16px" }}>
                {errorValidacion}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Nombre de la Etapa *
                </label>
                <input
                  type="text"
                  value={etapaActual.nombre || ""}
                  onChange={e => setEtapaActual({ ...etapaActual, nombre: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Código identificador *
                </label>
                <input
                  type="text"
                  value={etapaActual.codigo || ""}
                  onChange={e => setEtapaActual({ ...etapaActual, codigo: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Tipo de Aprobador
                </label>
                <select
                  value={etapaActual.tipo_aprobador || "rol_contextual"}
                  onChange={e => setEtapaActual({ ...etapaActual, tipo_aprobador: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="rol_contextual">Rol Contextual (Supervisor / Gestor de Área)</option>
                  <option value="perfil">Perfil Institucional</option>
                  <option value="comite">Comité (CAB o ECAB)</option>
                  <option value="sistema">Sistema (Automática)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Regla de Decisión
                </label>
                <select
                  value={etapaActual.regla_decision || "cualquiera"}
                  onChange={e => setEtapaActual({ ...etapaActual, regla_decision: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="cualquiera">Cualquiera (1 aprobador suficiente)</option>
                  <option value="todos">Todos (Unanimidad de involucrados)</option>
                  <option value="mayoria_simple">Mayoría Simple</option>
                  <option value="segun_comite">Reglas Propias del Comité</option>
                  <option value="automatica">Automática por Sistema</option>
                </select>
              </div>
            </div>

            {/* Plazos por prioridad */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Plazo de Respuesta por Prioridad (Horas)
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>P1 (Crítica)</span>
                  <input
                    type="number"
                    value={etapaActual.plazo_horas_p1 ?? 2}
                    onChange={e => setEtapaActual({ ...etapaActual, plazo_horas_p1: Number(e.target.value) })}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>P2 (Alta)</span>
                  <input
                    type="number"
                    value={etapaActual.plazo_horas_p2 ?? 8}
                    onChange={e => setEtapaActual({ ...etapaActual, plazo_horas_p2: Number(e.target.value) })}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>P3 (Media)</span>
                  <input
                    type="number"
                    value={etapaActual.plazo_horas_p3 ?? 24}
                    onChange={e => setEtapaActual({ ...etapaActual, plazo_horas_p3: Number(e.target.value) })}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b" }}>P4 (Baja)</span>
                  <input
                    type="number"
                    value={etapaActual.plazo_horas_p4 ?? 48}
                    onChange={e => setEtapaActual({ ...etapaActual, plazo_horas_p4: Number(e.target.value) })}
                    style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                  />
                </div>
              </div>
            </div>

            {/* Invalidar si cambia */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Invalidar y Reiniciar Aprobación si se Modifica:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {CAMPOS_CRITICOS_INVALIDACION.map(c => {
                  const check = (etapaActual.invalidar_si_cambia || []).includes(c.id);
                  return (
                    <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={ev => {
                          const actuales = etapaActual.invalidar_si_cambia || [];
                          const nuevos = ev.target.checked ? [...actuales, c.id] : actuales.filter(i => i !== c.id);
                          setEtapaActual({ ...etapaActual, invalidar_si_cambia: nuevos });
                        }}
                      />
                      {c.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEtapa}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Guardar Etapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
