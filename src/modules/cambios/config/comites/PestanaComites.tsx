"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Users, Play, ShieldAlert, CheckCircle2, Clock, Calendar, Check, X, AlertCircle } from "@/shared/components/ui/Iconos";
import TablaDobleScroll from "@/shared/components/ui/TablaDobleScroll";

interface MiembroComite {
  id_usuario: number;
  nombre: string;
  correo?: string;
  rol_comite: "presidente" | "secretario" | "miembro_voto" | "consultor_sin_voto" | "observador";
  perfil_origen: string;
  suplente_id: number | null;
  suplente_nombre: string;
  activo: boolean;
}

interface ComiteConfig {
  nombre: string;
  descripcion: string;
  quorum_minimo: number;
  presencia_presidente_obligatoria: boolean;
  regla_aprobacion: "mayoria_simple" | "mayoria_calificada" | "unanimidad" | "dos_de_tres";
  desempate: "voto_calidad_presidente" | "aplazar";
  voto_asincrono_permitido: boolean;
  plazo_voto_asincrono_horas: number;
  dictamenes_permitidos: string[];
  abstenciones_cuentan_para_quorum: boolean;
  exclusion_conflicto_interes: boolean;
  reunion?: {
    frecuencia: string;
    dia_semana: string;
    hora_inicio: string;
    duracion_minutos: number;
    ubicacion_enlace: string;
    corte_agenda_horas: number;
    generacion_agenda_automatica: boolean;
    recordatorio_horas_antes: number;
    plantilla_acta: string;
  };
  plazos_decision_horas?: { p1: number; p2: number; p3: number; p4: number };
  canal_convocatoria_inmediata?: string;
  permitir_decision_verbal?: boolean;
  campos_decision_verbal?: string[];
  revision_retroactiva_cab_obligatoria?: boolean;
  miembros: MiembroComite[];
}

interface PestanaComitesProps {
  snapshot: {
    comites?: {
      cab?: ComiteConfig;
      ecab?: ComiteConfig;
    };
    cab?: ComiteConfig;
    ecab?: ComiteConfig;
  };
  catalogoUsuarios?: any[];
  onChange: (nuevoSnapshot: { cab: ComiteConfig; ecab: ComiteConfig }) => void;
  disabled?: boolean;
  onGuardar?: () => void;
  guardando?: boolean;
}

const ROLES_COMITE = [
  { id: "presidente", label: "Presidente del Comité (Exactamente 1)" },
  { id: "secretario", label: "Secretario (Actas y Quórum)" },
  { id: "miembro_voto", label: "Miembro con Voto" },
  { id: "consultor_sin_voto", label: "Consultor Técnico (Sin Voto)" },
  { id: "observador", label: "Observador / Auditor (Sin Voto)" }
];

function obtenerIniciales(nombre?: string): string {
  if (!nombre) return "U";
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const PestanaComites: React.FC<PestanaComitesProps> = ({ snapshot, catalogoUsuarios, onChange, disabled, onGuardar, guardando }) => {
  const comites = snapshot?.comites || { cab: snapshot?.cab, ecab: snapshot?.ecab };
  const cabConfig: ComiteConfig = comites?.cab || {
    nombre: "Comité Asesor de Cambios (CAB)",
    descripcion: "",
    quorum_minimo: 3,
    presencia_presidente_obligatoria: true,
    regla_aprobacion: "mayoria_simple",
    desempate: "voto_calidad_presidente",
    voto_asincrono_permitido: true,
    plazo_voto_asincrono_horas: 48,
    dictamenes_permitidos: ["aprobar", "aprobar_con_condiciones", "rechazar", "aplazar", "solicitar_informacion"],
    abstenciones_cuentan_para_quorum: false,
    exclusion_conflicto_interes: true,
    reunion: {
      frecuencia: "semanal",
      dia_semana: "miercoles",
      hora_inicio: "10:00",
      duracion_minutos: 60,
      ubicacion_enlace: "Sala de Coordinación TI / Teams",
      corte_agenda_horas: 24,
      generacion_agenda_automatica: true,
      recordatorio_horas_antes: 24,
      plantilla_acta: "ACTA DE REUNIÓN CAB\nFecha: {{fecha}}\nAsistentes: {{asistentes}}\nQuórum: {{quorum}}\nRFCs Tratadas: {{rfcs}}\nVotación y Dictamen: {{dictamen}}\nObservaciones y Acuerdos: {{observaciones}}"
    },
    miembros: []
  };

  const ecabConfig: ComiteConfig = comites?.ecab || {
    nombre: "Comité de Cambios de Emergencia (ECAB)",
    descripcion: "",
    quorum_minimo: 2,
    presencia_presidente_obligatoria: true,
    regla_aprobacion: "dos_de_tres",
    desempate: "voto_calidad_presidente",
    voto_asincrono_permitido: true,
    plazo_voto_asincrono_horas: 2,
    dictamenes_permitidos: ["aprobar", "aprobar_con_condiciones", "rechazar"],
    abstenciones_cuentan_para_quorum: false,
    exclusion_conflicto_interes: true,
    plazos_decision_horas: { p1: 2, p2: 4, p3: 8, p4: 24 },
    canal_convocatoria_inmediata: "notificacion_y_correo",
    permitir_decision_verbal: true,
    campos_decision_verbal: ["quien_autorizo", "medio_comunicacion", "fecha_hora"],
    revision_retroactiva_cab_obligatoria: true,
    miembros: []
  };

  const [panelActivo, setPanelActivo] = useState<"cab" | "ecab">("cab");
  const comiteActual = panelActivo === "cab" ? cabConfig : ecabConfig;

  // Modal Miembro
  const [modalMiembroAbierto, setModalMiembroAbierto] = useState(false);
  const [miembroEnEdicion, setMiembroEnEdicion] = useState<Partial<MiembroComite>>({});
  const [errorMiembro, setErrorMiembro] = useState<string | null>(null);

  const actualizarComite = (modificado: Partial<ComiteConfig>) => {
    if (panelActivo === "cab") {
      onChange({ cab: { ...cabConfig, ...modificado }, ecab: ecabConfig });
    } else {
      onChange({ cab: cabConfig, ecab: { ...ecabConfig, ...modificado } });
    }
  };

  const abrirModalNuevoMiembro = () => {
    setMiembroEnEdicion({
      id_usuario: catalogoUsuarios?.[0]?.id_usuario || 1,
      nombre: catalogoUsuarios?.[0]?.nombre_completo || "Usuario",
      rol_comite: "miembro_voto",
      perfil_origen: catalogoUsuarios?.[0]?.perfil || "Aprobador",
      suplente_id: null,
      suplente_nombre: "Sin asignar",
      activo: true
    });
    setErrorMiembro(null);
    setModalMiembroAbierto(true);
  };

  const abrirModalEditarMiembro = (m: MiembroComite) => {
    setMiembroEnEdicion({ ...m });
    setErrorMiembro(null);
    setModalMiembroAbierto(true);
  };

  const handleGuardarMiembro = () => {
    if (!miembroEnEdicion.id_usuario) {
      setErrorMiembro("Debe seleccionar un usuario.");
      return;
    }

    if (miembroEnEdicion.rol_comite === "presidente") {
      const otroPresidente = comiteActual.miembros.find(m => m.rol_comite === "presidente" && m.id_usuario !== miembroEnEdicion.id_usuario && m.activo);
      if (otroPresidente) {
        setErrorMiembro(`Ya existe un Presidente activo (${otroPresidente.nombre}). Debe haber exactamente 1 Presidente.`);
        return;
      }
    }

    if (miembroEnEdicion.suplente_id && miembroEnEdicion.suplente_id === miembroEnEdicion.id_usuario) {
      setErrorMiembro("El suplente no puede ser el mismo usuario.");
      return;
    }

    const existe = comiteActual.miembros.some(m => m.id_usuario === miembroEnEdicion.id_usuario);
    let nuevos: MiembroComite[] = [];
    if (existe) {
      nuevos = comiteActual.miembros.map(m => m.id_usuario === miembroEnEdicion.id_usuario ? (miembroEnEdicion as MiembroComite) : m);
    } else {
      nuevos = [...comiteActual.miembros, miembroEnEdicion as MiembroComite];
    }

    actualizarComite({ miembros: nuevos });
    setModalMiembroAbierto(false);
  };

  const handleEliminarMiembro = (id: number) => {
    if (confirm("¿Confirma quitar a este miembro del comité?")) {
      actualizarComite({ miembros: comiteActual.miembros.filter(m => m.id_usuario !== id) });
    }
  };

  function renderRolBadge(rol: string) {
    let clase = "badge-rol-voto";
    let etiqueta = "Miembro con Voto";
    if (rol === "presidente") {
      clase = "badge-rol-presidente";
      etiqueta = "Presidente del Comité";
    } else if (rol === "secretario") {
      clase = "badge-rol-secretario";
      etiqueta = "Secretario";
    } else if (rol === "consultor_sin_voto") {
      clase = "badge-rol-consultor";
      etiqueta = "Consultor Técnico";
    } else if (rol === "observador") {
      clase = "badge-rol-observador";
      etiqueta = "Observador";
    }
    return <span className={`badge-rol ${clase}`}>{etiqueta}</span>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Pestañas arriba; el título corresponde al comité activo */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div className="pestanas">
          <button
            type="button"
            onClick={() => setPanelActivo("cab")}
            className={`pestana ${panelActivo === "cab" ? "pestana-activa" : ""}`}
          >
            <span>CAB — Comité Asesor de Cambios</span>
            <span className="pestana-contador">
              {cabConfig.miembros.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPanelActivo("ecab")}
            className={`pestana ${panelActivo === "ecab" ? "pestana-activa" : ""}`}
          >
            <span>ECAB — Comité de Emergencia</span>
            <span className="pestana-contador">
              {ecabConfig.miembros.length}
            </span>
          </button>
        </div>
      </div>

      {/* Cabecera Unificada Corporativa */}
      <div className="cabecera-pagina">
        <div>
          <h1 className="titulo-pagina">
            {panelActivo === "cab" ? "Miembros y quórum del CAB" : "Miembros y quórum del ECAB"}
          </h1>
          <p className="descripcion-pagina">
            {panelActivo === "cab" ? "Change Advisory Board: composición, quórum y reglas de voto para cambios normales." : "Emergency CAB: composición, quórum y reglas de voto para cambios de emergencia."}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {onGuardar && (
            <button
              type="button"
              onClick={onGuardar}
              disabled={guardando || disabled}
              className="boton-primario"
            >
              
              <span>{guardando ? "Guardando..." : "Guardar miembros y quórum"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Reglas de Decisión del Comité */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <ShieldAlert size={18} style={{ color: panelActivo === "cab" ? "#2563eb" : "#dc2626" }} />
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Reglas de Decisión y Quórum: {comiteActual.nombre}
            </h3>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
              Parámetros de validez para sesiones ordinarias, extraordinarias y adopción de dictámenes colegiados.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(230px, 100%), 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Quórum Mínimo Requerido
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="number"
                value={comiteActual.quorum_minimo}
                onChange={e => actualizarComite({ quorum_minimo: Number(e.target.value) })}
                disabled={disabled}
                min={1}
                className="input-base"
                style={{ width: "90px", textAlign: "center", fontWeight: 600 }}
              />
              <span style={{ fontSize: "12.5px", color: "#64748b" }}>votantes mínimos</span>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Regla de Aprobación
            </label>
            <select
              value={comiteActual.regla_aprobacion}
              onChange={e => actualizarComite({ regla_aprobacion: e.target.value as any })}
              disabled={disabled}
              className="input-base"
              style={{ width: "100%", fontSize: "13px" }}
            >
              <option value="mayoria_simple">Mayoría Simple (&gt; 50%)</option>
              <option value="mayoria_calificada">Mayoría Calificada (2/3)</option>
              <option value="dos_de_tres">2 de 3 Convocados (ECAB)</option>
              <option value="unanimidad">Unanimidad (100%)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Resolución de Empate
            </label>
            <select
              value={comiteActual.desempate}
              onChange={e => actualizarComite({ desempate: e.target.value as any })}
              disabled={disabled}
              className="input-base"
              style={{ width: "100%", fontSize: "13px" }}
            >
              <option value="voto_calidad_presidente">Voto de Calidad del Presidente</option>
              <option value="aplazar">Aplazar a Siguiente Sesión</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
              Voto Asíncrono (Sin Reunión)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                backgroundColor: comiteActual.voto_asincrono_permitido ? "#f8fafc" : "#ffffff",
                minHeight: "40px",
              }}
            >
              <input
                type="checkbox"
                id="voto-asincrono"
                checked={comiteActual.voto_asincrono_permitido}
                onChange={e => actualizarComite({ voto_asincrono_permitido: e.target.checked })}
                disabled={disabled}
                style={{ cursor: "pointer", width: "15px", height: "15px" }}
              />
              <label htmlFor="voto-asincrono" style={{ fontSize: "12.5px", color: "#1e293b", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>Permitir</span>
                <span style={{ fontSize: "11px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#e2e8f0", color: "#475569", fontWeight: 600 }}>
                  {comiteActual.plazo_voto_asincrono_horas}h plazo
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Políticas de Gobernanza */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: "12px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f1f5f9" }}>
          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 14px",
              backgroundColor: comiteActual.presencia_presidente_obligatoria ? "#f8fafc" : "#ffffff",
              border: `1px solid ${comiteActual.presencia_presidente_obligatoria ? "#cbd5e1" : "#e2e8f0"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <input
              type="checkbox"
              checked={comiteActual.presencia_presidente_obligatoria}
              onChange={e => actualizarComite({ presencia_presidente_obligatoria: e.target.checked })}
              disabled={disabled}
              style={{ marginTop: "3px", width: "15px", height: "15px" }}
            />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Presencia obligatoria del Presidente</div>
              <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                Exige la asistencia del Presidente o su suplente para sesionar y validar dictámenes.
              </div>
            </div>
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "10px 14px",
              backgroundColor: comiteActual.exclusion_conflicto_interes ? "#f8fafc" : "#ffffff",
              border: `1px solid ${comiteActual.exclusion_conflicto_interes ? "#cbd5e1" : "#e2e8f0"}`,
              borderRadius: "8px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <input
              type="checkbox"
              checked={comiteActual.exclusion_conflicto_interes}
              onChange={e => actualizarComite({ exclusion_conflicto_interes: e.target.checked })}
              disabled={disabled}
              style={{ marginTop: "3px", width: "15px", height: "15px" }}
            />
            <div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>Exclusión por Conflicto de Interés</div>
              <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
                Autoexcluye el derecho a voto si el miembro figura como solicitante o técnico implementador.
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Composición del Comité */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          padding: "20px 24px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} style={{ color: "#2563eb" }} />
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Composición de Miembros ({comiteActual.miembros.length})
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Miembros oficiales, roles de gobernanza y suplentes registrados.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirModalNuevoMiembro}
            disabled={disabled}
            className="boton-primario"
          >
            
            <span>Agregar Miembro</span>
          </button>
        </div>

        <TablaDobleScroll minWidth={850}>
          <table className="tabla-datos" style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left", minWidth: "850px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 600 }}>Usuario</th>
                <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 600, width: "190px" }}>Rol en Comité</th>
                <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 600, width: "170px" }}>Perfil de Origen</th>
                <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 600, width: "180px" }}>Suplente Asignado</th>
                <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 600, width: "100px" }}>Estado</th>
                <th style={{ padding: "12px 16px", color: "#475569", fontWeight: 600, textAlign: "right", width: "100px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comiteActual.miembros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="celda-vacia">
                    No hay miembros asignados a este comité aún. Pulsa en "Agregar Miembro" para incorporar el primer integrante.
                  </td>
                </tr>
              ) : (
                comiteActual.miembros.map((m) => (
                  <tr key={m.id_usuario} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="avatar-iniciales">{obtenerIniciales(m.nombre)}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "13px" }}>{m.nombre}</div>
                          <div style={{ fontSize: "11px", color: "#64748b" }}>{m.correo || "—"}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      {renderRolBadge(m.rol_comite)}
                    </td>

                    <td style={{ padding: "12px 16px", color: "#475569", fontSize: "12.5px" }}>
                      {m.perfil_origen}
                    </td>

                    <td style={{ padding: "12px 16px", color: "#334155", fontSize: "12.5px" }}>
                      {m.suplente_nombre ? (
                        <span style={{ fontWeight: 500 }}>{m.suplente_nombre}</span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontStyle: "italic", fontSize: "12px" }}>Sin suplente</span>
                      )}
                    </td>

                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <span className={`badge-estado ${m.activo ? "badge-estado-activo" : "badge-estado-inactivo"}`}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: m.activo ? "#10b981" : "#94a3b8" }} />
                        <span>{m.activo ? "Activo" : "Inactivo"}</span>
                      </span>
                    </td>

                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "inline-flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => abrirModalEditarMiembro(m)}
                          disabled={disabled}
                          className="boton-secundario boton-sm"
                          title="Editar miembro"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEliminarMiembro(m.id_usuario)}
                          disabled={disabled}
                          className="boton-peligro boton-sm"
                          title="Quitar miembro del comité"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TablaDobleScroll>
      </div>

      {/* Parámetros de reunión (Solo CAB) */}
      {panelActivo === "cab" && cabConfig.reunion && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Calendar size={18} style={{ color: "#2563eb" }} />
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Reuniones Periódicas del CAB
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Convocatoria recurrente de sesiones de evaluación ordinaria.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Frecuencia y Día
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  value={cabConfig.reunion.frecuencia}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, frecuencia: e.target.value } })}
                  className="input-base"
                  style={{ width: "50%", fontSize: "12.5px" }}
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
                <select
                  value={cabConfig.reunion.dia_semana}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, dia_semana: e.target.value } })}
                  className="input-base"
                  style={{ width: "50%", fontSize: "12.5px" }}
                >
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Hora y Duración
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="time"
                  value={cabConfig.reunion.hora_inicio}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, hora_inicio: e.target.value } })}
                  className="input-base"
                  style={{ width: "50%", fontSize: "12.5px" }}
                />
                <input
                  type="number"
                  placeholder="Minutos"
                  value={cabConfig.reunion.duracion_minutos}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, duracion_minutos: Number(e.target.value) } })}
                  className="input-base"
                  style={{ width: "50%", fontSize: "12.5px" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Corte de Agenda (Horas antes)
              </label>
              <input
                type="number"
                value={cabConfig.reunion.corte_agenda_horas}
                onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, corte_agenda_horas: Number(e.target.value) } })}
                className="input-base"
                style={{ width: "100%", fontSize: "12.5px" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Protocolo de ECAB */}
      {panelActivo === "ecab" && (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
            padding: "20px 24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <Clock size={18} style={{ color: "#dc2626" }} />
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Protocolo de Decisión Inmediata de Emergencia (ECAB)
              </h3>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0 0" }}>
                Mecanismos de autorización expedita para cambios que restauran servicios críticos (P1).
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Plazo Máximo Decisión P1 (Horas)
              </label>
              <input
                type="number"
                value={ecabConfig.plazos_decision_horas?.p1 ?? 2}
                onChange={e => actualizarComite({ plazos_decision_horas: { ...ecabConfig.plazos_decision_horas!, p1: Number(e.target.value) } })}
                className="input-base"
                style={{ width: "100%", fontSize: "12.5px" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                Canal de Convocatoria Inmediata
              </label>
              <select
                value={ecabConfig.canal_convocatoria_inmediata || "in_app"}
                onChange={e => actualizarComite({ canal_convocatoria_inmediata: e.target.value })}
                className="input-base"
                style={{ width: "100%", fontSize: "12.5px" }}
              >
                <option value="in_app">Notificación interna en el sistema (In-App)</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={ecabConfig.permitir_decision_verbal ?? true}
                  onChange={e => actualizarComite({ permitir_decision_verbal: e.target.checked })}
                />
                <span>Permitir registro de decisión verbal con auditoría</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={ecabConfig.revision_retroactiva_cab_obligatoria ?? true}
                  onChange={e => actualizarComite({ revision_retroactiva_cab_obligatoria: e.target.checked })}
                />
                <span>Exigir revisión retroactiva obligatoria por CAB</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MIEMBRO */}
      {modalMiembroAbierto && (
        <div className="modal-overlay" onClick={() => setModalMiembroAbierto(false)}>
          <div className="modal-contenido" style={{ maxWidth: "520px", padding: "24px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Users size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Miembro del Comité: {comiteActual.nombre}
                </h3>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  Definición de titular, rol en el comité y suplente ante contingencias.
                </span>
              </div>
            </div>

            {errorMiembro && (
              <div style={{ padding: "10px 14px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "12.5px", marginBottom: "14px" }}>
                {errorMiembro}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Usuario Titular *
                </label>
                <select
                  value={miembroEnEdicion.id_usuario}
                  onChange={e => {
                    const u = (catalogoUsuarios || []).find(item => item.id_usuario === Number(e.target.value));
                    setMiembroEnEdicion({
                      ...miembroEnEdicion,
                      id_usuario: Number(e.target.value),
                      nombre: u?.nombre_completo || "Usuario",
                      correo: u?.correo_electronico,
                      perfil_origen: u?.perfil || "Aprobador"
                    });
                  }}
                  className="input-base"
                  style={{ width: "100%", fontSize: "13px" }}
                >
                  {(catalogoUsuarios || []).map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.perfil})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Rol en el Comité *
                </label>
                <select
                  value={miembroEnEdicion.rol_comite}
                  onChange={e => setMiembroEnEdicion({ ...miembroEnEdicion, rol_comite: e.target.value as any })}
                  className="input-base"
                  style={{ width: "100%", fontSize: "13px" }}
                >
                  {ROLES_COMITE.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "6px" }}>
                  Usuario Suplente (Interviene ante ausencia)
                </label>
                <select
                  value={miembroEnEdicion.suplente_id || ""}
                  onChange={e => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    const su = (catalogoUsuarios || []).find(item => item.id_usuario === val);
                    setMiembroEnEdicion({
                      ...miembroEnEdicion,
                      suplente_id: val,
                      suplente_nombre: su?.nombre_completo || "Sin asignar"
                    });
                  }}
                  className="input-base"
                  style={{ width: "100%", fontSize: "13px" }}
                >
                  <option value="">Sin suplente asignado</option>
                  {(catalogoUsuarios || []).map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.perfil})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", cursor: "pointer", color: "#334155" }}>
                  <input
                    type="checkbox"
                    checked={miembroEnEdicion.activo ?? true}
                    onChange={e => setMiembroEnEdicion({ ...miembroEnEdicion, activo: e.target.checked })}
                    style={{ width: "15px", height: "15px" }}
                  />
                  <span>Miembro activo con facultades vigentes en el comité</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setModalMiembroAbierto(false)}
                className="boton-secundario"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarMiembro}
                className="boton-primario"
              >
                Guardar Miembro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
