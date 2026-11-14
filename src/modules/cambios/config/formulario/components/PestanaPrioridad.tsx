"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PrioridadConfig {
  usar_matriz_propia: boolean;
  matriz_personalizada?: Record<string, string>;
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

  // Resolver prioridad (propia de Cambios o institucional compartida)
  const resolverPrioridad = (idImp: number, idUrg: number) => {
    const clave = `${idImp}-${idUrg}`;
    if (config.matriz_personalizada && config.matriz_personalizada[clave]) {
      const cod = config.matriz_personalizada[clave];
      const colorMap: Record<string, { bg: string; text: string; nombre: string }> = {
        P1: { bg: "#fee2e2", text: "#991b1b", nombre: "P1 - Crítica" },
        P2: { bg: "#ffedd5", text: "#9a3412", nombre: "P2 - Alta" },
        P3: { bg: "#fef3c7", text: "#92400e", nombre: "P3 - Media" },
        P4: { bg: "#f0fdf4", text: "#166534", nombre: "P4 - Baja" },
        P5: { bg: "#f1f5f9", text: "#475569", nombre: "P5 - Planificada" },
      };
      const m = colorMap[cod] || colorMap.P3;
      return { codigo: cod, nombre: m.nombre, color: m.bg, textColor: m.text };
    }

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

  const cambiarCeldaPersonalizada = (idImp: number, idUrg: number, nuevoCodigo: string) => {
    const clave = `${idImp}-${idUrg}`;
    const matrizBase: Record<string, string> = {};
    for (let i = 1; i <= 3; i++) {
      for (let u = 1; u <= 3; u++) {
        matrizBase[`${i}-${u}`] = config.matriz_personalizada?.[`${i}-${u}`] || resolverPrioridad(i, u).codigo;
      }
    }
    matrizBase[clave] = nuevoCodigo;
    onChangeConfig({
      ...config,
      matriz_personalizada: matrizBase,
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Matriz de Prioridad (Siempre Editable - Controlada por Checkbox) */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="badge-itil"
                style={{
                  backgroundColor: config.usar_matriz_propia ? "#eff6ff" : "#f1f5f9",
                  color: config.usar_matriz_propia ? "#1d4ed8" : "#475569",
                  border: `1px solid ${config.usar_matriz_propia ? "#bfdbfe" : "#cbd5e1"}`,
                  fontWeight: 700,
                }}
              >
                {config.usar_matriz_propia ? "MATRIZ PROPIA ACTIVA" : "MATRIZ COMPARTIDA (POR DEFECTO)"}
              </span>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Matriz de Prioridad de Gestión de Cambios (Impacto × Riesgo)
              </h4>
            </div>
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>
              {config.usar_matriz_propia
                ? "Las solicitudes RFC calcularán su prioridad según las celdas configuradas a continuación."
                : "Actualmente se utiliza por defecto la matriz general institucional. Puedes configurar los valores abajo y activar la casilla inferior para aplicar esta matriz a Cambios."}
            </p>
          </div>

          <Link
            href="/plataforma/servicios/configuracion/sla"
            className="boton-secundario"
            style={{ fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Ver Matriz Compartida en Catálogo de Servicios / SLA →
          </Link>
        </div>

        {/* Visualizador / Editor de la Matriz 3x3 (Siempre editable) */}
        <div style={{ display: "grid", gridTemplateColumns: "130px repeat(3, 1fr)", gap: 8, maxWidth: 680 }}>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11, color: "#64748b", textAlign: "center" }}>
            IMPACTO \ RIESGO
          </div>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Alta (3)
          </div>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Media (2)
          </div>
          <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
            Baja (1)
          </div>

          {/* Filas 1, 2, 3: Impacto Alto, Medio, Bajo */}
          {[
            { id: 1, label: "Alta (I1)" },
            { id: 2, label: "Media (I2)" },
            { id: 3, label: "Baja (I3)" },
          ].map((imp) => (
            <React.Fragment key={imp.id}>
              <div style={{ padding: 8, fontWeight: 700, fontSize: 11.5, color: "#1e293b", display: "flex", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 4 }}>
                {imp.label}
              </div>
              {[1, 2, 3].map((urg) => {
                const p = resolverPrioridad(imp.id, urg);
                return (
                  <select
                    key={`${imp.id}-${urg}`}
                    value={p.codigo}
                    onChange={(e) => cambiarCeldaPersonalizada(imp.id, urg, e.target.value)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 6,
                      backgroundColor: p.color,
                      color: p.textColor,
                      fontWeight: 800,
                      fontSize: 12,
                      textAlign: "center",
                      border: "1px solid #cbd5e1",
                      cursor: "pointer",
                    }}
                  >
                    <option value="P1">P1 - Crítica</option>
                    <option value="P2">P2 - Alta</option>
                    <option value="P3">P3 - Media</option>
                    <option value="P4">P4 - Baja</option>
                    <option value="P5">P5 - Planificada</option>
                  </select>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Checkbox: Usar Matriz Propia de Gestión de Cambios */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              id="chk-matriz-propia"
              checked={!!config.usar_matriz_propia}
              onChange={(e) => {
                onChangeConfig({ ...config, usar_matriz_propia: e.target.checked });
              }}
              style={{ width: 16, height: 16, cursor: "pointer" }}
            />
            <label htmlFor="chk-matriz-propia" style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", cursor: "pointer" }}>
              Usar matriz propia de gestión de cambios
            </label>
          </div>
          <p style={{ fontSize: 12, color: "#64748b", margin: 0, paddingLeft: 26 }}>
            {config.usar_matriz_propia
              ? "✓ Matriz propia activa: Se utilizarán los valores configurados en la tabla superior al guardar cambios."
              : "Desmarcado (Por defecto): Se utiliza la matriz institucional compartida. Marca esta casilla y guarda cambios para activar la matriz propia de cambios."}
          </p>
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
