"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Lock, CheckCircle2, AlertCircle } from "@/shared/components/ui/Iconos";

interface EstadoConfig {
  id: string;
  codigo: string;
  nombre: string;
  tipo: "inicial" | "en_evaluacion" | "en_pausa" | "en_autorizacion" | "autorizado" | "programado" | "en_ejecucion" | "implementado" | "final";
  color: string;
  reloj: "evaluacion" | "autorizacion" | "ninguno";
  reloj_comportamiento: "corre" | "pausa" | "detiene";
  cuenta_como_abierto: boolean;
  permite_editar: "si" | "solo_comentarios_y_tareas" | "solo_comentarios_y_bitacora" | "solo_comentarios" | "solo_la_revision" | "no";
  aparece_calendario: boolean;
  tipos_aplicables: string[];
  es_sistema: boolean;
  activo: boolean;
  orden: number;
  descripcion?: string;
}

interface PestanaEstadosProps {
  snapshot: { estados?: EstadoConfig[] };
  onChange: (nuevoSnapshot: { estados: EstadoConfig[] }) => void;
  disabled?: boolean;
}

const TIPOS_ESTADO = [
  { id: "inicial", label: "Inicial (Exactamente 1)" },
  { id: "en_evaluacion", label: "En evaluación" },
  { id: "en_pausa", label: "En pausa" },
  { id: "en_autorizacion", label: "En autorización" },
  { id: "autorizado", label: "Autorizado" },
  { id: "programado", label: "Programado" },
  { id: "en_ejecucion", label: "En ejecución" },
  { id: "implementado", label: "Implementado" },
  { id: "final", label: "Final (Cerrado/Rechazado/Cancelado)" }
];

const PERMISOS_EDICION = [
  { id: "si", label: "Sí (Edición completa)" },
  { id: "solo_comentarios_y_tareas", label: "Solo comentarios y tareas" },
  { id: "solo_comentarios_y_bitacora", label: "Solo comentarios y bitácora" },
  { id: "solo_comentarios", label: "Solo comentarios" },
  { id: "solo_la_revision", label: "Solo la revisión (PIR)" },
  { id: "no", label: "No (Lectura estricta)" }
];

export const PestanaEstados: React.FC<PestanaEstadosProps> = ({ snapshot, onChange, disabled }) => {
  const estados: EstadoConfig[] = (snapshot?.estados || []).slice().sort((a, b) => a.orden - b.orden);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<"crear" | "editar">("crear");
  const [estadoActual, setEstadoActual] = useState<Partial<EstadoConfig>>({});
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Validaciones globales de estados
  const iniciales = estados.filter(e => e.tipo === "inicial" && e.activo);
  const finales = estados.filter(e => e.tipo === "final" && e.activo);
  const implementados = estados.filter(e => e.tipo === "implementado" && e.activo);

  const abrirModalCrear = () => {
    setModoEdicion("crear");
    setEstadoActual({
      id: "nuevo_estado_" + Date.now(),
      codigo: "nuevo_estado",
      nombre: "Nuevo estado",
      tipo: "en_evaluacion",
      color: "#3b82f6",
      reloj: "ninguno",
      reloj_comportamiento: "corre",
      cuenta_como_abierto: true,
      permite_editar: "solo_comentarios",
      aparece_calendario: false,
      tipos_aplicables: ["normal", "estandar"],
      es_sistema: false,
      activo: true,
      orden: estados.length + 1,
      descripcion: ""
    });
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (est: EstadoConfig) => {
    setModoEdicion("editar");
    setEstadoActual({ ...est });
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const handleGuardarEstado = () => {
    if (!estadoActual.nombre?.trim()) {
      setErrorValidacion("El nombre del estado es obligatorio.");
      return;
    }
    if (!estadoActual.codigo?.trim()) {
      setErrorValidacion("El código es obligatorio.");
      return;
    }

    // Si es tipo inicial y se marca como tal, verificar que no haya otro
    if (estadoActual.tipo === "inicial") {
      const otroInicial = estados.find(e => e.tipo === "inicial" && e.id !== estadoActual.id);
      if (otroInicial) {
        setErrorValidacion(`Ya existe un estado inicial ('${otroInicial.nombre}'). Solo puede existir 1 estado Inicial.`);
        return;
      }
    }

    let nuevosEstados: EstadoConfig[] = [];
    if (modoEdicion === "crear") {
      nuevosEstados = [...estados, estadoActual as EstadoConfig];
    } else {
      nuevosEstados = estados.map(e => e.id === estadoActual.id ? (estadoActual as EstadoConfig) : e);
    }

    onChange({ estados: nuevosEstados });
    setModalAbierto(false);
  };

  const handleEliminarEstado = (est: EstadoConfig) => {
    if (est.es_sistema) {
      alert("Los estados protegidos de sistema no pueden eliminarse.");
      return;
    }
    if (confirm(`¿Confirma que desea eliminar el estado '${est.nombre}'?`)) {
      const filtrados = estados.filter(e => e.id !== est.id);
      onChange({ estados: filtrados });
    }
  };

  const handleMoverOrden = (index: number, direccion: "arriba" | "abajo") => {
    if (direccion === "arriba" && index === 0) return;
    if (direccion === "abajo" && index === estados.length - 1) return;

    const copia = [...estados];
    const targetIndex = direccion === "arriba" ? index - 1 : index + 1;
    const temp = copia[index];
    copia[index] = copia[targetIndex];
    copia[targetIndex] = temp;

    // Actualizar números de orden
    copia.forEach((e, idx) => { e.orden = idx + 1; });
    onChange({ estados: copia });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado informativo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Catálogo de Estados del Cambio
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Configuración del ciclo de vida y políticas de edición, relojes SLA y visibilidad en calendario por estado.
          </p>
        </div>

        <button
          onClick={abrirModalCrear}
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
            gap: "8px"
          }}
        >
          <Plus size={16} />
          Nuevo Estado
        </button>
      </div>

      {/* Reglas normativas de resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
        <div style={{ backgroundColor: iniciales.length === 1 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${iniciales.length === 1 ? "#86efac" : "#fca5a5"}`, padding: "10px 14px", borderRadius: "6px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: iniciales.length === 1 ? "#15803d" : "#b91c1c", textTransform: "uppercase" }}>Estado Inicial</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginTop: "2px" }}>
            {iniciales.length === 1 ? `${iniciales[0].nombre} (1/1)` : `${iniciales.length} detectados (Requiere 1)`}
          </div>
        </div>

        <div style={{ backgroundColor: implementados.length >= 1 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${implementados.length >= 1 ? "#86efac" : "#fca5a5"}`, padding: "10px 14px", borderRadius: "6px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: implementados.length >= 1 ? "#15803d" : "#b91c1c", textTransform: "uppercase" }}>Estados Implementados</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginTop: "2px" }}>
            {implementados.length >= 1 ? `${implementados.length} configurados` : "Ninguno (Requiere >= 1)"}
          </div>
        </div>

        <div style={{ backgroundColor: finales.length >= 1 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${finales.length >= 1 ? "#86efac" : "#fca5a5"}`, padding: "10px 14px", borderRadius: "6px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: finales.length >= 1 ? "#15803d" : "#b91c1c", textTransform: "uppercase" }}>Estados Finales</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", marginTop: "2px" }}>
            {finales.length >= 1 ? `${finales.length} configurados` : "Ninguno (Requiere >= 1)"}
          </div>
        </div>
      </div>

      {/* Tabla de estados */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "10px 12px", width: "70px" }}>Orden</th>
              <th style={{ padding: "10px 12px" }}>Estado / Código</th>
              <th style={{ padding: "10px 12px" }}>Tipo de ciclo</th>
              <th style={{ padding: "10px 12px" }}>Color</th>
              <th style={{ padding: "10px 12px" }}>Reloj SLA</th>
              <th style={{ padding: "10px 12px" }}>¿Abierto?</th>
              <th style={{ padding: "10px 12px" }}>Edición solicitud</th>
              <th style={{ padding: "10px 12px" }}>Calendario</th>
              <th style={{ padding: "10px 12px" }}>Aplica a</th>
              <th style={{ padding: "10px 12px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {estados.map((est, index) => (
              <tr key={est.id} style={{ borderBottom: "1px solid #f1f5f9", backgroundColor: est.activo ? "#ffffff" : "#f8fafc" }}>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontWeight: 700, color: "#64748b", width: "18px" }}>{est.orden}</span>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <button
                        onClick={() => handleMoverOrden(index, "arriba")}
                        disabled={disabled || index === 0}
                        style={{ background: "none", border: "none", cursor: index === 0 ? "default" : "pointer", padding: 0, opacity: index === 0 ? 0.3 : 0.8 }}
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        onClick={() => handleMoverOrden(index, "abajo")}
                        disabled={disabled || index === estados.length - 1}
                        style={{ background: "none", border: "none", cursor: index === estados.length - 1 ? "default" : "pointer", padding: 0, opacity: index === estados.length - 1 ? 0.3 : 0.8 }}
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                  </div>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{est.nombre}</span>
                    {est.es_sistema && (
                      <span title="Estado protegido de sistema">
                        <Lock size={12} style={{ color: "#94a3b8" }} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace" }}>{est.codigo}</div>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    backgroundColor: est.tipo === "inicial" ? "#e0e7ff" : est.tipo === "final" ? "#f1f5f9" : est.tipo === "en_ejecucion" ? "#ffedd5" : "#e0f2fe",
                    color: est.tipo === "inicial" ? "#4338ca" : est.tipo === "final" ? "#475569" : est.tipo === "en_ejecucion" ? "#c2410c" : "#0369a1"
                  }}>
                    {TIPOS_ESTADO.find(t => t.id === est.tipo)?.label.split(" (")[0] || est.tipo}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: est.color, border: "1px solid rgba(0,0,0,0.1)" }} />
                    <span style={{ fontSize: "0.75rem", color: "#475569", fontFamily: "monospace" }}>{est.color}</span>
                  </div>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#334155" }}>
                    {est.reloj === "evaluacion" ? "Evaluación" : est.reloj === "autorizacion" ? "Autorización" : "Ninguno"}
                  </div>
                  <div style={{ fontSize: "0.7rem", color: est.reloj_comportamiento === "corre" ? "#16a34a" : est.reloj_comportamiento === "pausa" ? "#d97706" : "#64748b", fontWeight: 600 }}>
                    ({est.reloj_comportamiento})
                  </div>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {est.cuenta_como_abierto ? (
                    <span style={{ color: "#16a34a", fontWeight: 600 }}>Sí</span>
                  ) : (
                    <span style={{ color: "#64748b" }}>No</span>
                  )}
                </td>

                <td style={{ padding: "10px 12px", maxWidth: "160px" }}>
                  <span style={{ fontSize: "0.75rem", color: "#475569" }}>
                    {PERMISOS_EDICION.find(p => p.id === est.permite_editar)?.label.split(" (")[0] || est.permite_editar}
                  </span>
                </td>

                <td style={{ padding: "10px 12px" }}>
                  {est.aparece_calendario ? (
                    <span style={{ color: "#0284c7", fontWeight: 600 }}>Visible</span>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>No</span>
                  )}
                </td>

                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {(est.tipos_aplicables || []).map(t => (
                      <span key={t} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "3px", backgroundColor: "#f1f5f9", color: "#475569", textTransform: "capitalize" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      onClick={() => abrirModalEditar(est)}
                      disabled={disabled}
                      style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                      title="Editar propiedades del estado"
                    >
                      <Edit2 size={13} />
                    </button>
                    {!est.es_sistema && (
                      <button
                        onClick={() => handleEliminarEstado(est)}
                        disabled={disabled}
                        style={{ padding: "4px 8px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer", color: "#b91c1c" }}
                        title="Eliminar estado"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición/creación */}
      {modalAbierto && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "16px"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "8px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              {modoEdicion === "crear" ? "Nuevo Estado del Ciclo de Vida" : `Editar Estado: ${estadoActual.nombre}`}
            </h3>

            {errorValidacion && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "0.85rem", marginBottom: "16px" }}>
                {errorValidacion}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Nombre del Estado *
                </label>
                <input
                  type="text"
                  value={estadoActual.nombre || ""}
                  onChange={e => setEstadoActual({ ...estadoActual, nombre: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Código identificador * {estadoActual.es_sistema && "(Bloqueado)"}
                </label>
                <input
                  type="text"
                  value={estadoActual.codigo || ""}
                  disabled={estadoActual.es_sistema}
                  onChange={e => setEstadoActual({ ...estadoActual, codigo: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", backgroundColor: estadoActual.es_sistema ? "#f1f5f9" : "#ffffff" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Tipo de Ciclo * {estadoActual.es_sistema && "(Bloqueado)"}
                </label>
                <select
                  value={estadoActual.tipo || "en_evaluacion"}
                  disabled={estadoActual.es_sistema}
                  onChange={e => setEstadoActual({ ...estadoActual, tipo: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", backgroundColor: estadoActual.es_sistema ? "#f1f5f9" : "#ffffff" }}
                >
                  {TIPOS_ESTADO.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Color Distintivo
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={estadoActual.color || "#3b82f6"}
                    onChange={e => setEstadoActual({ ...estadoActual, color: e.target.value })}
                    style={{ width: "40px", height: "36px", border: "none", cursor: "pointer", borderRadius: "4px" }}
                  />
                  <input
                    type="text"
                    value={estadoActual.color || ""}
                    onChange={e => setEstadoActual({ ...estadoActual, color: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Reloj SLA Aplicable
                </label>
                <select
                  value={estadoActual.reloj || "ninguno"}
                  onChange={e => setEstadoActual({ ...estadoActual, reloj: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="ninguno">Ninguno</option>
                  <option value="evaluacion">Reloj de Evaluación</option>
                  <option value="autorizacion">Reloj de Autorización</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Comportamiento del Reloj
                </label>
                <select
                  value={estadoActual.reloj_comportamiento || "detiene"}
                  onChange={e => setEstadoActual({ ...estadoActual, reloj_comportamiento: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="corre">Corre</option>
                  <option value="pausa">Pausa</option>
                  <option value="detiene">Detiene</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Permisos de Edición de la RFC
                </label>
                <select
                  value={estadoActual.permite_editar || "si"}
                  onChange={e => setEstadoActual({ ...estadoActual, permite_editar: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  {PERMISOS_EDICION.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Parámetros de Auditoría
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={estadoActual.cuenta_como_abierto ?? true}
                      onChange={e => setEstadoActual({ ...estadoActual, cuenta_como_abierto: e.target.checked })}
                    />
                    Cuenta como ticket abierto
                  </label>

                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={estadoActual.aparece_calendario ?? false}
                      onChange={e => setEstadoActual({ ...estadoActual, aparece_calendario: e.target.checked })}
                    />
                    Aparece visible en calendario
                  </label>
                </div>
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Aplica a Tipos de Cambio
              </label>
              <div style={{ display: "flex", gap: "16px" }}>
                {["estandar", "normal", "emergencia"].map(t => {
                  const checkeado = (estadoActual.tipos_aplicables || []).includes(t);
                  return (
                    <label key={t} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", textTransform: "capitalize", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={checkeado}
                        onChange={e => {
                          const actuales = estadoActual.tipos_aplicables || [];
                          const nuevos = e.target.checked ? [...actuales, t] : actuales.filter(item => item !== t);
                          setEstadoActual({ ...estadoActual, tipos_aplicables: nuevos });
                        }}
                      />
                      {t}
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Descripción y Notas de Uso
              </label>
              <textarea
                value={estadoActual.descripcion || ""}
                onChange={e => setEstadoActual({ ...estadoActual, descripcion: e.target.value })}
                rows={3}
                placeholder="Explique el propósito operativo de este estado en el ciclo de vida..."
                style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEstado}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Guardar Estado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
