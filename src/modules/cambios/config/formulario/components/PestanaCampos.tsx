"use client";

import React, { useState } from "react";

export interface CampoFormulario {
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

export interface SeccionFormulario {
  id: string;
  codigo: string;
  titulo: string;
  color: string;
  orden: number;
  es_condicional_emergencia?: boolean;
  campos: CampoFormulario[];
}

export interface PestanaCamposProps {
  secciones: SeccionFormulario[];
  onChangeSecciones: (nuevasSecciones: SeccionFormulario[]) => void;
  camposPersonalizados?: any[];
  onIrACamposPersonalizados?: () => void;
  onVistaPrevia?: () => void;
  puedeEditar?: boolean;
}

export const PestanaCampos: React.FC<PestanaCamposProps> = ({
  secciones,
  onChangeSecciones,
  camposPersonalizados = [],
  onIrACamposPersonalizados,
  onVistaPrevia,
  puedeEditar = true,
}) => {
  const [campoSeleccionado, setCampoSeleccionado] = useState<{ seccionId: string; codigo: string } | null>(null);
  const [formularioActivo, setFormularioActivo] = useState<"solicitud" | "edicion">("solicitud");
  const [soloObligatorios, setSoloObligatorios] = useState(false);
  const [soloOcultos, setSoloOcultos] = useState(false);
  const [arrastrando, setArrastrando] = useState<{ seccionId: string; index: number } | null>(null);
  const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});

  const toggleSeccion = (secId: string) => {
    setSeccionesColapsadas((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

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

  // Reordenar campo mediante arrastre
  const reordenarCampo = (seccionId: string, fromIndex: number, toIndex: number) => {
    const sec = secciones.find((s) => s.id === seccionId);
    if (!sec || fromIndex === toIndex) return;
    const nuevosCampos = [...sec.campos];
    const [removido] = nuevosCampos.splice(fromIndex, 1);
    nuevosCampos.splice(toIndex, 0, removido);
    onChangeSecciones(secciones.map((s) => (s.id === seccionId ? { ...s, campos: nuevosCampos } : s)));
  };

  // Contadores
  const totalCampos = secciones.reduce((acc, s) => acc + s.campos.length, 0);
  const totalVisibles = secciones.reduce((acc, s) => acc + s.campos.filter((c) => c.visible).length, 0);
  const totalObligatorios = secciones.reduce((acc, s) => acc + s.campos.filter((c) => c.visible && c.obligatorio === "si").length, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Barra Superior con Selector de Formulario, Filtros y Vista Previa */}
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
              setSoloObligatorios((prev) => {
                const next = !prev;
                if (next) setSoloOcultos(false);
                return next;
              });
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
              setSoloOcultos((prev) => {
                const next = !prev;
                if (next) setSoloObligatorios(false);
                return next;
              });
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
              className="boton-mini"
              title="Abrir vista previa interactiva del formulario y ticket"
              style={{
                backgroundColor: "#eff6ff",
                borderColor: "#bfdbfe",
                color: "#1d4ed8",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Vista Previa
            </button>
          )}
        </div>
      </div>

      {/* Layout de Dos Columnas: Lienzo de Secciones (1fr) y Panel de Propiedades (380px) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16, minHeight: 680, alignItems: "start" }}>
        {/* Columna Centro: Lienzo de Secciones y Campos (Canvas) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
            minHeight: 600,
          }}
        >
          {secciones.map((sec) => {
            const estaColapsada = Boolean(seccionesColapsadas[sec.id]);
            return (
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
                {/* Cabecera de la Sección (Plegable / Desplegable) */}
                <div
                  onClick={() => toggleSeccion(sec.id)}
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "11px 16px",
                    borderBottom: estaColapsada ? "none" : "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: `4px solid ${sec.color}`,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        color: "#64748b",
                        transform: estaColapsada ? "rotate(-90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>
                      {sec.campos.filter((c) => c.visible).length} / {sec.campos.length} visibles
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {estaColapsada ? "(Expandir)" : "(Contraer)"}
                    </span>
                  </div>
                </div>

                {/* Lista de Campos en la Sección */}
                {!estaColapsada && (
                  <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
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
                            draggable={puedeEditar}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", JSON.stringify({ seccionId: sec.id, index: idx }));
                              e.dataTransfer.effectAllowed = "move";
                              setArrastrando({ seccionId: sec.id, index: idx });
                            }}
                            onDragEnd={() => setArrastrando(null)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              try {
                                const raw = e.dataTransfer.getData("text/plain");
                                if (!raw) return;
                                const data = JSON.parse(raw);
                                if (data.seccionId === sec.id && data.index !== idx) {
                                  reordenarCampo(sec.id, data.index, idx);
                                }
                              } catch (err) {
                                console.error("Error al reordenar campo:", err);
                              } finally {
                                setArrastrando(null);
                              }
                            }}
                            onClick={() => setCampoSeleccionado({ seccionId: sec.id, codigo: campo.codigo })}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "9px 12px",
                              borderRadius: 6,
                              border: `1px solid ${estaSeleccionado ? "#2563eb" : "#e2e8f0"}`,
                              backgroundColor: estaSeleccionado ? "#eff6ff" : campo.visible ? "#ffffff" : "#f8fafc",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              opacity: arrastrando?.seccionId === sec.id && arrastrando?.index === idx ? 0.4 : 1,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  cursor: "grab",
                                  color: "#94a3b8",
                                  padding: "2px 4px",
                                  borderRadius: 4,
                                }}
                                title="Arrastra este icono para reordenar el campo"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <circle cx="8" cy="5" r="2" />
                                  <circle cx="16" cy="5" r="2" />
                                  <circle cx="8" cy="12" r="2" />
                                  <circle cx="16" cy="12" r="2" />
                                  <circle cx="8" cy="19" r="2" />
                                  <circle cx="16" cy="19" r="2" />
                                </svg>
                              </div>
                              <div>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: campo.visible ? "#1e293b" : "#94a3b8" }}>
                                    {campo.etiqueta}
                                  </span>
                                </div>
                                <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                                  {campo.codigo} · {campo.tipo}
                                </span>
                              </div>
                            </div>

                            {/* Controles Rápidos en la Fila */}
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                              <select
                                className="input-base"
                                value={campo.obligatorio}
                                disabled={!puedeEditar}
                                onChange={(e) => actualizarCampo(sec.id, campo.codigo, { obligatorio: e.target.value as any })}
                                style={{ fontSize: 11.5, padding: "4px 8px", width: "auto" }}
                              >
                                <option value="si">Siempre Obligatorio</option>
                                <option value="segun_tipo">Según Tipo de Cambio</option>
                                <option value="condicional">Condicional</option>
                                <option value="no">Opcional</option>
                              </select>

                              {/* Botón de visibilidad con icono */}
                              <button
                                type="button"
                                disabled={!puedeEditar}
                                onClick={() => {
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
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Columna Derecha: Panel Inspector de Propiedades del Campo (380px) */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "sticky",
            top: 16,
            alignSelf: "start",
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
                    disabled={!puedeEditar}
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
                    disabled={!puedeEditar}
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
                    disabled={!puedeEditar}
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
                    disabled={!puedeEditar}
                    onChange={(e) => actualizarCampo(seccionActiva.id, campoActivo.codigo, { obligatorio: e.target.value as any })}
                    style={{ width: "100%", fontSize: 12 }}
                  >
                    <option value="si">Siempre Obligatorio</option>
                    <option value="segun_tipo">Según Tipo de Cambio</option>
                    <option value="condicional">Condicional (Reglas dinámicas)</option>
                    <option value="no">Opcional</option>
                  </select>
                </div>

                {/* Reglas condicionales si aplican */}
                {campoActivo.reglas && campoActivo.reglas.length > 0 && (
                  <div style={{ backgroundColor: "#f8fafc", padding: 10, borderRadius: 6, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                      Reglas condicionales activas ({campoActivo.reglas.length})
                    </span>
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                      {campoActivo.reglas.map((r, i) => (
                        <span key={i} style={{ fontSize: 11, color: "#334155" }}>
                          CUANDO <strong>{r.si_campo}</strong> {r.operador} <em>{String(r.valor)}</em> → <strong>{r.accion}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "40px 10px", color: "#94a3b8" }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>Ningún campo seleccionado</p>
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
