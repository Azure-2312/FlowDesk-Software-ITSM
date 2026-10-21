"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, CheckCircle2, Clock, HelpCircle, FileText } from "@/shared/components/ui/Iconos";

interface PreguntaPir {
  id: string;
  orden: number;
  texto: string;
  tipo_respuesta: "booleano" | "lista" | "texto" | "escala";
  opciones?: string[];
  obligatoria: boolean;
  tipos_aplicables: string[];
}

interface ReglaObligatoriedadPir {
  tipo_cambio: string;
  resultado: string;
  riesgo: string;
  obligatoria: boolean;
  muestreo_pct: number;
}

interface PirConfig {
  obligatoriedad_consolidada?: ReglaObligatoriedadPir[];
  parametros?: {
    plazo_completar_dias: number;
    revisor_permitido: string;
    prohibir_implementador_revisor: boolean;
    ventana_observacion_incidentes_horas: number;
    calificaciones_disponibles: string[];
    bloquear_cierre_hasta_completar: boolean;
    habilitar_acciones_mejora: boolean;
  };
  preguntas?: PreguntaPir[];
}

interface PestanaPirProps {
  snapshot: PirConfig;
  onChange: (nuevoSnapshot: PirConfig) => void;
  disabled?: boolean;
}

const TIPOS_RESPUESTA = [
  { id: "booleano", label: "Sí / No (Booleano)" },
  { id: "lista", label: "Lista de Opciones Seleccionables" },
  { id: "texto", label: "Texto Libre Detallado" },
  { id: "escala", label: "Escala Numérica (1 a 5)" }
];

export const PestanaPir: React.FC<PestanaPirProps> = ({ snapshot, onChange, disabled }) => {
  const preguntas: PreguntaPir[] = (snapshot?.preguntas || []).slice().sort((a, b) => a.orden - b.orden);
  const obligatoriedad: ReglaObligatoriedadPir[] = snapshot?.obligatoriedad_consolidada || [];
  const parametros = snapshot?.parametros || {
    plazo_completar_dias: 5,
    revisor_permitido: "gestor_cambios_o_supervisor",
    prohibir_implementador_revisor: true,
    ventana_observacion_incidentes_horas: 72,
    calificaciones_disponibles: ["exitoso", "con_observaciones", "fallido"],
    bloquear_cierre_hasta_completar: true,
    habilitar_acciones_mejora: true
  };

  const [seccionActiva, setSeccionActiva] = useState<"preguntas" | "obligatoriedad" | "parametros">("preguntas");

  // Modales
  const [modalPreguntaAbierto, setModalPreguntaAbierto] = useState(false);
  const [preguntaEnEdicion, setPreguntaEnEdicion] = useState<Partial<PreguntaPir>>({});
  const [modalVistaPreviaAbierto, setModalVistaPreviaAbierto] = useState(false);

  const abrirModalCrearPregunta = () => {
    setPreguntaEnEdicion({
      id: "pir_q_" + Date.now(),
      orden: preguntas.length + 1,
      texto: "¿Pregunta de revisión post-implementación?",
      tipo_respuesta: "texto",
      opciones: [],
      obligatoria: true,
      tipos_aplicables: ["estandar", "normal", "emergencia"]
    });
    setModalPreguntaAbierto(true);
  };

  const abrirModalEditarPregunta = (q: PreguntaPir) => {
    setPreguntaEnEdicion({ ...q });
    setModalPreguntaAbierto(true);
  };

  const handleGuardarPregunta = () => {
    if (!preguntaEnEdicion.texto?.trim()) return;

    const existe = preguntas.some(q => q.id === preguntaEnEdicion.id);
    let nuevas: PreguntaPir[] = [];
    if (existe) {
      nuevas = preguntas.map(q => q.id === preguntaEnEdicion.id ? (preguntaEnEdicion as PreguntaPir) : q);
    } else {
      nuevas = [...preguntas, preguntaEnEdicion as PreguntaPir];
    }

    onChange({ ...snapshot, preguntas: nuevas });
    setModalPreguntaAbierto(false);
  };

  const handleEliminarPregunta = (id: string) => {
    if (confirm("¿Confirma eliminar esta pregunta del formulario PIR?")) {
      onChange({ ...snapshot, preguntas: preguntas.filter(q => q.id !== id) });
    }
  };

  const handleMoverPregunta = (index: number, direccion: "arriba" | "abajo") => {
    if (direccion === "arriba" && index === 0) return;
    if (direccion === "abajo" && index === preguntas.length - 1) return;

    const copia = [...preguntas];
    const target = direccion === "arriba" ? index - 1 : index + 1;
    const temp = copia[index];
    copia[index] = copia[target];
    copia[target] = temp;

    copia.forEach((q, i) => { q.orden = i + 1; });
    onChange({ ...snapshot, preguntas: copia });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            1.3.3.3.8 Revisión Post-Implementación (PIR - Post-Implementation Review)
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Plantilla de evaluación posterior, ventana de observación de incidentes inducidos y matriz de exigencia normativa.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setModalVistaPreviaAbierto(true)}
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
            <Eye size={15} style={{ color: "#2563eb" }} />
            Vista Previa de la PIR
          </button>

          {seccionActiva === "preguntas" && (
            <button
              onClick={abrirModalCrearPregunta}
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
              Agregar Pregunta
            </button>
          )}
        </div>
      </div>

      {/* Switcher de pestañas internas */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px" }}>
        <button
          onClick={() => setSeccionActiva("preguntas")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "preguntas" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "preguntas" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "preguntas" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Cuestionario de Preguntas ({preguntas.length})
        </button>

        <button
          onClick={() => setSeccionActiva("obligatoriedad")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "obligatoriedad" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "obligatoriedad" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "obligatoriedad" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Matriz de Exigencia Normativa
        </button>

        <button
          onClick={() => setSeccionActiva("parametros")}
          style={{
            padding: "6px 14px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: seccionActiva === "parametros" ? "#2563eb" : "#cbd5e1",
            backgroundColor: seccionActiva === "parametros" ? "#eff6ff" : "#ffffff",
            color: seccionActiva === "parametros" ? "#1d4ed8" : "#475569",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer"
          }}
        >
          Parámetros de Observación y Calificación
        </button>
      </div>

      {/* SECCIÓN 1: CUESTIONARIO DE PREGUNTAS */}
      {seccionActiva === "preguntas" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 12px", width: "70px" }}>Orden</th>
                <th style={{ padding: "10px 12px" }}>Pregunta / Dimensión Evaluada</th>
                <th style={{ padding: "10px 12px" }}>Tipo de Respuesta</th>
                <th style={{ padding: "10px 12px" }}>Obligatoria</th>
                <th style={{ padding: "10px 12px" }}>Tipos Aplicables</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.map((q, idx) => (
                <tr key={q.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ fontWeight: 700, color: "#64748b", width: "18px" }}>{q.orden}</span>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <button
                          onClick={() => handleMoverPregunta(idx, "arriba")}
                          disabled={disabled || idx === 0}
                          style={{ background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", padding: 0, opacity: idx === 0 ? 0.3 : 0.8 }}
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          onClick={() => handleMoverPregunta(idx, "abajo")}
                          disabled={disabled || idx === preguntas.length - 1}
                          style={{ background: "none", border: "none", cursor: idx === preguntas.length - 1 ? "default" : "pointer", padding: 0, opacity: idx === preguntas.length - 1 ? 0.3 : 0.8 }}
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px", fontWeight: 500, color: "#1e293b", maxWidth: "350px" }}>
                    {q.texto}
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    <span style={{ padding: "2px 6px", borderRadius: "3px", backgroundColor: "#f1f5f9", color: "#334155", fontSize: "0.75rem" }}>
                      {TIPOS_RESPUESTA.find(t => t.id === q.tipo_respuesta)?.label.split(" (")[0] || q.tipo_respuesta}
                    </span>
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    {q.obligatoria ? (
                      <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "0.75rem" }}>Obligatoria</span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Opcional</span>
                    )}
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(q.tipos_aplicables || []).map(t => (
                        <span key={t} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "3px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", textTransform: "capitalize" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => abrirModalEditarPregunta(q)}
                        disabled={disabled}
                        style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleEliminarPregunta(q.id)}
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

      {/* SECCIÓN 2: MATRIZ DE OBLIGATORIEDAD CONSOLIDADA */}
      {seccionActiva === "obligatoriedad" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px", overflowX: "auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 0, marginBottom: "14px" }}>
            Directriz ITIL 4: Los cambios Normales y de Emergencia exigen revisión PIR al 100%. Para cambios Estándar, se exige PIR solo si el resultado no es exitoso o mediante muestreo probabilístico configurable.
          </p>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "8px 12px" }}>Tipo de Cambio</th>
                <th style={{ padding: "8px 12px" }}>Resultado Obtenido</th>
                <th style={{ padding: "8px 12px" }}>Nivel de Riesgo</th>
                <th style={{ padding: "8px 12px" }}>¿PIR Obligatoria?</th>
                <th style={{ padding: "8px 12px" }}>% Muestreo</th>
              </tr>
            </thead>
            <tbody>
              {obligatoriedad.map((ob, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 600, textTransform: "capitalize", color: "#1e293b" }}>
                    {ob.tipo_cambio}
                  </td>
                  <td style={{ padding: "8px 12px", textTransform: "capitalize", color: "#475569" }}>
                    {ob.resultado}
                  </td>
                  <td style={{ padding: "8px 12px", textTransform: "capitalize", color: "#475569" }}>
                    {ob.riesgo}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      backgroundColor: ob.obligatoria ? "#dcfce7" : "#f1f5f9",
                      color: ob.obligatoria ? "#166534" : "#64748b"
                    }}>
                      {ob.obligatoria ? "Obligatoria" : "Opcional / Muestreo"}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px", color: "#334155", fontWeight: 600 }}>
                    {ob.muestreo_pct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SECCIÓN 3: PARÁMETROS DE OBSERVACIÓN */}
      {seccionActiva === "parametros" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
            Parámetros Operativos de la Revisión Post-Implementación
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Plazo para Completar PIR (Días)
              </label>
              <input
                type="number"
                value={parametros.plazo_completar_dias}
                onChange={e => onChange({ ...snapshot, parametros: { ...parametros, plazo_completar_dias: Number(e.target.value) } })}
                disabled={disabled}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
              />
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Días posteriores al registro de Implementado</span>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Ventana de Observación de Incidentes (Horas)
              </label>
              <input
                type="number"
                value={parametros.ventana_observacion_incidentes_horas}
                onChange={e => onChange({ ...snapshot, parametros: { ...parametros, ventana_observacion_incidentes_horas: Number(e.target.value) } })}
                disabled={disabled}
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
              />
              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Horas tras el fin real para vincular incidentes inducidos en los CIs</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={parametros.prohibir_implementador_revisor}
                  onChange={e => onChange({ ...snapshot, parametros: { ...parametros, prohibir_implementador_revisor: e.target.checked } })}
                  disabled={disabled}
                />
                <strong>El implementador no puede ser el revisor</strong> de la PIR (Segregación de funciones)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={parametros.bloquear_cierre_hasta_completar}
                  onChange={e => onChange({ ...snapshot, parametros: { ...parametros, bloquear_cierre_hasta_completar: e.target.checked } })}
                  disabled={disabled}
                />
                Bloquear el cierre definitivo hasta que la PIR obligatoria esté aprobada
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PREGUNTA */}
      {modalPreguntaAbierto && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", width: "100%", maxWidth: "550px", padding: "20px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 14px 0" }}>Pregunta de la Plantilla PIR</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Texto de la Pregunta *</label>
                <textarea
                  rows={2}
                  value={preguntaEnEdicion.texto || ""}
                  onChange={e => setPreguntaEnEdicion({ ...preguntaEnEdicion, texto: e.target.value })}
                  style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Tipo de Respuesta</label>
                <select
                  value={preguntaEnEdicion.tipo_respuesta}
                  onChange={e => setPreguntaEnEdicion({ ...preguntaEnEdicion, tipo_respuesta: e.target.value as any })}
                  style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                >
                  {TIPOS_RESPUESTA.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={preguntaEnEdicion.obligatoria ?? true}
                    onChange={e => setPreguntaEnEdicion({ ...preguntaEnEdicion, obligatoria: e.target.checked })}
                  />
                  Respuesta obligatoria en el informe PIR
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => setModalPreguntaAbierto(false)} style={{ padding: "6px 12px", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                Cancelar
              </button>
              <button onClick={handleGuardarPregunta} style={{ padding: "6px 14px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA DE LA PIR */}
      {modalVistaPreviaAbierto && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", width: "100%", maxWidth: "700px", maxHeight: "90vh", overflowY: "auto", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              Vista Previa: Formulario de Revisión Post-Implementación (PIR)
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {preguntas.map(q => (
                <div key={q.id} style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b", marginBottom: "6px" }}>
                    {q.orden}. {q.texto} {q.obligatoria && <span style={{ color: "#dc2626" }}>*</span>}
                  </div>

                  {q.tipo_respuesta === "booleano" && (
                    <div style={{ display: "flex", gap: "16px", fontSize: "0.8rem" }}>
                      <label><input type="radio" name={`prev_${q.id}`} /> Sí</label>
                      <label><input type="radio" name={`prev_${q.id}`} /> No</label>
                    </div>
                  )}

                  {q.tipo_respuesta === "lista" && (
                    <select style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}>
                      {(q.opciones || ["Opción 1", "Opción 2"]).map((op, i) => (
                        <option key={i}>{op}</option>
                      ))}
                    </select>
                  )}

                  {q.tipo_respuesta === "texto" && (
                    <textarea rows={2} placeholder="Escriba aquí sus observaciones técnicas..." style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }} />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                onClick={() => setModalVistaPreviaAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
