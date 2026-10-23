"use client";

import React, { useState } from "react";
import { Play, AlertTriangle, AlertCircle, CheckCircle2, Clock, Sliders, X, Check } from "@/shared/components/ui/Iconos";

interface PestanaConflictosCapacidadProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
  servicios: any[];
  ciList: any[];
  usuarios: any[];
}

export function PestanaConflictosCapacidad({ config, onChange, servicios, ciList, usuarios }: PestanaConflictosCapacidadProps) {
  const [modalSimuladorAbierto, setModalSimuladorAbierto] = useState(false);
  const [simTipo, setSimTipo] = useState<"estandar" | "normal" | "emergencia">("normal");
  const [simFecha, setSimFecha] = useState(new Date().toISOString().substring(0, 10));
  const [simHora, setSimHora] = useState("23:00");
  const [simDuracion, setSimDuracion] = useState(4);
  const [simServicio, setSimServicio] = useState<string>("");
  const [simCI, setSimCI] = useState<string>("");
  const [simImplementador, setSimImplementador] = useState<string>("");
  const [simulando, setSimulando] = useState(false);
  const [simResultado, setSimResultado] = useState<any | null>(null);

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

  const ejecutarSimulador = async () => {
    try {
      setSimulando(true);
      setSimResultado(null);

      const fechaHoraISO = `${simFecha}T${simHora}:00.000Z`;

      const res = await fetch("/api/cambios/configuracion/notificaciones-calendario/simular-conflictos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_cambio: simTipo,
          fecha_inicio: fechaHoraISO,
          duracion_horas: Number(simDuracion),
          servicio_id: simServicio ? Number(simServicio) : null,
          ci_id: simCI ? Number(simCI) : null,
          implementador_id: simImplementador ? Number(simImplementador) : null
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al simular");
      setSimResultado(data);
    } catch (err: any) {
      alert("Error en el simulador: " + err.message);
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Cabecera con botón de simulador */}
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
        <button
          onClick={() => { setModalSimuladorAbierto(true); setSimResultado(null); }}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          <Play size={14} /> Simulador de Conflictos
        </button>
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
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
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
                    onClick={() => actualizarRegla(r.codigo, "activa", !r.activa)}
                    style={{
                      background: r.activa ? "#10b981" : "#cbd5e1",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: 12,
                      width: 36,
                      height: 20,
                      cursor: "pointer",
                      position: "relative"
                    }}
                    title={r.activa ? "Desactivar regla" : "Activar regla"}
                  >
                    <div style={{
                      position: "absolute",
                      top: 2,
                      left: r.activa ? 18 : 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "#ffffff",
                      transition: "left 0.2s"
                    }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Simulador de Conflictos */}
      {modalSimuladorAbierto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 840, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Play size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Simulador de Conflictos y Validación de Ventanas</h3>
              </div>
              <button onClick={() => setModalSimuladorAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {/* Formulario de entrada */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16, fontSize: 13 }}>
              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Tipo de Cambio</label>
                <select
                  value={simTipo}
                  onChange={(e: any) => setSimTipo(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="estandar">Estándar</option>
                  <option value="normal">Normal</option>
                  <option value="emergencia">Emergencia</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Fecha Propuesta</label>
                <input
                  type="date"
                  value={simFecha}
                  onChange={(e) => setSimFecha(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Hora de Inicio (Lima)</label>
                <input
                  type="time"
                  value={simHora}
                  onChange={(e) => setSimHora(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Duración Estimada (Horas)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={simDuracion}
                  onChange={(e) => setSimDuracion(parseInt(e.target.value, 10) || 1)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Servicio Tecnológico</label>
                <select
                  value={simServicio}
                  onChange={(e) => setSimServicio(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="">(Opcional / Ninguno)</option>
                  {servicios.map((s: any) => (
                    <option key={s.id_servicio} value={s.id_servicio}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Elemento CI Afectado</label>
                <select
                  value={simCI}
                  onChange={(e) => setSimCI(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="">(Opcional / Ninguno)</option>
                  {ciList.map((c: any) => (
                    <option key={c.id_ci} value={c.id_ci}>{c.codigo_ci ? `[${c.codigo_ci}] ` : ""}{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button
                disabled={simulando}
                onClick={ejecutarSimulador}
                style={{ padding: "8px 18px", background: simulando ? "#94a3b8" : "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
              >
                <Play size={14} /> {simulando ? "Calculando conflictos..." : "Ejecutar Simulación"}
              </button>
            </div>

            {/* Resultados del simulador */}
            {simResultado && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{
                  padding: 14,
                  borderRadius: 6,
                  border: `1px solid ${simResultado.resultado === "bloqueado" ? "#fecaca" : simResultado.resultado === "advertencia" ? "#fde68a" : "#bbf7d0"}`,
                  background: simResultado.resultado === "bloqueado" ? "#fef2f2" : simResultado.resultado === "advertencia" ? "#fffbeb" : "#f0fdf4"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14, color: simResultado.resultado === "bloqueado" ? "#b91c1c" : simResultado.resultado === "advertencia" ? "#b45309" : "#15803d" }}>
                    {simResultado.resultado === "bloqueado" ? <AlertCircle size={18} /> : simResultado.resultado === "advertencia" ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                    <span>Dictamen del Motor de Conflictos: {simResultado.resultado.toUpperCase()}</span>
                  </div>
                  <p style={{ margin: "6px 0 0 0", fontSize: 13, color: "#334155" }}>
                    {simResultado.resumen}
                  </p>
                </div>

                {/* Lista de bloqueos */}
                {simResultado.bloqueos && simResultado.bloqueos.length > 0 && (
                  <div style={{ background: "#ffffff", border: "1px solid #fee2e2", borderRadius: 6, padding: 12 }}>
                    <div style={{ fontWeight: 600, color: "#b91c1c", fontSize: 13, marginBottom: 6 }}>
                      Bloqueos Normativos Detectados ({simResultado.bloqueos.length}):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#7f1d1d" }}>
                      {simResultado.bloqueos.map((b: string, i: number) => (
                        <li key={i} style={{ marginBottom: 4 }}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lista de advertencias */}
                {simResultado.advertencias && simResultado.advertencias.length > 0 && (
                  <div style={{ background: "#ffffff", border: "1px solid #fef3c7", borderRadius: 6, padding: 12 }}>
                    <div style={{ fontWeight: 600, color: "#b45309", fontSize: 13, marginBottom: 6 }}>
                      Advertencias para Revisión ({simResultado.advertencias.length}):
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: "#92400e" }}>
                      {simResultado.advertencias.map((a: string, i: number) => (
                        <li key={i} style={{ marginBottom: 4 }}>{a}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sugerencias de huecos libres */}
                {simResultado.huecos_libres && simResultado.huecos_libres.length > 0 && (
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: 12 }}>
                    <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <Clock size={14} color="#059669" />
                      <span>Huecos Libres Recomendados en Ventanas Autorizadas:</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {simResultado.huecos_libres.map((h: any, i: number) => (
                        <div key={i} style={{ background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, padding: "8px 10px", fontSize: 12 }}>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>Fecha: {h.fecha}</div>
                          <div style={{ color: "#2563eb" }}>Horario: {h.hora_inicio} a {h.hora_fin}</div>
                          <div style={{ color: "#64748b", fontSize: 11 }}>{h.ventana_nombre} ({h.capacidad_disponible})</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button
                onClick={() => setModalSimuladorAbierto(false)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
