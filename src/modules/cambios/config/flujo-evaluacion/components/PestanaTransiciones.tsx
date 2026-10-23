"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Eye, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Grid, Network, ListFilter } from "@/shared/components/ui/Iconos";

interface TransicionConfig {
  id: string;
  codigo: string;
  nombre: string;
  origen: string[];
  destino: string;
  destino_final_todas_aprobadas?: string;
  tipos: string[];
  roles: string[];
  condiciones_previas: string[];
  campos_obligatorios: string[];
  comentario_modo: "ninguno" | "opcional" | "obligatorio";
  requiere_confirmacion: boolean;
  texto_confirmacion?: string;
  color: string;
  icono?: string;
  orden: number;
  activa: boolean;
  automatizaciones: { tipo: string; descripcion: string }[];
}

interface PestanaTransicionesProps {
  snapshot: { transiciones?: TransicionConfig[]; estados?: any[] };
  estadosDisponibles?: any[];
  onChange: (nuevoSnapshot: { transiciones: TransicionConfig[] }) => void;
  disabled?: boolean;
}

const ROLES_DISPONIBLES = [
  { id: "gestor_cambios", label: "Gestor de Cambios" },
  { id: "supervisor", label: "Supervisor del Grupo" },
  { id: "implementador", label: "Implementador Asignado (Contextual)" },
  { id: "solicitante", label: "Solicitante de la RFC (Contextual)" },
  { id: "evaluador", label: "Evaluador Asignado (Contextual)" },
  { id: "aprobador_etapa_actual", label: "Aprobador de la Etapa Vigente (Contextual)" },
  { id: "presidente_comite", label: "Presidente del Comité (Contextual)" },
  { id: "administrador", label: "Administrador del Sistema" },
  { id: "sistema", label: "Motor de Sistema (Automático)" }
];

const CONDICIONES_PREVIAS_CATALOGO = [
  { id: "sin_congelamiento_vigente", label: "Sin período de congelamiento vigente (Obligatorio a En ejecución)" },
  { id: "todas_etapas_aprobadas", label: "Todas las etapas de aprobación aprobadas formalmente" },
  { id: "checklist_go_no_go_superada", label: "Checklist Go/No-Go superada con resultado Go" },
  { id: "condiciones_aprobacion_cumplidas", label: "Condiciones estipuladas en aprobación cumplidas y firmadas" },
  { id: "dentro_de_tolerancia_ventana", label: "Estar dentro de la ventana autorizada o tolerancia permitida" },
  { id: "implementador_asignado", label: "Técnico implementador asignado formalmente" },
  { id: "ventana_valida_sin_bloqueos", label: "Ventana válida en calendario sin conflictos bloqueantes" },
  { id: "tareas_obligatorias_creadas", label: "Tareas técnicas obligatorias creadas y asignadas" },
  { id: "plan_comunicacion_listo", label: "Plan de comunicación de interrupción preparado" },
  { id: "modelo_aprobado_y_vigente", label: "Modelo de cambio estándar aprobado y vigente" },
  { id: "elegibilidad_confirmada", label: "Criterios de elegibilidad del modelo completados" },
  { id: "riesgo_bajo", label: "Nivel de riesgo calificado como Bajo" },
  { id: "pir_completada_si_aplica", label: "Revisión post-implementación (PIR) finalizada y aprobada" },
  { id: "actualizaciones_cmdb_confirmadas", label: "Actualizaciones de atributos en CMDB verificadas" },
  { id: "segregacion_funciones_valida", label: "Cumplimiento estricto de Segregación de Funciones (SoD)" }
];

const AUTOMATIZACIONES_DISPONIBLES = [
  { id: "asignar_evaluador", label: "Asignar evaluador técnico según grupo implementador" },
  { id: "iniciar_reloj_evaluacion", label: "Iniciar reloj SLA de evaluación" },
  { id: "iniciar_reloj_autorizacion", label: "Iniciar reloj SLA de autorización" },
  { id: "pausar_relojes", label: "Pausar relojes de evaluación y autorización" },
  { id: "reanudar_relojes", label: "Reanudar cómputo de relojes SLA" },
  { id: "detener_relojes", label: "Detener todos los plazos SLA activos" },
  { id: "generar_etapas_aprobacion", label: "Generar etapas de aprobación según matriz de autoridad" },
  { id: "avanzar_etapa_o_autorizar", label: "Avanzar a siguiente etapa o pasar a 'Autorizado'" },
  { id: "reservar_ventana_calendario", label: "Reservar ventana de mantenimiento en el calendario" },
  { id: "liberar_reserva_calendario", label: "Liberar reserva de ventana en el calendario" },
  { id: "registrar_inicio_real", label: "Registrar fecha y hora real de inicio de trabajos" },
  { id: "disparar_acciones_por_resultado", label: "Ejecutar acciones automáticas según resultado (incidente, PIR, etc.)" },
  { id: "iniciar_cuestionario_pir", label: "Activar plantilla de revisión post-implementación (PIR)" },
  { id: "analizar_incidentes_ventana_observacion", label: "Detectar incidentes en los CIs dentro de las 72h posteriores" },
  { id: "cerrar_rfc_definitivo", label: "Marcar RFC cerrada y archivar de forma inmutable" },
  { id: "cerrar_rfc_directo", label: "Cerrar RFC directamente para procedimientos sin PIR" }
];

export const PestanaTransiciones: React.FC<PestanaTransicionesProps> = ({ snapshot, estadosDisponibles, onChange, disabled }) => {
  const transiciones: TransicionConfig[] = snapshot?.transiciones || [];
  const estados: any[] = estadosDisponibles || snapshot?.estados || [];

  const [vista, setVista] = useState<"lista" | "matriz" | "diagrama">("lista");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");

  // Modal editor
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState<"crear" | "editar">("crear");
  const [transicionActual, setTransicionActual] = useState<Partial<TransicionConfig>>({});
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  // Modal validación de flujo
  const [modalValidacionAbierto, setModalValidacionAbierto] = useState(false);
  const [resultadoValidacion, setResultadoValidacion] = useState<any>(null);
  const [validando, setValidando] = useState(false);

  const transicionesFiltradas = transiciones.filter(t => {
    if (filtroTipo === "todos") return true;
    return t.tipos && t.tipos.includes(filtroTipo);
  });

  const abrirModalCrear = () => {
    setModoEdicion("crear");
    setTransicionActual({
      id: "trans_" + Date.now(),
      codigo: "nueva_transicion",
      nombre: "Nueva acción",
      origen: ["solicitado"],
      destino: "en_evaluacion",
      tipos: ["estandar", "normal", "emergencia"],
      roles: ["gestor_cambios", "supervisor"],
      condiciones_previas: [],
      campos_obligatorios: [],
      comentario_modo: "opcional",
      requiere_confirmacion: false,
      color: "#2563eb",
      orden: transiciones.length + 1,
      activa: true,
      automatizaciones: []
    });
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (t: TransicionConfig) => {
    setModoEdicion("editar");
    setTransicionActual({ ...t });
    setErrorValidacion(null);
    setModalAbierto(true);
  };

  const handleGuardarTransicion = () => {
    if (!transicionActual.nombre?.trim()) {
      setErrorValidacion("El nombre de la acción es obligatorio.");
      return;
    }
    if (!transicionActual.origen || transicionActual.origen.length === 0) {
      setErrorValidacion("Debe seleccionar al menos un estado de origen.");
      return;
    }
    if (!transicionActual.destino) {
      setErrorValidacion("Debe seleccionar un estado destino.");
      return;
    }

    let nuevas: TransicionConfig[] = [];
    if (modoEdicion === "crear") {
      nuevas = [...transiciones, transicionActual as TransicionConfig];
    } else {
      nuevas = transiciones.map(t => t.id === transicionActual.id ? (transicionActual as TransicionConfig) : t);
    }

    onChange({ transiciones: nuevas });
    setModalAbierto(false);
  };

  const handleEliminarTransicion = (t: TransicionConfig) => {
    if (confirm(`¿Confirma eliminar la transición '${t.nombre}'?`)) {
      onChange({ transiciones: transiciones.filter(item => item.id !== t.id) });
    }
  };

  // Validar flujo completo con backend
  const handleValidarFlujo = async () => {
    try {
      setValidando(true);
      setModalValidacionAbierto(true);
      const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/validar-flujo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estados, transiciones })
      });
      const data = await res.json();
      setResultadoValidacion(data);
    } catch (err: any) {
      setResultadoValidacion({ valido: false, errores: [err.message] });
    } finally {
      setValidando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado y barra de controles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            1.3.3.3.2 Transiciones, Acciones y Automatizaciones
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Reglas de pase de estado, perfiles autorizados, pre-condiciones normativas y automatizaciones vinculadas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Switcher de vista */}
          <div style={{ display: "flex", border: "1px solid #cbd5e1", borderRadius: "6px", overflow: "hidden" }}>
            <button
              onClick={() => setVista("lista")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "none",
                backgroundColor: vista === "lista" ? "#2563eb" : "#ffffff",
                color: vista === "lista" ? "#ffffff" : "#475569",
                cursor: "pointer"
              }}
            >
              <ListFilter size={14} />
              Lista
            </button>
            <button
              onClick={() => setVista("matriz")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "none",
                backgroundColor: vista === "matriz" ? "#2563eb" : "#ffffff",
                color: vista === "matriz" ? "#ffffff" : "#475569",
                cursor: "pointer"
              }}
            >
              <Grid size={14} />
              Matriz
            </button>
            <button
              onClick={() => setVista("diagrama")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "none",
                backgroundColor: vista === "diagrama" ? "#2563eb" : "#ffffff",
                color: vista === "diagrama" ? "#ffffff" : "#475569",
                cursor: "pointer"
              }}
            >
              <Network size={14} />
              Diagrama
            </button>
          </div>

          {/* Botón validar flujo */}
          <button
            onClick={handleValidarFlujo}
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
            <ShieldCheck size={16} style={{ color: "#2563eb" }} />
            Validar Flujo
          </button>

          {/* Botón crear acción */}
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
              gap: "6px"
            }}
          >
            <Plus size={16} />
            Nueva Transición
          </button>
        </div>
      </div>

      {/* Filtro por tipo de cambio */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
        <span style={{ fontWeight: 600, color: "#475569" }}>Filtrar por tipo de cambio:</span>
        {["todos", "estandar", "normal", "emergencia"].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              border: "1px solid",
              borderColor: filtroTipo === tipo ? "#2563eb" : "#cbd5e1",
              backgroundColor: filtroTipo === tipo ? "#eff6ff" : "#ffffff",
              color: filtroTipo === tipo ? "#1d4ed8" : "#475569",
              fontWeight: filtroTipo === tipo ? 700 : 500,
              cursor: "pointer",
              fontSize: "0.8rem",
              textTransform: "capitalize"
            }}
          >
            {tipo}
          </button>
        ))}
        <span style={{ marginLeft: "auto", color: "#64748b", fontSize: "0.8rem" }}>
          {transicionesFiltradas.length} transiciones activas
        </span>
      </div>

      {/* VISTA 1: LISTA */}
      {vista === "lista" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
                <th style={{ padding: "10px 12px", width: "40px" }}>#</th>
                <th style={{ padding: "10px 12px" }}>Acción / Botón</th>
                <th style={{ padding: "10px 12px" }}>Origen &rarr; Destino</th>
                <th style={{ padding: "10px 12px" }}>Tipos</th>
                <th style={{ padding: "10px 12px" }}>Roles Autorizados</th>
                <th style={{ padding: "10px 12px" }}>Condiciones Previas</th>
                <th style={{ padding: "10px 12px" }}>Automatizaciones</th>
                <th style={{ padding: "10px 12px", textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transicionesFiltradas.map((t, idx) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "10px 12px", color: "#94a3b8", fontWeight: 600 }}>{idx + 1}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontWeight: 600,
                        backgroundColor: t.color || "#2563eb",
                        color: "#ffffff",
                        fontSize: "0.75rem"
                      }}>
                        {t.nombre}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", fontFamily: "monospace", marginTop: "2px" }}>{t.codigo}</div>
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, color: "#334155" }}>
                        {(t.origen || []).join(", ")}
                      </span>
                      <ArrowRight size={14} style={{ color: "#94a3b8" }} />
                      <span style={{ fontWeight: 600, color: "#2563eb" }}>
                        {t.destino}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {(t.tipos || []).map(tipo => (
                        <span key={tipo} style={{ fontSize: "0.7rem", padding: "2px 6px", borderRadius: "3px", backgroundColor: "#f1f5f9", color: "#475569", textTransform: "capitalize" }}>
                          {tipo}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px", maxWidth: "200px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#334155", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {(t.roles || []).map(r => (
                        <span key={r} style={{ padding: "2px 5px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "3px" }}>
                          {ROLES_DISPONIBLES.find(item => item.id === r)?.label.split(" (")[0] || r}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px", maxWidth: "220px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                      {(t.condiciones_previas || []).length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: "16px" }}>
                          {t.condiciones_previas.map((c, i) => (
                            <li key={i}>{CONDICIONES_PREVIAS_CATALOGO.find(item => item.id === c)?.label || c}</li>
                          ))}
                        </ul>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Sin condiciones previas</span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px", maxWidth: "220px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#1e293b" }}>
                      {(t.automatizaciones || []).length > 0 ? (
                        <span style={{ padding: "2px 6px", backgroundColor: "#f0fdf4", color: "#166534", borderRadius: "4px", fontWeight: 600 }}>
                          {t.automatizaciones.length} automatizaciones
                        </span>
                      ) : (
                        <span style={{ color: "#94a3b8" }}>Ninguna</span>
                      )}
                    </div>
                  </td>

                  <td style={{ padding: "10px 12px", textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <button
                        onClick={() => abrirModalEditar(t)}
                        disabled={disabled}
                        style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                        title="Editar acción"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleEliminarTransicion(t)}
                        disabled={disabled}
                        style={{ padding: "4px 8px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "4px", cursor: "pointer", color: "#b91c1c" }}
                        title="Eliminar transición"
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

      {/* VISTA 2: MATRIZ ORIGEN X DESTINO */}
      {vista === "matriz" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px", overflowX: "auto" }}>
          <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 0, marginBottom: "12px" }}>
            Filas = Estado de Origen · Columnas = Estado de Destino. Haga clic en una celda para ver las transiciones configuradas entre ambos estados.
          </p>
          <table style={{ borderCollapse: "collapse", fontSize: "0.75rem", textAlign: "center" }}>
            <thead>
              <tr>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", textAlign: "left" }}>Origen \ Destino</th>
                {estados.map(e => (
                  <th key={e.id} style={{ padding: "8px 6px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", maxWidth: "90px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.nombre}>
                    {e.nombre}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estados.map(orig => (
                <tr key={orig.id}>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", backgroundColor: "#f8fafc", textAlign: "left", fontWeight: 600 }}>
                    {orig.nombre}
                  </td>
                  {estados.map(dest => {
                    const transQueConectan = transicionesFiltradas.filter(t => t.origen.includes(orig.id) && t.destino === dest.id);
                    const tiene = transQueConectan.length > 0;
                    return (
                      <td
                        key={dest.id}
                        style={{
                          padding: "6px",
                          border: "1px solid #cbd5e1",
                          backgroundColor: tiene ? "#eff6ff" : orig.id === dest.id ? "#f8fafc" : "#ffffff",
                          cursor: tiene ? "pointer" : "default"
                        }}
                        onClick={() => {
                          if (tiene) {
                            abrirModalEditar(transQueConectan[0]);
                          }
                        }}
                      >
                        {tiene ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {transQueConectan.map(tc => (
                              <span key={tc.id} style={{ padding: "2px 4px", borderRadius: "3px", backgroundColor: tc.color || "#2563eb", color: "#ffffff", fontSize: "0.65rem", fontWeight: 600 }}>
                                {tc.nombre}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "#cbd5e1" }}>-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA 3: DIAGRAMA INTERACTIVO */}
      {vista === "diagrama" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#334155" }}>
              Visualización Topológica del Ciclo de Vida ({filtroTipo})
            </span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Grafo generado dinámicamente con las {transicionesFiltradas.length} transiciones y {estados.length} estados.
            </span>
          </div>

          {/* Representación visual de grafo tipo pipeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
            {estados.map((est, i) => {
              const transSalientes = transicionesFiltradas.filter(t => t.origen.includes(est.id));
              return (
                <div key={est.id} style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#ffffff", padding: "10px 14px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                  <div style={{ width: "200px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: est.color }} />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{est.nombre}</span>
                    <span style={{ fontSize: "0.7rem", color: "#64748b" }}>({est.tipo})</span>
                  </div>

                  <ArrowRight size={16} style={{ color: "#94a3b8" }} />

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1 }}>
                    {transSalientes.length > 0 ? (
                      transSalientes.map(ts => (
                        <div
                          key={ts.id}
                          onClick={() => abrirModalEditar(ts)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 8px",
                            backgroundColor: "#f1f5f9",
                            border: "1px solid #cbd5e1",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                        >
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{ts.nombre}</span>
                          <span style={{ color: "#64748b" }}>&rarr; {ts.destino}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: "0.75rem", color: est.tipo === "final" ? "#16a34a" : "#ef4444", fontWeight: 600 }}>
                        {est.tipo === "final" ? "Estado Final (Concluye flujo)" : "Sin transiciones salientes"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE TRANSICIÓN */}
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
            maxWidth: "700px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              {modoEdicion === "crear" ? "Nueva Transición de Estado" : `Editar Acción: ${transicionActual.nombre}`}
            </h3>

            {errorValidacion && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "0.85rem", marginBottom: "16px" }}>
                {errorValidacion}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Nombre del Botón / Acción *
                </label>
                <input
                  type="text"
                  value={transicionActual.nombre || ""}
                  onChange={e => setTransicionActual({ ...transicionActual, nombre: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Código identificador *
                </label>
                <input
                  type="text"
                  value={transicionActual.codigo || ""}
                  onChange={e => setTransicionActual({ ...transicionActual, codigo: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Estado Destino *
                </label>
                <select
                  value={transicionActual.destino || ""}
                  onChange={e => setTransicionActual({ ...transicionActual, destino: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="estado_anterior">&lt;Estado Anterior&gt; (Para responder info)</option>
                  {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Color del Botón de Acción
                </label>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input
                    type="color"
                    value={transicionActual.color || "#2563eb"}
                    onChange={e => setTransicionActual({ ...transicionActual, color: e.target.value })}
                    style={{ width: "40px", height: "36px", border: "none", cursor: "pointer", borderRadius: "4px" }}
                  />
                  <input
                    type="text"
                    value={transicionActual.color || ""}
                    onChange={e => setTransicionActual({ ...transicionActual, color: e.target.value })}
                    style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem", fontFamily: "monospace" }}
                  />
                </div>
              </div>
            </div>

            {/* Estados de origen (selector múltiple) */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Estados de Origen Permitidos *
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px", maxHeight: "120px", overflowY: "auto", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                {estados.map(e => {
                  const seleccionado = (transicionActual.origen || []).includes(e.id);
                  return (
                    <label key={e.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={ev => {
                          const origenes = transicionActual.origen || [];
                          const nuevos = ev.target.checked ? [...origenes, e.id] : origenes.filter(item => item !== e.id);
                          setTransicionActual({ ...transicionActual, origen: nuevos });
                        }}
                      />
                      {e.nombre}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Aplica a tipos */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Aplica a Tipos de Cambio
              </label>
              <div style={{ display: "flex", gap: "16px" }}>
                {["estandar", "normal", "emergencia"].map(tipo => {
                  const check = (transicionActual.tipos || []).includes(tipo);
                  return (
                    <label key={tipo} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", textTransform: "capitalize", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={ev => {
                          const actuales = transicionActual.tipos || [];
                          const nuevos = ev.target.checked ? [...actuales, tipo] : actuales.filter(item => item !== tipo);
                          setTransicionActual({ ...transicionActual, tipos: nuevos });
                        }}
                      />
                      {tipo}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Roles autorizados */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Roles y Actores Autorizados para Ejecutar la Acción
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", maxHeight: "120px", overflowY: "auto", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                {ROLES_DISPONIBLES.map(r => {
                  const check = (transicionActual.roles || []).includes(r.id);
                  return (
                    <label key={r.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={ev => {
                          const actuales = transicionActual.roles || [];
                          const nuevos = ev.target.checked ? [...actuales, r.id] : actuales.filter(item => item !== r.id);
                          setTransicionActual({ ...transicionActual, roles: nuevos });
                        }}
                      />
                      {r.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Condiciones previas */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Condiciones Previas Exigidas (Constructor)
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "140px", overflowY: "auto", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                {CONDICIONES_PREVIAS_CATALOGO.map(cp => {
                  const check = (transicionActual.condiciones_previas || []).includes(cp.id);
                  return (
                    <label key={cp.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={ev => {
                          const actuales = transicionActual.condiciones_previas || [];
                          const nuevos = ev.target.checked ? [...actuales, cp.id] : actuales.filter(item => item !== cp.id);
                          setTransicionActual({ ...transicionActual, condiciones_previas: nuevos });
                        }}
                      />
                      {cp.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Automatizaciones asociadas */}
            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Automatizaciones al Disparar la Acción
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "140px", overflowY: "auto", padding: "8px", border: "1px solid #cbd5e1", borderRadius: "6px" }}>
                {AUTOMATIZACIONES_DISPONIBLES.map(aut => {
                  const check = (transicionActual.automatizaciones || []).some(a => a.tipo === aut.id);
                  return (
                    <label key={aut.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={ev => {
                          const actuales = transicionActual.automatizaciones || [];
                          const nuevos = ev.target.checked 
                            ? [...actuales, { tipo: aut.id, descripcion: aut.label }]
                            : actuales.filter(a => a.tipo !== aut.id);
                          setTransicionActual({ ...transicionActual, automatizaciones: nuevos });
                        }}
                      />
                      {aut.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Modal de confirmación y comentario */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Exigencia de Comentario
                </label>
                <select
                  value={transicionActual.comentario_modo || "opcional"}
                  onChange={e => setTransicionActual({ ...transicionActual, comentario_modo: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="ninguno">Ninguno</option>
                  <option value="opcional">Opcional</option>
                  <option value="obligatorio">Obligatorio</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Confirmación del Usuario
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
                  <input
                    type="checkbox"
                    checked={transicionActual.requiere_confirmacion ?? false}
                    onChange={e => setTransicionActual({ ...transicionActual, requiere_confirmacion: e.target.checked })}
                  />
                  <span style={{ fontSize: "0.85rem", color: "#334155" }}>Pedir confirmación previa en modal</span>
                </div>
              </div>
            </div>

            {transicionActual.requiere_confirmacion && (
              <div style={{ marginTop: "12px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Texto del Diálogo de Confirmación
                </label>
                <input
                  type="text"
                  value={transicionActual.texto_confirmacion || ""}
                  onChange={e => setTransicionActual({ ...transicionActual, texto_confirmacion: e.target.value })}
                  placeholder="¿Está seguro de ejecutar esta acción?"
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                />
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setModalAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarTransicion}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Guardar Transición
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESULTADO DE VALIDACIÓN DE FLUJO */}
      {modalValidacionAbierto && (
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              {validando ? (
                <ShieldCheck size={24} style={{ color: "#2563eb" }} />
              ) : resultadoValidacion?.valido ? (
                <CheckCircle2 size={24} style={{ color: "#16a34a" }} />
              ) : (
                <AlertTriangle size={24} style={{ color: "#dc2626" }} />
              )}
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                {validando ? "Validando Topología del Flujo..." : resultadoValidacion?.valido ? "Flujo Conforme con Directrices ITIL 4" : "Inconsistencias Detectadas en el Flujo"}
              </h3>
            </div>

            {validando && (
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Verificando alcanzabilidad de estados, salidas sin vías muertas y condiciones normativas...
              </p>
            )}

            {!validando && resultadoValidacion && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {resultadoValidacion.valido ? (
                  <div style={{ padding: "12px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", color: "#15803d", fontSize: "0.85rem" }}>
                    La topología del flujo es íntegra: todos los estados son alcanzables, no hay vías muertas y se cumplen las condiciones mínimas normativas hacia En ejecución.
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#b91c1c", margin: "0 0 8px 0" }}>
                      Errores Bloqueantes ({resultadoValidacion.errores?.length || 0}):
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.8rem", color: "#b91c1c" }}>
                      {(resultadoValidacion.errores || []).map((err: string, i: number) => (
                        <li key={i} style={{ marginBottom: "4px" }}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {resultadoValidacion.advertencias?.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#d97706", margin: "0 0 8px 0" }}>
                      Advertencias Recomendadas ({resultadoValidacion.advertencias.length}):
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.8rem", color: "#d97706" }}>
                      {resultadoValidacion.advertencias.map((adv: string, i: number) => (
                        <li key={i} style={{ marginBottom: "4px" }}>{adv}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => setModalValidacionAbierto(false)}
                    style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
