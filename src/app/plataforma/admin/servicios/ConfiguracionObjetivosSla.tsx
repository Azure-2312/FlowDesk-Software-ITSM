"use client";

import { useEffect, useState } from "react";
import { MatrizPrioridadSla } from "./sla/components/MatrizPrioridadSla";

interface PrioridadSla {
  id_prioridad: number;
  codigo: string;
  nombre: string;
  nivel: number;
  tiempo_primera_respuesta_hrs: number;
  tiempo_resolucion_horas: number;
  color: string;
  estado_registro: boolean;
}

interface ObjetivoOla {
  id_objetivo: number;
  id_prioridad: number;
  prioridad_codigo: string;
  prioridad_nombre: string;
  prioridad_color: string;
  primera_respuesta_horas: number;
  diagnostico_horas: number;
  resolucion_total_horas: number;
  descripcion_operativa?: string;
}

interface PoliticaSla {
  meta_cumplimiento_porcentaje: number;
  tipo_jornada: "habil" | "24x7";
  hora_inicio_jornada: number;
  hora_fin_jornada: number;
  pausar_espera_solicitante: boolean;
  pausar_espera_proveedor: boolean;
  umbral_alerta_preventiva_pct: number;
  umbral_alerta_critica_pct: number;
}

interface MotivoEspera {
  id_motivo_espera: number;
  nombre: string;
  descripcion: string;
}

interface ConfiguracionObjetivosSlaProps {
  pestañaInicial?: "tiempos" | "matriz";
}

export default function ConfiguracionObjetivosSla({ pestañaInicial = "tiempos" }: ConfiguracionObjetivosSlaProps) {
  const [pestañaActiva, setPestañaActiva] = useState<"tiempos" | "matriz">(pestañaInicial);
  const [prioridades, setPrioridades] = useState<PrioridadSla[]>([]);
  const [objetivosOla, setObjetivosOla] = useState<ObjetivoOla[]>([]);
  const [politicaSla, setPoliticaSla] = useState<PoliticaSla>({
    meta_cumplimiento_porcentaje: 80,
    tipo_jornada: "habil",
    hora_inicio_jornada: 8,
    hora_fin_jornada: 18,
    pausar_espera_solicitante: true,
    pausar_espera_proveedor: true,
    umbral_alerta_preventiva_pct: 75,
    umbral_alerta_critica_pct: 90,
  });
  const [motivosEspera, setMotivosEspera] = useState<MotivoEspera[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatosSla() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/sla");
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "No se pudieron cargar los objetivos SLA.");
          return;
        }
        setPrioridades(data.prioridades || []);
        setObjetivosOla(data.objetivosOla || []);
        if (data.politicaSla) {
          setPoliticaSla(data.politicaSla);
        }
        setMotivosEspera(data.motivosEspera || []);
      } catch {
        setError("Error de conexión al cargar objetivos SLA.");
      } finally {
        setCargando(false);
      }
    }
    cargarDatosSla();
  }, []);

  function actualizarTiempoPrioridad(
    id: number,
    campo: "tiempo_primera_respuesta_hrs" | "tiempo_resolucion_horas",
    valor: number
  ) {
    setPrioridades((prev) =>
      prev.map((p) => (p.id_prioridad === id ? { ...p, [campo]: valor } : p))
    );
  }

  function actualizarTiempoOla(
    idPrioridad: number,
    campo: "primera_respuesta_horas" | "diagnostico_horas" | "resolucion_total_horas",
    valor: number
  ) {
    setObjetivosOla((prev) =>
      prev.map((o) => (o.id_prioridad === idPrioridad ? { ...o, [campo]: valor } : o))
    );
  }

  async function guardarObjetivos(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    // Validaciones SLA (ITIL v4)
    for (const p of prioridades) {
      if (p.tiempo_primera_respuesta_hrs <= 0 || p.tiempo_resolucion_horas <= 0) {
        setError(`Los tiempos de la prioridad ${p.codigo} - ${p.nombre} deben ser mayores a 0.`);
        setGuardando(false);
        return;
      }
      if (p.tiempo_primera_respuesta_hrs >= p.tiempo_resolucion_horas) {
        setError(`El tiempo de primera respuesta (${p.tiempo_primera_respuesta_hrs}h) no puede ser igual o mayor al tiempo de resolución (${p.tiempo_resolucion_horas}h) en ${p.codigo} - ${p.nombre}. Según ITIL v4, el primer contacto debe preceder a la resolución.`);
        setGuardando(false);
        return;
      }
    }

    // Validaciones OLA (ITIL v4)
    for (const o of objetivosOla) {
      if (o.primera_respuesta_horas <= 0 || o.diagnostico_horas <= 0 || o.resolucion_total_horas <= 0) {
        setError(`Los tiempos de OLA para ${o.prioridad_codigo} - ${o.prioridad_nombre} deben ser mayores a 0.`);
        setGuardando(false);
        return;
      }
      if (o.primera_respuesta_horas >= o.resolucion_total_horas) {
        setError(`El tiempo de primera respuesta OLA (${o.primera_respuesta_horas}h) no puede ser igual o mayor a la resolución total (${o.resolucion_total_horas}h) para ${o.prioridad_codigo}.`);
        setGuardando(false);
        return;
      }
      if (o.diagnostico_horas >= o.resolucion_total_horas) {
        setError(`El tiempo de diagnóstico OLA (${o.diagnostico_horas}h) no puede ser igual o mayor a la resolución total (${o.resolucion_total_horas}h) para ${o.prioridad_codigo}.`);
        setGuardando(false);
        return;
      }
    }

    try {
      const res = await fetch("/api/admin/sla", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prioridades, politicaSla, objetivosOla }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al actualizar objetivos SLA.");
        return;
      }
      setMensajeExito("Los objetivos de SLA, OLA y la política de tiempos fueron guardados exitosamente.");
    } catch {
      setError("Error de red al guardar los objetivos de SLA.");
    } finally {
      setGuardando(false);
    }
  }

  // Validación reactiva de coherencia temporal ITIL v4
  const hayErrorSla = prioridades.some(
    (p) => p.tiempo_primera_respuesta_hrs <= 0 || p.tiempo_resolucion_horas <= 0 || p.tiempo_primera_respuesta_hrs >= p.tiempo_resolucion_horas
  );
  const hayErrorOla = objetivosOla.some(
    (o) =>
      o.primera_respuesta_horas <= 0 ||
      o.diagnostico_horas <= 0 ||
      o.resolucion_total_horas <= 0 ||
      o.primera_respuesta_horas >= o.resolucion_total_horas ||
      o.diagnostico_horas >= o.resolucion_total_horas
  );
  const hayInconsistenciasTiempos = hayErrorSla || hayErrorOla;

  if (cargando) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
        Cargando matriz institucional de objetivos SLA...
      </div>
    );
  }

  return (
    <div>
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
            Objetivos y Acuerdos de Nivel de Servicio (SLA)
          </h1>
          <p className="subtitulo" style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
            Parametrización de la matriz institucional de tiempos por prioridad, metas globales de cumplimiento, calendario laboral y reglas de congelación de cronómetros conforme a ITIL v4 e ISO/IEC 20000.
          </p>
        </div>
      </div>

      {/* Selector de Pestañas SLA (sin números de versión en las etiquetas) */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: 20,
          backgroundColor: "#ffffff",
          borderRadius: "8px 8px 0 0",
          padding: "0 12px",
          gap: 4,
          overflowX: "auto",
        }}
      >
        <button
          type="button"
          onClick={() => setPestañaActiva("tiempos")}
          style={{
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: pestañaActiva === "tiempos" ? 700 : 500,
            color: pestañaActiva === "tiempos" ? "#2563eb" : "#64748b",
            borderBottom: pestañaActiva === "tiempos" ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: -2,
            background: pestañaActiva === "tiempos" ? "#eff6ff" : "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Objetivos de Tiempo y Métricas SLA
        </button>
        <button
          type="button"
          onClick={() => setPestañaActiva("matriz")}
          style={{
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: pestañaActiva === "matriz" ? 700 : 500,
            color: pestañaActiva === "matriz" ? "#2563eb" : "#64748b",
            borderBottom: pestañaActiva === "matriz" ? "2px solid #2563eb" : "2px solid transparent",
            marginBottom: -2,
            background: pestañaActiva === "matriz" ? "#eff6ff" : "none",
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Matriz Institucional de Prioridad (Impacto x Urgencia)
        </button>
      </div>

      {pestañaActiva === "matriz" ? (
        <MatrizPrioridadSla />
      ) : (
        <>
          {error && (
            <div className="mensaje-error" style={{ marginBottom: 16 }}>
              {error}
            </div>
          )}

          {mensajeExito && (
            <div
              style={{
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: "12px 16px",
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {mensajeExito}
            </div>
          )}

          <form onSubmit={guardarObjetivos}>
            {/* SECCIÓN 1: MATRIZ DE TIEMPOS POR PRIORIDAD (SLA) */}
            <div
              className="tarjeta"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Matriz Institucional de Tiempos por Prioridad (SLA)
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Tiempos máximos comprometidos para el primer contacto técnico y el restablecimiento total del servicio.
                </p>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table className="tabla-base" style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                      <th style={{ width: 80, padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "#475569" }}>
                        Nivel
                      </th>
                      <th style={{ width: 130, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                        Prioridad
                      </th>
                      <th style={{ width: 170, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                        Primera Respuesta
                      </th>
                      <th style={{ width: 170, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                        Resolución Total
                      </th>
                      <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                        Equivalencia / Descripción Operativa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {prioridades.map((p) => {
                      const errorFilaSla = p.tiempo_primera_respuesta_hrs <= 0 || p.tiempo_resolucion_horas <= 0 || p.tiempo_primera_respuesta_hrs >= p.tiempo_resolucion_horas;
                      return (
                      <tr key={p.id_prioridad} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: errorFilaSla ? "#fff1f2" : undefined }}>
                        <td style={{ padding: "12px 14px", textAlign: "center", verticalAlign: "middle" }}>
                          <span
                            className="badge-itil"
                            style={{
                              display: "inline-block",
                              width: 38,
                              textAlign: "center",
                              backgroundColor: `${p.color}15`,
                              color: p.color,
                              border: `1px solid ${p.color}40`,
                              fontWeight: 700,
                              fontSize: 12,
                              padding: "3px 0",
                              borderRadius: 4,
                            }}
                          >
                            {p.codigo}
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontWeight: 600, color: "#0f172a", verticalAlign: "middle" }}>
                          {p.nombre}
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              className="input-base"
                              min={0.5}
                              step={0.5}
                              max={720}
                              value={p.tiempo_primera_respuesta_hrs}
                              onChange={(e) =>
                                actualizarTiempoPrioridad(
                                  p.id_prioridad,
                                  "tiempo_primera_respuesta_hrs",
                                  Number(e.target.value)
                                )
                              }
                              required
                              style={{
                                width: 75,
                                textAlign: "right",
                                backgroundColor: errorFilaSla ? "#fef2f2" : "white",
                                borderColor: errorFilaSla ? "#ef4444" : undefined,
                                padding: "6px 8px",
                              }}
                            />
                            <span style={{ fontSize: 12.5, color: "#64748b" }}>horas</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", verticalAlign: "middle" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="number"
                              className="input-base"
                              min={1}
                              step={0.5}
                              max={720}
                              value={p.tiempo_resolucion_horas}
                              onChange={(e) =>
                                actualizarTiempoPrioridad(
                                  p.id_prioridad,
                                  "tiempo_resolucion_horas",
                                  Number(e.target.value)
                                )
                              }
                              required
                              style={{
                                width: 75,
                                textAlign: "right",
                                backgroundColor: errorFilaSla ? "#fef2f2" : "white",
                                borderColor: errorFilaSla ? "#ef4444" : undefined,
                                padding: "6px 8px",
                              }}
                            />
                            <span style={{ fontSize: 12.5, color: "#64748b" }}>horas</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: 12.5, color: "#64748b", verticalAlign: "middle" }}>
                          {p.nivel === 1 && "Falla general con interrupción total en operaciones críticas institucionales."}
                          {p.nivel === 2 && "Afectación de un departamento o proceso clave sin disponibilidad de bypass."}
                          {p.nivel === 3 && "Incidencia o solicitud habitual que afecta a un usuario con solución alternativa."}
                          {p.nivel === 4 && "Consultas estándar, requerimientos de baja urgencia o mejoras no prioritarias."}
                          {errorFilaSla && (
                            <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700, display: "block", marginTop: 4 }}>
                              Error ITIL: Respuesta ({p.tiempo_primera_respuesta_hrs}h) debe ser menor a resolución ({p.tiempo_resolucion_horas}h).
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              {/* SECCIÓN OLA EDITABLE: Objetivos Internos de Problemas (ITIL v4 OLA) */}
              <div
                style={{
                  marginTop: 28,
                  padding: 20,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                }}
              >
                <div style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                    Objetivos Internos de Problemas (OLA)
                  </h3>
                  <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b" }}>
                    Metas de gestión técnica para primera respuesta, diagnóstico de causa raíz y mitigación definitiva (valores editables).
                  </p>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="tabla-base" style={{ width: "100%", fontSize: 12.5, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "1px solid #cbd5e1" }}>
                        <th style={{ width: 80, padding: "10px 14px", textAlign: "center", fontWeight: 600, color: "#475569" }}>
                          Nivel
                        </th>
                        <th style={{ width: 130, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                          Prioridad
                        </th>
                        <th style={{ width: 160, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                          Primera Respuesta
                        </th>
                        <th style={{ width: 160, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                          Diagnóstico OLA
                        </th>
                        <th style={{ width: 160, padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                          Resolución Total
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                          Equivalencia Operativa
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {objetivosOla.map((ola) => {
                        const errorFilaOla =
                          ola.primera_respuesta_horas <= 0 ||
                          ola.diagnostico_horas <= 0 ||
                          ola.resolucion_total_horas <= 0 ||
                          ola.primera_respuesta_horas >= ola.resolucion_total_horas ||
                          ola.diagnostico_horas >= ola.resolucion_total_horas;
                        return (
                        <tr key={ola.id_prioridad} style={{ borderBottom: "1px solid #e2e8f0", backgroundColor: errorFilaOla ? "#fff1f2" : undefined }}>
                          <td style={{ padding: "10px 14px", textAlign: "center", verticalAlign: "middle" }}>
                            <span
                              className="badge-itil"
                              style={{
                                display: "inline-block",
                                width: 38,
                                textAlign: "center",
                                backgroundColor: `${ola.prioridad_color}15`,
                                color: ola.prioridad_color,
                                border: `1px solid ${ola.prioridad_color}40`,
                                fontWeight: 700,
                                fontSize: 11,
                                padding: "2px 0",
                                borderRadius: 4,
                              }}
                            >
                              {ola.prioridad_codigo}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", fontWeight: 600, color: "#334155", verticalAlign: "middle" }}>
                            {ola.prioridad_nombre}
                          </td>
                          <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input
                                type="number"
                                className="input-base"
                                min={1}
                                step={1}
                                value={ola.primera_respuesta_horas}
                                onChange={(e) =>
                                  actualizarTiempoOla(
                                    ola.id_prioridad,
                                    "primera_respuesta_horas",
                                    Number(e.target.value)
                                  )
                                }
                                required
                                style={{
                                  width: 70,
                                  textAlign: "right",
                                  backgroundColor: errorFilaOla ? "#fef2f2" : "white",
                                  borderColor: errorFilaOla ? "#ef4444" : undefined,
                                  padding: "5px 6px",
                                  fontSize: 12,
                                }}
                              />
                              <span style={{ fontSize: 12, color: "#64748b" }}>horas</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input
                                type="number"
                                className="input-base"
                                min={1}
                                step={1}
                                value={ola.diagnostico_horas}
                                onChange={(e) =>
                                  actualizarTiempoOla(
                                    ola.id_prioridad,
                                    "diagnostico_horas",
                                    Number(e.target.value)
                                  )
                                }
                                required
                                style={{
                                  width: 70,
                                  textAlign: "right",
                                  backgroundColor: errorFilaOla ? "#fef2f2" : "white",
                                  borderColor: errorFilaOla ? "#ef4444" : undefined,
                                  padding: "5px 6px",
                                  fontSize: 12,
                                }}
                              />
                              <span style={{ fontSize: 12, color: "#64748b" }}>horas</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", verticalAlign: "middle" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <input
                                type="number"
                                className="input-base"
                                min={1}
                                step={1}
                                value={ola.resolucion_total_horas}
                                onChange={(e) =>
                                  actualizarTiempoOla(
                                    ola.id_prioridad,
                                    "resolucion_total_horas",
                                    Number(e.target.value)
                                  )
                                }
                                required
                                style={{
                                  width: 70,
                                  textAlign: "right",
                                  backgroundColor: errorFilaOla ? "#fef2f2" : "white",
                                  borderColor: errorFilaOla ? "#ef4444" : undefined,
                                  padding: "5px 6px",
                                  fontSize: 12,
                                }}
                              />
                              <span style={{ fontSize: 12, color: "#64748b" }}>horas</span>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", fontSize: 12, color: "#64748b", verticalAlign: "middle" }}>
                            {ola.descripcion_operativa || (
                              ola.prioridad_codigo === "P1" ? "Interrupción total o paralización crítica de servicio." :
                              ola.prioridad_codigo === "P2" ? "Degradación severa recurrente con impacto institucional." :
                              ola.prioridad_codigo === "P3" ? "Fallas repetitivas con workaround provisional disponible." :
                              "Anomalías menores o mejoras preventivas de infraestructura."
                            )}
                            {errorFilaOla && (
                              <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700, display: "block", marginTop: 4 }}>
                                Error ITIL: Respuesta o diagnóstico no pueden ser iguales o mayores a resolución ({ola.resolucion_total_horas}h).
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: METAS GLOBALES Y CALENDARIO LABORAL */}
            <div
              className="tarjeta"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Meta Global Institucional y Calendario Laboral
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Indicador clave de rendimiento (KPI) para auditoría ISO 20000 y régimen horario del cronómetro.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="campo">
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Meta Institucional de Cumplimiento (%) *
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="number"
                      className="input-base"
                      min={50}
                      max={100}
                      value={politicaSla.meta_cumplimiento_porcentaje}
                      onChange={(e) =>
                        setPoliticaSla({
                          ...politicaSla,
                          meta_cumplimiento_porcentaje: Number(e.target.value),
                        })
                      }
                      required
                      style={{ width: 100, backgroundColor: "white" }}
                    />
                    <span style={{ fontSize: 13, color: "#475569" }}>% de tickets dentro de plazo</span>
                  </div>
                  <small style={{ color: "#64748b", marginTop: 4 }}>
                    Estándar corporativo recomendado: 80% - 90% para auditoría de calidad.
                  </small>
                </div>

                <div className="campo">
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Régimen de Calendario para Cómputo de Horas *
                  </label>
                  <select
                    className="input-base"
                    value={politicaSla.tipo_jornada}
                    onChange={(e) =>
                      setPoliticaSla({
                        ...politicaSla,
                        tipo_jornada: e.target.value as "habil" | "24x7",
                      })
                    }
                    style={{ backgroundColor: "white" }}
                  >
                    <option value="habil">Horario Laboral Hábil (Lunes a Viernes, descuenta noches y fines de semana)</option>
                    <option value="24x7">Continuo 24x7 (Cronómetro ininterrumpido todos los días)</option>
                  </select>
                  <small style={{ color: "#64748b", marginTop: 4 }}>
                    Determina el algoritmo del motor de cálculo de vencimiento en tickets de TI.
                  </small>
                </div>
              </div>

              {politicaSla.tipo_jornada === "habil" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 16, paddingTop: 16, borderTop: "1px dashed #e2e8f0" }}>
                  <div className="campo">
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Hora Inicio de Jornada</label>
                    <select
                      className="input-base"
                      value={politicaSla.hora_inicio_jornada}
                      onChange={(e) =>
                        setPoliticaSla({
                          ...politicaSla,
                          hora_inicio_jornada: Number(e.target.value),
                        })
                      }
                      style={{ backgroundColor: "white" }}
                    >
                      <option value={7}>07:00 AM</option>
                      <option value={8}>08:00 AM (Estándar)</option>
                      <option value={9}>09:00 AM</option>
                    </select>
                  </div>

                  <div className="campo">
                    <label style={{ fontSize: 13, fontWeight: 600 }}>Hora Fin de Jornada</label>
                    <select
                      className="input-base"
                      value={politicaSla.hora_fin_jornada}
                      onChange={(e) =>
                        setPoliticaSla({
                          ...politicaSla,
                          hora_fin_jornada: Number(e.target.value),
                        })
                      }
                      style={{ backgroundColor: "white" }}
                    >
                      <option value={17}>05:00 PM (17:00)</option>
                      <option value={18}>06:00 PM (18:00 - Estándar)</option>
                      <option value={19}>07:00 PM (19:00)</option>
                      <option value={20}>08:00 PM (20:00)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: REGLAS DE PAUSA (STOP-THE-CLOCK) */}
            <div
              className="tarjeta"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Reglas de Pausa del Temporizador (Stop-the-Clock)
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Conforme a ITIL v4, el temporizador de SLA se congela cuando la resolución depende de un tercero o del solicitante.
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={politicaSla.pausar_espera_solicitante}
                    onChange={(e) =>
                      setPoliticaSla({
                        ...politicaSla,
                        pausar_espera_solicitante: e.target.checked,
                      })
                    }
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                      Pausar automáticamente en &quot;En Espera del Solicitante&quot;
                    </span>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                      Detiene el cómputo de SLA cuando el técnico requiere información complementaria o pruebas del usuario final.
                    </p>
                  </div>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    cursor: "pointer",
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={politicaSla.pausar_espera_proveedor}
                    onChange={(e) =>
                      setPoliticaSla({
                        ...politicaSla,
                        pausar_espera_proveedor: e.target.checked,
                      })
                    }
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>
                      Pausar automáticamente en &quot;En Espera de Proveedor Externo&quot;
                    </span>
                    <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                      Detiene el cómputo mientras se tramita garantía de hardware, repuestos o soporte externo de fabricante.
                    </p>
                  </div>
                </label>
              </div>

              {motivosEspera.length > 0 && (
                <div style={{ marginTop: 16, fontSize: 12, color: "#64748b" }}>
                  <strong>Motivos de espera habilitados en la base de datos:</strong>{" "}
                  {motivosEspera.map((m) => m.nombre).join(", ")}.
                </div>
              )}
            </div>

            {/* SECCIÓN 4: UMBRALES DE ALERTA Y ESCALAMIENTO */}
            <div
              className="tarjeta"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 24,
                marginBottom: 24,
                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Umbrales de Alerta y Escalamiento Preventivo
                </h2>
                <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "#64748b" }}>
                  Notificaciones y disparadores visuales antes de que se produzca el incumplimiento formal del acuerdo.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="campo">
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Alerta Preventiva (% de tiempo consumido) *
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      className="input-base"
                      min={50}
                      max={89}
                      value={politicaSla.umbral_alerta_preventiva_pct}
                      onChange={(e) =>
                        setPoliticaSla({
                          ...politicaSla,
                          umbral_alerta_preventiva_pct: Number(e.target.value),
                        })
                      }
                      required
                      style={{ width: 90, backgroundColor: "white" }}
                    />
                    <span style={{ fontSize: 13, color: "#64748b" }}>% del SLA transcurrido</span>
                  </div>
                  <small style={{ color: "#64748b", marginTop: 4 }}>
                    El ticket pasa a estado de advertencia (color ámbar) en la bandeja técnica.
                  </small>
                </div>

                <div className="campo">
                  <label style={{ fontSize: 13, fontWeight: 600 }}>
                    Alerta Crítica / Escalamiento (% de tiempo consumido) *
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="number"
                      className="input-base"
                      min={90}
                      max={99}
                      value={politicaSla.umbral_alerta_critica_pct}
                      onChange={(e) =>
                        setPoliticaSla({
                          ...politicaSla,
                          umbral_alerta_critica_pct: Number(e.target.value),
                        })
                      }
                      required
                      style={{ width: 90, backgroundColor: "white" }}
                    />
                    <span style={{ fontSize: 13, color: "#64748b" }}>% del SLA transcurrido</span>
                  </div>
                  <small style={{ color: "#64748b", marginTop: 4 }}>
                    Dispara notificación prioritaria al Supervisor y tiñe el indicador en rojo.
                  </small>
                </div>
              </div>
            </div>

            {/* BOTÓN DE GUARDAR AL FONDO DE TODA LA CONFIGURACIÓN */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                paddingTop: 20,
                marginTop: 10,
                borderTop: "1px solid #e2e8f0",
                gap: 12,
              }}
            >
              <div>
                {hayInconsistenciasTiempos && (
                  <span style={{ fontSize: 12.5, color: "#dc2626", fontWeight: 600 }}>
                    Existen inconsistencias en los tiempos de SLA u OLA (la primera respuesta y diagnóstico deben ser menores a la resolución total).
                  </span>
                )}
              </div>
              <button
                type="submit"
                className="boton-primario"
                disabled={guardando || hayInconsistenciasTiempos}
                style={{
                  padding: "10px 28px",
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: "#2563eb",
                  borderRadius: 8,
                  opacity: hayInconsistenciasTiempos || guardando ? 0.6 : 1,
                  cursor: hayInconsistenciasTiempos || guardando ? "not-allowed" : "pointer",
                }}
                title={hayInconsistenciasTiempos ? "Corrija las inconsistencias de tiempos SLA/OLA para guardar." : ""}
              >
                {guardando ? "Guardando Configuración..." : "Guardar Objetivos SLA y OLA"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
