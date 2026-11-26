"use client";

import React, { useState } from "react";
import { Play, AlertTriangle, AlertCircle, CheckCircle2, Clock, Sliders, X, Check } from "@/shared/components/ui/Iconos";
import TablaDobleScroll from "@/shared/components/ui/TablaDobleScroll";

interface PestanaConflictosCapacidadProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
  servicios: any[];
  ciList: any[];
  usuarios: any[];
}

export function PestanaConflictosCapacidad({ config, onChange, servicios, ciList, usuarios }: PestanaConflictosCapacidadProps) {
  const reglas: any[] = config.reglas || [];

  const actualizarRegla = (codigo: string, campo: string, valor: any) => {
    const nuevas = reglas.map((r: any) => {
      if (r.codigo === codigo) {
        if (campo === "severidad") {
          return { ...r, severidad: { ...r.severidad, ...valor } };
        }
        return { ...r, [campo]: valor };
      }
      return r;
    });
    onChange({ ...config, reglas: nuevas });
  };

  const actualizarParametro = (campo: string, valor: any) => {
    onChange({ ...config, [campo]: valor });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Cabecera */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sliders size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
              Reglas de Detección de Conflictos y Capacidad
            </h3>
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>
            Gobierna la prevención de solapamientos entre cambios, intervenciones sobre los mismos CIs o servicios, y límites de saturación operativa.
          </p>
        </div>
      </div>

      {/* Parámetros Globales */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 14, fontWeight: 600, color: "#0f172a" }}>
          Parámetros Globales de Planificación
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, fontSize: 13 }}>
          <div>
            <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Duración Máxima de RFC (Horas)</label>
            <input
              type="number"
              min={1}
              max={72}
              value={config.duracion_maxima_rfc_horas || 12}
              onChange={(e) => actualizarParametro("duracion_maxima_rfc_horas", parseInt(e.target.value, 10) || 12)}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Tolerancia de Inicio (Minutos)</label>
            <input
              type="number"
              min={5}
              max={120}
              value={config.tolerancia_inicio_minutos || 30}
              onChange={(e) => actualizarParametro("tolerancia_inicio_minutos", parseInt(e.target.value, 10) || 30)}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Perfil para Excepción de Conflicto</label>
            <select
              value={config.perfil_excepcion_conflicto || "gestor_cambios"}
              onChange={(e) => actualizarParametro("perfil_excepcion_conflicto", e.target.value)}
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
            >
              <option value="gestor_cambios">Gestor de Cambios</option>
              <option value="supervisor">Supervisor de Soporte</option>
              <option value="administrador">Administrador del Sistema</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Frecuencia de Reevaluación Periódica</label>
            <input
              type="text"
              disabled
              value="Cada 60 minutos (Automático)"
              style={{ width: "100%", padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 6, background: "#f8fafc", color: "#64748b" }}
            />
          </div>
        </div>
      </div>

      {/* Tabla de Reglas de Conflicto */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 8 }}>
        <TablaDobleScroll>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left", minWidth: 880 }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Conflicto y Criterio</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Parámetros Específicos</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Severidad Estándar</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Severidad Normal</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Severidad Emergencia</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Activa</th>
            </tr>
          </thead>
          <tbody>
            {reglas.map((r: any, idx: number) => (
              <tr key={r.codigo || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                <td style={{ padding: "10px 14px", maxWidth: 280 }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{r.nombre}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{r.descripcion}</div>
                </td>
                <td style={{ padding: "10px 14px", color: "#334155" }}>
                  {r.codigo === "mismo_ci" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>Colchón de seguridad:</span>
                      <input
                        type="number"
                        min={0}
                        max={240}
                        value={r.colchon_minutos || 60}
                        onChange={(e) => actualizarRegla(r.codigo, "colchon_minutos", parseInt(e.target.value, 10) || 60)}
                        style={{ width: 60, padding: "2px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }}
                      />
                      <span>min</span>
                    </div>
                  )}
                  {r.codigo === "mismo_servicio" && (
                    <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={!!r.solo_servicios_criticos}
                        onChange={(e) => actualizarRegla(r.codigo, "solo_servicios_criticos", e.target.checked)}
                      />
                      <span>Solo si el servicio es crítico</span>
                    </label>
                  )}
                  {r.codigo === "ci_relacionados" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span>Profundidad CMDB:</span>
                      <select
                        value={r.profundidad_relaciones || 1}
                        onChange={(e) => actualizarRegla(r.codigo, "profundidad_relaciones", parseInt(e.target.value, 10))}
                        style={{ padding: "2px 6px", border: "1px solid #cbd5e1", borderRadius: 4 }}
                      >
                        <option value={1}>1 nivel (directo)</option>
                        <option value={2}>2 niveles</option>
                        <option value={3}>3 niveles</option>
                      </select>
                    </div>
                  )}
                  {r.codigo === "capacidad_concurrencia" && (
                    <div style={{ fontSize: 11, color: "#475569" }}>
                      Global: <strong>{r.max_global_simultaneo || 5}</strong> · Serv. Crítico: <strong>{r.max_por_servicio_critico || 2}</strong> · CI: <strong>{r.max_por_ci || 1}</strong> · Día: <strong>{r.max_por_dia || 10}</strong>
                    </div>
                  )}
                  {!["mismo_ci", "mismo_servicio", "ci_relacionados", "capacidad_concurrencia"].includes(r.codigo) && (
                    <span style={{ fontSize: 12, color: "#64748b" }}>Criterio normativo estándar</span>
                  )}
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <select
                    value={r.severidad?.estandar || "bloquear"}
                    onChange={(e) => actualizarRegla(r.codigo, "severidad", { estandar: e.target.value })}
                    style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="bloquear">Bloquear</option>
                    <option value="advertir">Advertir</option>
                    <option value="ignorar">Ignorar</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <select
                    value={r.severidad?.normal || "bloquear"}
                    onChange={(e) => actualizarRegla(r.codigo, "severidad", { normal: e.target.value })}
                    style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="bloquear">Bloquear</option>
                    <option value="advertir">Advertir</option>
                    <option value="ignorar">Ignorar</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <select
                    value={r.severidad?.emergencia || "advertir"}
                    onChange={(e) => actualizarRegla(r.codigo, "severidad", { emergencia: e.target.value })}
                    style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: 4, fontSize: 12 }}
                  >
                    <option value="bloquear">Bloquear</option>
                    <option value="advertir">Advertir</option>
                    <option value="ignorar">Ignorar</option>
                  </select>
                </td>
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={r.activa}
                    className={r.activa ? "interruptor interruptor-activo" : "interruptor"}
                    onClick={() => actualizarRegla(r.codigo, "activa", !r.activa)}
                    title={r.activa ? "Desactivar regla" : "Activar regla"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </TablaDobleScroll>
      </div>
    </div>
  );
}
