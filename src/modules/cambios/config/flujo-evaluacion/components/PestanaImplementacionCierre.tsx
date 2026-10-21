"use client";

import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Database, Archive, Eye, ShieldCheck, RefreshCw } from "@/shared/components/ui/Iconos";

interface ImplementacionCierreConfig {
  resultado_bitacora?: {
    campos_exigidos: string[];
    bitacora_obligatoria: boolean;
    tolerancia_inicio_minutos: number;
    tolerancia_fin_minutos: number;
    exigir_motivo_exceso_ventana: boolean;
  };
  acciones_por_resultado?: {
    fallido_o_rollback: {
      exigir_causa_fallo: boolean;
      crear_incidente_vinculado: boolean;
      plantilla_incidente: string;
      heredar_prioridad: boolean;
      crear_problema_si_sugiere: boolean;
      plantilla_problema: string;
      notificar_roles: string[];
      etiquetar_rfc: string[];
      etiquetar_ci: boolean;
      suspender_modelo_estandar_si_aplica: boolean;
      forzar_pir_obligatoria: boolean;
    };
    parcial: {
      exigir_descripcion_pendiente: boolean;
      crear_rfc_seguimiento_opcional: boolean;
      forzar_pir: boolean;
    };
    exitoso: {
      programar_pir_segun_tipo: boolean;
    };
  };
  actualizacion_cmdb?: {
    exigir_plan_actualizacion_cmdb_antes_programar: boolean;
    aplicar_automaticamente_en_exitoso: boolean;
    bloquear_cierre_si_hay_actualizaciones_cmdb_pendientes: boolean;
    notificar_gestor_activos: boolean;
  };
  cierre?: {
    exigir_codigo_cierre: boolean;
    exigir_resumen_cierre: boolean;
    cierre_automatico_dias_sin_pir: number;
    permitir_reapertura: boolean;
    excepcion_reapertura_gestor_dias: number;
    exigir_motivo_reapertura: boolean;
  };
}

interface PestanaImplementacionCierreProps {
  snapshot: ImplementacionCierreConfig;
  onChange: (nuevoSnapshot: ImplementacionCierreConfig) => void;
  disabled?: boolean;
}

export const PestanaImplementacionCierre: React.FC<PestanaImplementacionCierreProps> = ({ snapshot, onChange, disabled }) => {
  const bitacora = snapshot?.resultado_bitacora || {
    campos_exigidos: ["resultado", "fecha_inicio_real", "fecha_fin_real", "duracion_interrupcion_real", "bitacora_detallada"],
    bitacora_obligatoria: true,
    tolerancia_inicio_minutos: 30,
    tolerancia_fin_minutos: 30,
    exigir_motivo_exceso_ventana: true
  };

  const acciones = snapshot?.acciones_por_resultado || {
    fallido_o_rollback: {
      exigir_causa_fallo: true,
      crear_incidente_vinculado: true,
      plantilla_incidente: "Incidente mayor por cambio fallido",
      heredar_prioridad: true,
      crear_problema_si_sugiere: true,
      plantilla_problema: "Investigación de causa raíz por fallo de RFC",
      notificar_roles: ["gestor_cambios", "supervisor", "responsables_servicio"],
      etiquetar_rfc: ["Fallido", "Rollback"],
      etiquetar_ci: true,
      suspender_modelo_estandar_si_aplica: true,
      forzar_pir_obligatoria: true
    },
    parcial: {
      exigir_descripcion_pendiente: true,
      crear_rfc_seguimiento_opcional: true,
      forzar_pir: true
    },
    exitoso: {
      programar_pir_segun_tipo: true
    }
  };

  const cmdb = snapshot?.actualizacion_cmdb || {
    exigir_plan_actualizacion_cmdb_antes_programar: true,
    aplicar_automaticamente_en_exitoso: false,
    bloquear_cierre_si_hay_actualizaciones_cmdb_pendientes: true,
    notificar_gestor_activos: true
  };

  const cierre = snapshot?.cierre || {
    exigir_codigo_cierre: true,
    exigir_resumen_cierre: true,
    cierre_automatico_dias_sin_pir: 5,
    permitir_reapertura: false,
    excepcion_reapertura_gestor_dias: 3,
    exigir_motivo_reapertura: true
  };

  const [modalVistaPreviaAbierto, setModalVistaPreviaAbierto] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Encabezado */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            1.3.3.3.7 Parámetros de Implementación, CMDB y Cierre Formal
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>
            Requisitos de registro de resultado, acciones automáticas ante fallo, sincronización de CMDB y políticas de cierre.
          </p>
        </div>

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
          Vista Previa de Modales de Cierre
        </button>
      </div>

      {/* BLOQUE 1: RESULTADO Y BITÁCORA */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Bloque 1: Registro de Resultado y Bitácora de Ejecución
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={bitacora.bitacora_obligatoria}
                onChange={e => onChange({ ...snapshot, resultado_bitacora: { ...bitacora, bitacora_obligatoria: e.target.checked } })}
                disabled={disabled}
              />
              <strong>Bitácora de ejecución obligatoria</strong> al transicionar a 'Implementado'
            </label>
          </div>

          <div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={bitacora.exigir_motivo_exceso_ventana}
                onChange={e => onChange({ ...snapshot, resultado_bitacora: { ...bitacora, exigir_motivo_exceso_ventana: e.target.checked } })}
                disabled={disabled}
              />
              Exigir motivo justificado si la ejecución supera la ventana autorizada
            </label>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Tolerancia de Inicio y Fin (Minutos)
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="number"
                title="Tolerancia Inicio"
                value={bitacora.tolerancia_inicio_minutos}
                onChange={e => onChange({ ...snapshot, resultado_bitacora: { ...bitacora, tolerancia_inicio_minutos: Number(e.target.value) } })}
                disabled={disabled}
                style={{ width: "50%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
              <input
                type="number"
                title="Tolerancia Fin"
                value={bitacora.tolerancia_fin_minutos}
                onChange={e => onChange({ ...snapshot, resultado_bitacora: { ...bitacora, tolerancia_fin_minutos: Number(e.target.value) } })}
                disabled={disabled}
                style={{ width: "50%", padding: "6px 8px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.8rem" }}
              />
            </div>
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Tolerancia inicio / fin respecto a la ventana</span>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: ACCIONES AUTOMÁTICAS POR RESULTADO */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: "0 0 12px 0" }}>
          Bloque 2: Acciones Automáticas según Resultado Registrado
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Fallido / Rollback */}
          <div style={{ padding: "12px", backgroundColor: "#fef2f2", border: "1px solid #fca5a5", borderRadius: "6px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
              <AlertTriangle size={16} style={{ color: "#dc2626" }} />
              <strong style={{ fontSize: "0.85rem", color: "#991b1b" }}>
                Resultado: Fallido o Rollback Ejecutado
              </strong>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px", fontSize: "0.8rem", color: "#7f1d1d" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.fallido_o_rollback.exigir_causa_fallo}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      fallido_o_rollback: { ...acciones.fallido_o_rollback, exigir_causa_fallo: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Exigir causa de fallo del catálogo obligatorio
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.fallido_o_rollback.crear_incidente_vinculado}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      fallido_o_rollback: { ...acciones.fallido_o_rollback, crear_incidente_vinculado: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Crear Incidente vinculado automáticamente
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.fallido_o_rollback.crear_problema_si_sugiere}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      fallido_o_rollback: { ...acciones.fallido_o_rollback, crear_problema_si_sugiere: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Crear Registro de Problema para análisis de causa raíz
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.fallido_o_rollback.suspender_modelo_estandar_si_aplica}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      fallido_o_rollback: { ...acciones.fallido_o_rollback, suspender_modelo_estandar_si_aplica: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Suspender modelo estándar si supera umbral de fallos
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.fallido_o_rollback.forzar_pir_obligatoria}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      fallido_o_rollback: { ...acciones.fallido_o_rollback, forzar_pir_obligatoria: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Forzar Revisión Post-Implementación (PIR) obligatoria
              </label>
            </div>
          </div>

          {/* Parcial */}
          <div style={{ padding: "12px", backgroundColor: "#fffbeb", border: "1px solid #fde68a", borderRadius: "6px" }}>
            <strong style={{ fontSize: "0.85rem", color: "#92400e" }}>Resultado: Parcial</strong>
            <div style={{ display: "flex", gap: "20px", marginTop: "6px", fontSize: "0.8rem", color: "#78350f" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.parcial.exigir_descripcion_pendiente}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      parcial: { ...acciones.parcial, exigir_descripcion_pendiente: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Exigir descripción detallada de actividades pendientes
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={acciones.parcial.crear_rfc_seguimiento_opcional}
                  onChange={e => onChange({
                    ...snapshot,
                    acciones_por_resultado: {
                      ...acciones,
                      parcial: { ...acciones.parcial, crear_rfc_seguimiento_opcional: e.target.checked }
                    }
                  })}
                  disabled={disabled}
                />
                Habilitar creación de RFC de seguimiento vinculada
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* BLOQUE 3: ACTUALIZACIÓN DE CMDB */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Database size={18} style={{ color: "#2563eb" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Bloque 3: Integración y Actualización de la CMDB (ITIL 4: Service Configuration Management)
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", fontSize: "0.85rem" }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={cmdb.exigir_plan_actualizacion_cmdb_antes_programar}
              onChange={e => onChange({ ...snapshot, actualizacion_cmdb: { ...cmdb, exigir_plan_actualizacion_cmdb_antes_programar: e.target.checked } })}
              disabled={disabled}
            />
            <span><strong>Exigir plan de actualización de CMDB</strong> antes de programar si el cambio modifica atributos de activos.</span>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={cmdb.bloquear_cierre_si_hay_actualizaciones_cmdb_pendientes}
              onChange={e => onChange({ ...snapshot, actualizacion_cmdb: { ...cmdb, bloquear_cierre_si_hay_actualizaciones_cmdb_pendientes: e.target.checked } })}
              disabled={disabled}
            />
            <span><strong>Bloquear el cierre definitivo</strong> si existen actualizaciones de CMDB pendientes de aplicar.</span>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={cmdb.aplicar_automaticamente_en_exitoso}
              onChange={e => onChange({ ...snapshot, actualizacion_cmdb: { ...cmdb, aplicar_automaticamente_en_exitoso: e.target.checked } })}
              disabled={disabled}
            />
            <span>Aplicar automáticamente los cambios a la CMDB al registrar éxito (Por defecto: no, requiere acción manual del Gestor de Activos).</span>
          </label>
        </div>
      </div>

      {/* BLOQUE 4: CIERRE Y REAPERTURA */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e2e8f0", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <Archive size={18} style={{ color: "#2563eb" }} />
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
            Bloque 4: Cierre Formal y Reglas de Reapertura
          </h3>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Cierre Automático sin PIR (Días)
            </label>
            <input
              type="number"
              value={cierre.cierre_automatico_dias_sin_pir}
              onChange={e => onChange({ ...snapshot, cierre: { ...cierre, cierre_automatico_dias_sin_pir: Number(e.target.value) } })}
              disabled={disabled}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Días tras Implementado si no exige PIR</span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Ventana de Excepción Reapertura (Días)
            </label>
            <input
              type="number"
              value={cierre.excepcion_reapertura_gestor_dias}
              onChange={e => onChange({ ...snapshot, cierre: { ...cierre, excepcion_reapertura_gestor_dias: Number(e.target.value) } })}
              disabled={disabled}
              style={{ width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.85rem" }}
            />
            <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Solo Gestor de Cambios con motivo justificado</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={cierre.exigir_codigo_cierre}
                onChange={e => onChange({ ...snapshot, cierre: { ...cierre, exigir_codigo_cierre: e.target.checked } })}
                disabled={disabled}
              />
              Código de cierre del catálogo obligatorio
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.85rem", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={cierre.exigir_resumen_cierre}
                onChange={e => onChange({ ...snapshot, cierre: { ...cierre, exigir_resumen_cierre: e.target.checked } })}
                disabled={disabled}
              />
              Resumen ejecutivo de cierre obligatorio
            </label>
          </div>
        </div>
      </div>

      {/* MODAL VISTA PREVIA DE MODALES */}
      {modalVistaPreviaAbierto && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", width: "100%", maxWidth: "600px", padding: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>
              Vista Previa: Modal Operativo de Cierre de RFC
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", border: "1px solid #cbd5e1", padding: "16px", borderRadius: "6px", backgroundColor: "#f8fafc" }}>
              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>Código de Cierre *</label>
                <select style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem", marginTop: "4px" }}>
                  <option>Implementado con éxito</option>
                  <option>Implementado con observaciones</option>
                  <option>Implementado parcialmente</option>
                  <option>Fallido – revertido</option>
                  <option>Fallido – sin reversión</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#334155" }}>Resumen Ejecutivo de Cierre *</label>
                <textarea rows={3} placeholder="Detalle el resultado final de la intervención y conformidad..." style={{ width: "100%", padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: "4px", fontSize: "0.85rem", marginTop: "4px" }} />
              </div>

              <div style={{ padding: "8px 12px", backgroundColor: "#eff6ff", borderRadius: "4px", fontSize: "0.75rem", color: "#1e40af" }}>
                Validaciones activas: Verificación de estado de CMDB, verificación de PIR aprobada y cierre formal sin reapertura.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
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
