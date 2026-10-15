"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, CheckSquare, Layers, CheckCircle2, AlertTriangle, ArrowRight } from "./Iconos";

interface TareaCatalogo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  fase: "pre_implementacion" | "implementacion" | "validacion" | "post_implementacion";
  tipo: string;
  responsable_tipo: string;
  duracion_estimada_minutos: number;
  offset_horas_ventana: number;
  obligatoria: boolean;
  bloquea_transicion?: string | null;
  checklist_interno?: string[];
  dependencia_tarea_id?: string | null;
  activa: boolean;
}

interface PaqueteTareas {
  id: string;
  nombre: string;
  descripcion: string;
  aplica_cuando: { tipo_cambio: string[] };
  tareas_ids: string[];
  activo: boolean;
}

interface ItemGoNoGo {
  id: string;
  texto: string;
  obligatorio: boolean;
  responsable_rol: string;
  evidencia_requerida: boolean;
  tipos_aplicables: string[];
  orden: number;
}

interface TareasChecklistsConfig {
  catalogo_tareas?: TareaCatalogo[];
  paquetes_tareas?: PaqueteTareas[];
  checklist_go_no_go?: ItemGoNoGo[];
  conversion_plan_a_tareas?: {
    convertir_pasos_en_tareas: boolean;
    fase_por_defecto: string;
  };
}

interface PestanaTareasChecklistsProps {
  snapshot: TareasChecklistsConfig;
  onChange: (nuevoSnapshot: TareasChecklistsConfig) => void;
  disabled?: boolean;
}

const FASES_CATALOGO = [
  { id: "pre_implementacion", label: "Pre-implementación" },
  { id: "implementacion", label: "Implementación" },
  { id: "validacion", label: "Validación" },
  { id: "post_implementacion", label: "Post-implementación" }
];

export const PestanaTareasChecklists: React.FC<PestanaTareasChecklistsProps> = ({ snapshot, onChange, disabled }) => {
  const catalogo: TareaCatalogo[] = snapshot?.catalogo_tareas || [];
  const paquetes: PaqueteTareas[] = snapshot?.paquetes_tareas || [];
  const goNoGo: ItemGoNoGo[] = snapshot?.checklist_go_no_go || [];
  const conversion = snapshot?.conversion_plan_a_tareas || {
    convertir_pasos_en_tareas: true,
    fase_por_defecto: "implementacion"
  };

  const [seccionActiva, setSeccionActiva] = useState<"catalogo" | "paquetes" | "gonogo" | "conversion">("catalogo");

  // Modales
  const [modalTareaAbierto, setModalTareaAbierto] = useState(false);
  const [tareaEnEdicion, setTareaEnEdicion] = useState<Partial<TareaCatalogo>>({});

  const [modalItemGngAbierto, setModalItemGngAbierto] = useState(false);
  const [itemGngEnEdicion, setItemGngEnEdicion] = useState<Partial<ItemGoNoGo>>({});

  const abrirModalCrearTarea = () => {
    setTareaEnEdicion({
      id: "tar_" + Date.now(),
      codigo: "tarea_personalizada",
      nombre: "Nueva tarea técnica",
      descripcion: "",
      fase: "implementacion",
      tipo: "ejecucion",
      responsable_tipo: "implementador",
      duracion_estimada_minutos: 60,
      offset_horas_ventana: 0,
      obligatoria: true,
      bloquea_transicion: null,
      checklist_interno: [],
      dependencia_tarea_id: null,
      activa: true
    });
    setModalTareaAbierto(true);
  };

  const handleGuardarTarea = () => {
    if (!tareaEnEdicion.nombre?.trim()) return;
    const existe = catalogo.some(t => t.id === tareaEnEdicion.id);
    let nuevos = existe 
      ? catalogo.map(t => t.id === tareaEnEdicion.id ? (tareaEnEdicion as TareaCatalogo) : t)
      : [...catalogo, tareaEnEdicion as TareaCatalogo];
    
    onChange({ ...snapshot, catalogo_tareas: nuevos });
    setModalTareaAbierto(false);
  };

  const handleEliminarTarea = (id: string) => {
    if (confirm("¿Confirma eliminar esta tarea del catálogo?")) {
      onChange({ ...snapshot, catalogo_tareas: catalogo.filter(t => t.id !== id) });
    }
  };

  const abrirModalCrearGng = () => {
    setItemGngEnEdicion({
      id: "gng_" + Date.now(),
      texto: "Nuevo ítem de verificación Go/No-Go",
      obligatorio: true,
      responsable_rol: "implementador",
      evidencia_requerida: false,
      tipos_aplicables: ["normal", "emergencia"],
      orden: goNoGo.length + 1
    });
    setModalItemGngAbierto(true);
  };

  const handleGuardarGng = () => {
    if (!itemGngEnEdicion.texto?.trim()) return;
    const existe = goNoGo.some(i => i.id === itemGngEnEdicion.id);
    let nuevos = existe
      ? goNoGo.map(i => i.id === itemGngEnEdicion.id ? (itemGngEnEdicion as ItemGoNoGo) : i)
      : [...goNoGo, itemGngEnEdicion as ItemGoNoGo];

    onChange({ ...snapshot, checklist_go_no_go: nuevos });
    setModalItemGngAbierto(false);
  };

  const handleEliminarGng = (id: string) => {
    if (confirm("¿Confirma eliminar este ítem Go/No-Go?")) {
      onChange({ ...snapshot, checklist_go_no_go: goNoGo.filter(i => i.id !== id) });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            1.3.3.3.6 Tareas Técnicas, Paquetes y Checklist Go/No-Go
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Estandarización de actividades operativas por fase, paquetes predeterminados y barrera de control previo a la ejecución.
          </p>
        </div>

        {seccionActiva === "catalogo" && (
          <button
            onClick={abrirModalCrearTarea}
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
            Nueva Tarea
          </button>
        )}

        {seccionActiva === "gonogo" && (
          <button
            onClick={abrirModalCrearGng}
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
            Nuevo Ítem Go/No-Go
          </button>
        )}
      </div>

      {/* Switcher de secciones */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
        <button
          onClick={() => setSeccionActiva("catalogo")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "catalogo" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "catalogo" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "catalogo" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Sección A: Catálogo de Tareas ({catalogo.length})
        </button>

        <button
          onClick={() => setSeccionActiva("paquetes")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "paquetes" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "paquetes" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "paquetes" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Sección B: Paquetes de Tareas ({paquetes.length})
        </button>

        <button
          onClick={() => setSeccionActiva("gonogo")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "gonogo" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "gonogo" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "gonogo" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Sección C: Checklist Go/No-Go ({goNoGo.length})
        </button>

        <button
          onClick={() => setSeccionActiva("conversion")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "conversion" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "conversion" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "conversion" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Sección D: Conversión de Planes
        </button>
      </div>

      {/* SECCIÓN A: CATÁLOGO DE TAREAS */}
      {seccionActiva === "catalogo" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 12px" }}>Tarea / Código</th>
                <th style={{ padding: "10px 12px" }}>Fase del Ciclo</th>
                <th style={{ padding: "10px 12px" }}>Responsable</th>
                <th style={{ padding: "10px 12px" }}>Duración Est.</th>
                <th style={{ padding: "10px 12px" }}>Offset Ventana</th>
                <th style={{ padding: "10px 12px" }}>Obligatoria</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {catalogo.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ fontWeight: 600, color: "#1e293b" }}>{t.nombre}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>{t.codigo}</div>
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      padding: "3px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor: t.fase === "pre_implementacion" ? "#e0e7ff" : t.fase === "implementacion" ? "#ffedd5" : t.fase === "validacion" ? "#fef3c7" : "#dcfce7",
                      color: t.fase === "pre_implementacion" ? "#3730a3" : t.fase === "implementacion" ? "#c2410c" : t.fase === "validacion" ? "#92400e" : "#166534"
                    }}>
                      {FASES_CATALOGO.find(f => f.id === t.fase)?.label || t.fase}
                    </span>
                  </td>

                  <td style={{ padding: "10px 12px", color: "#334155", textTransform: "capitalize" }}>
                    {t.responsable_tipo}
                  </td>

                  <td style={{ padding: "10px 12px", color: "#475569" }}>
                    {t.duracion_estimada_minutos} min
                  </td>

                  <td style={{ padding: "10px 12px", color: "#475569" }}>
                    {t.offset_horas_ventana >= 0 ? `+${t.offset_horas_ventana}h` : `${t.offset_horas_ventana}h`}
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    {t.obligatoria ? (
                      <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "0.75rem" }}>Sí (Bloquea)</span>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Opcional</span>
                    )}
                  </td>

                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => { setTareaEnEdicion({ ...t }); setModalTareaAbierto(true); }}
                        disabled={disabled}
                        style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleEliminarTarea(t.id)}
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
      )}

      {/* SECCIÓN B: PAQUETES DE TAREAS */}
      {seccionActiva === "paquetes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {paquetes.map(p => (
            <div key={p.id} style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div>
                  <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>{p.nombre}</h4>
                  <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "2px 0 0 0" }}>{p.descripcion}</p>
                </div>

                <span style={{ fontSize: "0.75rem", padding: "2px 8px", borderRadius: "4px", backgroundColor: "#f1f5f9", color: "#475569" }}>
                  Aplica a: {p.aplica_cuando?.tipo_cambio?.join(", ")}
                </span>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
                {p.tareas_ids.map((tid, idx) => {
                  const tDef = catalogo.find(t => t.id === tid);
                  return (
                    <span key={idx} style={{ padding: "4px 10px", borderRadius: "4px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", fontSize: "0.75rem", color: "#334155" }}>
                      {idx + 1}. {tDef?.nombre || tid}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SECCIÓN C: CHECKLIST GO/NO-GO */}
      {seccionActiva === "gonogo" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 0, marginBottom: "14px" }}>
            El resultado <strong>Go</strong> autoriza el paso a 'En ejecución' solo si todos los ítems obligatorios están marcados y firmados. En caso de <strong>No-Go</strong>, se devuelve la RFC a 'Autorizado' para su reprogramación.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "8px 12px", width: "40px" }}>#</th>
                <th style={{ padding: "8px 12px" }}>Ítem de Validación Go / No-Go</th>
                <th style={{ padding: "8px 12px" }}>Responsable</th>
                <th style={{ padding: "8px 12px" }}>Evidencia Adjunta</th>
                <th style={{ padding: "8px 12px" }}>Obligatorio</th>
                <th style={{ padding: "8px 12px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {goNoGo.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 500, color: "#1e293b" }}>{item.texto}</td>
                  <td style={{ padding: "8px 12px", color: "#475569", textTransform: "capitalize" }}>{item.responsable_rol}</td>
                  <td style={{ padding: "8px 12px" }}>
                    {item.evidencia_requerida ? (
                      <span style={{ color: "#d97706", fontWeight: 600, fontSize: "0.75rem" }}>Exigida</span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>No</span>
                    )}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {item.obligatorio ? (
                      <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.75rem" }}>Bloqueante Go</span>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "0.75rem" }}>Recomendado</span>
                    )}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => { setItemGngEnEdicion({ ...item }); setModalItemGngAbierto(true); }}
                        disabled={disabled}
                        style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleEliminarGng(item.id)}
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
      )}

      {/* SECCIÓN D: CONVERSIÓN DE PLANES */}
      {seccionActiva === "conversion" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
            Conversión Automática del Plan de Implementación en Tareas
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={conversion.convertir_pasos_en_tareas}
                onChange={e => onChange({
                  ...snapshot,
                  conversion_plan_a_tareas: { ...conversion, convertir_pasos_en_tareas: e.target.checked }
                })}
                disabled={disabled}
              />
              <strong>Convertir los pasos del plan de implementación en tareas técnicas</strong> de forma automática al transicionar a 'Programado'.
            </label>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Fase por Defecto de las Tareas Generadas
              </label>
              <select
                value={conversion.fase_por_defecto}
                onChange={e => onChange({
                  ...snapshot,
                  conversion_plan_a_tareas: { ...conversion, fase_por_defecto: e.target.value }
                })}
                disabled={disabled}
                style={{ width: "250px", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
              >
                {FASES_CATALOGO.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAREA */}
      {modalTareaAbierto && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", width: "100%", maxWidth: "550px", padding: "20px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px 0" }}>Tarea del Catálogo</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Nombre de la Tarea *</label>
                <input
                  type="text"
                  value={tareaEnEdicion.nombre || ""}
                  onChange={e => setTareaEnEdicion({ ...tareaEnEdicion, nombre: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Fase</label>
                  <select
                    value={tareaEnEdicion.fase}
                    onChange={e => setTareaEnEdicion({ ...tareaEnEdicion, fase: e.target.value as any })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                  >
                    {FASES_CATALOGO.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Duración (minutos)</label>
                  <input
                    type="number"
                    value={tareaEnEdicion.duracion_estimada_minutos}
                    onChange={e => setTareaEnEdicion({ ...tareaEnEdicion, duracion_estimada_minutos: Number(e.target.value) })}
                    style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={tareaEnEdicion.obligatoria ?? true}
                    onChange={e => setTareaEnEdicion({ ...tareaEnEdicion, obligatoria: e.target.checked })}
                  />
                  Tarea obligatoria (bloquea avance)
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setModalTareaAbierto(false)} style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                Cancelar
              </button>
              <button onClick={handleGuardarTarea} style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ÍTEM GO/NO-GO */}
      {modalItemGngAbierto && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", width: "100%", maxWidth: "500px", padding: "20px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px 0" }}>Ítem de Validación Go / No-Go</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Texto del Requisito *</label>
                <input
                  type="text"
                  value={itemGngEnEdicion.texto || ""}
                  onChange={e => setItemGngEnEdicion({ ...itemGngEnEdicion, texto: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={itemGngEnEdicion.obligatorio ?? true}
                    onChange={e => setItemGngEnEdicion({ ...itemGngEnEdicion, obligatorio: e.target.checked })}
                  />
                  Requisito obligatorio (bloquea veredicto Go)
                </label>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={itemGngEnEdicion.evidencia_requerida ?? false}
                    onChange={e => setItemGngEnEdicion({ ...itemGngEnEdicion, evidencia_requerida: e.target.checked })}
                  />
                  Exige comprobante o evidencia adjunta
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setModalItemGngAbierto(false)} style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                Cancelar
              </button>
              <button onClick={handleGuardarGng} style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
