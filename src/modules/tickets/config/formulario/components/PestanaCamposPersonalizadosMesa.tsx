"use client";

import React, { useState, useEffect } from "react";

export interface CampoPersonalizadoMesa {
  id_campo: number;
  entidad: string;
  codigo: string;
  etiqueta: string;
  descripcion?: string;
  tipo: string;
  activo: boolean;
  seccion?: string;
  obligatorio?: string;
  propiedades?: any;
  fecha_creacion?: string;
}

interface PestanaCamposPersonalizadosMesaProps {
  tipo: "incidente" | "solicitud";
  onCampoCreado?: () => void;
}

export const PestanaCamposPersonalizadosMesa: React.FC<PestanaCamposPersonalizadosMesaProps> = ({
  tipo,
  onCampoCreado,
}) => {
  const [campos, setCampos] = useState<CampoPersonalizadoMesa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Formulario del nuevo campo
  const [nuevoTipo, setNuevoTipo] = useState<string>("texto_corto");
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState<string>("");
  const [nuevoCodigo, setNuevoCodigo] = useState<string>("");
  const [nuevaAyuda, setNuevaAyuda] = useState<string>("");
  const [nuevasOpciones, setNuevasOpciones] = useState<string>("");
  const [nuevaSeccion, setNuevaSeccion] = useState<string>(
    tipo === "incidente" ? "sec_detalle" : "sec_justificacion"
  );
  const [nuevoObligatorio, setNuevoObligatorio] = useState<string>("no");

  const seccionesDisponibles = tipo === "incidente"
    ? [
        { id: "sec_identificacion", label: "Sección A — Identificación" },
        { id: "sec_detalle", label: "Sección B — Detalle del Incidente" },
        { id: "sec_severidad", label: "Sección C — Severidad ITIL" },
        { id: "sec_adjuntos", label: "Sección D — Elementos CMDB y Evidencias" },
      ]
    : [
        { id: "sec_identificacion", label: "Sección A — Identificación del Requerimiento" },
        { id: "sec_justificacion", label: "Sección B — Justificación y Destino" },
        { id: "sec_adjuntos", label: "Sección C — Elemento CMDB y Evidencias" },
      ];

  const cargarCampos = async () => {
    setCargando(true);
    try {
      const res = await fetch(`/api/tickets/configuracion/campos-personalizados?entidad=${tipo}`);
      const data = await res.json();
      if (data.ok && data.campos) {
        setCampos(data.campos);
      }
    } catch {
      setError("Error al cargar los campos personalizados.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCampos();
  }, [tipo]);

  // Generar código slug a partir de la etiqueta
  const handleEtiquetaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNuevaEtiqueta(val);
    const slug = val
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_");
    setNuevoCodigo(`cf_${slug}`);
  };

  const handleCrearCampo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaEtiqueta.trim() || !nuevoCodigo.trim()) {
      setError("La etiqueta y el código del campo son obligatorios.");
      return;
    }

    setGuardando(true);
    setError(null);

    const opcionesArray = nuevoTipo === "lista_seleccion"
      ? nuevasOpciones
          .split("\n")
          .map((o) => o.trim())
          .filter(Boolean)
      : [];

    try {
      const res = await fetch(`/api/tickets/configuracion/campos-personalizados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entidad: tipo,
          codigo: nuevoCodigo,
          etiqueta: nuevaEtiqueta,
          descripcion: nuevaAyuda,
          tipo: nuevoTipo,
          seccion: nuevaSeccion,
          obligatorio: nuevoObligatorio,
          propiedades: {
            opciones: opcionesArray,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el campo.");
        return;
      }

      setMensajeExito(`Campo personalizado "${nuevaEtiqueta}" creado exitosamente.`);
      setTimeout(() => setMensajeExito(null), 3500);
      setModalAbierto(false);

      // Limpiar
      setNuevaEtiqueta("");
      setNuevoCodigo("");
      setNuevaAyuda("");
      setNuevasOpciones("");

      await cargarCampos();
      if (onCampoCreado) onCampoCreado();
    } catch {
      setError("Error de red al crear el campo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleActivo = async (idCampo: number, activoActual: boolean, etiqueta: string) => {
    try {
      const res = await fetch("/api/tickets/configuracion/campos-personalizados", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_campo: idCampo,
          activo: !activoActual,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo actualizar el estado del campo.");
        return;
      }
      setMensajeExito(`Campo "${etiqueta}" ${!activoActual ? "habilitado" : "deshabilitado"} exitosamente.`);
      setTimeout(() => setMensajeExito(null), 3000);
      await cargarCampos();
      if (onCampoCreado) onCampoCreado();
    } catch {
      alert("Error al actualizar el estado del campo.");
    }
  };

  const handleEliminarCampo = async (idCampo: number, etiqueta: string) => {
    if (!window.confirm(`¿Está seguro de eliminar el campo personalizado "${etiqueta}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/tickets/configuracion/campos-personalizados?id=${idCampo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo eliminar el campo.");
        return;
      }
      setMensajeExito(`Campo "${etiqueta}" eliminado.`);
      setTimeout(() => setMensajeExito(null), 3500);
      await cargarCampos();
      if (onCampoCreado) onCampoCreado();
    } catch {
      alert("Error al eliminar el campo.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Notificaciones */}
      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}
      {error && <div className="mensaje-error">{error}</div>}

      {/* Cabecera de la Pestaña */}
      <div
        className="tarjeta"
        style={{
          padding: "16px 20px",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
            Biblioteca de Campos Personalizados ({tipo === "incidente" ? "Incidentes" : "Solicitudes"})
          </h2>
          <p style={{ margin: 0, fontSize: 12.5, color: "#64748b" }}>
            Defina atributos institucionales propios para complementar los campos normativos ITIL. Los campos creados aquí se integran automáticamente en la pestaña de Campos para ordenarlos a gusto.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>
            {campos.length} / 30 campos creados
          </span>
          <button
            type="button"
            className="boton-primario"
            onClick={() => setModalAbierto(true)}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo Campo Personalizado</span>
          </button>
        </div>
      </div>

      {/* Tabla de Campos Personalizados */}
      <div className="contenedor-tabla" style={{ backgroundColor: "#ffffff" }}>
        <table className="tabla-datos">
          <thead>
            <tr>
              <th>Etiqueta Visible</th>
              <th>Código Interno</th>
              <th>Tipo de Control</th>
              <th>Sección Asignada</th>
              <th>Obligatoriedad</th>
              <th>Estado</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 30, color: "#64748b" }}>
                  Cargando campos personalizados...
                </td>
              </tr>
            ) : campos.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 35, color: "#64748b" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#334155", marginBottom: 4 }}>
                    No hay campos personalizados registrados para {tipo === "incidente" ? "incidentes" : "solicitudes"}.
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>
                    Haga clic en "+ Nuevo Campo Personalizado" para añadir campos específicos a su organización.
                  </div>
                </td>
              </tr>
            ) : (
              campos.map((c) => (
                <tr key={c.id_campo}>
                  <td style={{ fontWeight: 600, color: "#0f172a" }}>{c.etiqueta}</td>
                  <td><code style={{ fontSize: 11.5, color: "#2563eb" }}>{c.codigo}</code></td>
                  <td>
                    <span style={{ fontSize: 12, textTransform: "capitalize" }}>
                      {c.tipo.replace("_", " ")}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: "#475569" }}>
                    {seccionesDisponibles.find((s) => s.id === c.seccion)?.label || c.seccion || "Detalle"}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: c.obligatorio === "si" ? "#fef2f2" : "#f1f5f9",
                        color: c.obligatorio === "si" ? "#b91c1c" : "#475569",
                        border: `1px solid ${c.obligatorio === "si" ? "#fca5a5" : "#cbd5e1"}`,
                      }}
                    >
                      {c.obligatorio === "si" ? "Obligatorio" : "Opcional"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: c.activo ? "#f0fdf4" : "#f8fafc",
                        color: c.activo ? "#166534" : "#94a3b8",
                      }}
                    >
                      {c.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActivo(c.id_campo, c.activo, c.etiqueta)}
                        style={{
                          border: `1px solid ${c.activo ? "#fde68a" : "#bbf7d0"}`,
                          backgroundColor: c.activo ? "#fffbeb" : "#f0fdf4",
                          color: c.activo ? "#b45309" : "#166534",
                          padding: "4px 8px",
                          borderRadius: 5,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title={c.activo ? "Deshabilitar campo" : "Habilitar campo"}
                      >
                        {c.activo ? "Deshabilitar" : "Habilitar"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarCampo(c.id_campo, c.etiqueta)}
                        style={{
                          border: "1px solid #fee2e2",
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          padding: "4px 8px",
                          borderRadius: 5,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title="Eliminar campo personalizado"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Crear Nuevo Campo */}
      {modalAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setModalAbierto(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
              width: "100%",
              maxWidth: 540,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  Crear Campo Personalizado para {tipo === "incidente" ? "Incidentes" : "Solicitudes"}
                </h3>
                <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                  Defina las propiedades y la sección del formulario donde se incorporará.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                style={{ border: "none", backgroundColor: "transparent", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCrearCampo} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Etiqueta Visible *
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. Sede de Atención"
                    value={nuevaEtiqueta}
                    onChange={handleEtiquetaChange}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Código Interno (Slug)
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={nuevoCodigo}
                    onChange={(e) => setNuevoCodigo(e.target.value.toLowerCase())}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Tipo de Dato / Control *
                  </label>
                  <select
                    className="input-base"
                    value={nuevoTipo}
                    onChange={(e) => setNuevoTipo(e.target.value)}
                  >
                    <option value="texto_corto">Texto Corto</option>
                    <option value="texto_largo">Texto Multilínea (Área)</option>
                    <option value="numero">Numérico</option>
                    <option value="fecha">Fecha</option>
                    <option value="lista_seleccion">Lista Desplegable</option>
                    <option value="casilla">Casilla (Sí/No)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Sección de Destino *
                  </label>
                  <select
                    className="input-base"
                    value={nuevaSeccion}
                    onChange={(e) => setNuevaSeccion(e.target.value)}
                  >
                    {seccionesDisponibles.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nuevoTipo === "lista_seleccion" && (
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                    Opciones de la Lista (una por línea) *
                  </label>
                  <textarea
                    className="input-base"
                    rows={3}
                    placeholder={"Opción 1\nOpción 2\nOpción 3"}
                    value={nuevasOpciones}
                    onChange={(e) => setNuevasOpciones(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                  Instrucción de Ayuda / Tooltip
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Texto explicativo para orientar al usuario al llenar el campo..."
                  value={nuevaAyuda}
                  onChange={(e) => setNuevaAyuda(e.target.value)}
                />
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b", display: "block", marginBottom: 4 }}>
                  Obligatoriedad Inicial
                </label>
                <select
                  className="input-base"
                  value={nuevoObligatorio}
                  onChange={(e) => setNuevoObligatorio(e.target.value)}
                >
                  <option value="no">Opcional</option>
                  <option value="si">Obligatorio al registrar</option>
                  <option value="condicional">Condicional</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
                <button
                  type="button"
                  className="boton-secundario"
                  onClick={() => setModalAbierto(false)}
                  style={{ padding: "8px 16px", fontSize: 13 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-primario"
                  disabled={guardando}
                  style={{ padding: "8px 20px", fontSize: 13 }}
                >
                  {guardando ? "Creando..." : "Crear Campo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
