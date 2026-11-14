"use client";

import React, { useState } from "react";
import { ModalEditarPropiedadesCampo } from "./ModalEditarPropiedadesCampo";
import { SimuladorCambiosEnVivo } from "./ModalVistaPrevia";

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
  tipo_cambio_aplicable?: "TODOS" | "NORMAL" | "EMERGENCIA" | "ESTANDAR";
  fase_aplicable?: "todas" | "fase_1" | "fase_2";
  es_personalizado?: boolean;
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

// Resolver a qué sección estándar corresponde un campo personalizado
export function resolverSeccionId(
  seccionStr: string | undefined,
  listaSecciones: SeccionFormulario[]
): string {
  if (!seccionStr) return "sec_a";
  const sLimpia = seccionStr.toLowerCase().trim();

  // 1. Coincidencia directa por id
  const porId = listaSecciones.find((s) => s.id.toLowerCase() === sLimpia);
  if (porId) return porId.id;

  // 2. Coincidencia directa por codigo
  const porCodigo = listaSecciones.find((s) => s.codigo.toLowerCase() === sLimpia);
  if (porCodigo) return porCodigo.id;

  // 3. Coincidencia por título exacto o contenido
  const porTitulo = listaSecciones.find(
    (s) =>
      s.titulo.toLowerCase().trim() === sLimpia ||
      s.titulo.toLowerCase().includes(sLimpia) ||
      sLimpia.includes(s.titulo.toLowerCase())
  );
  if (porTitulo) return porTitulo.id;

  // 4. Coincidencias semánticas por matriz de palabras clave (declarativo)
  const REGLAS_SEMANTICAS: [string[], string][] = [
    [["identifica"], "sec_a"],
    [["justifica", "descripci"], "sec_b"],
    [["alcance", "cmdb"], "sec_c"],
    [["evalua", "prioridad", "riesgo"], "sec_d"],
    [["programa", "calendario", "ventana"], "sec_e"],
    [["plane", "responsable", "gobernanza", "cab"], "sec_f"],
    [["crisis", "ecab", "emergencia"], "sec_g"],
    [["pir", "post-mortem", "mortem"], "sec_pir"],
    [["evidencia", "adjunto", "documenta"], "sec_h"],
  ];

  for (const [palabras, seccionId] of REGLAS_SEMANTICAS) {
    if (palabras.some((p) => sLimpia.includes(p))) return seccionId;
  }

  return listaSecciones[0]?.id || "sec_a";
}

// Fusionar dinámicamente campos del catálogo de campos personalizados dentro de la estructura de secciones
export function fusionarSeccionesConCamposPersonalizados(
  seccionesBase: SeccionFormulario[],
  camposPersonalizados: any[]
): SeccionFormulario[] {
  if (!Array.isArray(seccionesBase) || seccionesBase.length === 0) {
    return seccionesBase || [];
  }
  if (!Array.isArray(camposPersonalizados)) {
    return seccionesBase;
  }

  // Set de códigos de campos personalizados activos y válidos
  const codigosValidosCP = new Set(camposPersonalizados.map((cp) => cp.codigo));

  // Primero: limpiar en seccionesBase omitiendo tipo_cambio (se define en paso previo de selección)
  // y aquellos campos marcados como es_personalizado que ya fueron eliminados del catálogo
  const seccionesLimpias = seccionesBase.map((sec) => ({
    ...sec,
    campos: (sec.campos || [])
      .filter((c) => c.codigo !== "tipo_cambio")
      .filter((c) => {
        if (c.es_personalizado || c.codigo.startsWith("cf_")) {
          return codigosValidosCP.has(c.codigo);
        }
        return true;
      }),
  }));

  // Segundo: Para cada campo personalizado activo en cpLista, verificar si ya está en su sección
  const seccionesResultado = seccionesLimpias.map((sec) => ({
    ...sec,
    campos: [...sec.campos],
  }));

  camposPersonalizados.forEach((cp) => {
    const targetSecId = resolverSeccionId(cp.seccion, seccionesResultado);
    const targetSec = seccionesResultado.find((s) => s.id === targetSecId) || seccionesResultado[0];
    if (!targetSec) return;

    const idxExistente = targetSec.campos.findIndex((c) => c.codigo === cp.codigo);

    // Tipos de cambio aplicables
    const tipos = cp.propiedades?.tipos_cambio;
    let tipoCambioAplicable: "TODOS" | "NORMAL" | "EMERGENCIA" | "ESTANDAR" = "TODOS";
    if (Array.isArray(tipos) && tipos.length === 1) {
      tipoCambioAplicable = tipos[0];
    }

    const faseAplicable: "todas" | "fase_1" | "fase_2" =
      cp.propiedades?.fase === "fase_1" || cp.propiedades?.fase === "fase_2"
        ? cp.propiedades.fase
        : "todas";

    if (idxExistente === -1) {
      // Agregar nuevo campo personalizado
      const nuevoCampo: CampoFormulario = {
        codigo: cp.codigo,
        etiqueta: cp.etiqueta || cp.codigo,
        tipo: cp.tipo || "texto",
        visible: cp.activo !== false,
        obligatorio:
          cp.obligatorio === "si"
            ? "si"
            : cp.obligatorio === "segun_tipo"
            ? "segun_tipo"
            : cp.obligatorio === "condicional"
            ? "condicional"
            : "no",
        bloqueado: false,
        ancho: cp.tipo === "area_enriquecida" ? "completo" : "1/2",
        ayuda: cp.descripcion || undefined,
        es_personalizado: true,
        tipo_cambio_aplicable: tipoCambioAplicable,
        fase_aplicable: faseAplicable,
      };
      targetSec.campos.push(nuevoCampo);
    } else {
      // Actualizar datos del catálogo conservando personalizaciones locales
      targetSec.campos[idxExistente] = {
        ...targetSec.campos[idxExistente],
        etiqueta: cp.etiqueta || targetSec.campos[idxExistente].etiqueta,
        tipo: cp.tipo || targetSec.campos[idxExistente].tipo,
        ayuda: cp.descripcion ?? targetSec.campos[idxExistente].ayuda,
        es_personalizado: true,
        visible: cp.activo === false ? false : targetSec.campos[idxExistente].visible,
        tipo_cambio_aplicable: targetSec.campos[idxExistente].tipo_cambio_aplicable || tipoCambioAplicable,
        fase_aplicable: targetSec.campos[idxExistente].fase_aplicable || faseAplicable,
      };
    }
  });

  return seccionesResultado;
}

// Secciones del Alta inicial (solicitud) vs Secciones técnicas de Planificación y Aprobación
const SECCIONES_ALTA_IDS = ["sec_a", "sec_b", "sec_c", "sec_d"];

export const PestanaCampos: React.FC<PestanaCamposProps> = ({
  secciones = [],
  onChangeSecciones,
  camposPersonalizados = [],
  onIrACamposPersonalizados,
  puedeEditar = true,
}) => {
  const [campoEditando, setCampoEditando] = useState<{ seccionId: string; campo: CampoFormulario } | null>(null);
  const [tipoCambioActivo, setTipoCambioActivo] = useState<"NORMAL" | "EMERGENCIA" | "ESTANDAR">("NORMAL");
  const [soloObligatorios, setSoloObligatorios] = useState(false);
  const [soloOcultos, setSoloOcultos] = useState(false);
  const [arrastrando, setArrastrando] = useState<{ seccionId: string; index: number } | null>(null);
  const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});

  // Fusionar dinámicamente las secciones con los campos técnicos personalizados
  const seccionesEfectivas = React.useMemo(() => {
    return fusionarSeccionesConCamposPersonalizados(secciones, camposPersonalizados);
  }, [secciones, camposPersonalizados]);

  const toggleSeccion = (secId: string) => {
    setSeccionesColapsadas((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Filtrado de pertenencia del campo según Tipo de Cambio
  const campoAplicaATipoYFase = (campo: CampoFormulario) => {
    // 1. Modelo de cambio estándar ÚNICAMENTE en tipo ESTANDAR
    if (campo.codigo === "modelo_id") {
      return tipoCambioActivo === "ESTANDAR";
    }

    // 2. Campos de crisis de emergencia ÚNICAMENTE en tipo EMERGENCIA
    if (["ticket_emergencia", "medio_autorizacion_emergencia", "justificacion_emergencia", "consecuencia_emergencia"].includes(campo.codigo)) {
      return tipoCambioActivo === "EMERGENCIA";
    }

    // 3. Campos de fase 2 / Post-Mortem PIR no aplican al formulario de alta inicial (se configuran en "Configuración del Ticket")
    if (["causa_raiz_tecnica", "tiempo_downtime_real", "incidente_colateral", "ticket_problema_preventivo", "lecciones_aprendidas"].includes(campo.codigo)) {
      return false;
    }

    // 4. En EMERGENCIA: El alta es de intervención rápida (hotfix). Se excluyen planes detallados de fase 2, cuestionarios y ventanas normales
    if (tipoCambioActivo === "EMERGENCIA") {
      if ([
        "punto_no_retorno", "plan_pruebas", "criterios_exito", "ventana_id",
        "requiere_interrupcion", "duracion_interrupcion", "riesgo_respuestas",
        "impacto", "urgencia", "prioridad", "beneficio", "consecuencia_no_hacer"
      ].includes(campo.codigo)) {
        return false;
      }
    }

    // 5. En ESTANDAR: Se rige por el modelo pre-aprobado. No requiere cuestionario ni priorización dinámica
    if (tipoCambioActivo === "ESTANDAR") {
      if ([
        "riesgo_respuestas", "ticket_origen", "consecuencia_no_hacer",
        "impacto", "urgencia", "prioridad", "beneficio"
      ].includes(campo.codigo)) {
        return false;
      }
    }

    // 6. Tipo de cambio aplicable configurado en propiedades
    if (campo.tipo_cambio_aplicable && campo.tipo_cambio_aplicable !== "TODOS") {
      if (campo.tipo_cambio_aplicable !== tipoCambioActivo) return false;
    }

    return true;
  };

  // Eliminar un campo de una sección (para todos los campos)
  const eliminarCampoDeSeccion = (seccionId: string, codigo: string) => {
    const confirmacion = window.confirm(`¿Deseas eliminar el campo "${codigo}" de esta sección del formulario?`);
    if (!confirmacion) return;
    const nuevas = seccionesEfectivas.map((sec) => {
      if (sec.id !== seccionId) return sec;
      return {
        ...sec,
        campos: sec.campos.filter((c) => c.codigo !== codigo),
      };
    });
    onChangeSecciones(nuevas);
  };

  // Actualizar un campo específico
  const actualizarCampo = (seccionId: string, codigo: string, patch: Partial<CampoFormulario>) => {
    const nuevas = seccionesEfectivas.map((sec) => {
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
    const sec = seccionesEfectivas.find((s) => s.id === seccionId);
    if (!sec || fromIndex === toIndex) return;
    const nuevosCampos = [...sec.campos];
    const [removido] = nuevosCampos.splice(fromIndex, 1);
    nuevosCampos.splice(toIndex, 0, removido);
    onChangeSecciones(seccionesEfectivas.map((s) => (s.id === seccionId ? { ...s, campos: nuevosCampos } : s)));
  };

  // Particiones y secciones activas estrictamente por Tipo de Cambio para el Formulario de Alta
  const obtenerSeccionesActivas = (): SeccionFormulario[] => {
    if (tipoCambioActivo === "NORMAL") {
      return ["sec_a", "sec_b", "sec_c", "sec_d", "sec_e", "sec_h"]
        .map((id) => seccionesEfectivas.find((s) => s.id === id))
        .filter(Boolean) as SeccionFormulario[];
    } else if (tipoCambioActivo === "EMERGENCIA") {
      return ["sec_g", "sec_a", "sec_c", "sec_f", "sec_h"]
        .map((id) => seccionesEfectivas.find((s) => s.id === id))
        .filter(Boolean) as SeccionFormulario[];
    } else {
      // ESTANDAR
      return ["sec_a", "sec_c", "sec_e", "sec_h"]
        .map((id) => seccionesEfectivas.find((s) => s.id === id))
        .filter(Boolean) as SeccionFormulario[];
    }
  };

  const seccionesVisiblesEnLienzo = obtenerSeccionesActivas();

  // Contadores dinámicos filtrados por tipo de cambio y fase
  const totalCampos = seccionesVisiblesEnLienzo.reduce(
    (acc, s) => acc + (s.campos?.filter(campoAplicaATipoYFase).length || 0),
    0
  );
  const totalVisibles = seccionesVisiblesEnLienzo.reduce(
    (acc, s) => acc + (s.campos?.filter((c) => campoAplicaATipoYFase(c) && c.visible).length || 0),
    0
  );
  const totalObligatorios = seccionesVisiblesEnLienzo.reduce(
    (acc, s) => acc + (s.campos?.filter((c) => campoAplicaATipoYFase(c) && c.visible && c.obligatorio === "si").length || 0),
    0
  );

  // Renderizador de una tarjeta de sección
  const renderizarSeccion = (sec: SeccionFormulario, esHeredada: boolean) => {
    const estaColapsada = Boolean(seccionesColapsadas[sec.id]);
    return (
      <div
        key={sec.id}
        style={{
          backgroundColor: "#ffffff",
          borderRadius: 8,
          border: `1px solid ${esHeredada ? "#cbd5e1" : "#e2e8f0"}`,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}
      >
        {/* Cabecera de la Sección */}
        <div
          onClick={() => toggleSeccion(sec.id)}
          style={{
            backgroundColor: esHeredada ? "#f1f5f9" : "#f8fafc",
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
              {sec.titulo.replace(/^Sección\s+[A-Z]\s*—\s*/i, "")}
            </span>
            {esHeredada && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                  backgroundColor: "#dbeafe",
                  color: "#1e40af",
                  border: "1px solid #bfdbfe",
                  textTransform: "uppercase",
                }}
              >
                Heredado de Alta
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              {sec.campos?.filter((c) => campoAplicaATipoYFase(c) && c.visible).length || 0} /{" "}
              {sec.campos?.filter(campoAplicaATipoYFase).length || 0} visibles
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {estaColapsada ? "(Expandir)" : "(Contraer)"}
            </span>
          </div>
        </div>

        {/* Lista de Campos en la Sección */}
        {!estaColapsada && (
          <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
            {(sec.campos || [])
              .filter((c) => {
                if (!campoAplicaATipoYFase(c)) return false;
                if (soloObligatorios) return c.visible && c.obligatorio === "si";
                if (soloOcultos) return !c.visible;
                return true;
              })
              .map((campo, idx) => {
                return (
                  <div
                    key={campo.codigo}
                    draggable={puedeEditar && !esHeredada}
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "6px 10px",
                      borderRadius: 6,
                      border: "1px solid #e2e8f0",
                      backgroundColor: campo.visible ? "#ffffff" : "#f8fafc",
                      transition: "all 0.15s ease",
                      opacity: arrastrando?.seccionId === sec.id && arrastrando?.index === idx ? 0.4 : 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: esHeredada ? "default" : "grab",
                          color: esHeredada ? "#cbd5e1" : "#94a3b8",
                          padding: "2px 4px",
                          borderRadius: 4,
                          flexShrink: 0,
                        }}
                        title={esHeredada ? "Campo base heredado de la solicitud inicial" : "Arrastra los 6 puntos para mover este campo"}
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
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: campo.visible ? "#1e293b" : "#94a3b8",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {campo.etiqueta}
                          </span>
                          {campo.es_personalizado && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: "1px 6px",
                                borderRadius: 4,
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #cbd5e1",
                                fontWeight: 700,
                              }}
                              title="Campo técnico personalizado definido en el catálogo general"
                            >
                              Personalizado
                            </span>
                          )}
                          {campo.tipo_cambio_aplicable && campo.tipo_cambio_aplicable !== "TODOS" && (
                            <span
                              style={{
                                fontSize: 9.5,
                                padding: "1px 5px",
                                borderRadius: 4,
                                backgroundColor: "#e0f2fe",
                                color: "#0369a1",
                                border: "1px solid #bae6fd",
                                fontWeight: 600,
                              }}
                            >
                              {campo.tipo_cambio_aplicable}
                            </span>
                          )}
                          {esHeredada && campo.solo_lectura && (
                            <span
                              style={{
                                fontSize: 10,
                                padding: "1px 6px",
                                borderRadius: 4,
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              Solo Lectura
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "#64748b", fontFamily: "monospace" }}>
                          {campo.codigo} · {campo.tipo}
                        </span>
                      </div>
                    </div>

                    {/* Controles en la fila */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <select
                        className="input-base"
                        value={campo.obligatorio}
                        disabled={!puedeEditar}
                        onChange={(e) => actualizarCampo(sec.id, campo.codigo, { obligatorio: e.target.value as any })}
                        style={{ fontSize: 10.5, padding: "2px 5px", maxWidth: 115, width: "auto" }}
                      >
                        <option value="si">Obligatorio</option>
                        <option value="no">Opcional</option>
                        <option value="segun_tipo">Según Tipo</option>
                        <option value="condicional">Condicional</option>
                      </select>

                      {/* Botón de visibilidad con icono de ojo */}
                      <button
                        type="button"
                        disabled={!puedeEditar}
                        onClick={() => {
                          actualizarCampo(sec.id, campo.codigo, { visible: !campo.visible });
                        }}
                        className="boton-accion-icono"
                        style={{
                          width: 26,
                          height: 26,
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

                      {/* Botón de edición con icono de lápiz */}
                      <button
                        type="button"
                        disabled={!puedeEditar}
                        onClick={() => setCampoEditando({ seccionId: sec.id, campo })}
                        className="boton-accion-icono"
                        style={{
                          width: 28,
                          height: 28,
                          color: "#2563eb",
                          borderColor: "#bfdbfe",
                          backgroundColor: "#eff6ff",
                        }}
                        title="Editar propiedades del campo (etiqueta, ayuda, ancho, reglas)"
                        aria-label="Editar propiedades del campo"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>

                      {/* Botón de eliminar campo para TODOS los campos */}
                      <button
                        type="button"
                        disabled={!puedeEditar}
                        onClick={() => eliminarCampoDeSeccion(sec.id, campo.codigo)}
                        className="boton-accion-icono"
                        style={{
                          width: 28,
                          height: 28,
                          color: "#dc2626",
                          borderColor: "#fecaca",
                          backgroundColor: "#fef2f2",
                        }}
                        title="Eliminar campo de la sección"
                        aria-label="Eliminar campo"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  };

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
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {/* Selector Maestro: Tipo de Cambio */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1e293b" }}>Tipo de Cambio a configurar:</span>
            <select
              className="input-base"
              value={tipoCambioActivo}
              onChange={(e) => {
                const nuevo = e.target.value as "NORMAL" | "EMERGENCIA" | "ESTANDAR";
                setTipoCambioActivo(nuevo);
              }}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: tipoCambioActivo === "EMERGENCIA" ? "#dc2626" : tipoCambioActivo === "ESTANDAR" ? "#16a34a" : "#2563eb",
                width: 250,
              }}
            >
              <option value="NORMAL">Normal (CAB y Rollback)</option>
              <option value="EMERGENCIA">Emergencia (Crisis P1 y ECAB)</option>
              <option value="ESTANDAR">Estándar (Pre-Aprobado por Catálogo)</option>
            </select>
          </div>

          <span style={{ fontSize: 11.5, color: "#64748b" }}>
            {totalVisibles} campos visibles · {totalObligatorios} obligatorios
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
        </div>
      </div>

      {/* Layout de Dos Columnas: Lienzo de Secciones y Campos (Izquierda) + Vista Previa en Vivo (Derecha) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(270px, 0.80fr) minmax(380px, 1.20fr)",
          gap: 12,
          minHeight: 680,
          alignItems: "start",
        }}
      >
        {/* Columna Izquierda: Lienzo de Secciones */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 600 }}>
          {seccionesVisiblesEnLienzo.map((sec) => renderizarSeccion(sec, false))}
        </div>

        {/* Columna Derecha: Vista Previa en Vivo Simulada fijada y con scroll independiente */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "sticky",
            top: 16,
            maxHeight: "calc(100vh - 32px)",
            overflowY: "auto",
            scrollbarWidth: "thin",
          }}
        >
          <SimuladorCambiosEnVivo
            secciones={seccionesEfectivas}
            abierto={true}
            tipoCambioProp={tipoCambioActivo}
            onTipoCambioChange={(nuevo) => setTipoCambioActivo(nuevo)}
          />
        </div>
      </div>

      {/* Modal de Edición de Propiedades del Campo */}
      <ModalEditarPropiedadesCampo
        abierto={!!campoEditando}
        seccionId={campoEditando?.seccionId || ""}
        campo={campoEditando?.campo || null}
        onCerrar={() => setCampoEditando(null)}
        onGuardar={actualizarCampo}
        puedeEditar={puedeEditar}
      />
    </div>
  );
};
