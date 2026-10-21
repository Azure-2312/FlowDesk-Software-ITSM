"use client";

import React, { useState } from "react";
import { Eye, Calendar, Clock, Sliders, CheckCircle2, X } from "@/shared/components/ui/Iconos";

interface PestanaPresentacionCalendarioProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
}

export function PestanaPresentacionCalendario({ config, onChange }: PestanaPresentacionCalendarioProps) {
  const [modalPreviaAbierto, setModalPreviaAbierto] = useState(false);

  const criterioColor = config.criterio_color || "tipo_cambio";
  const paleta = config.paleta_colores || {
    tipos: { estandar: "#10b981", normal: "#3b82f6", emergencia: "#ef4444" },
    estados: { programado: "#06b6d4", en_ejecucion: "#f97316", implementado: "#14b8a6", cancelado: "#94a3b8" },
    riesgos: { bajo: "#10b981", medio: "#f59e0b", alto: "#f97316", critico: "#dc2626" }
  };
  const capas = config.capas_visibles_defecto || {
    rfcs_programadas: true,
    ventanas_mantenimiento: true,
    periodos_congelamiento: true,
    feriados: true,
    reuniones_cab: true
  };
  const camposTooltip = config.campos_tooltip_tarjeta || {
    codigo_rfc: true,
    titulo: true,
    tipo_cambio: true,
    estado: true,
    nivel_riesgo: true,
    horario_ventana: true,
    implementador: true,
    servicios_afectados: true
  };
  const exportacionIcs = config.exportacion_ics || {
    permitir_suscripcion: true,
    caducidad_token_dias: 90,
    capas_incluidas: ["rfcs_programadas", "ventanas_mantenimiento", "periodos_congelamiento"]
  };

  const actualizarCampo = (campo: string, valor: any) => {
    onChange({ ...config, [campo]: valor });
  };

  const actualizarColor = (categoria: string, clave: string, valor: string) => {
    onChange({
      ...config,
      paleta_colores: {
        ...paleta,
        [categoria]: {
          ...paleta[categoria],
          [clave]: valor
        }
      }
    });
  };

  const toggleCapa = (capa: string) => {
    onChange({
      ...config,
      capas_visibles_defecto: {
        ...capas,
        [capa]: !capas[capa]
      }
    });
  };

  const toggleCampoTooltip = (campo: string) => {
    onChange({
      ...config,
      campos_tooltip_tarjeta: {
        ...camposTooltip,
        [campo]: !camposTooltip[campo]
      }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Cabecera con botón de vista previa */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} color="#2563eb" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
              Presentación del Calendario Operativo (5.1.2)
            </h3>
          </div>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>
            Configuración de visualización, paletas cromáticas, capas interactivas y suscripciones ICS para el calendario institucional de cambios.
          </p>
        </div>
        <button
          onClick={() => setModalPreviaAbierto(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "#2563eb", color: "#ffffff", border: "none", borderRadius: 6, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
        >
          <Eye size={14} /> Vista Previa del Calendario
        </button>
      </div>

      {/* Bloque 1: Criterio de Color y Paletas */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
          Criterio de Codificación por Colores
        </h4>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#475569", marginBottom: 6 }}>
            Criterio principal para colorear las tarjetas de RFC en el calendario:
          </label>
          <div style={{ display: "flex", gap: 24, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="criterio_color"
                value="tipo_cambio"
                checked={criterioColor === "tipo_cambio"}
                onChange={(e) => actualizarCampo("criterio_color", e.target.value)}
              />
              <span>Por Tipo de Cambio (Estándar / Normal / Emergencia)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="criterio_color"
                value="estado"
                checked={criterioColor === "estado"}
                onChange={(e) => actualizarCampo("criterio_color", e.target.value)}
              />
              <span>Por Estado del Ciclo de Vida</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input
                type="radio"
                name="criterio_color"
                value="nivel_riesgo"
                checked={criterioColor === "nivel_riesgo"}
                onChange={(e) => actualizarCampo("criterio_color", e.target.value)}
              />
              <span>Por Nivel de Riesgo (Bajo / Medio / Alto / Crítico)</span>
            </label>
          </div>
        </div>

        {/* Paletas editables */}
        <div style={{ background: "#f8fafc", padding: 14, borderRadius: 6, border: "1px solid #e2e8f0" }}>
          {criterioColor === "tipo_cambio" && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 8 }}>Paleta por Tipo de Cambio:</div>
              <div style={{ display: "flex", gap: 20 }}>
                {Object.keys(paleta.tipos || {}).map((k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, textTransform: "capitalize" }}>
                    <span>{k}:</span>
                    <input
                      type="color"
                      value={paleta.tipos[k]}
                      onChange={(e) => actualizarColor("tipos", k, e.target.value)}
                      style={{ width: 28, height: 28, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {criterioColor === "estado" && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 8 }}>Paleta por Estado de Cambio:</div>
              <div style={{ display: "flex", gap: 20 }}>
                {Object.keys(paleta.estados || {}).map((k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, textTransform: "capitalize" }}>
                    <span>{k.replace(/_/g, " ")}:</span>
                    <input
                      type="color"
                      value={paleta.estados[k]}
                      onChange={(e) => actualizarColor("estados", k, e.target.value)}
                      style={{ width: 28, height: 28, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {criterioColor === "nivel_riesgo" && (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 8 }}>Paleta por Nivel de Riesgo:</div>
              <div style={{ display: "flex", gap: 20 }}>
                {Object.keys(paleta.riesgos || {}).map((k) => (
                  <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, textTransform: "capitalize" }}>
                    <span>{k}:</span>
                    <input
                      type="color"
                      value={paleta.riesgos[k]}
                      onChange={(e) => actualizarColor("riesgos", k, e.target.value)}
                      style={{ width: 28, height: 28, border: "1px solid #cbd5e1", borderRadius: 4, cursor: "pointer" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bloque 2: Capas y Vistas por Defecto */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Capas visibles */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
            Capas Visibles por Defecto
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={!!capas.rfcs_programadas} onChange={() => toggleCapa("rfcs_programadas")} />
              <span>RFCs Programadas y En Ejecución</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={!!capas.ventanas_mantenimiento} onChange={() => toggleCapa("ventanas_mantenimiento")} />
              <span>Ventanas de Mantenimiento Autorizadas</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={!!capas.periodos_congelamiento} onChange={() => toggleCapa("periodos_congelamiento")} />
              <span>Períodos de Congelamiento Institucional</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={!!capas.feriados} onChange={() => toggleCapa("feriados")} />
              <span>Días Feriados y No Laborables</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={!!capas.reuniones_cab} onChange={() => toggleCapa("reuniones_cab")} />
              <span>Sesiones y Reuniones Ordinarias del CAB</span>
            </label>
          </div>
        </div>

        {/* Vistas y disposición */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
            Disposición y Vista Predeterminada
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
            <div>
              <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Vista predeterminada al ingresar:</label>
              <select
                value={config.vista_por_defecto || "mes"}
                onChange={(e) => actualizarCampo("vista_por_defecto", e.target.value)}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
              >
                <option value="mes">Mes completo (Matriz)</option>
                <option value="semana">Semana (Horas)</option>
                <option value="dia">Día (Detalle horario)</option>
                <option value="agenda">Agenda (Lista cronológica)</option>
                <option value="linea_tiempo_servicio">Línea de tiempo por servicio</option>
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Primer día de la semana:</label>
                <select
                  value={config.primer_dia_semana !== undefined ? config.primer_dia_semana : 1}
                  onChange={(e) => actualizarCampo("primer_dia_semana", parseInt(e.target.value, 10))}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value={1}>Lunes</option>
                  <option value={0}>Domingo</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Densidad de visualización:</label>
                <select
                  value={config.densidad || "comoda"}
                  onChange={(e) => actualizarCampo("densidad", e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="comoda">Cómoda (Detallada)</option>
                  <option value="compacta">Compacta (Más eventos)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque 3: Datos de Tarjeta y Exportación ICS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Contenido de la Tarjeta y Tooltip */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
            Campos Visibles en Tarjeta y Tooltip
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            {Object.keys(camposTooltip).map((k) => (
              <label key={k} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={!!camposTooltip[k]} onChange={() => toggleCampoTooltip(k)} />
                <span style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Suscripción iCalendar / ICS */}
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: 15, fontWeight: 600, color: "#0f172a" }}>
            Suscripción y Exportación Externa ICS
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={!!exportacionIcs.permitir_suscripcion}
                onChange={(e) => actualizarCampo("exportacion_ics", { ...exportacionIcs, permitir_suscripcion: e.target.checked })}
              />
              <span>Permitir suscripción externa vía enlace con token (Outlook / Google Calendar)</span>
            </label>
            <div>
              <label style={{ display: "block", color: "#475569", marginBottom: 4 }}>Caducidad del token de suscripción (días):</label>
              <input
                type="number"
                min={30}
                max={365}
                value={exportacionIcs.caducidad_token_dias || 90}
                onChange={(e) => actualizarCampo("exportacion_ics", { ...exportacionIcs, caducidad_token_dias: parseInt(e.target.value, 10) || 90 })}
                style={{ width: 140, padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
              />
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>
              Zona horaria base del sistema: <strong>{config.zona_horaria || "America/Lima (-05:00)"}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Vista Previa del Calendario */}
      {modalPreviaAbierto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 880, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Eye size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Vista Previa de Calendario con Configuración Activa</h3>
              </div>
              <button onClick={() => setModalPreviaAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {/* Simulación visual de mes */}
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "10px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: 600, fontSize: 14, color: "#1e293b" }}>
                <span>Octubre 2026</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Criterio de color: {criterioColor}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "#ffffff" }}>
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d, i) => (
                  <div key={i} style={{ padding: "8px 4px", textAlign: "center", background: "#f1f5f9", fontWeight: 600, fontSize: 12, color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
                    {d}
                  </div>
                ))}
                {/* Días simulados */}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => {
                  const tieneRFC = dia === 8 || dia === 15 || dia === 22;
                  const tieneCongelamiento = dia >= 20 && dia <= 25;
                  const tieneFeriado = dia === 8;

                  return (
                    <div
                      key={dia}
                      style={{
                        minHeight: 70,
                        borderRight: "1px solid #f1f5f9",
                        borderBottom: "1px solid #f1f5f9",
                        padding: 4,
                        background: tieneCongelamiento ? "#fef2f2" : "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        gap: 2
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, color: tieneCongelamiento ? "#b91c1c" : "#64748b" }}>
                        {dia}
                      </div>
                      {tieneFeriado && capas.feriados && (
                        <div style={{ background: "#fef3c7", color: "#92400e", fontSize: 9, padding: "1px 3px", borderRadius: 2 }}>
                          Combate Angamos
                        </div>
                      )}
                      {tieneCongelamiento && dia === 20 && capas.periodos_congelamiento && (
                        <div style={{ background: "#dc2626", color: "#ffffff", fontSize: 9, padding: "1px 3px", borderRadius: 2, fontWeight: 600 }}>
                          Congelamiento
                        </div>
                      )}
                      {tieneRFC && capas.rfcs_programadas && (
                        <div style={{
                          background: criterioColor === "tipo_cambio" ? paleta.tipos?.normal || "#3b82f6" : "#06b6d4",
                          color: "#ffffff",
                          fontSize: 9,
                          padding: "2px 4px",
                          borderRadius: 3,
                          marginTop: "auto"
                        }}>
                          RFC-00014{dia}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setModalPreviaAbierto(false)}
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
