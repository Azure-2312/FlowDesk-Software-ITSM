"use client";

import React from "react";

interface ConfigRfc {
  exigir_rfc_para_pendiente_cambio: boolean;
  permitir_varias_rfc: boolean;
  maximo_rfc: number;
  tipo_cambio_sugerido: string;
  regla_p1_riesgo_recurrencia: boolean;
  mapeo_campos: Array<{ origen: string; campo_problema: string; destino: string; campo_rfc: string }>;
  exigir_todas_rfc_implementadas_exito: boolean;
  accion_rfc_fallida: string;
  crear_tarea_rfc_fallida: boolean;
  plantilla_tarea_rfc_fallida: string;
  notificar_roles_rfc_fallida: string[];
  pasar_automatico_a_resuelto: boolean;
  verificacion_post_cambio_dias: number;
  sincronizacion_tiempo_real: boolean;
}

interface Props {
  config: ConfigRfc;
  onChange: (nuevaConfig: ConfigRfc) => void;
  onMarcarModificado: () => void;
}

export function PestanaRfc({ config, onChange, onMarcarModificado }: Props) {
  function actualizar(campo: keyof ConfigRfc, valor: any) {
    onChange({ ...config, [campo]: valor });
    onMarcarModificado();
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          Solicitudes de cambio (RFC)
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
          Articula la transición hacia la Gestión de Cambios (ITIL 4), garantizando que las soluciones permanentes a fallas estructurales se implementen bajo control de cambios.
        </p>
      </div>

      {/* REGLAS DE ENLACE Y BLOQUEO */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Reglas de Enlace Obligatorio y Capacidad
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.exigir_rfc_para_pendiente_cambio ?? true}
              onChange={(e) => actualizar("exigir_rfc_para_pendiente_cambio", e.target.checked)}
            />
            <span>
              <strong>Exigir RFC cuando la solución permanente requiere cambio:</strong> Impide transicionar el problema a <em>Pendiente de cambio</em> sin una RFC vinculada.
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.regla_p1_riesgo_recurrencia ?? true}
              onChange={(e) => actualizar("regla_p1_riesgo_recurrencia", e.target.checked)}
            />
            <span>
              <strong>Regla P1 de Emergencia:</strong> Si la prioridad del problema es P1 y existe alto riesgo de recurrencia, sugerir automáticamente tipo de cambio de <em>Emergencia</em>.
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="campo">
            <label>Tipo de Cambio Sugerido por Defecto</label>
            <select
              className="input-base"
              value={config.tipo_cambio_sugerido || "Normal"}
              onChange={(e) => actualizar("tipo_cambio_sugerido", e.target.value)}
            >
              <option value="Normal">Normal (Evaluación Estándar / CAB)</option>
              <option value="Estándar">Estándar (Procedimiento Preaprobado)</option>
              <option value="Emergencia">Emergencia (ECAB / Atención Urgente)</option>
            </select>
          </div>

          <div className="campo">
            <label>Permitir Múltiples RFC</label>
            <select
              className="input-base"
              value={config.permitir_varias_rfc ? "si" : "no"}
              onChange={(e) => actualizar("permitir_varias_rfc", e.target.value === "si")}
            >
              <option value="si">Sí, permitir varias RFC por problema</option>
              <option value="no">No, máximo 1 RFC por problema</option>
            </select>
          </div>

          <div className="campo">
            <label>Tope Máximo de RFCs</label>
            <input
              type="number"
              min={1}
              max={20}
              className="input-base"
              value={config.maximo_rfc || 5}
              onChange={(e) => actualizar("maximo_rfc", parseInt(e.target.value, 10) || 5)}
              disabled={!config.permitir_varias_rfc}
            />
          </div>
        </div>
      </div>

      {/* MAPEO DE PRELLENADO DE LA RFC */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Mapeo de Prellenado de la RFC (Problema → Cambio)
        </h3>

        <p style={{ margin: "0 0 12px 0", fontSize: 12.5, color: "#64748b" }}>
          Campos que se transfieren automáticamente al pulsar "Crear RFC desde problema":
        </p>

        <div className="contenedor-tabla">
          <table className="tabla" style={{ fontSize: 12.5 }}>
            <thead>
              <tr>
                <th>Campo Origen (Problema)</th>
                <th style={{ width: 40, textAlign: "center" }}>→</th>
                <th>Campo Destino (RFC de Cambio)</th>
                <th>Estado de Prellenado</th>
              </tr>
            </thead>
            <tbody>
              {(config.mapeo_campos || []).map((m, idx) => (
                <tr key={idx}>
                  <td><strong>{m.campo_problema}</strong></td>
                  <td style={{ textAlign: "center", color: "#3b82f6" }}>→</td>
                  <td><span style={{ color: "#0f172a", fontWeight: 600 }}>{m.campo_rfc}</span></td>
                  <td>
                    <span style={{ fontSize: 11.5, color: "#16a34a", fontWeight: 600 }}>
                      Sincronizado
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AUTOMATIZACIONES Y RETORNO TRAS RESULTADO DE LA RFC */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Condiciones para Resolver y Tratamiento de Fallas de Cambio
        </h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.exigir_todas_rfc_implementadas_exito ?? true}
              onChange={(e) => actualizar("exigir_todas_rfc_implementadas_exito", e.target.checked)}
            />
            <span>
              <strong>Condición de Resolución:</strong> Exigir que todas las RFC vinculadas estén en estado <em>Implementado con éxito</em> o <em>Cerrado</em> antes de permitir pasar a <em>Resuelto</em>.
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div className="campo">
            <label>Si la RFC es Rechazada, Falla o se Cancela:</label>
            <select
              className="input-base"
              value={config.accion_rfc_fallida || "volver_causa_raiz"}
              onChange={(e) => actualizar("accion_rfc_fallida", e.target.value)}
            >
              <option value="volver_causa_raiz">Retornar a estado: Causa raíz identificada</option>
              <option value="volver_en_analisis">Retornar a estado: En análisis</option>
            </select>
          </div>

          <div className="campo">
            <label>Si el Cambio se Implementa con Éxito:</label>
            <div style={{ paddingTop: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.pasar_automatico_a_resuelto ?? true}
                  onChange={(e) => actualizar("pasar_automatico_a_resuelto", e.target.checked)}
                />
                <span>Pasar automáticamente el problema a <strong>Resuelto</strong></span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="campo">
            <label>Plantilla de Tarea ante Falla de RFC</label>
            <input
              type="text"
              className="input-base"
              value={config.plantilla_tarea_rfc_fallida || ""}
              onChange={(e) => actualizar("plantilla_tarea_rfc_fallida", e.target.value)}
            />
            <span style={{ fontSize: 11, color: "#64748b" }}>Crea automáticamente una tarea para reevaluar la solución técnica</span>
          </div>

          <div className="campo">
            <label>Verificación Post-Cambio (Días de Observación)</label>
            <input
              type="number"
              min={1}
              max={60}
              className="input-base"
              value={config.verificacion_post_cambio_dias || 7}
              onChange={(e) => actualizar("verificacion_post_cambio_dias", parseInt(e.target.value, 10) || 7)}
            />
            <span style={{ fontSize: 11, color: "#64748b" }}>Crea tarea: "Confirmar que no ha recurrido" a los N días</span>
          </div>
        </div>
      </div>
    </div>
  );
}
