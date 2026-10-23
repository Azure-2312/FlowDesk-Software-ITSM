"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PrioridadConfig {
  usar_matriz_propia: boolean;
  permitir_prioridad_manual: boolean;
  perfiles_prioridad_manual: number[];
  recalcular_al_cambiar: boolean;
  tooltips: {
    impacto: {
      alta: string;
      media: string;
      baja: string;
    };
    urgencia: {
      alta: string;
      media: string;
      baja: string;
    };
  };
}

interface PestanaPrioridadProps {
  config: PrioridadConfig;
  onChangeConfig: (nuevaConfig: PrioridadConfig) => void;
}

export const PestanaPrioridad: React.FC<PestanaPrioridadProps> = ({
  config,
  onChangeConfig,
}) => {
  const [matrizInstitucional, setMatrizInstitucional] = useState<any[]>([]);
  const [cargandoMatriz, setCargandoMatriz] = useState(false);

  // Estados del Simulador de Prioridad
  const [simImpacto, setSimImpacto] = useState<number>(2);
  const [simUrgencia, setSimUrgencia] = useState<number>(2);

  useEffect(() => {
    async function cargarMatriz() {
      setCargandoMatriz(true);
      try {
        const res = await fetch("/api/servicios/sla/matriz");
        const data = await res.json();
        if (data.ok && Array.isArray(data.matriz)) {
          setMatrizInstitucional(data.matriz);
        }
      } catch (err) {
        console.error("Error al cargar matriz institucional:", err);
      } finally {
        setCargandoMatriz(false);
      }
    }
    cargarMatriz();
  }, []);

  const tooltips = config.tooltips || {
    impacto: {
      alta: "Interrupción de servicios críticos institucionales o afectación generalizada.",
      media: "Degradación de rendimiento o afectación de procesos auxiliares.",
      baja: "Afectación acotada o cosmética sin perjuicio operativo.",
    },
    urgencia: {
      alta: "Requiere atención inmediata; amenaza inminente a la estabilidad operativa.",
      media: "Requiere atención en la siguiente ventana programada dentro del ciclo estándar.",
      baja: "Puede programarse con holgura en ventanas diferidas.",
    },
  };

  // Resolver prioridad del simulador
  const resolverPrioridad = (idImp: number, idUrg: number) => {
    const celda = matrizInstitucional.find((c) => c.id_impacto === idImp && c.id_urgencia === idUrg);
    if (!celda) {
      if (idImp === 1 && idUrg === 1) return { codigo: "P1", nombre: "P1 - Crítica", color: "#fee2e2", textColor: "#991b1b" };
      if ((idImp === 1 && idUrg === 2) || (idImp === 2 && idUrg === 1)) return { codigo: "P2", nombre: "P2 - Alta", color: "#ffedd5", textColor: "#9a3412" };
      if ((idImp === 2 && idUrg === 2) || (idImp === 1 && idUrg === 3) || (idImp === 3 && idUrg === 1)) return { codigo: "P3", nombre: "P3 - Media", color: "#fef3c7", textColor: "#92400e" };
      if ((idImp === 2 && idUrg === 3) || (idImp === 3 && idUrg === 2)) return { codigo: "P4", nombre: "P4 - Baja", color: "#f0fdf4", textColor: "#166534" };
      return { codigo: "P5", nombre: "P5 - Planificada", color: "#f1f5f9", textColor: "#475569" };
    }
    const colorMap: Record<number, { bg: string; text: string }> = {
      1: { bg: "#fee2e2", text: "#991b1b" },
      2: { bg: "#ffedd5", text: "#9a3412" },
      3: { bg: "#fef3c7", text: "#92400e" },
      4: { bg: "#f0fdf4", text: "#166534" },
      5: { bg: "#f1f5f9", text: "#475569" },
    };
    const c = colorMap[celda.id_prioridad] || { bg: "#f1f5f9", text: "#334155" };
    return {
      codigo: celda.prioridad_codigo || `P${celda.id_prioridad}`,
      nombre: celda.prioridad_nombre || `Prioridad P${celda.id_prioridad}`,
      color: c.bg,
      textColor: c.text,
    };
  };

  const prioridadSimulada = resolverPrioridad(simImpacto, simUrgencia);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Aclaración ITIL 4 de Gobernanza (Sección 6.5) */}
      <div
        style={{
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          padding: "14px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <span style={{ fontSize: 18, color: "#2563eb" }}>ℹ️</span>
        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: "#1e40af", margin: 0 }}>
            Principio ITIL 4: Independencia entre Prioridad Técnica y Riesgo
          </h4>
          <p style={{ fontSize: 12, color: "#1e3a8a", margin: "4px 0 0 0", lineHeight: 1.5 }}>
            La <strong>prioridad</strong> se calcula mediante la matriz institucional de <em>Impacto × Urgencia</em> compartida con Incidentes y Problemas. El <strong>nivel de riesgo</strong> proviene del cuestionario multidimensional. La <strong>autoridad de cambio (CAB, ECAB o aprobación delegada)</strong> se determina en función del tipo de cambio y del riesgo, no de la prioridad técnica ni del solicitante.
          </p>
        </div>
      </div>

      {/* Matriz Compartida y Enlace a Edición General */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#166534", fontWeight: 700 }}>
                MATRIZ COMPARTIDA
              </span>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Matriz Institucional de Prioridad (Incidentes, Problemas y Cambios)
              </h4>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>
              Garantiza coherencia institucional absoluta: una RFC con el mismo impacto y urgencia recibe exactamente la misma prioridad técnica que un incidente o problema.
            </p>
          </div>

          <Link
            href="/plataforma/servicios/configuracion/sla"
            className="boton-secundario"
            style={{ fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Editar Matriz Compartida en Objetivos SLA →
          </Link>
        </div>

        {/* Visualizador de la Matriz 3x3 */}
        <div style={{ display: "grid", gridTemplateColumns: "120px repeat(3, 1fr)", gap: 8, maxWidth: 640 }}>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11, color: "#64748b", textAlign: "center" }}>
            IMPACTO \ URG
          </div>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Alta (U1)
          </div>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Media (U2)
          </div>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Baja (U3)
          </div>

          {/* Fila 1: Impacto Alto */}
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", display: "flex", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Alta (I1)
          </div>
          {[1, 2, 3].map((urg) => {
            const p = resolverPrioridad(1, urg);
            return (
              <div
                key={`1-${urg}`}
                style={{
                  padding: "10px 8px",
                  borderRadius: 6,
                  backgroundColor: p.color,
                  color: p.textColor,
                  fontWeight: 800,
                  fontSize: 12,
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {p.codigo}
              </div>
            );
          })}

          {/* Fila 2: Impacto Medio */}
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", display: "flex", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Media (I2)
          </div>
          {[1, 2, 3].map((urg) => {
            const p = resolverPrioridad(2, urg);
            return (
              <div
                key={`2-${urg}`}
                style={{
                  padding: "10px 8px",
                  borderRadius: 6,
                  backgroundColor: p.color,
                  color: p.textColor,
                  fontWeight: 800,
                  fontSize: 12,
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {p.codigo}
              </div>
            );
          })}

          {/* Fila 3: Impacto Bajo */}
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", display: "flex", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Baja (I3)
          </div>
          {[1, 2, 3].map((urg) => {
            const p = resolverPrioridad(3, urg);
            return (
              <div
                key={`3-${urg}`}
                style={{
                  padding: "10px 8px",
                  borderRadius: 6,
                  backgroundColor: p.color,
                  color: p.textColor,
                  fontWeight: 800,
                  fontSize: 12,
                  textAlign: "center",
                  border: "1px solid rgba(0,0,0,0.06)",
                }}
              >
                {p.codigo}
              </div>
            );
          })}
        </div>

        {/* Interruptor Usar Matriz Propia (Apagado por defecto según Sección 6.5) */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="checkbox"
            id="chk-matriz-propia"
            checked={config.usar_matriz_propia}
            onChange={(e) => {
              if (e.target.checked) {
                if (confirm("¿Desea habilitar una matriz de prioridad independiente para Cambios? Esto separará las prioridades calculadas respecto a Incidentes y Problemas.")) {
                  onChangeConfig({ ...config, usar_matriz_propia: true });
                }
              } else {
                onChangeConfig({ ...config, usar_matriz_propia: false });
              }
            }}
          />
          <label htmlFor="chk-matriz-propia" style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
            Usar matriz propia para Gestión de Cambios (Desactivado por defecto)
          </label>
        </div>
      </div>

      {/* Simulador Interactivo de Prioridad */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Simulador Rápido de Prioridad Calculada
        </h4>

        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Impacto técnico:</span>
            <select
              className="input-base"
              value={simImpacto}
              onChange={(e) => setSimImpacto(Number(e.target.value))}
              style={{ fontSize: 12, width: "auto" }}
            >
              <option value={1}>Alta (I1)</option>
              <option value={2}>Media (I2)</option>
              <option value={3}>Baja (I3)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Urgencia:</span>
            <select
              className="input-base"
              value={simUrgencia}
              onChange={(e) => setSimUrgencia(Number(e.target.value))}
              style={{ fontSize: 12, width: "auto" }}
            >
              <option value={1}>Alta (U1)</option>
              <option value={2}>Media (U2)</option>
              <option value={3}>Baja (U3)</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Resultado:</span>
            <span
              className="badge-itil"
              style={{
                backgroundColor: prioridadSimulada.color,
                color: prioridadSimulada.textColor,
                fontWeight: 800,
                fontSize: 12,
                padding: "4px 10px",
              }}
            >
              {prioridadSimulada.nombre}
            </span>
          </div>
        </div>
      </div>

      {/* Textos de Ayuda y Tooltips Específicos para Cambios */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Textos Guía y Tooltips Específicos para el Formulario RFC
        </h4>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Tooltips de Impacto */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#2563eb" }}>Tooltips de Impacto</span>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                Impacto Alto:
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={tooltips.impacto.alta}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    tooltips: {
                      ...tooltips,
                      impacto: { ...tooltips.impacto, alta: e.target.value },
                    },
                  })
                }
                style={{ width: "100%", fontSize: 11.5 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                Impacto Medio:
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={tooltips.impacto.media}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    tooltips: {
                      ...tooltips,
                      impacto: { ...tooltips.impacto, media: e.target.value },
                    },
                  })
                }
                style={{ width: "100%", fontSize: 11.5 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                Impacto Bajo:
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={tooltips.impacto.baja}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    tooltips: {
                      ...tooltips,
                      impacto: { ...tooltips.impacto, baja: e.target.value },
                    },
                  })
                }
                style={{ width: "100%", fontSize: 11.5 }}
              />
            </div>
          </div>

          {/* Tooltips de Urgencia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0891b2" }}>Tooltips de Urgencia</span>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                Urgencia Alta:
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={tooltips.urgencia.alta}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    tooltips: {
                      ...tooltips,
                      urgencia: { ...tooltips.urgencia, alta: e.target.value },
                    },
                  })
                }
                style={{ width: "100%", fontSize: 11.5 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                Urgencia Media:
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={tooltips.urgencia.media}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    tooltips: {
                      ...tooltips,
                      urgencia: { ...tooltips.urgencia, media: e.target.value },
                    },
                  })
                }
                style={{ width: "100%", fontSize: 11.5 }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 2 }}>
                Urgencia Baja:
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={tooltips.urgencia.baja}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    tooltips: {
                      ...tooltips,
                      urgencia: { ...tooltips.urgencia, baja: e.target.value },
                    },
                  })
                }
                style={{ width: "100%", fontSize: 11.5 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
