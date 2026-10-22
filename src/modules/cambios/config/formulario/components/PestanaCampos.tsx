"use client";

import React, { useState } from "react";

interface CampoFormulario {
  codigo: string;
  etiqueta: string;
  tipo: string;
  visible: boolean;
  obligatorio: "si" | "no" | "segun_tipo" | "condicional";
  bloqueado?: boolean;
  ancho?: "1/3" | "1/2" | "2/3" | "completo";
  placeholder?: string;
  ayuda?: string;
  solo_lectura?: boolean;
  valor_defecto?: string;
  reglas?: any[];
}

interface SeccionFormulario {
  id: string;
  codigo: string;
  titulo: string;
  color: string;
  orden: number;
  es_condicional_emergencia?: boolean;
  campos: CampoFormulario[];
}

interface PestanaCamposProps {
  secciones: SeccionFormulario[];
  onChangeSecciones: (nuevasSecciones: SeccionFormulario[]) => void;
  camposPersonalizados: any[];
  onIrACamposPersonalizados: () => void;
  onVistaPrevia?: () => void;
}

export const PestanaCampos: React.FC<PestanaCamposProps> = ({
  secciones,
  onChangeSecciones,
  camposPersonalizados,
  onIrACamposPersonalizados,
  onVistaPrevia,
}) => {
  const [campoSeleccionado, setCampoSeleccionado] = useState<{ seccionId: string; codigo: string } | null>(null);
  const [filtroBiblioteca, setFiltroBiblioteca] = useState("");
  const [formularioActivo, setFormularioActivo] = useState<"solicitud" | "edicion">("solicitud");
  const [soloObligatorios, setSoloObligatorios] = useState(false);
  const [soloOcultos, setSoloOcultos] = useState(false);

  // Obtener campo activo para el panel derecho
  const seccionActiva = campoSeleccionado ? secciones.find((s) => s.id === campoSeleccionado.seccionId) : null;
  const campoActivo = seccionActiva ? seccionActiva.campos.find((c) => c.codigo === campoSeleccionado?.codigo) : null;

  // Actualizar un campo específico
  const actualizarCampo = (seccionId: string, codigo: string, patch: Partial<CampoFormulario>) => {
    const nuevas = secciones.map((sec) => {
      if (sec.id !== seccionId) return sec;
      return {
        ...sec,
        campos: sec.campos.map((c) => (c.codigo === codigo ? { ...c, ...patch } : c)),
      };
    });
    onChangeSecciones(nuevas);
  };

  // Mover campo hacia arriba o abajo en la sección
  const moverCampo = (seccionId: string, idx: number, direccion: -1 | 1) => {
    const sec = secciones.find((s) => s.id === seccionId);
    if (!sec) return;
    const nuevoIdx = idx + direccion;
    if (nuevoIdx < 0 || nuevoIdx >= sec.campos.length) return;

    const nuevosCampos = [...sec.campos];
    const temp = nuevosCampos[idx];
    nuevosCampos[idx] = nuevosCampos[nuevoIdx];
    nuevosCampos[nuevoIdx] = temp;

    onChangeSecciones(secciones.map((s) => (s.id === seccionId ? { ...s, campos: nuevosCampos } : s)));
  };

  // Contadores
  const totalCampos = secciones.reduce((acc, s) => acc + s.campos.length, 0);
  const totalVisibles = secciones.reduce((acc, s) => acc + s.campos.filter((c) => c.visible).length, 0);
  const totalObligatorios = secciones.reduce((acc, s) => acc + s.campos.filter((c) => c.visible && c.obligatorio === "si").length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Barra Superior con Selector de Formulario y Filtros */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#ffffff",
          padding: "12px 18px",
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "#334155" }}>Formulario a configurar:</span>
          <select
            className="input-base"
            value={formularioActivo}
            onChange={(e) => setFormularioActivo(e.target.value as any)}
            style={{ fontSize: 12, width: 220 }}
          >
            <option value="solicitud">Solicitud de RFC (Alta)</option>
            <option value="edicion">Edición dentro del Ticket RFC</option>
          </select>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            {totalVisibles} campos visibles · {totalObligatorios} obligatorios normativos
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="boton-mini"
            onClick={() => {
              setSoloObligatorios(!soloObligatorios);
              setSoloObligatorios(false);
            }}
            style={{
              backgroundColor: soloObligatorios ? "#eff6ff" : "#ffffff",
              color: soloObligatorios ? "#1d4ed8" : "#475569",
              borderColor: soloObligatorios ? "#93c5fd" : "#cbd5e1",
            }}
          >
            Solo obligatorios
          </button>
          <button
            type="button"
            className="boton-mini"
            onClick={() => {
              setSoloOcultos(!soloOcultos);
              setSoloObligatorios(false);
            }}
            style={{
              backgroundColor: soloOcultos ? "#fee2e2" : "#ffffff",
              color: soloOcultos ? "#991b1b" : "#475569",
              borderColor: soloOcultos ? "#fca5a5" : "#cbd5e1",
            }}
          >
            Solo ocultos
          </button>
          {onVistaPrevia && (
            <button
              type="button"
              onClick={onVistaPrevia}
              className="boton-accion-icono"
              title="Abrir vista previa interactiva"
              aria-label="Abrir vista previa interactiva"
              style={{ backgroundColor: "#eff6ff", borderColor: "#bfdbfe", color: "#1d4ed8" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Layout de Tres Columnas (Sección 6.1) */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 360px", gap: 14, minHeight: 680 }}>
        {/* Columna Izquierda: Biblioteca de Campos (280px) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: "0 0 6px 0" }}>
              Biblioteca de Campos
            </h4>
            <input
              type="text"
              className="input-base"
              placeholder="Buscar campo..."
              value={filtroBiblioteca}
              onChange={(e) => setFiltroBiblioteca(e.target.value)}
              style={{ width: "100%", fontSize: 11.5, padding: "5px 8px" }}
            />
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Grupo 1: Campos Estándar de Gestión de Cambios */}
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                Campos Estándar (ITIL v4)
              </span>
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {secciones.flatMap((s) => s.campos)
                  .filter((c) => !c.codigo.startsWith("cf_"))
                  .filter((c) => !filtroBiblioteca || c.etiqueta.toLowerCase().includes(filtroBiblioteca.toLowerCase()) || c.codigo.includes(filtroBiblioteca.toLowerCase()))
                  .map((c) => (
                    <div
                      key={c.codigo}
                      style={{
                        padding: "6px 8px",
                        backgroundColor: c.visible ? "#f8fafc" : "#f1f5f9",
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        fontSize: 11.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: c.visible ? "#1e293b" : "#94a3b8" }}>
                        {c.etiqueta}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        {c.bloqueado && <span title="Campo normativo bloqueado" style={{ fontSize: 11 }}>[Bloqueado]</span>}
                        <span style={{ fontSize: 10, color: c.visible ? "#16a34a" : "#dc2626" }}>
                          {c.visible ? "✓" : "Oculto"}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Grupo 2: Campos Personalizados */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Campos Personalizados ({camposPersonalizados.length})
                </span>
                <button
                  type="button"
                  onClick={onIrACamposPersonalizados}
                  style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 11, fontWeight: 700 }}
                >
                  + Crear
                </button>
              </div>
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                {camposPersonalizados.length === 0 ? (
                  <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                    No hay campos personalizados activos.
                  </span>
                ) : (
                  camposPersonalizados.map((cp) => (
                    <div
                      key={cp.id_campo}
                      style={{
                        padding: "6px 8px",
                        backgroundColor: "#faf5ff",
                        borderRadius: 6,
                        border: "1px solid #e9d5ff",
                        fontSize: 11.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "#6b21a8" }}>{cp.etiqueta}</span>
                      <span style={{ fontSize: 10, color: "#9333ea" }}>{cp.tipo}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Centro: Lienzo de Secciones y Campos (Canvas) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            maxHeight: 740,
            overflowY: "auto",
            paddingRight: 4,
          }}
        >
          {secciones.map((sec) => (
            <div
              key={sec.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              {/* Cabecera de la Sección */}
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "10px 14px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderLeft: `4px solid ${sec.color}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    {sec.titulo}
                  </span>
                  {sec.es_condicional_emergencia && (
                    <span
                      className="badge-itil"
                      style={{ backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5", fontSize: 10, fontWeight: 700 }}
                    >
                      Solo visible con Tipo = Emergencia
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>
                  {sec.campos.filter((c) => c.visible).length} / {sec.campos.length} visibles
                </span>
              </div>

              {/* Lista de Campos en la Sección */}
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {sec.campos
                  .filter((c) => {
                    if (soloObligatorios) return c.visible && c.obligatorio === "si";
                    if (soloOcultos) return !c.visible;
                    return true;
                  })
                  .map((campo, idx) => {
                    const estaSeleccionado = campoSeleccionado?.codigo === campo.codigo;
                    return (
                      <div
                        key={campo.codigo}
                        onClick={() => setCampoSeleccionado({ seccionId: sec.id, codigo: campo.codigo })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: `1px solid ${estaSeleccionado ? "#2563eb" : "#e2e8f0"}`,
                          backgroundColor: estaSeleccionado ? "#eff6ff" : campo.visible ? "#ffffff" : "#f8fafc",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                          <span style={{ color: "#94a3b8", cursor: "grab", fontSize: 14 }}>⋮⋮</span>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 12.5, fontWeight: 600, color: campo.visible ? "#1e293b" : "#94a3b8" }}>
                                {campo.etiqueta}
                              </span>
                              {campo.bloqueado && (
                                <span title="Campo normativo bloqueado; no puede ocultarse" style={{ fontSize: 11 }}>
                                  [Bloqueado]
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontFamily: "monospace" }}>
                              {campo.codigo} · {campo.tipo}
                            </span>
                          </div>
                        </div>

                        {/* Controles Rápidos en la Fila */}
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                          <select
                            className="input-base"
                            value={campo.obligatorio}
                            disabled={campo.bloqueado && (sec.codigo === "identificacion" || sec.codigo === "planes")}
                            onChange={(e) => actualizarCampo(sec.id, campo.codigo, { obligatorio: e.target.value as any })}
                            style={{ fontSize: 11, padding: "3px 6px", width: "auto" }}
                          >
                            <option value="si">Siempre Obligatorio</option>
                            <option value="segun_tipo">Según Tipo de Cambio</option>
                            <option value="condicional">Condicional</option>
                            <option value="no">Opcional</option>
                          </select>

                          {/* Botón de visibilidad con icono únicamente */}
                          <button
                            type="button"
                            onClick={() => {
                              if (campo.bloqueado) {
                                alert(`"${campo.etiqueta}" es un campo normativo bloqueado y no puede ocultarse.`);
                                return;
                              }
                              actualizarCampo(sec.id, campo.codigo, { visible: !campo.visible });
                            }}
                            className="boton-accion-icono"
                            style={{
                              width: 28,
                              height: 28,
                              color: campo.visible ? "#16a34a" : "#94a3b8",
                              borderColor: campo.visible ? "#bbf7d0" : "#e2e8f0",
                              backgroundColor: campo.visible ? "#f0fdf4" : "#f8fafc",
                            }}
                            title={campo.visible ? "Campo visible (clic para ocultar)" : "Campo oculto (clic para mostrar)"}
                            aria-label={campo.visible ? "Campo visible (clic para ocultar)" : "Campo oculto (clic para mostrar)"}
                          >
                            {campo.visible ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>

                          {/* Botones de reordenamiento con iconos únicamente */}
                          <div style={{ display: "flex", gap: 3 }}>
                            <button
                              type="button"
                              onClick={() => moverCampo(sec.id, idx, -1)}
                              disabled={idx === 0}
                              className="boton-accion-icono"
                              style={{ width: 26, height: 26 }}
                              title="Mover campo hacia arriba"
                              aria-label="Mover campo hacia arriba"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="18 15 12 9 6 15" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => moverCampo(sec.id, idx, 1)}
                              disabled={idx === sec.campos.length - 1}
                              className="boton-accion-icono"
                              style={{ width: 26, height: 26 }}
                              title="Mover campo hacia abajo"
                              aria-label="Mover campo hacia abajo"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Columna Derecha: Panel de Propiedades del Campo (360px) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxHeight: 740,
            overflowY: "auto",
          }}
        >
          {campoActivo && seccionActiva ? (
            <div>
              <div style={{ paddingBottom: 10, borderBottom: "1px solid #e2e8f0", marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", textTransform: "uppercase" }}>
                  Propiedades del Campo
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", margin: "2px 0 0 0" }}>
                  {campoActivo.etiqueta}
                </h3>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#475569", marginBottom: 4 }}>
                    Código Interno (Inmutable)
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={campoActivo.codigo}
                    readOnly
                    style={{ width: "100%", fontSize: 12, backgroundColor: "#f1f5f9", fontFamily: "monospace" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Etiqueta visible
                  </label>
                  <input
                    type="text"
                    className="input-base"
                    value={campoActivo.etiqueta}
                    onChange={(e) => actualizarCampo(seccionActiva.id, campoActivo.codigo, { etiqueta: e.target.value })}
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Texto de ayuda (Tooltip)
                  </label>
                  <textarea
                    className="input-base"
                    rows={2}
                    value={campoActivo.ayuda || ""}
                    onChange={(e) => actualizarCampo(seccionActiva.id, campoActivo.codigo, { ayuda: e.target.value })}
                    style={{ width: "100%", fontSize: 12 }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Ancho en el formulario
                  </label>
                  <select
                    className="input-base"
                    value={campoActivo.ancho || "completo"}
                    onChange={(e) => actualizarCampo(seccionActiva.id, campoActivo.codigo, { ancho: e.target.value as any })}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="completo">Ancho completo (100%)</option>
                    <option value="1/2">Mitad de fila (50%)</option>
                    <option value="1/3">Un tercio (33%)</option>
                    <option value="2/3">Dos tercios (66%)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 11.5, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                    Obligatoriedad
                  </label>
                  <select
                    className="input-base"
                    value={campoActivo.obligatorio}
                    disabled={campoActivo.bloqueado && (seccionActiva.codigo === "identificacion" || seccionActiva.codigo === "planes")}
                    onChange={(e) => actualizarCampo(seccionActiva.id, campoActivo.codigo, { obligatorio: e.target.value as any })}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="si">Siempre Obligatorio</option>
                    <option value="segun_tipo">Según Tipo de Cambio (Matriz 1.3.3.2.1)</option>
                    <option value="condicional">Condicional (Reglas dinámicas)</option>
                    <option value="no">Opcional</option>
                  </select>
                  {campoActivo.bloqueado && (
                    <span style={{ fontSize: 10.5, color: "#d97706", display: "block", marginTop: 4 }}>
                      [Bloqueado] Campo requerido por norma ITIL v4 e ISO/IEC 20000.
                    </span>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="prop-solo-lectura"
                    checked={!!campoActivo.solo_lectura}
                    onChange={(e) => actualizarCampo(seccionActiva.id, campoActivo.codigo, { solo_lectura: e.target.checked })}
                  />
                  <label htmlFor="prop-solo-lectura" style={{ fontSize: 12, color: "#334155" }}>
                    Solo lectura para el solicitante
                  </label>
                </div>

                {/* Reglas Condicionales del Campo */}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#334155" }}>
                    Reglas Condicionales Asociadas
                  </span>
                  {(!campoActivo.reglas || campoActivo.reglas.length === 0) ? (
                    <p style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic", margin: "4px 0 0 0" }}>
                      Sin reglas condicionales activas para este campo.
                    </p>
                  ) : (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {campoActivo.reglas.map((r, i) => (
                        <div key={i} style={{ padding: "4px 6px", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, fontSize: 11, color: "#475569" }}>
                          CUANDO <strong>{r.si_campo}</strong> {r.operador} <em>{String(r.valor)}</em> → <strong>{r.accion}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "#64748b" }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Ningún campo seleccionado</p>
              <p style={{ fontSize: 11.5, margin: "4px 0 0 0" }}>
                Haga clic en cualquier campo del lienzo central para editar sus propiedades y reglas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
