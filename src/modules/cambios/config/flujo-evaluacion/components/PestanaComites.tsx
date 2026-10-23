"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Users, Play, ShieldAlert, CheckCircle2, Clock, Calendar, FileText } from "@/shared/components/ui/Iconos";

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
}

const ROLES_COMITE = [
  { id: "presidente", label: "Presidente del Comité (Exactamente 1)" },
  { id: "secretario", label: "Secretario (Actas y Quórum)" },
  { id: "miembro_voto", label: "Miembro con Voto" },
  { id: "consultor_sin_voto", label: "Consultor Técnico (Sin Voto)" },
  { id: "observador", label: "Observador / Auditor (Sin Voto)" }
];

export const PestanaComites: React.FC<PestanaComitesProps> = ({ snapshot, catalogoUsuarios, onChange, disabled }) => {
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

  // Modal Probar Quórum
  const [modalQuorumAbierto, setModalQuorumAbierto] = useState(false);
  const [simMiembros, setSimMiembros] = useState<any[]>([]);
  const [simResultado, setSimResultado] = useState<any>(null);
  const [simulando, setSimulando] = useState(false);

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

  // Preparar y abrir prueba de quórum
  const handleAbrirPruebaQuorum = () => {
    const listado = comiteActual.miembros.map(m => ({
      id_usuario: m.id_usuario,
      nombre: m.nombre,
      rol_comite: m.rol_comite,
      suplente_id: m.suplente_id,
      suplente_nombre: m.suplente_nombre,
      presente: true,
      voto: "aprobar",
      es_solicitante: false,
      es_implementador: false,
      ausente: false
    }));
    setSimMiembros(listado);
    setModalQuorumAbierto(true);
    ejecutarSimulacionQuorum(listado);
  };

  const ejecutarSimulacionQuorum = async (miembrosData: any[]) => {
    try {
      setSimulando(true);
      const res = await fetch("/api/cambios/configuracion/flujo-evaluacion/simular-quorum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comite_id: panelActivo,
          miembros: miembrosData,
          parametros_custom: comiteActual
        })
      });
      const data = await res.json();
      setSimResultado(data);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSimulando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Comités Colegiados: CAB y ECAB
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Gobernanza del Change Advisory Board (CAB) y Emergency CAB: composición, quórum, reglas de voto y agendas.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleAbrirPruebaQuorum}
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
            <Play size={15} style={{ color: "#2563eb" }} />
            Probar Quórum
          </button>
        </div>
      </div>

      {/* Selector de panel CAB vs ECAB */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px" }}>
        <button
          onClick={() => setPanelActivo("cab")}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: panelActivo === "cab" ? "#2563eb" : "#cbd5e1",
            backgroundColor: panelActivo === "cab" ? "#eff6ff" : "#ffffff",
            color: panelActivo === "cab" ? "#1d4ed8" : "#475569",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer"
          }}
        >
          CAB — Comité Asesor de Cambios ({cabConfig.miembros.length} miembros)
        </button>

        <button
          onClick={() => setPanelActivo("ecab")}
          style={{
            padding: "8px 18px",
            borderRadius: "6px",
            border: "1px solid",
            borderColor: panelActivo === "ecab" ? "#dc2626" : "#cbd5e1",
            backgroundColor: panelActivo === "ecab" ? "#fef2f2" : "#ffffff",
            color: panelActivo === "ecab" ? "#b91c1c" : "#475569",
            fontWeight: 700,
            fontSize: "0.85rem",
            cursor: "pointer"
          }}
        >
          ECAB — Comité de Emergencia ({ecabConfig.miembros.length} miembros)
        </button>
      </div>

      {/* Reglas de Decisión del Comité */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Reglas de Decisión y Quórum: {comiteActual.nombre}
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Quórum Mínimo Requerido (Votantes)
            </label>
            <input
              type="number"
              value={comiteActual.quorum_minimo}
              onChange={e => actualizarComite({ quorum_minimo: Number(e.target.value) })}
              disabled={disabled}
              min={1}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Regla de Aprobación
            </label>
            <select
              value={comiteActual.regla_aprobacion}
              onChange={e => actualizarComite({ regla_aprobacion: e.target.value as any })}
              disabled={disabled}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            >
              <option value="mayoria_simple">Mayoría Simple (&gt; 50%)</option>
              <option value="mayoria_calificada">Mayoría Calificada (2/3)</option>
              <option value="dos_de_tres">2 de 3 Convocados (ECAB)</option>
              <option value="unanimidad">Unanimidad (100%)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Resolución de Empate
            </label>
            <select
              value={comiteActual.desempate}
              onChange={e => actualizarComite({ desempate: e.target.value as any })}
              disabled={disabled}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            >
              <option value="voto_calidad_presidente">Voto de Calidad del Presidente</option>
              <option value="aplazar">Aplazar a Siguiente Sesión</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Voto Asíncrono (Sin Reunión)
            </label>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={comiteActual.voto_asincrono_permitido}
                onChange={e => actualizarComite({ voto_asincrono_permitido: e.target.checked })}
                disabled={disabled}
              />
              <span style={{ fontSize: "0.8rem", color: "#334155" }}>Permitir ({comiteActual.plazo_voto_asincrono_horas}h plazo)</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "20px", marginTop: "14px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={comiteActual.presencia_presidente_obligatoria}
              onChange={e => actualizarComite({ presencia_presidente_obligatoria: e.target.checked })}
              disabled={disabled}
            />
            Presencia obligatoria del Presidente o su suplente para sesionar
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={comiteActual.exclusion_conflicto_interes}
              onChange={e => actualizarComite({ exclusion_conflicto_interes: e.target.checked })}
              disabled={disabled}
            />
            Exclusión automática de voto por Conflicto de Interés (Solicitante/Implementador)
          </label>
        </div>
      </div>

      {/* Composición del Comité */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Users size={18} style={{ color: "#2563eb" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Composición de Miembros ({comiteActual.miembros.length})
            </h3>
          </div>

          <button
            onClick={abrirModalNuevoMiembro}
            disabled={disabled}
            style={{
              backgroundColor: "#2563eb",
              color: "#ffffff",
              padding: "6px 12px",
              borderRadius: "6px",
              border: "none",
              fontWeight: 600,
              fontSize: "0.8rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <Plus size={14} />
            Agregar Miembro
          </button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0", color: "#475569" }}>
              <th style={{ padding: "8px 12px" }}>Usuario</th>
              <th style={{ padding: "8px 12px" }}>Rol en Comité</th>
              <th style={{ padding: "8px 12px" }}>Perfil de Origen</th>
              <th style={{ padding: "8px 12px" }}>Suplente Asignado</th>
              <th style={{ padding: "8px 12px" }}>Estado</th>
              <th style={{ padding: "8px 12px", textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comiteActual.miembros.map(m => (
              <tr key={m.id_usuario} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "8px 12px" }}>
                  <div style={{ fontWeight: 600, color: "#1e293b" }}>{m.nombre}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{m.correo}</div>
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <span style={{
                    padding: "3px 8px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    backgroundColor: m.rol_comite === "presidente" ? "#fef3c7" : m.rol_comite === "secretario" ? "#e0e7ff" : "#f1f5f9",
                    color: m.rol_comite === "presidente" ? "#b45309" : m.rol_comite === "secretario" ? "#3730a3" : "#334155"
                  }}>
                    {ROLES_COMITE.find(r => r.id === m.rol_comite)?.label.split(" (")[0] || m.rol_comite}
                  </span>
                </td>

                <td style={{ padding: "8px 12px", color: "#475569" }}>{m.perfil_origen}</td>

                <td style={{ padding: "8px 12px", color: "#334155" }}>
                  {m.suplente_nombre || "Sin suplente"}
                </td>

                <td style={{ padding: "8px 12px" }}>
                  <span style={{ color: m.activo ? "#16a34a" : "#94a3b8", fontWeight: 600, fontSize: "0.75rem" }}>
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>

                <td style={{ padding: "8px 12px", textAlign: "right" }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                    <button
                      onClick={() => abrirModalEditarMiembro(m)}
                      disabled={disabled}
                      style={{ padding: "4px 8px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#334155" }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleEliminarMiembro(m.id_usuario)}
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

      {/* Parámetros de reunión (Solo CAB) o ECAB */}
      {panelActivo === "cab" && cabConfig.reunion && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Calendar size={18} style={{ color: "#2563eb" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Reuniones Periódicas del CAB
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Frecuencia y Día
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  value={cabConfig.reunion.frecuencia}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, frecuencia: e.target.value } })}
                  style={{ width: "50%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                >
                  <option value="semanal">Semanal</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="mensual">Mensual</option>
                </select>
                <select
                  value={cabConfig.reunion.dia_semana}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, dia_semana: e.target.value } })}
                  style={{ width: "50%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
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
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Hora y Duración
              </label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="time"
                  value={cabConfig.reunion.hora_inicio}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, hora_inicio: e.target.value } })}
                  style={{ width: "50%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                />
                <input
                  type="number"
                  placeholder="Minutos"
                  value={cabConfig.reunion.duracion_minutos}
                  onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, duracion_minutos: Number(e.target.value) } })}
                  style={{ width: "50%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Corte de Agenda (Horas antes)
              </label>
              <input
                type="number"
                value={cabConfig.reunion.corte_agenda_horas}
                onChange={e => actualizarComite({ reunion: { ...cabConfig.reunion!, corte_agenda_horas: Number(e.target.value) } })}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Parámetros de ECAB */}
      {panelActivo === "ecab" && (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <Clock size={18} style={{ color: "#dc2626" }} />
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Protocolo de Decisión Inmediata de Emergencia (ECAB)
            </h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Plazo Máximo Decisión P1 (Horas)
              </label>
              <input
                type="number"
                value={ecabConfig.plazos_decision_horas?.p1 ?? 2}
                onChange={e => actualizarComite({ plazos_decision_horas: { ...ecabConfig.plazos_decision_horas!, p1: Number(e.target.value) } })}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                Canal de Convocatoria Inmediata
              </label>
              <select
                value={ecabConfig.canal_convocatoria_inmediata || "notificacion_y_correo"}
                onChange={e => actualizarComite({ canal_convocatoria_inmediata: e.target.value })}
                style={{ width: "100%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              >
                <option value="notificacion_y_correo">Notificación Push y Correo</option>
                <option value="sms_whatsapp">SMS / WhatsApp y Correo</option>
                <option value="todos">Todos los canales concurrentes</option>
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={ecabConfig.permitir_decision_verbal ?? true}
                  onChange={e => actualizarComite({ permitir_decision_verbal: e.target.checked })}
                />
                Permitir registro de decisión verbal con auditoría
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={ecabConfig.revision_retroactiva_cab_obligatoria ?? true}
                  onChange={e => actualizarComite({ revision_retroactiva_cab_obligatoria: e.target.checked })}
                />
                Exigir revisión retroactiva obligatoria por CAB
              </label>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MIEMBRO */}
      {modalMiembroAbierto && (
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
            maxWidth: "500px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              Miembro del Comité: {comiteActual.nombre}
            </h3>

            {errorMiembro && (
              <div style={{ padding: "10px", backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "6px", color: "#b91c1c", fontSize: "0.8rem", marginBottom: "14px" }}>
                {errorMiembro}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
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
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  {(catalogoUsuarios || []).map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.perfil})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
                  Rol en el Comité *
                </label>
                <select
                  value={miembroEnEdicion.rol_comite}
                  onChange={e => setMiembroEnEdicion({ ...miembroEnEdicion, rol_comite: e.target.value as any })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  {ROLES_COMITE.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
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
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
                >
                  <option value="">Sin suplente asignado</option>
                  {(catalogoUsuarios || []).map(u => (
                    <option key={u.id_usuario} value={u.id_usuario}>{u.nombre_completo} ({u.perfil})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={miembroEnEdicion.activo ?? true}
                    onChange={e => setMiembroEnEdicion({ ...miembroEnEdicion, activo: e.target.checked })}
                  />
                  Miembro activo en el comité
                </label>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setModalMiembroAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", color: "#475569" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarMiembro}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Guardar Miembro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROBAR QUÓRUM Y VOTACIÓN */}
      {modalQuorumAbierto && (
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
            maxWidth: "750px",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
              Simulador de Quórum y Votación: {comiteActual.nombre}
            </h3>

            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 16px 0" }}>
              Simule la asistencia de miembros, votos individuales, conflicto de intereses y ausencia para evaluar si se cumple el quórum y el dictamen final.
            </p>

            {/* Listado de miembros interactivo */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {simMiembros.map((m, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "#1e293b" }}>{m.nombre}</span>
                    <span style={{ fontSize: "0.7rem", color: "#64748b", marginLeft: "6px" }}>({m.rol_comite})</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={m.presente}
                        onChange={e => {
                          const copy = [...simMiembros];
                          copy[idx].presente = e.target.checked;
                          setSimMiembros(copy);
                          ejecutarSimulacionQuorum(copy);
                        }}
                      />
                      Presente
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", color: "#b91c1c" }}>
                      <input
                        type="checkbox"
                        checked={m.es_solicitante}
                        onChange={e => {
                          const copy = [...simMiembros];
                          copy[idx].es_solicitante = e.target.checked;
                          setSimMiembros(copy);
                          ejecutarSimulacionQuorum(copy);
                        }}
                      />
                      Conflicto Interés
                    </label>

                    <select
                      value={m.voto}
                      onChange={e => {
                        const copy = [...simMiembros];
                        copy[idx].voto = e.target.value;
                        setSimMiembros(copy);
                        ejecutarSimulacionQuorum(copy);
                      }}
                      style={{ padding: "4px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.75rem" }}
                    >
                      <option value="aprobar">Aprobar</option>
                      <option value="aprobar_con_condiciones">Aprobar c/ Condición</option>
                      <option value="rechazar">Rechazar</option>
                      <option value="aplazar">Aplazar</option>
                      <option value="abstencion">Abstención</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Resultado de la simulación */}
            {simResultado && (
              <div style={{ padding: "16px", backgroundColor: simResultado.quorum_alcanzado ? "#f0fdf4" : "#fef2f2", border: `1px solid ${simResultado.quorum_alcanzado ? "#86efac" : "#fca5a5"}`, borderRadius: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: simResultado.quorum_alcanzado ? "#15803d" : "#b91c1c" }}>
                    Quórum: {simResultado.quorum_alcanzado ? "Alcanzado" : "Insuficiente"} ({simResultado.votantes_presentes}/{simResultado.quorum_minimo} requeridos)
                  </span>
                  <span style={{ padding: "4px 10px", borderRadius: "4px", backgroundColor: "#1e293b", color: "#ffffff", fontWeight: 700, fontSize: "0.8rem" }}>
                    Dictamen: {simResultado.dictamen_final}
                  </span>
                </div>

                <p style={{ fontSize: "0.8rem", color: "#334155", margin: 0 }}>
                  {simResultado.detalle_dictamen}
                </p>

                {simResultado.excluidos_conflicto?.length > 0 && (
                  <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#b91c1c" }}>
                    <strong>Excluidos por Conflicto de Interés:</strong>
                    {simResultado.excluidos_conflicto.map((ex: any, i: number) => (
                      <span key={i} style={{ marginLeft: "6px" }}>{ex.nombre} ({ex.motivo})</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button
                onClick={() => setModalQuorumAbierto(false)}
                style={{ padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}
              >
                Cerrar Simulador
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
