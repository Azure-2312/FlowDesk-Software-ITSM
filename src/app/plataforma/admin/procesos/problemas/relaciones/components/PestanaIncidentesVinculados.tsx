"use client";

import React, { useState } from "react";

interface ConfigIncidentes {
  tipos_vinculo: string[];
  estados_incidente_permitidos: string[];
  max_incidentes_por_problema: number;
  permitir_vinculo_multiple_abierto: boolean;
  heredar_servicio: boolean;
  heredar_ci: boolean;
  heredar_categoria: boolean;
  perfiles_desvincular: number[];
  motivo_desvincular_obligatorio: boolean;
  mostrar_banner_incidente: boolean;
  mostrar_workaround_incidente: boolean;
  audiencia_workaround_mesa: boolean;
  audiencia_workaround_tecnicos: boolean;
  audiencia_workaround_solicitante: boolean;
  sugerir_problema_registro_incidente: boolean;
  accion_error_conocido: string;
  politica_cierre: string;
  codigo_resolucion_masiva: string;
  plantilla_nota_masiva: string;
  notificar_solicitantes_masiva: boolean;
  exigir_sin_incidentes_abiertos: boolean;
}

interface Props {
  config: ConfigIncidentes;
  onChange: (nuevaConfig: ConfigIncidentes) => void;
  onMarcarModificado: () => void;
}

export function PestanaIncidentesVinculados({ config, onChange, onMarcarModificado }: Props) {
  const [nuevoTipoVinculo, setNuevoTipoVinculo] = useState("");
  const [modalVistaPrevia, setModalVistaPrevia] = useState(false);

  function actualizar(campo: keyof ConfigIncidentes, valor: any) {
    onChange({ ...config, [campo]: valor });
    onMarcarModificado();
  }

  function agregarTipoVinculo() {
    if (!nuevoTipoVinculo.trim()) return;
    const actualizados = [...(config.tipos_vinculo || []), nuevoTipoVinculo.trim()];
    actualizar("tipos_vinculo", actualizados);
    setNuevoTipoVinculo("");
  }

  function eliminarTipoVinculo(index: number) {
    const actualizados = config.tipos_vinculo.filter((_, i) => i !== index);
    actualizar("tipos_vinculo", actualizados);
  }

  function toggleEstadoIncidente(estado: string) {
    const actuales = config.estados_incidente_permitidos || [];
    const actualizados = actuales.includes(estado)
      ? actuales.filter((e) => e !== estado)
      : [...actuales, estado];
    actualizar("estados_incidente_permitidos", actualizados);
  }

  const estadosDisponibles = [
    { codigo: "NUEVO", label: "Nuevo / Sin Asignar" },
    { codigo: "ASIGNADO", label: "Asignado a Técnico" },
    { codigo: "EN_PROCESO", label: "En Atención / En Proceso" },
    { codigo: "PENDIENTE_TERCERO", label: "En Espera de Tercero / Proveedor" },
    { codigo: "PENDIENTE_USUARIO", label: "En Espera del Solicitante" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          1.3.4.3.2 Incidentes vinculados
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
          Regula cómo se asocian incidentes a un problema, la visibilidad de soluciones provisionales (workarounds) y el comportamiento al resolver o cerrar el problema.
        </p>
      </div>

      {/* BLOQUE 1: VINCULACIÓN */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Bloque 1 — Reglas de Vinculación
        </h3>

        {/* Tipos de vínculo */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
            Catálogo de Tipos de Vínculo:
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 8 }}>
            {(config.tipos_vinculo || []).map((tipo, idx) => (
              <span
                key={idx}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: "#eff6ff",
                  color: "#1e40af",
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "1px solid #bfdbfe"
                }}
              >
                {tipo}
                <button
                  type="button"
                  onClick={() => eliminarTipoVinculo(idx)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#93c5fd",
                    cursor: "pointer",
                    padding: 0,
                    fontWeight: 700
                  }}
                  title="Eliminar tipo"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, maxWidth: 360 }}>
            <input
              type="text"
              className="input-base"
              placeholder="Nuevo tipo de vínculo..."
              value={nuevoTipoVinculo}
              onChange={(e) => setNuevoTipoVinculo(e.target.value)}
              style={{ fontSize: 12.5 }}
            />
            <button
              type="button"
              className="boton-secundario"
              style={{ width: "auto", padding: "4px 12px", fontSize: 12 }}
              onClick={agregarTipoVinculo}
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Estados de incidente permitidos */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
            Estados de Incidente que Pueden Vincularse:
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            {estadosDisponibles.map((est) => {
              const checked = (config.estados_incidente_permitidos || []).includes(est.codigo);
              return (
                <label key={est.codigo} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleEstadoIncidente(est.codigo)}
                  />
                  <span>{est.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 14 }}>
          <div className="campo">
            <label>Límite Máximo de Incidentes por Problema</label>
            <input
              type="number"
              min={1}
              max={5000}
              className="input-base"
              value={config.max_incidentes_por_problema || 500}
              onChange={(e) => actualizar("max_incidentes_por_problema", parseInt(e.target.value, 10) || 500)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 18 }}>
            <input
              type="checkbox"
              id="chk-vinculo-multiple"
              checked={config.permitir_vinculo_multiple_abierto || false}
              onChange={(e) => actualizar("permitir_vinculo_multiple_abierto", e.target.checked)}
            />
            <label htmlFor="chk-vinculo-multiple" style={{ fontSize: 12.5, cursor: "pointer" }}>
              Permitir que un incidente se vincule a más de un problema abierto simultáneamente
            </label>
          </div>
        </div>

        {/* Herencia al vincular */}
        <div style={{ backgroundColor: "#f8fafc", padding: 12, borderRadius: 6, border: "1px solid #e2e8f0" }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            Herencia Automática al Vincular (si el campo del problema está vacío):
          </label>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.heredar_servicio ?? true}
                onChange={(e) => actualizar("heredar_servicio", e.target.checked)}
              />
              <span>Heredar Servicio</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.heredar_ci ?? true}
                onChange={(e) => actualizar("heredar_ci", e.target.checked)}
              />
              <span>Heredar Elemento de Configuración (CI)</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={config.heredar_categoria ?? true}
                onChange={(e) => actualizar("heredar_categoria", e.target.checked)}
              />
              <span>Heredar Categoría</span>
            </label>
          </div>
        </div>
      </div>

      {/* BLOQUE 2: VISIBILIDAD EN EL INCIDENTE */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Bloque 2 — Visibilidad y Comunicación en el Incidente
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.mostrar_banner_incidente ?? true}
              onChange={(e) => actualizar("mostrar_banner_incidente", e.target.checked)}
            />
            <span>Mostrar banner distintivo: <strong>"Vinculado al problema PRB-xxxxxx"</strong> en la cabecera del incidente</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.mostrar_workaround_incidente ?? true}
              onChange={(e) => actualizar("mostrar_workaround_incidente", e.target.checked)}
            />
            <span>Mostrar el Workaround (solución temporal) vigente en la vista del ticket de incidente</span>
          </label>

          {config.mostrar_workaround_incidente && (
            <div style={{ marginLeft: 26, padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0", display: "flex", gap: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>Audiencia autorizada:</span>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.audiencia_workaround_mesa ?? true}
                  onChange={(e) => actualizar("audiencia_workaround_mesa", e.target.checked)}
                />
                <span>Mesa de Ayuda</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.audiencia_workaround_tecnicos ?? true}
                  onChange={(e) => actualizar("audiencia_workaround_tecnicos", e.target.checked)}
                />
                <span>Especialistas Técnicos</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.audiencia_workaround_solicitante ?? false}
                  onChange={(e) => actualizar("audiencia_workaround_solicitante", e.target.checked)}
                />
                <span>Solicitante / Portal</span>
              </label>
            </div>
          )}

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.sugerir_problema_registro_incidente ?? true}
              onChange={(e) => actualizar("sugerir_problema_registro_incidente", e.target.checked)}
            />
            <span>Sugerir proactivamente problemas abiertos y errores conocidos al redactar un nuevo incidente</span>
          </label>
        </div>
      </div>

      {/* BLOQUE 3 Y 4: ACCIONES AL AVANZAR O CERRAR EL PROBLEMA */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Bloques 3 y 4 — Automatizaciones al Alcanzar Error Conocido, Resuelto o Cerrado
        </h3>

        {/* Al llegar a Error Conocido */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
            Acción sobre incidentes abiertos al pasar a <em>Error Conocido</em>:
          </label>
          <div style={{ display: "flex", gap: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="radio"
                name="accion_error_conocido"
                value="agregar_nota_workaround"
                checked={config.accion_error_conocido === "agregar_nota_workaround"}
                onChange={(e) => actualizar("accion_error_conocido", e.target.value)}
              />
              <span>Agregar nota técnica automática con el workaround</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="radio"
                name="accion_error_conocido"
                value="notificar_responsables"
                checked={config.accion_error_conocido === "notificar_responsables"}
                onChange={(e) => actualizar("accion_error_conocido", e.target.value)}
              />
              <span>Solo notificar a técnicos asignados</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
              <input
                type="radio"
                name="accion_error_conocido"
                value="nada"
                checked={config.accion_error_conocido === "nada"}
                onChange={(e) => actualizar("accion_error_conocido", e.target.value)}
              />
              <span>No realizar ninguna acción</span>
            </label>
          </div>
        </div>

        {/* Al llegar a Resuelto / Cerrado */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
            Política de Cierre para Incidentes Vinculados:
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="radio"
                name="politica_cierre"
                value="C_resolucion_asistida"
                checked={config.politica_cierre === "C_resolucion_asistida"}
                onChange={(e) => actualizar("politica_cierre", e.target.value)}
              />
              <span>
                <strong>C) Resolución asistida (Recomendada ITIL 4):</strong> Muestra un modal al cerrar con la lista de incidentes abiertos vinculados para seleccionar individualmente cuáles resolver.
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="radio"
                name="politica_cierre"
                value="B_resolucion_masiva"
                checked={config.politica_cierre === "B_resolucion_masiva"}
                onChange={(e) => actualizar("politica_cierre", e.target.value)}
              />
              <span>
                <strong>B) Resolución masiva automática:</strong> Resuelve en bloque todos los incidentes abiertos vinculados al cerrar el problema.
              </span>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input
                type="radio"
                name="politica_cierre"
                value="A_no_tocar"
                checked={config.politica_cierre === "A_no_tocar"}
                onChange={(e) => actualizar("politica_cierre", e.target.value)}
              />
              <span>
                <strong>A) No tocar los incidentes:</strong> Los técnicos de cada ticket deben resolverlos de forma manual e independiente.
              </span>
            </label>
          </div>
        </div>

        {/* Configuración de plantilla de nota masiva si aplica */}
        {config.politica_cierre !== "A_no_tocar" && (
          <div style={{ backgroundColor: "#f8fafc", padding: 14, borderRadius: 6, border: "1px solid #e2e8f0", marginTop: 12 }}>
            <div className="campo" style={{ marginBottom: 12 }}>
              <label>Plantilla de Nota de Resolución en Incidentes</label>
              <textarea
                className="input-base"
                rows={2}
                value={config.plantilla_nota_masiva || ""}
                onChange={(e) => actualizar("plantilla_nota_masiva", e.target.value)}
              />
              <span style={{ fontSize: 11, color: "#64748b" }}>
                Variables disponibles: <code>{"{problema_id}"}</code>, <code>{"{solucion}"}</code>, <code>{"{fecha}"}</code>
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={config.notificar_solicitantes_masiva ?? true}
                  onChange={(e) => actualizar("notificar_solicitantes_masiva", e.target.checked)}
                />
                <span>Notificar por correo a los solicitantes del incidente al resolverse</span>
              </label>

              <button
                type="button"
                className="boton-secundario"
                style={{ width: "auto", padding: "4px 10px", fontSize: 12 }}
                onClick={() => setModalVistaPrevia(true)}
              >
                Vista previa del texto de nota y notificación
              </button>
            </div>
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.exigir_sin_incidentes_abiertos ?? true}
              onChange={(e) => actualizar("exigir_sin_incidentes_abiertos", e.target.checked)}
            />
            <span>
              <strong>Gobernanza de Cierre:</strong> Exigir que ningún incidente abierto quede sin decisión antes de autorizar el cierre definitivo del problema.
            </span>
          </label>
        </div>
      </div>

      {/* MODAL DE VISTA PREVIA */}
      {modalVistaPrevia && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: 10,
            maxWidth: 600,
            width: "100%",
            padding: 24,
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 14px 0", color: "#0f172a" }}>
              Vista Previa: Comunicación al Incidente Vinculado
            </h3>

            <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: 6 }}>
                Nota Pública / Bitácora del Incidente:
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#1e293b", lineHeight: 1.5 }}>
                {(config.plantilla_nota_masiva || "")
                  .replace("{problema_id}", "PRB-000412")
                  .replace("{solucion}", "Actualización de firmware en switch perimetral y depuración de tablas ARP.")}
              </p>
            </div>

            <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: 14, marginBottom: 18 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", fontWeight: 700, color: "#1e40af", marginBottom: 6 }}>
                Notificación por Correo al Solicitante:
              </div>
              <div style={{ fontSize: 12.5, color: "#1e3a8a" }}>
                <strong>Asunto:</strong> Su incidente INC-001842 ha sido resuelto mediante la solución del problema PRB-000412
              </div>
              <div style={{ fontSize: 12, color: "#3b82f6", marginTop: 4 }}>
                Estimado(a) colaborador(a), le informamos que la causa raíz de la incidencia reportada ha sido subsanada de forma permanente por el equipo de infraestructura.
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="boton-primario"
                style={{ width: "auto", padding: "6px 18px", fontSize: 13 }}
                onClick={() => setModalVistaPrevia(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
