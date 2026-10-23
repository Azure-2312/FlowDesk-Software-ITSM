"use client";

import React from "react";

interface ConfigCmdb {
  herencia_ci_desde_incidentes: boolean;
  validar_relacion_ci_servicio: string;
  clases_ci_permitidas: string[];
  maximo_ci_por_problema: number;
  mostrar_marca_problema_abierto: boolean;
  mostrar_marca_ke_vigente: boolean;
  sugerir_impacto_alto_si_criticidad_mayor: string;
  servicio_critico_activa_problema_mayor: boolean;
  accion_baja_ci_con_problemas: string;
}

interface Props {
  config: ConfigCmdb;
  clasesDisponibles: string[];
  onChange: (nuevaConfig: ConfigCmdb) => void;
  onMarcarModificado: () => void;
}

export function PestanaCmdb({ config, clasesDisponibles, onChange, onMarcarModificado }: Props) {
  function actualizar(campo: keyof ConfigCmdb, valor: any) {
    onChange({ ...config, [campo]: valor });
    onMarcarModificado();
  }

  function toggleClase(clase: string) {
    const actuales = config.clases_ci_permitidas || [];
    const actualizados = actuales.includes(clase)
      ? actuales.filter((c) => c !== clase)
      : [...actuales, clase];
    actualizar("clases_ci_permitidas", actualizados);
  }

  const clasesPredefinidas = clasesDisponibles.length > 0 ? clasesDisponibles : [
    "Servidor Físico",
    "Servidor Virtual (VM)",
    "Switch / Router",
    "Firewall Perimetral",
    "Base de Datos (Cluster)",
    "Almacenamiento SAN/NAS",
    "Balanceador de Carga"
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, color: "#0f172a" }}>
          CI y servicios (CMDB)
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: 13 }}>
          Define la interacción entre los tickets de problemas y los Elementos de Configuración (CI) de la CMDB, gobernando la herencia de activos, validación de relaciones y alertas de criticidad.
        </p>
      </div>

      {/* REGLAS DE VINCULACIÓN Y HERENCIA DE ACTIVOS */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Herencia de CI y Restricciones de Selección
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.herencia_ci_desde_incidentes ?? true}
              onChange={(e) => actualizar("herencia_ci_desde_incidentes", e.target.checked)}
            />
            <span>
              <strong>Herencia de CI desde incidentes:</strong> Copiar automáticamente a la lista de CI del problema los CI de los incidentes vinculados, marcándolos como origen <em>"heredado"</em>.
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div className="campo">
            <label>Validación de Relación CI – Servicio Afectado</label>
            <select
              className="input-base"
              value={config.validar_relacion_ci_servicio || "avisar"}
              onChange={(e) => actualizar("validar_relacion_ci_servicio", e.target.value)}
            >
              <option value="avisar">Avisar con advertencia (Permite continuar)</option>
              <option value="bloquear">Bloquear selección si el CI no soporta el servicio</option>
              <option value="no_validar">No validar relación en formulario</option>
            </select>
          </div>

          <div className="campo">
            <label>Tope Máximo de CI Asociados por Problema</label>
            <input
              type="number"
              min={1}
              max={1000}
              className="input-base"
              value={config.maximo_ci_por_problema || 100}
              onChange={(e) => actualizar("maximo_ci_por_problema", parseInt(e.target.value, 10) || 100)}
            />
            <span style={{ fontSize: 11, color: "#64748b" }}>Valor de fábrica: 100 elementos de configuración</span>
          </div>
        </div>

        {/* Clases de CI permitidas */}
        <div>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: "#334155", display: "block", marginBottom: 6 }}>
            Clases de CI Permitidas en Problemas (Vacío = Todas las clases):
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {clasesPredefinidas.map((clase) => {
              const checked = (config.clases_ci_permitidas || []).includes(clase);
              return (
                <label
                  key={clase}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 10px",
                    borderRadius: 6,
                    border: "1px solid " + (checked ? "#93c5fd" : "#e2e8f0"),
                    backgroundColor: checked ? "#eff6ff" : "#f8fafc",
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleClase(clase)}
                  />
                  <span>{clase}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* MARCAS VISIBLES EN CMDB Y SEVERIDAD */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <h3 style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 14px 0", color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 8 }}>
          Marcas en CMDB, Criticidad y Ciclo de Vida del Activo
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.mostrar_marca_problema_abierto ?? true}
              onChange={(e) => actualizar("mostrar_marca_problema_abierto", e.target.checked)}
            />
            <span>Mostrar en la ficha del CI el badge: <strong>"Problema abierto"</strong> con enlace directo al ticket</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.mostrar_marca_ke_vigente ?? true}
              onChange={(e) => actualizar("mostrar_marca_ke_vigente", e.target.checked)}
            />
            <span>Mostrar en la ficha del CI el indicador: <strong>"Error conocido vigente"</strong> con acceso al workaround</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={config.servicio_critico_activa_problema_mayor ?? true}
              onChange={(e) => actualizar("servicio_critico_activa_problema_mayor", e.target.checked)}
            />
            <span>
              <strong>Activación de Problema Mayor:</strong> Si el servicio afectado está marcado como <em>Crítico</em> en el catálogo, activar automáticamente la política de problema mayor y revisión obligatoria (PIR).
            </span>
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="campo">
            <label>Sugerir Impacto Alto ante Criticidad de CI:</label>
            <select
              className="input-base"
              value={config.sugerir_impacto_alto_si_criticidad_mayor || "CRITICO"}
              onChange={(e) => actualizar("sugerir_impacto_alto_si_criticidad_mayor", e.target.value)}
            >
              <option value="CRITICO">CI con criticidad Crítica (Nivel 1)</option>
              <option value="ALTA">CI con criticidad Alta o superior</option>
              <option value="DESACTIVADO">No sugerir impacto por criticidad</option>
            </select>
            <span style={{ fontSize: 11, color: "#64748b" }}>Muestra aviso en el formulario sin forzar el valor</span>
          </div>

          <div className="campo">
            <label>Al Dar de Baja un CI con Problemas Abiertos:</label>
            <select
              className="input-base"
              value={config.accion_baja_ci_con_problemas || "avisar_responsable"}
              onChange={(e) => actualizar("accion_baja_ci_con_problemas", e.target.value)}
            >
              <option value="avisar_responsable">Avisar al responsable de la investigación</option>
              <option value="bloquear_baja">Bloquear la baja del CI hasta resolver problemas</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
