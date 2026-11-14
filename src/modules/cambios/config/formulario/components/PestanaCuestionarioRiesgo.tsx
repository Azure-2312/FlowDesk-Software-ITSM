"use client";

import React, { useState } from "react";

interface OpcionRiesgo {
  valor: string;
  texto: string;
  puntaje: number;
  eleva_minimo: string | null;
}

interface PreguntaRiesgo {
  id: number;
  orden: number;
  texto: string;
  peso: number;
  aplica_a: string[];
  activa: boolean;
  opciones: OpcionRiesgo[];
}

interface NivelRiesgo {
  id: string;
  nombre: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  border: string;
  descripcion: string;
}

interface PestanaCuestionarioRiesgoProps {
  config: {
    activo?: boolean;
    puntaje_maximo_posible?: number;
    niveles?: NivelRiesgo[];
    reglas?: {
      aplicar_regla_elevacion: boolean;
      permitir_ajuste_manual: boolean;
      perfiles_ajuste_manual: number[];
      riesgo_fijo_estandar: boolean;
      cuestionario_abreviado_emergencia: boolean;
      preguntas_emergencia: number[];
    };
    preguntas?: PreguntaRiesgo[];
  };
  onChangeConfig: (nuevaConfig: any) => void;
}

const TIPOS_CAMBIO_DISPONIBLES = [
  { codigo: "NORMAL", etiqueta: "Normal" },
  { codigo: "EMERGENCIA", etiqueta: "Emergencia" },
  { codigo: "ESTANDAR", etiqueta: "Estándar" },
];

const calcularPuntajeMaximo = (listaPreguntas: PreguntaRiesgo[]) =>
  listaPreguntas.reduce((sum, p) => {
    if (!p.activa || !p.opciones || p.opciones.length === 0) return sum;
    const maxOpc = Math.max(...p.opciones.map((o) => Number(o.puntaje) || 0), 0);
    return sum + maxOpc * (Number(p.peso) || 1);
  }, 0);

const generarSlugValor = (texto: string, indice: number) => {
  const base = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 28);
  return base ? `${base}_${indice}` : `opcion_${Date.now()}_${indice}`;
};

export const PestanaCuestionarioRiesgo: React.FC<PestanaCuestionarioRiesgoProps> = ({
  config = {},
  onChangeConfig,
}) => {
  const [modalEditarPreguntaAbierto, setModalEditarPreguntaAbierto] = useState(false);
  const [esNuevaPregunta, setEsNuevaPregunta] = useState(false);
  const [preguntaEditar, setPreguntaEditar] = useState<PreguntaRiesgo | null>(null);
  const [errorModalPregunta, setErrorModalPregunta] = useState("");

  // Modal de Edición de Niveles de Riesgo
  const [modalNivelesAbierto, setModalNivelesAbierto] = useState(false);
  const [nivelesEditar, setNivelesEditar] = useState<NivelRiesgo[]>([]);
  const [errorModalNiveles, setErrorModalNiveles] = useState("");

  const preguntas: PreguntaRiesgo[] = Array.isArray(config.preguntas) ? config.preguntas : [];
  const niveles: NivelRiesgo[] = Array.isArray(config.niveles) ? config.niveles : [];
  const reglas = config.reglas || {
    aplicar_regla_elevacion: true,
    permitir_ajuste_manual: true,
    perfiles_ajuste_manual: [1, 8],
    riesgo_fijo_estandar: true,
    cuestionario_abreviado_emergencia: true,
    preguntas_emergencia: [1, 2, 3, 6, 8],
  };

  const puntajeMaximoCalculado = calcularPuntajeMaximo(preguntas);

  const emitirCambioPreguntas = (nuevasPreguntas: PreguntaRiesgo[]) => {
    const reordenadas = nuevasPreguntas.map((p, idx) => ({ ...p, orden: idx + 1 }));
    const idsEmergencia = reordenadas
      .filter((p) => p.activa && p.aplica_a?.includes("EMERGENCIA"))
      .map((p) => p.id);

    onChangeConfig({
      ...config,
      puntaje_maximo_posible: calcularPuntajeMaximo(reordenadas),
      reglas: {
        ...reglas,
        preguntas_emergencia: idsEmergencia,
      },
      preguntas: reordenadas,
    });
  };

  const alternarActivaPregunta = (id: number) => {
    const nuevas = preguntas.map((p) => (p.id === id ? { ...p, activa: !p.activa } : p));
    emitirCambioPreguntas(nuevas);
  };

  const moverPregunta = (index: number, direccion: -1 | 1) => {
    const nuevoIndice = index + direccion;
    if (nuevoIndice < 0 || nuevoIndice >= preguntas.length) return;
    const copia = [...preguntas];
    const [movida] = copia.splice(index, 1);
    copia.splice(nuevoIndice, 0, movida);
    emitirCambioPreguntas(copia);
  };

  const eliminarPregunta = (preg: PreguntaRiesgo) => {
    if (!confirm(`¿Deseas eliminar la pregunta #${preg.orden}: "${preg.texto}"?`)) return;
    const restantes = preguntas.filter((p) => p.id !== preg.id);
    emitirCambioPreguntas(restantes);
  };

  const abrirNuevaPregunta = () => {
    const siguienteId = Math.max(0, ...preguntas.map((p) => p.id || 0)) + 1;
    setEsNuevaPregunta(true);
    setErrorModalPregunta("");
    setPreguntaEditar({
      id: siguienteId,
      orden: preguntas.length + 1,
      texto: "",
      peso: 1,
      aplica_a: ["NORMAL"],
      activa: true,
      opciones: [
        { valor: `opcion_${siguienteId}_1`, texto: "Sin impacto / Bajo", puntaje: 0, eleva_minimo: null },
        { valor: `opcion_${siguienteId}_2`, texto: "Impacto moderado", puntaje: 2, eleva_minimo: null },
        { valor: `opcion_${siguienteId}_3`, texto: "Impacto crítico", puntaje: 5, eleva_minimo: null },
      ],
    });
    setModalEditarPreguntaAbierto(true);
  };

  const abrirEditarPregunta = (p: PreguntaRiesgo) => {
    setEsNuevaPregunta(false);
    setErrorModalPregunta("");
    setPreguntaEditar({
      ...p,
      aplica_a: Array.isArray(p.aplica_a) ? [...p.aplica_a] : ["NORMAL"],
      opciones: Array.isArray(p.opciones) ? p.opciones.map((o) => ({ ...o })) : [],
    });
    setModalEditarPreguntaAbierto(true);
  };

  const alternarTipoAplica = (tipo: string) => {
    if (!preguntaEditar) return;
    const actuales = preguntaEditar.aplica_a || [];
    const nuevos = actuales.includes(tipo)
      ? actuales.filter((t) => t !== tipo)
      : [...actuales, tipo];
    setPreguntaEditar({ ...preguntaEditar, aplica_a: nuevos });
  };

  const agregarOpcionModal = () => {
    if (!preguntaEditar) return;
    const indice = preguntaEditar.opciones.length + 1;
    const nuevaOpcion: OpcionRiesgo = {
      valor: `opc_${preguntaEditar.id}_${Date.now()}_${indice}`,
      texto: "",
      puntaje: 1,
      eleva_minimo: null,
    };
    setPreguntaEditar({
      ...preguntaEditar,
      opciones: [...preguntaEditar.opciones, nuevaOpcion],
    });
  };

  const actualizarOpcionModal = (idx: number, patch: Partial<OpcionRiesgo>) => {
    if (!preguntaEditar) return;
    const nuevas = preguntaEditar.opciones.map((opc, i) => (i === idx ? { ...opc, ...patch } : opc));
    setPreguntaEditar({ ...preguntaEditar, opciones: nuevas });
  };

  const moverOpcionModal = (idx: number, direccion: -1 | 1) => {
    if (!preguntaEditar) return;
    const nuevoIdx = idx + direccion;
    if (nuevoIdx < 0 || nuevoIdx >= preguntaEditar.opciones.length) return;
    const copia = [...preguntaEditar.opciones];
    const [movida] = copia.splice(idx, 1);
    copia.splice(nuevoIdx, 0, movida);
    setPreguntaEditar({ ...preguntaEditar, opciones: copia });
  };

  const eliminarOpcionModal = (idx: number) => {
    if (!preguntaEditar) return;
    if (preguntaEditar.opciones.length <= 1) {
      setErrorModalPregunta("La pregunta debe conservar al menos 1 opción de respuesta.");
      return;
    }
    setErrorModalPregunta("");
    setPreguntaEditar({
      ...preguntaEditar,
      opciones: preguntaEditar.opciones.filter((_, i) => i !== idx),
    });
  };

  const guardarPreguntaEditada = () => {
    if (!preguntaEditar) return;

    if (!preguntaEditar.texto.trim()) {
      setErrorModalPregunta("El texto de la pregunta es obligatorio.");
      return;
    }
    if (!preguntaEditar.aplica_a || preguntaEditar.aplica_a.length === 0) {
      setErrorModalPregunta("Selecciona al menos un Tipo de Cambio al que aplica la pregunta.");
      return;
    }
    if (!preguntaEditar.opciones || preguntaEditar.opciones.length === 0) {
      setErrorModalPregunta("Agrega al menos una opción de respuesta.");
      return;
    }
    const opcionVacia = preguntaEditar.opciones.find((o) => !o.texto.trim());
    if (opcionVacia) {
      setErrorModalPregunta("Todas las opciones deben tener un texto descriptivo.");
      return;
    }

    const opcionesLimpias = preguntaEditar.opciones.map((o, idx) => ({
      ...o,
      texto: o.texto.trim(),
      valor: o.valor || generarSlugValor(o.texto, idx + 1),
      puntaje: Math.max(0, Number(o.puntaje) || 0),
    }));

    const preguntaFinal: PreguntaRiesgo = {
      ...preguntaEditar,
      texto: preguntaEditar.texto.trim(),
      peso: Math.max(1, Math.min(5, Number(preguntaEditar.peso) || 1)),
      opciones: opcionesLimpias,
    };

    const nuevas = esNuevaPregunta
      ? [...preguntas, preguntaFinal]
      : preguntas.map((p) => (p.id === preguntaFinal.id ? preguntaFinal : p));

    emitirCambioPreguntas(nuevas);
    setModalEditarPreguntaAbierto(false);
  };

  // Edición de Niveles de Riesgo
  const abrirEditarNiveles = () => {
    setErrorModalNiveles("");
    setNivelesEditar(niveles.map((n) => ({ ...n })));
    setModalNivelesAbierto(true);
  };

  const actualizarNivelModal = (idx: number, patch: Partial<NivelRiesgo>) => {
    setNivelesEditar((prev) => prev.map((n, i) => (i === idx ? { ...n, ...patch } : n)));
  };

  const guardarNivelesEditados = () => {
    for (const niv of nivelesEditar) {
      if (!niv.nombre.trim()) {
        setErrorModalNiveles("Todos los niveles deben tener un nombre.");
        return;
      }
      if (Number(niv.min) < 0 || Number(niv.max) < Number(niv.min)) {
        setErrorModalNiveles(`Rango inválido en "${niv.nombre}": el mínimo no puede superar al máximo.`);
        return;
      }
    }
    onChangeConfig({
      ...config,
      niveles: nivelesEditar.map((n) => ({
        ...n,
        nombre: n.nombre.trim(),
        min: Number(n.min) || 0,
        max: Number(n.max) || 0,
      })),
    });
    setModalNivelesAbierto(false);
  };

  const idsEmergenciaActivos = preguntas
    .filter((p) => p.activa && p.aplica_a?.includes("EMERGENCIA"))
    .map((p) => p.orden);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Cabecera y Resumen de Métricas de Riesgo (Sin tarjeta contenedora) */}
      <div style={{ marginBottom: 4 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Cuestionario Ponderado de Evaluación de Riesgo (ITIL 4 / COBIT BAI06)
        </h3>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>
          El nivel de riesgo gobierna la matriz de autoridad y determina si una RFC requiere dictamen colegiado del CAB o aprobación técnica delegada.
        </p>
      </div>

      {/* Preguntas y Opciones de Ponderación (Arriba de todo, debajo del título) */}
      <div style={{ backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Preguntas y Opciones de Ponderación ({preguntas.length})
            </h4>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              {preguntas.filter((p) => p.activa).length} activas · Puntaje máximo posible:{" "}
              <strong>{puntajeMaximoCalculado} puntos</strong>
            </span>
          </div>

          <button
            type="button"
            className="boton-primario"
            onClick={abrirNuevaPregunta}
            style={{ width: "auto", fontSize: 12, padding: "7px 14px", backgroundColor: "#2563eb" }}
          >
            + Nueva Pregunta
          </button>
        </div>

        <div className="contenedor-tabla">
          <table className="tabla">
            <thead>
              <tr>
                <th style={{ width: 68, textAlign: "center" }}>#</th>
                <th>Pregunta</th>
                <th style={{ width: 150 }}>Aplica a Tipos</th>
                <th>Opciones y Puntos</th>
                <th style={{ width: 64, textAlign: "center" }}>Peso</th>
                <th style={{ width: 220, textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {preguntas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 28, color: "#64748b" }}>
                    No hay preguntas configuradas. Haz clic en <strong>+ Nueva Pregunta</strong> para agregar la primera.
                  </td>
                </tr>
              ) : (
                preguntas.map((preg, index) => (
                  <tr key={preg.id} style={{ opacity: preg.activa ? 1 : 0.6 }}>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <span style={{ fontWeight: 700, color: "#64748b", minWidth: 18 }}>{preg.orden}</span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <button
                            type="button"
                            onClick={() => moverPregunta(index, -1)}
                            disabled={index === 0}
                            title="Subir orden"
                            style={{
                              border: "none",
                              background: "none",
                              cursor: index === 0 ? "default" : "pointer",
                              color: index === 0 ? "#cbd5e1" : "#475569",
                              fontSize: 10,
                              lineHeight: 1,
                              padding: 1,
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => moverPregunta(index, 1)}
                            disabled={index === preguntas.length - 1}
                            title="Bajar orden"
                            style={{
                              border: "none",
                              background: "none",
                              cursor: index === preguntas.length - 1 ? "default" : "pointer",
                              color: index === preguntas.length - 1 ? "#cbd5e1" : "#475569",
                              fontSize: 10,
                              lineHeight: 1,
                              padding: 1,
                            }}
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: "#1e293b" }}>{preg.texto}</td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {(preg.aplica_a || []).map((tipo) => (
                          <span
                            key={tipo}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 6px",
                              borderRadius: 4,
                              backgroundColor:
                                tipo === "EMERGENCIA" ? "#fef2f2" : tipo === "ESTANDAR" ? "#f0fdf4" : "#eff6ff",
                              color:
                                tipo === "EMERGENCIA" ? "#b91c1c" : tipo === "ESTANDAR" ? "#15803d" : "#1d4ed8",
                              border: `1px solid ${
                                tipo === "EMERGENCIA" ? "#fecaca" : tipo === "ESTANDAR" ? "#bbf7d0" : "#bfdbfe"
                              }`,
                            }}
                          >
                            {tipo}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                        {(preg.opciones || []).map((opc, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => abrirEditarPregunta(preg)}
                            style={{
                              fontSize: 10.5,
                              padding: "2px 7px",
                              backgroundColor: opc.eleva_minimo ? "#fff1f2" : "#f8fafc",
                              border: `1px solid ${opc.eleva_minimo ? "#fecdd3" : "#e2e8f0"}`,
                              borderRadius: 4,
                              color: opc.eleva_minimo ? "#be123c" : "#334155",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            title={
                              opc.eleva_minimo
                                ? `Eleva riesgo automáticamente a mínimo ${opc.eleva_minimo} (clic para editar opciones)`
                                : "Clic para editar pregunta y opciones"
                            }
                          >
                            {opc.texto} ({opc.puntaje} pts{opc.eleva_minimo ? ` ⚠️ Mín. ${opc.eleva_minimo}` : ""})
                          </button>
                        ))}
                      </div>
                    </td>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>x{preg.peso || 1}</td>
                    <td>
                      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => alternarActivaPregunta(preg.id)}
                          style={{
                            fontSize: 11,
                            padding: "4px 8px",
                            backgroundColor: preg.activa ? "#fef2f2" : "#f0fdf4",
                            color: preg.activa ? "#b91c1c" : "#15803d",
                            border: `1px solid ${preg.activa ? "#fecaca" : "#bbf7d0"}`,
                            fontWeight: 600,
                          }}
                        >
                          {preg.activa ? "Deshabilitar" : "Habilitar"}
                        </button>
                        <button
                          type="button"
                          className="boton-mini"
                          onClick={() => abrirEditarPregunta(preg)}
                          style={{ fontSize: 11, padding: "4px 8px" }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="boton-mini boton-mini-peligro"
                          onClick={() => eliminarPregunta(preg)}
                          style={{ fontSize: 11, padding: "4px 8px" }}
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
      </div>

      {/* Dos bloques compartiendo la pantalla mitad y mitad a la misma altura */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 18,
          alignItems: "stretch",
        }}
      >
        {/* Izquierda (50%): Niveles de Riesgo y Escala de Puntajes */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
            <div>
              <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                Niveles de Riesgo y Escala de Puntajes
              </h4>
              <span style={{ fontSize: 11.5, color: "#64748b" }}>
                Puntaje máximo configurable posible: <strong>{puntajeMaximoCalculado} puntos</strong>
              </span>
            </div>
            <button
              type="button"
              className="boton-mini"
              onClick={abrirEditarNiveles}
              style={{ fontSize: 11, padding: "4px 10px", whiteSpace: "nowrap" }}
            >
              Editar Escala
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
            {niveles.map((niv) => (
              <div
                key={niv.id}
                style={{
                  backgroundColor: niv.bg || "#f8fafc",
                  border: `1.5px solid ${niv.border || "#cbd5e1"}`,
                  borderRadius: 8,
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 800, fontSize: 13.5, color: niv.color }}>
                    {niv.nombre}
                  </span>
                  <span
                    style={{
                      backgroundColor: "#ffffff",
                      border: `1px solid ${niv.border}`,
                      borderRadius: 4,
                      padding: "2px 6px",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: niv.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {niv.min} – {niv.max} pts
                  </span>
                </div>
                <p style={{ fontSize: 11, color: "#475569", margin: 0, lineHeight: 1.4 }}>
                  {niv.descripcion}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Derecha (50%): Parámetros de Gobierno y Elevación Automática */}
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: 8,
            border: "1px solid #e2e8f0",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            boxSizing: "border-box",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", margin: 0 }}>
              Parámetros de Gobierno y Elevación Automática
            </h4>
            <span style={{ fontSize: 11.5, color: "#64748b" }}>
              Reglas globales aplicadas al evaluar el nivel de riesgo de cada RFC
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <input
                type="checkbox"
                id="chk-elevacion"
                checked={reglas.aplicar_regla_elevacion}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    reglas: { ...reglas, aplicar_regla_elevacion: e.target.checked },
                  })
                }
                style={{ marginTop: 2 }}
              />
              <div>
                <label htmlFor="chk-elevacion" style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                  Aplicar Regla de Elevación de Riesgo
                </label>
                <span style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35, display: "block", marginTop: 3 }}>
                  Si una respuesta marca &quot;Eleva a mínimo X&quot;, el nivel final no podrá ser menor aunque el puntaje sea bajo.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <input
                type="checkbox"
                id="chk-ajuste-manual"
                checked={reglas.permitir_ajuste_manual}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    reglas: { ...reglas, permitir_ajuste_manual: e.target.checked },
                  })
                }
                style={{ marginTop: 2 }}
              />
              <div>
                <label htmlFor="chk-ajuste-manual" style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                  Permitir Ajuste Manual de Riesgo
                </label>
                <span style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35, display: "block", marginTop: 3 }}>
                  Permite al Gestor de Cambios ajustar el nivel calculado con justificación técnica auditada.
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <input
                type="checkbox"
                id="chk-estandar-fijo"
                checked={reglas.riesgo_fijo_estandar}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    reglas: { ...reglas, riesgo_fijo_estandar: e.target.checked },
                  })
                }
                style={{ marginTop: 2 }}
              />
              <div>
                <label htmlFor="chk-estandar-fijo" style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                  Riesgo Fijo para Cambios Estándar
                </label>
                <span style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35, display: "block", marginTop: 3 }}>
                  Para modelos preautorizados, el nivel de riesgo viene fijado desde el catálogo (típicamente Bajo).
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              <input
                type="checkbox"
                id="chk-emergencia-abreviado"
                checked={reglas.cuestionario_abreviado_emergencia}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    reglas: { ...reglas, cuestionario_abreviado_emergencia: e.target.checked },
                  })
                }
                style={{ marginTop: 2 }}
              />
              <div>
                <label htmlFor="chk-emergencia-abreviado" style={{ display: "block", fontSize: 11.5, fontWeight: 700, color: "#0f172a", cursor: "pointer" }}>
                  Cuestionario Abreviado en Emergencia
                </label>
                <span style={{ fontSize: 10.5, color: "#64748b", lineHeight: 1.35, display: "block", marginTop: 3 }}>
                  En emergencias solo son obligatorias las preguntas marcadas para Emergencia (
                  {idsEmergenciaActivos.length > 0 ? `#${idsEmergenciaActivos.join(", #")}` : "ninguna"}).
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Crear / Editar Pregunta y sus Opciones */}
      {modalEditarPreguntaAbierto && preguntaEditar && (
        <div
          className="modal-overlay"
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}
          onClick={() => setModalEditarPreguntaAbierto(false)}
        >
          <div
            className="modal-contenido"
            style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 680, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-ticket-cabecera">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  {esNuevaPregunta ? "Nueva Pregunta del Cuestionario" : `Editar Pregunta #${preguntaEditar.orden}`}
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Configura el enunciado, tipos de cambio aplicables y sus opciones con puntajes.
                </span>
              </div>
              <button type="button" className="modal-cerrar-boton" onClick={() => setModalEditarPreguntaAbierto(false)}>
                ✕
              </button>
            </div>

            <div className="modal-ticket-cuerpo">
              {errorModalPregunta && (
                <div className="mensaje-error" style={{ padding: "8px 12px", borderRadius: 6 }}>
                  {errorModalPregunta}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  Texto de la pregunta *
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Ej. ¿Afecta a servicios o CIs críticos?"
                  value={preguntaEditar.texto}
                  onChange={(e) => setPreguntaEditar({ ...preguntaEditar, texto: e.target.value })}
                  style={{ width: "100%", fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>
                  Multiplicador / Peso (1 a 5)
                </label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="input-base"
                  value={preguntaEditar.peso}
                  onChange={(e) => setPreguntaEditar({ ...preguntaEditar, peso: Number(e.target.value) || 1 })}
                  style={{ width: 140, fontSize: 12.5, height: 38, padding: "6px 10px" }}
                />
              </div>

              {/* Aplica a Tipos y Estado */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end", backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>
                    Aplica a Tipos de Cambio *
                  </label>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {TIPOS_CAMBIO_DISPONIBLES.map((t) => {
                      const marcado = preguntaEditar.aplica_a?.includes(t.codigo);
                      return (
                        <label
                          key={t.codigo}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            padding: "4px 10px",
                            borderRadius: 6,
                            cursor: "pointer",
                            backgroundColor: marcado ? "#eff6ff" : "#ffffff",
                            color: marcado ? "#1d4ed8" : "#475569",
                            border: `1px solid ${marcado ? "#93c5fd" : "#cbd5e1"}`,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={marcado}
                            onChange={() => alternarTipoAplica(t.codigo)}
                          />
                          {t.etiqueta}
                        </label>
                      );
                    })}
                  </div>
                </div>

                <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "#0f172a", cursor: "pointer", paddingBottom: 4 }}>
                  <input
                    type="checkbox"
                    checked={preguntaEditar.activa}
                    onChange={(e) => setPreguntaEditar({ ...preguntaEditar, activa: e.target.checked })}
                  />
                  Pregunta activa
                </label>
              </div>

              {/* Opciones de Respuesta (Agregar, Editar, Reordenar, Eliminar) */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>
                      Opciones de Respuesta y Puntajes ({preguntaEditar.opciones.length})
                    </label>
                    <span style={{ fontSize: 11, color: "#64748b" }}>
                      Aporte máximo al puntaje total:{" "}
                      <strong>
                        {Math.max(...preguntaEditar.opciones.map((o) => Number(o.puntaje) || 0), 0) *
                          (Number(preguntaEditar.peso) || 1)}{" "}
                        pts
                      </strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    className="boton-mini"
                    onClick={agregarOpcionModal}
                    style={{
                      backgroundColor: "#eff6ff",
                      borderColor: "#93c5fd",
                      color: "#1d4ed8",
                      fontWeight: 700,
                      padding: "5px 10px",
                    }}
                  >
                    + Agregar Opción
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 78px 140px 84px", gap: 8, marginBottom: 6, padding: "0 4px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Texto de la opción</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Puntos</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b" }}>Regla de elevación</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textAlign: "center" }}>Acciones</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {preguntaEditar.opciones.map((opc, idx) => (
                    <div
                      key={opc.valor || idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 78px 140px 84px",
                        gap: 8,
                        alignItems: "center",
                        backgroundColor: "#f8fafc",
                        padding: 6,
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <input
                        type="text"
                        className="input-base"
                        placeholder="Descripción de la opción..."
                        value={opc.texto}
                        onChange={(e) => actualizarOpcionModal(idx, { texto: e.target.value })}
                        style={{ fontSize: 12, padding: "6px 9px", height: 34 }}
                      />
                      <input
                        type="number"
                        min={0}
                        max={20}
                        className="input-base"
                        value={opc.puntaje}
                        onChange={(e) => actualizarOpcionModal(idx, { puntaje: Math.max(0, Number(e.target.value) || 0) })}
                        style={{ fontSize: 12, padding: "6px 6px", height: 34, textAlign: "center" }}
                      />
                      <select
                        className="input-base"
                        value={opc.eleva_minimo || ""}
                        onChange={(e) => actualizarOpcionModal(idx, { eleva_minimo: e.target.value ? e.target.value : null })}
                        style={{ fontSize: 11.5, padding: "5px 8px", height: 34 }}
                      >
                        <option value="">Sin elevación</option>
                        <option value="medio">Eleva a Medio</option>
                        <option value="alto">Eleva a Alto</option>
                        <option value="critico">Eleva a Crítico</option>
                      </select>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => moverOpcionModal(idx, -1)}
                          disabled={idx === 0}
                          title="Subir opción"
                          style={{
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            width: 24,
                            height: 28,
                            cursor: idx === 0 ? "default" : "pointer",
                            color: idx === 0 ? "#cbd5e1" : "#475569",
                            fontSize: 10,
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moverOpcionModal(idx, 1)}
                          disabled={idx === preguntaEditar.opciones.length - 1}
                          title="Bajar opción"
                          style={{
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            borderRadius: 4,
                            width: 24,
                            height: 28,
                            cursor: idx === preguntaEditar.opciones.length - 1 ? "default" : "pointer",
                            color: idx === preguntaEditar.opciones.length - 1 ? "#cbd5e1" : "#475569",
                            fontSize: 10,
                          }}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarOpcionModal(idx)}
                          title={
                            preguntaEditar.opciones.length <= 1
                              ? "Debe conservar al menos 1 opción"
                              : "Eliminar opción"
                          }
                          style={{
                            border: "1px solid #fecaca",
                            backgroundColor: "#fef2f2",
                            borderRadius: 4,
                            width: 26,
                            height: 28,
                            cursor: "pointer",
                            color: "#b91c1c",
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button type="button" className="boton-secundario" onClick={() => setModalEditarPreguntaAbierto(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="boton-primario"
                onClick={guardarPreguntaEditada}
                style={{ width: "auto", padding: "8px 18px", backgroundColor: "#2563eb" }}
              >
                {esNuevaPregunta ? "Agregar Pregunta" : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Niveles de Riesgo y Escala */}
      {modalNivelesAbierto && (
        <div
          className="modal-overlay"
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}
          onClick={() => setModalNivelesAbierto(false)}
        >
          <div
            className="modal-contenido"
            style={{ backgroundColor: "#ffffff", borderRadius: 12, maxWidth: 660, width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-ticket-cabecera">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                  Editar Niveles de Riesgo y Escala de Puntajes
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Puntaje máximo actual según preguntas activas: <strong>{puntajeMaximoCalculado} puntos</strong>
                </span>
              </div>
              <button type="button" className="modal-cerrar-boton" onClick={() => setModalNivelesAbierto(false)}>
                ✕
              </button>
            </div>

            <div className="modal-ticket-cuerpo">
              {errorModalNiveles && (
                <div className="mensaje-error" style={{ padding: "8px 12px", borderRadius: 6 }}>
                  {errorModalNiveles}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {nivelesEditar.map((niv, idx) => (
                  <div
                    key={niv.id}
                    style={{
                      backgroundColor: niv.bg || "#f8fafc",
                      border: `1.5px solid ${niv.border || "#cbd5e1"}`,
                      borderRadius: 8,
                      padding: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 100px", gap: 10, alignItems: "center" }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: niv.color, display: "block", marginBottom: 3 }}>
                          Nombre del nivel ({niv.id})
                        </label>
                        <input
                          type="text"
                          className="input-base"
                          value={niv.nombre}
                          onChange={(e) => actualizarNivelModal(idx, { nombre: e.target.value })}
                          style={{ fontSize: 12.5, padding: "6px 10px", height: 34, fontWeight: 700 }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>
                          Mín (pts)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="input-base"
                          value={niv.min}
                          onChange={(e) => actualizarNivelModal(idx, { min: Math.max(0, Number(e.target.value) || 0) })}
                          style={{ fontSize: 12.5, padding: "6px 8px", height: 34, textAlign: "center" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>
                          Máx (pts)
                        </label>
                        <input
                          type="number"
                          min={0}
                          className="input-base"
                          value={niv.max}
                          onChange={(e) => actualizarNivelModal(idx, { max: Math.max(0, Number(e.target.value) || 0) })}
                          style={{ fontSize: 12.5, padding: "6px 8px", height: 34, textAlign: "center" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 3 }}>
                        Descripción operativa
                      </label>
                      <input
                        type="text"
                        className="input-base"
                        value={niv.descripcion}
                        onChange={(e) => actualizarNivelModal(idx, { descripcion: e.target.value })}
                        style={{ fontSize: 12, padding: "6px 10px", height: 34 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #e2e8f0",
                backgroundColor: "#f8fafc",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                className="boton-mini"
                onClick={() => {
                  if (nivelesEditar.length > 0) {
                    actualizarNivelModal(nivelesEditar.length - 1, { max: Math.max(puntajeMaximoCalculado, nivelesEditar[nivelesEditar.length - 1].min) });
                  }
                }}
                style={{ fontSize: 11.5, padding: "6px 10px" }}
              >
                Ajustar tope máximo a {puntajeMaximoCalculado} pts
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="boton-secundario" onClick={() => setModalNivelesAbierto(false)}>
                  Cancelar
                </button>
                <button
                  type="button"
                  className="boton-primario"
                  onClick={guardarNivelesEditados}
                  style={{ width: "auto", padding: "8px 18px", backgroundColor: "#2563eb" }}
                >
                  Guardar Escala
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
