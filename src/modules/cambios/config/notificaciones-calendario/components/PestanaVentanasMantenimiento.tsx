"use client";

import React, { useState } from "react";
import { Plus, Edit2, Copy, Trash2, Calendar, Clock, Eye, AlertCircle, X, Check } from "@/shared/components/ui/Iconos";

interface PestanaVentanasMantenimientoProps {
  config: any;
  onChange: (nuevoConfig: any) => void;
  servicios: any[];
  departamentos: any[];
}

const DIAS_SEMANA_MAP = [
  { id: 1, label: "Lunes" },
  { id: 2, label: "Martes" },
  { id: 3, label: "Miércoles" },
  { id: 4, label: "Jueves" },
  { id: 5, label: "Viernes" },
  { id: 6, label: "Sábado" },
  { id: 0, label: "Domingo" }
];

export function PestanaVentanasMantenimiento({ config, onChange, servicios, departamentos }: PestanaVentanasMantenimientoProps) {
  const [ventanaEditando, setVentanaEditando] = useState<any | null>(null);
  const [esNueva, setEsNueva] = useState(false);
  const [modalPreviaAbierto, setModalPreviaAbierto] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const ventanas: any[] = config.ventanas || [];

  const abrirEditor = (v?: any) => {
    setErrorValidacion(null);
    if (v) {
      setVentanaEditando({ ...v });
      setEsNueva(false);
    } else {
      setVentanaEditando({
        id: Date.now(),
        codigo: `VENT-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        nombre: "",
        descripcion: "",
        recurrencia: "semanal",
        dias_semana: [1, 2, 3, 4],
        regla_mensual: {},
        hora_inicio: "22:00:00",
        hora_fin: "05:00:00",
        cruce_medianoche: true,
        fecha_vigencia_desde: null,
        fecha_vigencia_hasta: null,
        excepciones_fechas: [],
        alcance_tipo: "toda_la_organizacion",
        id_servicios: [],
        clases_ci: [],
        entornos: ["produccion"],
        id_departamentos: [],
        tipos_cambio_permitidos: ["estandar", "normal"],
        capacidad_simultanea: 3,
        capacidad_acumulada: 12,
        permite_interrupcion: false,
        permite_en_feriados: false,
        color: "#2563eb",
        activo: true
      });
      setEsNueva(true);
    }
  };

  const guardarVentana = () => {
    if (!ventanaEditando.nombre.trim()) {
      setErrorValidacion("El nombre de la ventana es obligatorio");
      return;
    }
    if (!ventanaEditando.codigo.trim()) {
      setErrorValidacion("El código de la ventana es obligatorio");
      return;
    }
    if (ventanaEditando.hora_inicio === ventanaEditando.hora_fin) {
      setErrorValidacion("La hora de inicio y fin no pueden ser idénticas");
      return;
    }

    let nuevasVentanas: any[];
    if (esNueva) {
      nuevasVentanas = [...ventanas, ventanaEditando];
    } else {
      nuevasVentanas = ventanas.map((v: any) => v.codigo === ventanaEditando.codigo ? ventanaEditando : v);
    }

    onChange({ ...config, ventanas: nuevasVentanas });
    setVentanaEditando(null);
  };

  const duplicarVentana = (v: any) => {
    const copia = {
      ...v,
      id: Date.now(),
      codigo: `${v.codigo}-COP`,
      nombre: `${v.nombre} (Copia)`,
      activo: false
    };
    onChange({ ...config, ventanas: [...ventanas, copia] });
  };

  const toggleActiva = (codigo: string) => {
    const nuevas = ventanas.map((v: any) => v.codigo === codigo ? { ...v, activo: !v.activo } : v);
    onChange({ ...config, ventanas: nuevas });
  };

  const eliminarVentana = (codigo: string) => {
    if (confirm("¿Está seguro de eliminar esta ventana de mantenimiento?")) {
      const nuevas = ventanas.filter((v: any) => v.codigo !== codigo);
      onChange({ ...config, ventanas: nuevas });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Barra de cabecera con botón de nueva ventana y vista previa */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "14px 18px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#1e293b" }}>
            Ventanas de Mantenimiento Autorizadas
          </h3>
          <p style={{ margin: "2px 0 0 0", fontSize: 13, color: "#64748b" }}>
            Horarios aprobados por gobernanza para la ejecución de cambios. Las intervenciones fuera de estas ventanas generan advertencia o exigen aprobación de excepción.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setModalPreviaAbierto(true)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 13, fontWeight: 500, color: "#334155", cursor: "pointer" }}
          >
            <Eye size={15} /> Vista Previa en Calendario
          </button>
          <button
            onClick={() => abrirEditor()}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "#2563eb", border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600, color: "#ffffff", cursor: "pointer" }}
          >
            <Plus size={15} /> Nueva Ventana
          </button>
        </div>
      </div>

      {/* Tabla de Ventanas */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, textAlign: "left" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <tr>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Nombre y Código</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Recurrencia</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Horario (Lima -05:00)</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Alcance</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Tipos Permitidos</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569" }}>Capacidad</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "center" }}>Activa</th>
              <th style={{ padding: "10px 14px", fontWeight: 600, color: "#475569", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventanas.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 30, textAlign: "center", color: "#64748b" }}>
                  No hay ventanas de mantenimiento configuradas. Cree una nueva para comenzar.
                </td>
              </tr>
            ) : (
              ventanas.map((v: any, idx: number) => (
                <tr key={v.codigo || idx} style={{ borderBottom: "1px solid #f1f5f9", background: idx % 2 === 0 ? "#ffffff" : "#fbfcfe" }}>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: v.color || "#2563eb", flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: "#1e293b" }}>{v.nombre}</div>
                        <div style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>{v.codigo}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span style={{ background: "#f1f5f9", color: "#334155", padding: "2px 8px", borderRadius: 4, fontWeight: 500, textTransform: "capitalize" }}>
                      {v.recurrencia}
                    </span>
                    {v.recurrencia === "semanal" && Array.isArray(v.dias_semana) && (
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>
                        {v.dias_semana.map((d: number) => DIAS_SEMANA_MAP.find(x => x.id === d)?.label.substring(0, 3)).join(", ")}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 500, color: "#0f172a" }}>
                      <Clock size={13} color="#64748b" />
                      <span>{v.hora_inicio?.substring(0, 5)} - {v.hora_fin?.substring(0, 5)}</span>
                    </div>
                    {v.cruce_medianoche && (
                      <span style={{ fontSize: 11, color: "#d97706" }}>Cruce de medianoche (+1 día)</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", textTransform: "capitalize", color: "#475569" }}>
                    {v.alcance_tipo?.replace(/_/g, " ")}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(v.tipos_cambio_permitidos || []).map((t: string) => (
                        <span key={t} style={{ background: "#eff6ff", color: "#1d4ed8", padding: "1px 6px", borderRadius: 4, fontSize: 11, textTransform: "capitalize" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#334155" }}>
                    <div>Simultáneos: <strong>{v.capacidad_simultanea}</strong></div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>Acumulado: {v.capacidad_acumulada}</div>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "center" }}>
                    <button
                      onClick={() => toggleActiva(v.codigo)}
                      style={{
                        background: v.activo ? "#10b981" : "#cbd5e1",
                        border: "none",
                        color: "#ffffff",
                        borderRadius: 12,
                        width: 36,
                        height: 20,
                        cursor: "pointer",
                        position: "relative"
                      }}
                      title={v.activo ? "Desactivar ventana" : "Activar ventana"}
                    >
                      <div style={{
                        position: "absolute",
                        top: 2,
                        left: v.activo ? 18 : 2,
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: "#ffffff",
                        transition: "left 0.2s"
                      }} />
                    </button>
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                      <button
                        onClick={() => abrirEditor(v)}
                        style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                      >
                        <Edit2 size={12} /> Editar
                      </button>
                      <button
                        onClick={() => duplicarVentana(v)}
                        style={{ background: "#f8fafc", border: "1px solid #cbd5e1", color: "#475569", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                        title="Duplicar ventana"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => eliminarVentana(v.codigo)}
                        style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "4px 8px", borderRadius: 4, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
                        title="Eliminar ventana"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Editor de Ventana */}
      {ventanaEditando && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 700, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>
                {esNueva ? "Nueva Ventana de Mantenimiento" : `Editar: ${ventanaEditando.nombre}`}
              </h3>
              <button onClick={() => setVentanaEditando(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            {errorValidacion && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "8px 12px", borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
                <AlertCircle size={16} />
                <span>{errorValidacion}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Nombre de la Ventana *</label>
                  <input
                    type="text"
                    value={ventanaEditando.nombre}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, nombre: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                    placeholder="Ej: Fin de semana extendido"
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Código *</label>
                  <input
                    type="text"
                    value={ventanaEditando.codigo}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, codigo: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6, fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Descripción</label>
                <textarea
                  rows={2}
                  value={ventanaEditando.descripcion || ""}
                  onChange={(e) => setVentanaEditando({ ...ventanaEditando, descripcion: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Recurrencia</label>
                  <select
                    value={ventanaEditando.recurrencia}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, recurrencia: e.target.value })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  >
                    <option value="unica">Única (fecha puntual)</option>
                    <option value="diaria">Diaria</option>
                    <option value="semanal">Semanal (días de semana)</option>
                    <option value="mensual">Mensual</option>
                    <option value="anual">Anual</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Hora Inicio</label>
                  <input
                    type="time"
                    value={ventanaEditando.hora_inicio?.substring(0, 5)}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, hora_inicio: `${e.target.value}:00` })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Hora Fin</label>
                  <input
                    type="time"
                    value={ventanaEditando.hora_fin?.substring(0, 5)}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, hora_fin: `${e.target.value}:00` })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
              </div>

              {ventanaEditando.recurrencia === "semanal" && (
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 6 }}>Días de la Semana</label>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {DIAS_SEMANA_MAP.map((dia) => (
                      <label key={dia.id} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={(ventanaEditando.dias_semana || []).includes(dia.id)}
                          onChange={(e) => {
                            const actual = ventanaEditando.dias_semana || [];
                            const nuevos = e.target.checked ? [...actual, dia.id] : actual.filter((x: number) => x !== dia.id);
                            setVentanaEditando({ ...ventanaEditando, dias_semana: nuevos });
                          }}
                        />
                        {dia.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Capacidad Simultánea</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={ventanaEditando.capacidad_simultanea}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, capacidad_simultanea: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Capacidad Acumulada</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={ventanaEditando.capacidad_acumulada}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, capacidad_acumulada: parseInt(e.target.value, 10) || 1 })}
                    style={{ width: "100%", padding: "8px 10px", border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 4 }}>Color en Calendario</label>
                  <input
                    type="color"
                    value={ventanaEditando.color || "#2563eb"}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, color: e.target.value })}
                    style={{ width: "100%", height: 38, padding: 2, border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontWeight: 600, color: "#334155", marginBottom: 6 }}>Tipos de Cambio Permitidos</label>
                <div style={{ display: "flex", gap: 16 }}>
                  {["estandar", "normal", "emergencia"].map((t) => (
                    <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, textTransform: "capitalize", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={(ventanaEditando.tipos_cambio_permitidos || []).includes(t)}
                        onChange={(e) => {
                          const actual = ventanaEditando.tipos_cambio_permitidos || [];
                          const nuevos = e.target.checked ? [...actual, t] : actual.filter((x: string) => x !== t);
                          setVentanaEditando({ ...ventanaEditando, tipos_cambio_permitidos: nuevos });
                        }}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 24, background: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!ventanaEditando.cruce_medianoche}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, cruce_medianoche: e.target.checked })}
                  />
                  <span>Soporta cruce de medianoche</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!ventanaEditando.permite_interrupcion}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, permite_interrupcion: e.target.checked })}
                  />
                  <span>¿Permite interrupción del servicio?</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!ventanaEditando.permite_en_feriados}
                    onChange={(e) => setVentanaEditando({ ...ventanaEditando, permite_en_feriados: e.target.checked })}
                  />
                  <span>¿Permite ejecución en feriados?</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24, borderTop: "1px solid #e2e8f0", paddingTop: 16 }}>
              <button
                onClick={() => setVentanaEditando(null)}
                style={{ padding: "8px 16px", border: "1px solid #cbd5e1", background: "#ffffff", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
              >
                Cancelar
              </button>
              <button
                onClick={guardarVentana}
                style={{ padding: "8px 16px", border: "none", background: "#2563eb", color: "#ffffff", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
              >
                Guardar Ventana
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Vista Previa de Ventanas en Calendario */}
      {modalPreviaAbierto && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#ffffff", borderRadius: 8, padding: 24, width: 800, maxWidth: "90vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: 17, color: "#0f172a" }}>Vista Semanal de Ventanas de Mantenimiento</h3>
              </div>
              <button onClick={() => setModalPreviaAbierto(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, minHeight: 280, background: "#f8fafc", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}>
              {DIAS_SEMANA_MAP.map((dia) => {
                const ventanasDelDia = ventanas.filter((v: any) => {
                  if (v.recurrencia === "diaria") return true;
                  if (v.recurrencia === "semanal" && Array.isArray(v.dias_semana)) return v.dias_semana.includes(dia.id);
                  return false;
                });

                return (
                  <div key={dia.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 6, padding: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 4 }}>
                      {dia.label}
                    </div>
                    {ventanasDelDia.length === 0 ? (
                      <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", marginTop: 8 }}>Sin ventanas</div>
                    ) : (
                      ventanasDelDia.map((v: any) => (
                        <div
                          key={v.codigo}
                          style={{
                            background: `${v.color || "#2563eb"}15`,
                            borderLeft: `3px solid ${v.color || "#2563eb"}`,
                            padding: "4px 6px",
                            borderRadius: 4,
                            fontSize: 11,
                            color: "#1e293b"
                          }}
                        >
                          <div style={{ fontWeight: 600 }}>{v.nombre}</div>
                          <div style={{ color: "#64748b", fontSize: 10 }}>
                            {v.hora_inicio?.substring(0, 5)} - {v.hora_fin?.substring(0, 5)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
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
