"use client";

import React, { useState } from "react";

interface TipoHijo {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  exige_hostname_unico?: boolean;
}

interface ClaseActivo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
  es_inventariable: boolean;
  es_ci_defecto: boolean;
  se_asigna_custodio: boolean;
  tiene_ubicacion: boolean;
  exige_modelo: boolean;
  exige_numero_serie: boolean;
  exige_hostname_unico: boolean;
  tiene_mantenimiento: boolean;
  tiene_garantia: boolean;
  tiene_almacenamiento: boolean;
  ciclo_vida_id: string;
  prefijo_codigo: string;
  vida_util_meses: number;
  garantia_meses: number;
  visible_selector_incidentes: boolean;
  activo: boolean;
  tipos: TipoHijo[];
}

interface Props {
  datos: { clases?: ClaseActivo[] };
  onChange: (nuevosDatos: any) => void;
  bloqueado: boolean;
}

export function PestanaClasesTipos({ datos, onChange, bloqueado }: Props) {
  const clases: ClaseActivo[] = datos?.clases || [];
  const [claseSeleccionadaId, setClaseSeleccionadaId] = useState<string>(clases[0]?.id || "hardware");
  const [busqueda, setBusqueda] = useState("");
  const [nuevoTipoNombre, setNuevoTipoNombre] = useState("");
  const [nuevoTipoCodigo, setNuevoTipoCodigo] = useState("");

  const claseActiva = clases.find((c) => c.id === claseSeleccionadaId) || clases[0];

  const actualizarClaseActual = (camposActualizados: Partial<ClaseActivo>) => {
    if (bloqueado || !claseActiva) return;
    const nuevasClases = clases.map((c) =>
      c.id === claseActiva.id ? { ...c, ...camposActualizados } : c
    );
    onChange({ ...datos, clases: nuevasClases });
  };

  const agregarTipo = () => {
    if (!nuevoTipoNombre.trim() || !nuevoTipoCodigo.trim() || bloqueado || !claseActiva) return;
    const nuevoId = nuevoTipoCodigo.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const nuevoTipo: TipoHijo = {
      id: nuevoId,
      codigo: nuevoTipoCodigo.trim().toUpperCase(),
      nombre: nuevoTipoNombre.trim(),
      activo: true,
      exige_hostname_unico: claseActiva.exige_hostname_unico
    };
    const tiposActualizados = [...(claseActiva.tipos || []), nuevoTipo];
    actualizarClaseActual({ tipos: tiposActualizados });
    setNuevoTipoNombre("");
    setNuevoTipoCodigo("");
  };

  const toggleEstadoTipo = (tipoId: string) => {
    if (bloqueado || !claseActiva) return;
    const tiposActualizados = (claseActiva.tipos || []).map((t) =>
      t.id === tipoId ? { ...t, activo: !t.activo } : t
    );
    actualizarClaseActual({ tipos: tiposActualizados });
  };

  const clasesFiltradas = clases.filter((c) =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20 }}>
      {/* Panel izquierdo: Árbol de clases y tipos */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 16 }}>
        <div style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px 0", color: "#0f172a" }}>
            Jerarquía de Clases
          </h3>
          <input
            type="text"
            className="input-base"
            placeholder="Buscar clase o tipo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ fontSize: 12, padding: "6px 10px", width: "100%" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: "560px", overflowY: "auto" }}>
          {clasesFiltradas.map((c) => {
            const esSeleccionada = c.id === claseSeleccionadaId;
            return (
              <div
                key={c.id}
                onClick={() => setClaseSeleccionadaId(c.id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  backgroundColor: esSeleccionada ? "#f1f5f9" : "#ffffff",
                  border: esSeleccionada ? `2px solid ${c.color || "#3b82f6"}` : "1px solid #f1f5f9",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: c.color || "#3b82f6"
                      }}
                    />
                    <strong style={{ fontSize: 13, color: "#1e293b" }}>{c.nombre}</strong>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, backgroundColor: "#e2e8f0", color: "#475569" }}>
                    {c.codigo}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b" }}>
                  <span>{c.tipos?.length || 0} tipos registrados</span>
                  <span>{c.es_inventariable ? "Inventariable" : "CI Lógico"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel derecho: Propiedades de la clase y gestión de tipos */}
      {claseActiva && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Tarjeta de propiedades */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                  Propiedades de Clase: {claseActiva.nombre}
                </h2>
                <p style={{ fontSize: 12, color: "#64748b", margin: 0 }}>
                  Definición de gobernanza, inventariabilidad y parámetros predeterminados para activos y CIs.
                </p>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "4px 10px",
                  borderRadius: 6,
                  backgroundColor: claseActiva.activo ? "#dcfce7" : "#fee2e2",
                  color: claseActiva.activo ? "#166534" : "#991b1b"
                }}
              >
                {claseActiva.activo ? "Clase Activa" : "Clase Inactiva"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 18 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                  Nombre de Clase
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={claseActiva.nombre}
                  disabled={bloqueado}
                  onChange={(e) => actualizarClaseActual({ nombre: e.target.value })}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                  Código Técnico
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={claseActiva.codigo}
                  disabled
                  style={{ width: "100%", fontSize: 12.5, backgroundColor: "#f8fafc" }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                  Prefijo de Código de Activo
                </label>
                <input
                  type="text"
                  className="input-base"
                  value={claseActiva.prefijo_codigo}
                  disabled={bloqueado}
                  onChange={(e) => actualizarClaseActual({ prefijo_codigo: e.target.value.toUpperCase() })}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                  Garantía Estándar (Meses)
                </label>
                <input
                  type="number"
                  className="input-base"
                  value={claseActiva.garantia_meses}
                  disabled={bloqueado}
                  onChange={(e) => actualizarClaseActual({ garantia_meses: parseInt(e.target.value, 10) || 0 })}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                  Vida Útil Estándar (Meses)
                </label>
                <input
                  type="number"
                  className="input-base"
                  value={claseActiva.vida_util_meses}
                  disabled={bloqueado}
                  onChange={(e) => actualizarClaseActual({ vida_util_meses: parseInt(e.target.value, 10) || 0 })}
                  style={{ width: "100%", fontSize: 12.5 }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                  Color Distintivo
                </label>
                <input
                  type="color"
                  value={claseActiva.color || "#3b82f6"}
                  disabled={bloqueado}
                  onChange={(e) => actualizarClaseActual({ color: e.target.value })}
                  style={{ width: "100%", height: 35, borderRadius: 6, border: "1px solid #cbd5e1", cursor: "pointer" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#334155", display: "block", marginBottom: 4 }}>
                Descripción de Alcance
              </label>
              <textarea
                className="input-base"
                rows={2}
                value={claseActiva.descripcion}
                disabled={bloqueado}
                onChange={(e) => actualizarClaseActual({ descripcion: e.target.value })}
                style={{ width: "100%", fontSize: 12 }}
              />
            </div>

            {/* Interruptores de Gobierno ITIL */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 10px 0", color: "#1e293b" }}>
                Comportamiento y Reglas de Control
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.es_inventariable}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ es_inventariable: e.target.checked })}
                  />
                  <span>¿Es inventariable (HAM / Activo patrimonial)?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.es_ci_defecto}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ es_ci_defecto: e.target.checked })}
                  />
                  <span>¿Es Elemento de Configuración (CI) por defecto?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.se_asigna_custodio}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ se_asigna_custodio: e.target.checked })}
                  />
                  <span>¿Permite asignación a custodio personal?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.tiene_ubicacion}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ tiene_ubicacion: e.target.checked })}
                  />
                  <span>¿Tiene ubicación física jerárquica?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.exige_modelo}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ exige_modelo: e.target.checked })}
                  />
                  <span>¿Exige catálogo de modelo homologado?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.exige_numero_serie}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ exige_numero_serie: e.target.checked })}
                  />
                  <span>¿Exige número de serie de fábrica único?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.exige_hostname_unico}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ exige_hostname_unico: e.target.checked })}
                  />
                  <span>¿Exige nombre de red / hostname único?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.tiene_almacenamiento}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ tiene_almacenamiento: e.target.checked })}
                  />
                  <span>¿Posee almacenamiento (exige borrado seguro en baja)?</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#334155", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={claseActiva.visible_selector_incidentes}
                    disabled={bloqueado}
                    onChange={(e) => actualizarClaseActual({ visible_selector_incidentes: e.target.checked })}
                  />
                  <span>¿Aparece en el selector de incidentes bajo custodia?</span>
                </label>
              </div>
            </div>
          </div>

          {/* Subtabla de tipos asociados a esta clase */}
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px 0", color: "#0f172a" }}>
              Tipos de Activos en Clase {claseActiva.nombre} ({claseActiva.tipos?.length || 0})
            </h3>

            <div style={{ overflowX: "auto", marginBottom: 16 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "8px 12px" }}>Código</th>
                    <th style={{ padding: "8px 12px" }}>Nombre del Tipo</th>
                    <th style={{ padding: "8px 12px" }}>Hostname Único</th>
                    <th style={{ padding: "8px 12px" }}>Estado</th>
                    <th style={{ padding: "8px 12px", textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(claseActiva.tipos || []).map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "8px 12px", fontFamily: "monospace", fontWeight: 600 }}>{t.codigo}</td>
                      <td style={{ padding: "8px 12px", fontWeight: 500 }}>{t.nombre}</td>
                      <td style={{ padding: "8px 12px" }}>{t.exige_hostname_unico ? "Sí" : "No"}</td>
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, backgroundColor: t.activo ? "#dcfce7" : "#f1f5f9", color: t.activo ? "#166534" : "#64748b" }}>
                          {t.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td style={{ padding: "8px 12px", textAlign: "right" }}>
                        <button
                          type="button"
                          className="boton-mini"
                          disabled={bloqueado}
                          onClick={() => toggleEstadoTipo(t.id)}
                          style={{ fontSize: 11 }}
                        >
                          {t.activo ? "Desactivar" : "Activar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!claseActiva.tipos || claseActiva.tipos.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#94a3b8" }}>
                        No hay tipos registrados para esta clase.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Formulario rápido para agregar tipo */}
            {!bloqueado && (
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end", backgroundColor: "#f8fafc", padding: 12, borderRadius: 6 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Nuevo Tipo
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. Tablet Corporativa"
                    value={nuevoTipoNombre}
                    onChange={(e) => setNuevoTipoNombre(e.target.value)}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <div style={{ width: 120 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "#475569", display: "block", marginBottom: 2 }}>
                    Código
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="TAB"
                    value={nuevoTipoCodigo}
                    onChange={(e) => setNuevoTipoCodigo(e.target.value.toUpperCase())}
                    style={{ fontSize: 12, width: "100%" }}
                  />
                </div>
                <button
                  type="button"
                  className="boton-principal"
                  onClick={agregarTipo}
                  style={{ fontSize: 12, padding: "8px 16px" }}
                >
                  Agregar Tipo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
