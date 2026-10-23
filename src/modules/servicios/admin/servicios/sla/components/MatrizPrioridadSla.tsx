"use client";

import React, { useEffect, useState } from "react";

interface PrioridadTicket {
  id_prioridad: number;
  codigo: string;
  nombre: string;
  nivel: number;
  color: string;
  tiempo_resolucion_horas: number;
}

interface CeldaMatriz {
  id_celda?: number;
  entidad: string;
  nivel_impacto: number; // 3 Alta, 2 Media, 1 Baja
  nivel_urgencia: number; // 3 Alta, 2 Media, 1 Baja
  id_prioridad: number;
}

interface ConfigMatriz {
  usar_matriz_propia: boolean;
  permitir_prioridad_manual: boolean;
  perfiles_prioridad_manual: number[];
  recalcular_al_cambiar: boolean;
  tooltips_impacto: Record<string, string>;
  tooltips_urgencia: Record<string, string>;
}

export function MatrizPrioridadSla() {
  const [prioridades, setPrioridades] = useState<PrioridadTicket[]>([]);
  const [celdasCompartidas, setCeldasCompartidas] = useState<CeldaMatriz[]>([]);
  const [celdasEditables, setCeldasEditables] = useState<CeldaMatriz[]>([]);
  const [config, setConfig] = useState<ConfigMatriz>({
    usar_matriz_propia: false,
    permitir_prioridad_manual: true,
    perfiles_prioridad_manual: [1, 4, 10],
    recalcular_al_cambiar: true,
    tooltips_impacto: {
      "1": "Baja: afecta a funciones accesorias o a un único usuario sin impacto en operaciones críticas.",
      "2": "Media: degradación parcial del rendimiento de un servicio sin paralización total.",
      "3": "Alta: afectación crítica o interrupción total de un servicio esencial o más de 100 usuarios.",
    },
    tooltips_urgencia: {
      "1": "Baja: la atención puede programarse de forma estándar sin riesgo operativo inmediato.",
      "2": "Media: existen incidentes concurrentes o riesgo de recurrencia en horas punta.",
      "3": "Alta: afectación crítica o bloqueo inmediato de la continuidad del negocio.",
    },
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Simulador
  const [simImpacto, setSimImpacto] = useState(2);
  const [simUrgencia, setSimUrgencia] = useState(2);

  useEffect(() => {
    async function cargarMatriz() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch("/api/servicios/sla/matriz");
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Error al cargar matriz");

        setPrioridades(data.prioridades || []);
        setCeldasCompartidas(data.celdas_compartidas || []);
        setCeldasEditables(data.celdas_compartidas || []);
        if (data.config) setConfig(data.config);
      } catch (err: any) {
        setError(err.message || "Error al conectar con la matriz de prioridad");
      } finally {
        setCargando(false);
      }
    }
    cargarMatriz();
  }, []);

  const obtenerPrioridadCelda = (imp: number, urg: number) => {
    const celda = celdasEditables.find(
      (c) => c.nivel_impacto === imp && c.nivel_urgencia === urg
    );
    if (!celda) return null;
    return prioridades.find((p) => p.id_prioridad === celda.id_prioridad) || null;
  };

  const prioridadSimulada = obtenerPrioridadCelda(simImpacto, simUrgencia);

  const handleCambiarCelda = (imp: number, urg: number, idPrioridad: number) => {
    const nuevas = [...celdasEditables];
    const idx = nuevas.findIndex((c) => c.nivel_impacto === imp && c.nivel_urgencia === urg);
    if (idx >= 0) {
      nuevas[idx] = { ...nuevas[idx], id_prioridad: idPrioridad };
    } else {
      nuevas.push({
        entidad: "compartida",
        nivel_impacto: imp,
        nivel_urgencia: urg,
        id_prioridad: idPrioridad,
      });
    }
    setCeldasEditables(nuevas);
  };

  const handleGuardarCambios = async () => {
    try {
      setGuardando(true);
      setError(null);
      setMensajeExito("");

      const res = await fetch("/api/servicios/sla/matriz", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          config,
          celdas_compartidas: celdasEditables,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al guardar");

      setMensajeExito("Matriz de prioridad institucional actualizada exitosamente.");
      setTimeout(() => setMensajeExito(""), 4000);
    } catch (err: any) {
      setError(err.message || "Error al actualizar la matriz");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b", fontSize: 13 }}>
        Cargando matriz institucional de prioridad y SLA...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Alertas */}
      {mensajeExito && (
        <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}
      {error && (
        <div style={{ backgroundColor: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {error}
        </div>
      )}

      {/* Encabezado descriptivo */}
      <div style={{ backgroundColor: "#ffffff", padding: "18px 24px", borderRadius: 10, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
            Matriz Institucional de Prioridad (Impacto x Urgencia)
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Define la combinación bidimensional estándar ITIL 4 que determina automáticamente la prioridad y los tiempos SLA objetivo de cada ticket en el sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGuardarCambios}
          disabled={guardando}
          style={{
            padding: "9px 22px",
            fontSize: 13,
            fontWeight: 600,
            color: "#ffffff",
            backgroundColor: "#2563eb",
            borderRadius: 8,
            border: "none",
            cursor: guardando ? "not-allowed" : "pointer",
            boxShadow: "0 1px 3px rgba(37,99,235,0.2)"
          }}
        >
          {guardando ? "Guardando..." : "Guardar Matriz de Prioridad"}
        </button>
      </div>

      {/* Grilla: Matriz 3x3 a la izquierda y Simulador a la derecha */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
        {/* LADO IZQUIERDO: MATRIZ BIDIMENSIONAL */}
        <div style={{ backgroundColor: "#ffffff", padding: 22, borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "0 0 4px 0" }}>
              Tabla de Decisión de Prioridades (3 x 3)
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
              Seleccione la prioridad resultante calculada para cada cruce de Impacto y Urgencia:
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 8, textAlign: "center" }}>
              <thead>
                <tr>
                  <th style={{ padding: 10, fontSize: 12, color: "#64748b", fontWeight: 700, textAlign: "left" }}>
                    IMPACTO \ URGENCIA
                  </th>
                  {[
                    { nivel: 3, label: "Alta" },
                    { nivel: 2, label: "Media" },
                    { nivel: 1, label: "Baja" },
                  ].map((u) => (
                    <th key={u.nivel} style={{ padding: "8px 12px", fontSize: 12, fontWeight: 700, color: "#1e293b", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                      {u.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { nivel: 3, label: "Alta" },
                  { nivel: 2, label: "Media" },
                  { nivel: 1, label: "Baja" },
                ].map((imp) => (
                  <tr key={imp.nivel}>
                    <td style={{ padding: "10px 14px", fontSize: 12, fontWeight: 700, color: "#1e293b", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", textAlign: "left" }}>
                      {imp.label}
                    </td>

                    {[3, 2, 1].map((urgNivel) => {
                      const prio = obtenerPrioridadCelda(imp.nivel, urgNivel);
                      return (
                        <td key={urgNivel} style={{ padding: 4 }}>
                          <select
                            value={prio?.id_prioridad || ""}
                            onChange={(e) =>
                              handleCambiarCelda(
                                imp.nivel,
                                urgNivel,
                                parseInt(e.target.value, 10)
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "9px 8px",
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: 6,
                              cursor: "pointer",
                              border: prio ? `2px solid ${prio.color}` : "1px solid #cbd5e1",
                              backgroundColor: "#ffffff",
                              color: prio?.color || "#0f172a",
                              textAlign: "center"
                            }}
                          >
                            {prioridades.map((p) => (
                              <option key={p.id_prioridad} value={p.id_prioridad} style={{ color: "#0f172a" }}>
                                {p.codigo} - {p.nombre} ({p.tiempo_resolucion_horas}h)
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 16, padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
            <strong>Nota:</strong> Los cambios en la matriz aplican para todos los procesos que usen la matriz institucional (Incidentes, Problemas y Solicitudes con SLA vinculado).
          </div>
        </div>

        {/* LADO DERECHO: SIMULADOR INTERACTIVO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ backgroundColor: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
              Simulador en Tiempo Real
            </h3>
            <p style={{ margin: "0 0 14px 0", fontSize: 12, color: "#64748b" }}>
              Compruebe el comportamiento del cálculo combinando variables de prueba:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                  Impacto en el negocio:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {[
                    { nivel: 1, label: "Baja" },
                    { nivel: 2, label: "Media" },
                    { nivel: 3, label: "Alta" },
                  ].map((imp) => (
                    <button
                      key={imp.nivel}
                      type="button"
                      onClick={() => setSimImpacto(imp.nivel)}
                      style={{
                        padding: "6px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: simImpacto === imp.nivel ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: simImpacto === imp.nivel ? "#eff6ff" : "#ffffff",
                        color: simImpacto === imp.nivel ? "#1d4ed8" : "#475569",
                        cursor: "pointer"
                      }}
                    >
                      {imp.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase" }}>
                  Urgencia operativa:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                  {[
                    { nivel: 1, label: "Baja" },
                    { nivel: 2, label: "Media" },
                    { nivel: 3, label: "Alta" },
                  ].map((urg) => (
                    <button
                      key={urg.nivel}
                      type="button"
                      onClick={() => setSimUrgencia(urg.nivel)}
                      style={{
                        padding: "6px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        borderRadius: 6,
                        border: simUrgencia === urg.nivel ? "1.5px solid #2563eb" : "1px solid #cbd5e1",
                        backgroundColor: simUrgencia === urg.nivel ? "#eff6ff" : "#ffffff",
                        color: simUrgencia === urg.nivel ? "#1d4ed8" : "#475569",
                        cursor: "pointer"
                      }}
                    >
                      {urg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resultado del simulador */}
            <div
              style={{
                padding: "16px",
                borderRadius: 8,
                backgroundColor: prioridadSimulada?.color ? `${prioridadSimulada.color}15` : "#f8fafc",
                border: `1.5px solid ${prioridadSimulada?.color || "#cbd5e1"}`,
                textAlign: "center"
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Prioridad Calculada y Tiempo SLA
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: prioridadSimulada?.color || "#0f172a" }}>
                {prioridadSimulada ? `${prioridadSimulada.codigo} - ${prioridadSimulada.nombre}` : "No definida"}
              </div>
              {prioridadSimulada && (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  Meta de resolución OLA: <strong>{prioridadSimulada.tiempo_resolucion_horas} horas</strong>
                </div>
              )}
            </div>
          </div>

          {/* Opciones de gobernanza de la matriz */}
          <div style={{ backgroundColor: "#ffffff", padding: 20, borderRadius: 10, border: "1px solid #e2e8f0" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 10px 0" }}>
              Reglas de Gobernanza
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12, color: "#334155" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.permitir_prioridad_manual}
                  onChange={(e) => setConfig({ ...config, permitir_prioridad_manual: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                Permitir sobrescritura manual con justificación
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.recalcular_al_cambiar}
                  onChange={(e) => setConfig({ ...config, recalcular_al_cambiar: e.target.checked })}
                  style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                />
                Recalcular automáticamente al cambiar impacto/urgencia
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
