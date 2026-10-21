"use client";

import React, { useState } from "react";

interface TipoCambioData {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  color: string;
  icono: string;
  perfiles_solicitud: string[];
  exigir_permiso_emergencia: boolean;
  anticipacion_horas: number;
  duracion_maxima_horas: number;
  corte_agenda_cab_horas: number;
  caducidad_autorizacion_dias: number;
  politica_ventana: string;
  politica_congelamiento: string;
  politica_feriados: string;
  pir_politica: string;
  pir_muestreo_pct: number;
  registro_retroactivo: boolean;
  plazo_documentacion_retroactiva_horas?: number;
  exige_autorizacion_retroactiva_cab?: boolean;
  exigir_implementador_antes_programar: boolean;
  exigir_plan_comunicacion_interrupcion: boolean;
  exigir_checklist_go_no_go: boolean;
}

interface RequisitoCampo {
  campo_key: string;
  label: string;
  estandar: "oculto" | "opcional" | "obligatorio";
  normal: "oculto" | "opcional" | "obligatorio";
  emergencia: "oculto" | "opcional" | "obligatorio";
  bloqueado_normativo?: boolean;
}

interface PestanaTiposCambioProps {
  config: {
    tipos: Record<string, TipoCambioData>;
    matriz_requisitos: RequisitoCampo[];
  };
  onChange: (nuevo: any) => void;
  onIrAMatrizAutoridad?: () => void;
}

const PERFILES_DISPONIBLES = [
  { id: "administrador", nombre: "Administrador" },
  { id: "gestor_cambios", nombre: "Gestor de Cambios" },
  { id: "supervisor", nombre: "Supervisor" },
  { id: "tecnico", nombre: "Técnico" },
  { id: "gestor_area", nombre: "Gestor de Área" },
  { id: "gestor_activos", nombre: "Gestor de Activos y Configuración" },
  { id: "gestor_problemas", nombre: "Gestor de Problemas" },
  { id: "aprobador", nombre: "Aprobador" }
];

export const PestanaTiposCambio: React.FC<PestanaTiposCambioProps> = ({
  config,
  onChange,
  onIrAMatrizAutoridad
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string>("estandar");
  const [seccionPlegada, setSeccionPlegada] = useState<Record<string, boolean>>({
    identidad: false,
    solicitud: false,
    tiempos: false,
    requisitos: false,
    calendario: false,
    autorizacion: false,
    pir: false,
    retroactivo: false,
    ejecucion: false
  });

  const tipos = config?.tipos || {};
  const matrizRequisitos = config?.matriz_requisitos || [];
  const tipoActual: TipoCambioData = tipos[tipoSeleccionado] || {
    id: tipoSeleccionado,
    codigo: tipoSeleccionado,
    nombre: tipoSeleccionado,
    descripcion: "",
    color: "#2563eb",
    icono: "FileText",
    perfiles_solicitud: [],
    exigir_permiso_emergencia: false,
    anticipacion_horas: 24,
    duracion_maxima_horas: 24,
    corte_agenda_cab_horas: 0,
    caducidad_autorizacion_dias: 7,
    politica_ventana: "dentro",
    politica_congelamiento: "bloquear",
    politica_feriados: "advertir",
    pir_politica: "siempre",
    pir_muestreo_pct: 100,
    registro_retroactivo: false,
    exigir_implementador_antes_programar: true,
    exigir_plan_comunicacion_interrupcion: true,
    exigir_checklist_go_no_go: true
  };

  const toggleSeccion = (sec: string) => {
    setSeccionPlegada((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const actualizarTipoActual = (parcial: Partial<TipoCambioData>) => {
    const nuevosTipos = {
      ...tipos,
      [tipoSeleccionado]: {
        ...tipoActual,
        ...parcial
      }
    };
    onChange({
      ...config,
      tipos: nuevosTipos
    });
  };

  const togglePerfil = (perfId: string) => {
    const actuales = tipoActual.perfiles_solicitud || [];
    const existe = actuales.includes(perfId);
    const nuevos = existe ? actuales.filter((p) => p !== perfId) : [...actuales, perfId];
    actualizarTipoActual({ perfiles_solicitud: nuevos });
  };

  const actualizarRequisito = (
    index: number,
    tipoKey: "estandar" | "normal" | "emergencia",
    valor: "oculto" | "opcional" | "obligatorio"
  ) => {
    const req = matrizRequisitos[index];
    if (req.bloqueado_normativo && (tipoKey === "normal" || tipoKey === "emergencia") && valor !== "obligatorio") {
      alert("Este campo forma parte del mínimo normativo ITIL v4 y no puede reducirse a opcional u oculto en tipos Normal y Emergencia.");
      return;
    }

    const nuevaMatriz = [...matrizRequisitos];
    nuevaMatriz[index] = {
      ...req,
      [tipoKey]: valor
    };
    onChange({
      ...config,
      matriz_requisitos: nuevaMatriz
    });
  };

  const copiarColumna = (origen: "estandar" | "normal" | "emergencia") => {
    if (!confirm(`¿Copiar los requisitos del tipo '${origen.toUpperCase()}' a '${tipoSeleccionado.toUpperCase()}'?`)) return;
    const destino = tipoSeleccionado as "estandar" | "normal" | "emergencia";
    const nuevaMatriz = matrizRequisitos.map((r) => {
      if (r.bloqueado_normativo && (destino === "normal" || destino === "emergencia")) {
        return { ...r, [destino]: "obligatorio" };
      }
      return { ...r, [destino]: r[origen] };
    });
    onChange({
      ...config,
      matriz_requisitos: nuevaMatriz
    });
  };

  const restaurarTipoActualFabrica = () => {
    if (!confirm(`¿Restaurar la configuración del tipo '${tipoActual.nombre}' a valores de fábrica ITIL v4?`)) return;
    // Dispara acción de restauración por defecto
    const valoresFabrica: Record<string, Partial<TipoCambioData>> = {
      estandar: {
        anticipacion_horas: 24,
        duracion_maxima_horas: 4,
        corte_agenda_cab_horas: 0,
        caducidad_autorizacion_dias: 30,
        politica_ventana: "dentro",
        politica_congelamiento: "bloquear",
        politica_feriados: "bloquear",
        pir_politica: "solo_si_falla_o_muestreo",
        pir_muestreo_pct: 10,
        registro_retroactivo: false,
        exigir_implementador_antes_programar: true,
        exigir_plan_comunicacion_interrupcion: true,
        exigir_checklist_go_no_go: true
      },
      normal: {
        anticipacion_horas: 72,
        duracion_maxima_horas: 48,
        corte_agenda_cab_horas: 24,
        caducidad_autorizacion_dias: 7,
        politica_ventana: "fuera_con_aprobacion",
        politica_congelamiento: "excepcion",
        politica_feriados: "advertir",
        pir_politica: "siempre",
        pir_muestreo_pct: 100,
        registro_retroactivo: false,
        exigir_implementador_antes_programar: true,
        exigir_plan_comunicacion_interrupcion: true,
        exigir_checklist_go_no_go: true
      },
      emergencia: {
        anticipacion_horas: 0,
        duracion_maxima_horas: 12,
        corte_agenda_cab_horas: 0,
        caducidad_autorizacion_dias: 1,
        politica_ventana: "libre",
        politica_congelamiento: "excepcion_ecab",
        politica_feriados: "ignorar",
        pir_politica: "siempre",
        pir_muestreo_pct: 100,
        registro_retroactivo: true,
        plazo_documentacion_retroactiva_horas: 24,
        exige_autorizacion_retroactiva_cab: true,
        exigir_implementador_antes_programar: true,
        exigir_plan_comunicacion_interrupcion: false,
        exigir_checklist_go_no_go: true
      }
    };
    if (valoresFabrica[tipoSeleccionado]) {
      actualizarTipoActual(valoresFabrica[tipoSeleccionado]);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>
      {/* Columna Izquierda: Tarjetas de los 3 Tipos de Cambio */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h4 style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
          Tipos de Cambio ITIL v4
        </h4>
        <p style={{ margin: "0 0 8px 0", fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
          Selecciona un tipo de cambio para configurar sus requisitos de registro, plazos y gobernanza.
        </p>

        {(["estandar", "normal", "emergencia"] as const).map((key) => {
          const t = tipos[key] || {
            nombre: key === "estandar" ? "Estándar" : key === "normal" ? "Normal" : "Emergencia",
            descripcion: "",
            color: key === "estandar" ? "#16a34a" : key === "normal" ? "#2563eb" : "#dc2626",
            anticipacion_horas: key === "estandar" ? 24 : key === "normal" ? 72 : 0
          };
          const seleccionado = tipoSeleccionado === key;

          return (
            <div
              key={key}
              onClick={() => setTipoSeleccionado(key)}
              style={{
                padding: "14px 16px",
                borderRadius: 8,
                border: seleccionado ? `2px solid ${t.color}` : "1px solid #cbd5e1",
                backgroundColor: seleccionado ? "#f8fafc" : "#ffffff",
                cursor: "pointer",
                boxShadow: seleccionado ? "0 2px 8px rgba(0, 0, 0, 0.06)" : "none",
                transition: "all 0.15s ease",
                borderLeft: `6px solid ${t.color}`
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                  {t.nombre}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "2px 6px",
                    borderRadius: 4,
                    backgroundColor: t.color + "18",
                    color: t.color
                  }}
                >
                  {t.anticipacion_horas}h anticipación
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 11.5, color: "#475569", lineHeight: 1.35 }}>
                {t.descripcion || "Tipo de cambio estándar normativo."}
              </p>
            </div>
          );
        })}

        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 6,
            backgroundColor: "#f1f5f9",
            border: "1px solid #e2e8f0",
            fontSize: 11.5,
            color: "#475569",
            lineHeight: 1.4
          }}
        >
          <strong style={{ color: "#1e293b", display: "block", marginBottom: 4 }}>
            Directriz ITIL v4:
          </strong>
          Los tres tipos de cambio son fundamentales para la gobernanza y no pueden eliminarse ni deshabilitarse. Su obligatoriedad técnica se coordina con la matriz de requisitos.
        </div>
      </div>

      {/* Columna Derecha: Panel de Configuración del Tipo Seleccionado */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Cabecera del Panel */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #cbd5e1"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: tipoActual.color
              }}
            />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
              Configuración de Cambio: {tipoActual.nombre}
            </h3>
            <span
              style={{
                fontSize: 11,
                fontFamily: "monospace",
                padding: "2px 6px",
                backgroundColor: "#f1f5f9",
                borderRadius: 4,
                color: "#64748b"
              }}
            >
              codigo: {tipoActual.codigo}
            </span>
          </div>

          <button
            type="button"
            onClick={restaurarTipoActualFabrica}
            style={{
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              color: "#475569",
              backgroundColor: "#f8fafc",
              border: "1px solid #cbd5e1",
              borderRadius: 6,
              cursor: "pointer"
            }}
          >
            Restaurar tipo a valores de fábrica
          </button>
        </div>

        {/* Sección 1: Identidad */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("identidad")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.identidad ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 1 — Identidad y Presentación
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.identidad ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.identidad && (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Nombre del tipo de cambio:
                </label>
                <input
                  type="text"
                  value={tipoActual.nombre}
                  onChange={(e) => actualizarTipoActual({ nombre: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Color distintivo:
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="color"
                    value={tipoActual.color}
                    onChange={(e) => actualizarTipoActual({ color: e.target.value })}
                    style={{ width: 40, height: 34, padding: 0, border: "1px solid #cbd5e1", borderRadius: 6, cursor: "pointer" }}
                  />
                  <input
                    type="text"
                    value={tipoActual.color}
                    onChange={(e) => actualizarTipoActual({ color: e.target.value })}
                    style={{ width: 120, padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6, fontFamily: "monospace" }}
                  />
                </div>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Descripción de ayuda para la persona solicitante:
                </label>
                <textarea
                  rows={2}
                  value={tipoActual.descripcion}
                  onChange={(e) => actualizarTipoActual({ descripcion: e.target.value })}
                  style={{ width: "100%", padding: "8px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6, resize: "vertical" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Sección 2: Quién puede solicitar */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("solicitud")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.solicitud ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 2 — Quién puede solicitar este tipo de cambio
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.solicitud ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.solicitud && (
            <div style={{ padding: 16 }}>
              <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#64748b" }}>
                Selecciona qué perfiles institucionales están habilitados para iniciar una solicitud de cambio con este tipo:
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                {PERFILES_DISPONIBLES.map((perf) => {
                  const check = (tipoActual.perfiles_solicitud || []).includes(perf.id);
                  return (
                    <label
                      key={perf.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "8px 10px",
                        borderRadius: 6,
                        backgroundColor: check ? "#f1f5f9" : "#ffffff",
                        border: "1px solid #e2e8f0",
                        fontSize: 12.5,
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={check}
                        onChange={() => togglePerfil(perf.id)}
                      />
                      <span style={{ color: "#1e293b", fontWeight: check ? 600 : 400 }}>
                        {perf.nombre}
                      </span>
                    </label>
                  );
                })}
              </div>

              {tipoSeleccionado === "emergencia" && (
                <div style={{ marginTop: 14, padding: 10, borderRadius: 6, backgroundColor: "#fee2e2", border: "1px solid #fecaca" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#991b1b", fontWeight: 700 }}>
                    <input
                      type="checkbox"
                      checked={true}
                      disabled={true}
                    />
                    Exigir permiso especial obligatorio: cambios.crear_emergencia (Bloqueado por directriz ITIL)
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección 3: Tiempos y Gobernanza Temporal */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("tiempos")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.tiempos ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 3 — Tiempos, Anticipación y Caducidad
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.tiempos ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.tiempos && (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Anticipación mínima de solicitud (horas):
                </label>
                <input
                  type="number"
                  min={0}
                  value={tipoActual.anticipacion_horas}
                  onChange={(e) => actualizarTipoActual({ anticipacion_horas: Number(e.target.value) })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Estándar: 24h · Normal: 72h · Emergencia: 0h
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Duración máxima autorizable de ventana (horas):
                </label>
                <input
                  type="number"
                  min={1}
                  value={tipoActual.duracion_maxima_horas}
                  onChange={(e) => actualizarTipoActual({ duracion_maxima_horas: Number(e.target.value) })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Corte de agenda del CAB (horas antes de reunión):
                </label>
                <input
                  type="number"
                  min={0}
                  value={tipoActual.corte_agenda_cab_horas}
                  onChange={(e) => actualizarTipoActual({ corte_agenda_cab_horas: Number(e.target.value) })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Aplica a Normal (fábrica: 24h antes)
                </span>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Caducidad de la autorización (días sin inicio de ejecución):
                </label>
                <input
                  type="number"
                  min={1}
                  value={tipoActual.caducidad_autorizacion_dias}
                  onChange={(e) => actualizarTipoActual({ caducidad_autorizacion_dias: Number(e.target.value) })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                />
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Estándar: 30d · Normal: 7d · Emergencia: 1d
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Sección 4: Matriz de Requisitos de Campos */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("requisitos")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.requisitos ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 4 — Requisitos de Campos por Tipo de Cambio (Matriz ITIL v4)
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.requisitos ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.requisitos && (
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                  Establece si cada campo del formulario es <strong>Oculto</strong>, <strong>Opcional</strong> u <strong>Obligatorio</strong> para cada tipo.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => copiarColumna("normal")}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Copiar columna de Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => copiarColumna("estandar")}
                    style={{
                      padding: "4px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: 4,
                      cursor: "pointer"
                    }}
                  >
                    Copiar columna de Estándar
                  </button>
                </div>
              </div>

              <div style={{ overflowX: "auto", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, textAlign: "left" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #cbd5e1" }}>
                      <th style={{ padding: "8px 12px", color: "#475569" }}>Campo del Formulario</th>
                      <th style={{ padding: "8px 12px", color: "#166534", width: 140 }}>Estándar</th>
                      <th style={{ padding: "8px 12px", color: "#1e40af", width: 140 }}>Normal</th>
                      <th style={{ padding: "8px 12px", color: "#991b1b", width: 140 }}>Emergencia</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrizRequisitos.map((req, idx) => (
                      <tr key={req.campo_key} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td style={{ padding: "8px 12px", color: "#1e293b", fontWeight: req.bloqueado_normativo ? 600 : 400 }}>
                          {req.label}
                          {req.bloqueado_normativo && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: "#64748b", fontWeight: 700 }}>
                              [Normativo [Bloqueado]]
                            </span>
                          )}
                        </td>

                        {/* Columna Estándar */}
                        <td style={{ padding: "6px 12px" }}>
                          <select
                            value={req.estandar}
                            onChange={(e) => actualizarRequisito(idx, "estandar", e.target.value as any)}
                            style={{
                              width: "100%",
                              padding: "4px 6px",
                              fontSize: 11.5,
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              backgroundColor: req.estandar === "obligatorio" ? "#dcfce7" : req.estandar === "oculto" ? "#f1f5f9" : "#ffffff",
                              color: req.estandar === "obligatorio" ? "#166534" : "#1e293b"
                            }}
                          >
                            <option value="oculto">Oculto</option>
                            <option value="opcional">Opcional</option>
                            <option value="obligatorio">Obligatorio</option>
                          </select>
                        </td>

                        {/* Columna Normal */}
                        <td style={{ padding: "6px 12px" }}>
                          <select
                            value={req.normal}
                            disabled={req.bloqueado_normativo}
                            onChange={(e) => actualizarRequisito(idx, "normal", e.target.value as any)}
                            style={{
                              width: "100%",
                              padding: "4px 6px",
                              fontSize: 11.5,
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              backgroundColor: req.normal === "obligatorio" ? "#dbeafe" : req.normal === "oculto" ? "#f1f5f9" : "#ffffff",
                              color: req.normal === "obligatorio" ? "#1e40af" : "#1e293b"
                            }}
                          >
                            <option value="oculto">Oculto</option>
                            <option value="opcional">Opcional</option>
                            <option value="obligatorio">Obligatorio</option>
                          </select>
                        </td>

                        {/* Columna Emergencia */}
                        <td style={{ padding: "6px 12px" }}>
                          <select
                            value={req.emergencia}
                            disabled={req.bloqueado_normativo && req.emergencia === "obligatorio"}
                            onChange={(e) => actualizarRequisito(idx, "emergencia", e.target.value as any)}
                            style={{
                              width: "100%",
                              padding: "4px 6px",
                              fontSize: 11.5,
                              borderRadius: 4,
                              border: "1px solid #cbd5e1",
                              backgroundColor: req.emergencia === "obligatorio" ? "#fee2e2" : req.emergencia === "oculto" ? "#f1f5f9" : "#ffffff",
                              color: req.emergencia === "obligatorio" ? "#991b1b" : "#1e293b"
                            }}
                          >
                            <option value="oculto">Oculto</option>
                            <option value="opcional">Opcional</option>
                            <option value="obligatorio">Obligatorio</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sección 5: Calendario y Ventanas */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("calendario")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.calendario ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 5 — Calendario, Ventanas y Períodos de Congelamiento
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.calendario ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.calendario && (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Política de ventana de mantenimiento:
                </label>
                <select
                  value={tipoActual.politica_ventana}
                  onChange={(e) => actualizarTipoActual({ politica_ventana: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="dentro">Solo dentro de ventanas vigentes</option>
                  <option value="fuera_con_aprobacion">Puede salir con etapa de aprobación adicional</option>
                  <option value="libre">Libre (Cualquier horario)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Períodos de congelamiento institucional:
                </label>
                <select
                  value={tipoActual.politica_congelamiento}
                  onChange={(e) => actualizarTipoActual({ politica_congelamiento: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="bloquear">Bloquear totalmente ejecución</option>
                  <option value="excepcion">Permitir con excepción aprobada</option>
                  <option value="excepcion_ecab">Permitir solo con excepción de ECAB</option>
                  <option value="ignorar">Ignorar período de congelamiento</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Intervención en feriados o no laborables:
                </label>
                <select
                  value={tipoActual.politica_feriados}
                  onChange={(e) => actualizarTipoActual({ politica_feriados: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="bloquear">Bloquear programación</option>
                  <option value="advertir">Advertir al solicitante</option>
                  <option value="ignorar">Permitir sin advertencia</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Sección 6: Autorización (Enlace a Matriz) */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("autorizacion")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.autorizacion ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 6 — Secuencia de Autorización Resultante
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.autorizacion ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.autorizacion && (
            <div style={{ padding: 16 }}>
              <p style={{ margin: "0 0 10px 0", fontSize: 12, color: "#475569" }}>
                Las etapas de aprobación para este tipo de cambio se determinan dinámicamente según la regla coincidente en la <strong>Matriz de Autoridad (1.3.3.2.2)</strong>.
              </p>
              <div style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12.5, color: "#1e293b" }}>
                  {tipoSeleccionado === "estandar"
                    ? "Riesgo Bajo: Sin aprobación previa (Autorización por modelo) · Otros riesgos: Reclasifica a Normal."
                    : tipoSeleccionado === "emergencia"
                    ? "Comité de Emergencia (ECAB) + Revisión posterior obligatoria por CAB."
                    : "Secuencia variable según riesgo: Técnica (Bajo) → Negocio (Medio) → CAB (Alto) → Dirección (Crítico)."}
                </span>
                {onIrAMatrizAutoridad && (
                  <button
                    type="button"
                    onClick={onIrAMatrizAutoridad}
                    style={{
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer"
                    }}
                  >
                    Editar en Matriz de autoridad →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sección 7: Revisión Post-Implementación (PIR) */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("pir")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.pir ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 7 — Revisión Post-Implementación (PIR)
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.pir ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.pir && (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                  Exigencia de PIR al concluir la intervención:
                </label>
                <select
                  value={tipoActual.pir_politica}
                  onChange={(e) => actualizarTipoActual({ pir_politica: e.target.value })}
                  style={{ width: "100%", padding: "7px 10px", fontSize: 12.5, border: "1px solid #cbd5e1", borderRadius: 6 }}
                >
                  <option value="siempre">Obligatoria siempre</option>
                  <option value="solo_si_falla_o_muestreo">Solo si no es exitoso o por muestreo</option>
                  <option value="opcional">Opcional</option>
                </select>
              </div>

              {tipoActual.pir_politica === "solo_si_falla_o_muestreo" && (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    Porcentaje de muestreo aleatorio en cambios exitosos (%):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={tipoActual.pir_muestreo_pct}
                    onChange={(e) => actualizarTipoActual({ pir_muestreo_pct: Number(e.target.value) })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sección 8: Documentación Retroactiva (Solo Emergencia) */}
        {tipoSeleccionado === "emergencia" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
            <div
              onClick={() => toggleSeccion("retroactivo")}
              style={{
                padding: "12px 16px",
                backgroundColor: "#fff1f2",
                borderBottom: seccionPlegada.retroactivo ? "none" : "1px solid #fecdd3",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer"
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13.5, color: "#9f1239" }}>
                Sección 8 — Documentación Retroactiva de Emergencias
              </span>
              <span style={{ fontSize: 12, color: "#9f1239" }}>{seccionPlegada.retroactivo ? "[+ Expandir]" : "[- Plegar]"}</span>
            </div>

            {!seccionPlegada.retroactivo && (
              <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 600, color: "#1e293b" }}>
                    <input
                      type="checkbox"
                      checked={tipoActual.registro_retroactivo}
                      onChange={(e) => actualizarTipoActual({ registro_retroactivo: e.target.checked })}
                    />
                    Permitir registrar la RFC de emergencia de manera retroactiva tras la resolución
                  </label>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    Plazo máximo para completar documentación (horas):
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={tipoActual.plazo_documentacion_retroactiva_horas || 24}
                    onChange={(e) => actualizarTipoActual({ plazo_documentacion_retroactiva_horas: Number(e.target.value) })}
                    style={{ width: "100%", padding: "7px 10px", fontSize: 13, border: "1px solid #cbd5e1", borderRadius: 6 }}
                  />
                </div>

                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#334155", marginTop: 22 }}>
                    <input
                      type="checkbox"
                      checked={tipoActual.exige_autorizacion_retroactiva_cab !== false}
                      onChange={(e) => actualizarTipoActual({ exige_autorizacion_retroactiva_cab: e.target.checked })}
                    />
                    Exigir autorización formal retroactiva en la siguiente sesión del CAB
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sección 9: Integración con Ejecución */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1", overflow: "hidden" }}>
          <div
            onClick={() => toggleSeccion("ejecucion")}
            style={{
              padding: "12px 16px",
              backgroundColor: "#f8fafc",
              borderBottom: seccionPlegada.ejecucion ? "none" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13.5, color: "#1e293b" }}>
              Sección 9 — Condiciones de Bloqueo e Integración con Ejecución
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{seccionPlegada.ejecucion ? "[+ Expandir]" : "[- Plegar]"}</span>
          </div>

          {!seccionPlegada.ejecucion && (
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1e293b" }}>
                <input
                  type="checkbox"
                  checked={tipoActual.exigir_implementador_antes_programar}
                  onChange={(e) => actualizarTipoActual({ exigir_implementador_antes_programar: e.target.checked })}
                />
                Exigir especialista técnico asignado antes de permitir pasar a estado <strong>Programado</strong>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1e293b" }}>
                <input
                  type="checkbox"
                  checked={tipoActual.exigir_plan_comunicacion_interrupcion}
                  onChange={(e) => actualizarTipoActual({ exigir_plan_comunicacion_interrupcion: e.target.checked })}
                />
                Exigir plan de comunicación a usuarios cuando el cambio indique interrupción de servicio
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#1e293b" }}>
                <input
                  type="checkbox"
                  checked={tipoActual.exigir_checklist_go_no_go}
                  onChange={(e) => actualizarTipoActual({ exigir_checklist_go_no_go: e.target.checked })}
                />
                Exigir checklist <strong>Go / No-Go</strong> con resultado favorable antes de permitir el inicio de ejecución
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
