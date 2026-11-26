"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CampoMesa, ModalEditarPropiedadesCampoMesa } from "./ModalEditarPropiedadesCampoMesa";

export interface SeccionMesa {
  id: string;
  titulo: string;
  color: string;
  orden: number;
  campos: CampoMesa[];
}

export interface NivelSolicitanteInfo {
  id: number;
  codigo: string;
  nombre: string;
  color: string;
  bg: string;
}

export const NIVELES_SOLICITANTE: NivelSolicitanteInfo[] = [
  { id: 1, codigo: "VIP", nombre: "Nivel 1 — VIP", color: "#7c3aed", bg: "#f3e8ff" },
  { id: 2, codigo: "EJE", nombre: "Nivel 2 — Ejecutiva", color: "#2563eb", bg: "#eff6ff" },
  { id: 3, codigo: "PREF", nombre: "Nivel 3 — Preferente", color: "#0891b2", bg: "#ecfeff" },
  { id: 4, codigo: "OPE", nombre: "Nivel 4 — Operativa (Técnicos)", color: "#059669", bg: "#ecfdf5" },
  { id: 5, codigo: "EST", nombre: "Nivel 5 — Estándar (Todos)", color: "#475569", bg: "#f1f5f9" },
];

const SECCIONES_INICIALES_INCIDENTE: SeccionMesa[] = [
  {
    id: "sec_identificacion",
    titulo: "Sección A — Identificación",
    color: "#2563eb",
    orden: 1,
    campos: [
      {
        codigo: "titulo",
        etiqueta: "Título del Incidente",
        tipo: "texto",
        visible: true,
        obligatorio: "si",
        ancho: "completo",
        placeholder: "Resumen conciso de la falla o síntoma observado...",
        ayuda: "Indique claramente la falla, sistema o servicio con interrupción.",
        prioridad_minima: 5,
      },
      {
        codigo: "categoria_servicio_id",
        etiqueta: "Categoría de Servicio",
        tipo: "selector_categoria_servicio",
        opciones: "Redes y Telecomunicaciones, Software y Aplicaciones, Equipamiento y Hardware, Cuentas y Accesos, Telefonía",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Clasificación inicial para orientar el caso en el catálogo.",
        prioridad_minima: 5,
      },
      {
        codigo: "servicio_id",
        etiqueta: "Servicio Específico del Catálogo",
        tipo: "selector_servicio",
        opciones: "Conectividad LAN Corporativa, Acceso VPN Remoto, Correo Electrónico M365, Impresión y Escaneo, ERP SAP",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Puede dejarse en blanco si el servicio aún no está catalogado formalmente.",
        prioridad_minima: 5,
      },
      {
        codigo: "en_nombre_de_otro",
        etiqueta: "Crear ticket a nombre de otro colaborador",
        tipo: "casilla",
        visible: true,
        obligatorio: "no",
        ancho: "completo",
        ayuda: "Permite a personal operativo (técnicos), jefaturas y directores registrar incidencias detectadas a otros colaboradores.",
        prioridad_minima: 4, // Exclusivo de Nivel Operativo (Técnicos) o superior
      },
      {
        codigo: "usuario_afectado_id",
        etiqueta: "Colaborador Afectado (Solicitante Real)",
        tipo: "selector_usuario",
        visible: true,
        obligatorio: "condicional",
        ancho: "completo",
        ayuda: "Se habilita únicamente cuando la casilla de registrar a nombre de otro está seleccionada.",
        prioridad_minima: 4,
      },
    ],
  },
  {
    id: "sec_detalle",
    titulo: "Sección B — Detalle del Incidente",
    color: "#0891b2",
    orden: 2,
    campos: [
      {
        codigo: "descripcion",
        etiqueta: "Descripción Detallada y Síntomas Observados",
        tipo: "area",
        visible: true,
        obligatorio: "si",
        ancho: "completo",
        placeholder: "Indique: 1) Frecuencia de la falla 2) Pasos previos que lo originaron 3) Mensajes de error en pantalla...",
        ayuda: "Detalle técnico indispensable para que el especialista diagnostique la causa raíz.",
        prioridad_minima: 5,
      },

    ],
  },
  {
    id: "sec_severidad",
    titulo: "Sección C — Severidad ITIL (Cálculo de Prioridad)",
    color: "#d97706",
    orden: 3,
    campos: [
      {
        codigo: "urgencia",
        etiqueta: "Nivel de Urgencia",
        tipo: "lista",
        opciones: "Alta (Labor crítica detenida), Media (Plazo estándar), Baja (Puede esperar)",
        visible: true,
        obligatorio: "si",
        ancho: "1/2",
        ayuda: "Velocidad requerida de mitigación según detención de labores.",
        prioridad_minima: 5,
      },
      {
        codigo: "impacto",
        etiqueta: "Nivel de Impacto",
        tipo: "lista",
        opciones: "Alta (Afecta toda la entidad), Media (Afecta un departamento), Baja (Afecta a un solo usuario)",
        visible: true,
        obligatorio: "si",
        ancho: "1/2",
        ayuda: "Amplitud y alcance de usuarios o servicios perjudicados.",
        prioridad_minima: 5,
      },
      {
        codigo: "prioridad",
        etiqueta: "Prioridad Calculada Automáticamente",
        tipo: "texto",
        visible: true,
        obligatorio: "si",
        ancho: "completo",
        ayuda: "Deducida por la matriz institucional Urgencia x Impacto (P1 a P4). El usuario no la llena manualmente.",
        prioridad_minima: 5,
      },
    ],
  },
  {
    id: "sec_adjuntos",
    titulo: "Sección D — Elementos CMDB y Evidencias",
    color: "#16a34a",
    orden: 4,
    campos: [
      {
        codigo: "tipo_activo_cmdb",
        etiqueta: "Categoría de Activo o Licencia",
        tipo: "lista",
        opciones: "Equipo de Cómputo / Laptop, Software / Licencia, Telefonía / Móvil, Periférico, Accesos y Red",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Filtra la lista de activos en custodia para facilitar la selección.",
        prioridad_minima: 5,
      },
      {
        codigo: "ci_cmdb",
        etiqueta: "Activo o Licencia Asignada al Usuario",
        tipo: "selector_cmdb_usuario",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Solo muestra los ítems asociados a la persona del solicitante (o dejar sin seleccionar si no está seguro).",
        prioridad_minima: 5,
      },
      {
        codigo: "archivos_adjuntos",
        etiqueta: "Capturas de Pantalla o Evidencias",
        tipo: "archivos",
        visible: true,
        obligatorio: "no",
        ancho: "completo",
        ayuda: "Adjunte capturas del mensaje de error, fotos del equipo o logs.",
        prioridad_minima: 5,
      },
    ],
  },
];

const SECCIONES_INICIALES_SOLICITUD: SeccionMesa[] = [
  {
    id: "sec_identificacion",
    titulo: "Sección A — Identificación del Requerimiento",
    color: "#2563eb",
    orden: 1,
    campos: [
      {
        codigo: "titulo",
        etiqueta: "Título del Requerimiento",
        tipo: "texto",
        visible: true,
        obligatorio: "si",
        ancho: "completo",
        placeholder: "Resumen del servicio, acceso o equipamiento solicitado...",
        ayuda: "Indique brevemente el propósito de la solicitud de servicio.",
        prioridad_minima: 5,
      },
      {
        codigo: "categoria_servicio_id",
        etiqueta: "Categoría de Servicio",
        tipo: "selector_categoria_servicio",
        opciones: "Equipamiento y Activos, Accesos y Cuentas, Software y Licencias, Servicios de Red",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Clasificación inicial del requerimiento dentro del catálogo.",
        prioridad_minima: 5,
      },
      {
        codigo: "servicio_id",
        etiqueta: "Servicio Solicitado del Catálogo",
        tipo: "selector_servicio",
        opciones: "Aprovisionamiento de Laptop Corporativa, Creación de Cuenta y Correo M365, Asignación de Licencia PowerBI, Acceso a Carpeta Compartida",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Servicio estándar de provisión. Puede dejarse vacío si no está catalogado.",
        prioridad_minima: 5,
      },
      {
        codigo: "en_nombre_de_otro",
        etiqueta: "Crear ticket a nombre de otro colaborador",
        tipo: "casilla",
        visible: true,
        obligatorio: "no",
        ancho: "completo",
        ayuda: "Habilita la tramitación del recurso para otro colaborador a su cargo.",
        prioridad_minima: 4, // A partir de Operativo (Técnicos)
      },
      {
        codigo: "usuario_afectado_id",
        etiqueta: "Colaborador Beneficiario",
        tipo: "selector_usuario",
        visible: true,
        obligatorio: "condicional",
        ancho: "completo",
        ayuda: "Seleccione el colaborador final que recibirá el aprovisionamiento.",
        prioridad_minima: 4,
      },
    ],
  },
  {
    id: "sec_justificacion",
    titulo: "Sección B — Justificación y Destino",
    color: "#0891b2",
    orden: 2,
    campos: [
      {
        codigo: "justificacion",
        etiqueta: "Justificación Operativa / Motivo del Requerimiento",
        tipo: "area",
        visible: true,
        obligatorio: "si",
        ancho: "completo",
        placeholder: "Explique la necesidad operativa o sustento institucional del pedido...",
        ayuda: "Sustento requerido para la aprobación de la jefatura.",
        prioridad_minima: 5,
      },
      {
        codigo: "fecha_limite",
        etiqueta: "Fecha Límite Deseada",
        tipo: "fecha",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Fecha límite deseada para la entrega del recurso.",
        prioridad_minima: 5,
      },
      {
        codigo: "modalidad_acceso",
        etiqueta: "Modalidad de Uso (Temporal o Definitivo)",
        tipo: "lista",
        opciones: "Permanente / Indefinido, Temporal (1 mes), Temporal (3 meses), Proyecto Especial",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Vigencia requerida para la cuenta, licencia o recurso provisto.",
        prioridad_minima: 5,
      },

    ],
  },
  {
    id: "sec_adjuntos",
    titulo: "Sección C — Elementos CMDB y Documentación",
    color: "#16a34a",
    orden: 3,
    campos: [
      {
        codigo: "tipo_activo_cmdb",
        etiqueta: "Categoría de Activo o Licencia",
        tipo: "lista",
        opciones: "Equipo de Cómputo / Laptop, Software / Licencia, Telefonía / Móvil, Periférico, Accesos y Red",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Filtra la lista de activos en custodia para facilitar la selección.",
        prioridad_minima: 5,
      },
      {
        codigo: "ci_cmdb",
        etiqueta: "Activo o Licencia Vinculada",
        tipo: "selector_cmdb_usuario",
        visible: true,
        obligatorio: "no",
        ancho: "1/2",
        ayuda: "Vincular a un equipo existente para renovación o upgrade.",
        prioridad_minima: 5,
      },
      {
        codigo: "archivos_adjuntos",
        etiqueta: "Formatos y Sustento Adjunto",
        tipo: "archivos",
        visible: true,
        obligatorio: "no",
        ancho: "completo",
        ayuda: "Adjunte fichas de requerimiento o autorizaciones formales si aplica.",
        prioridad_minima: 5,
      },
    ],
  },
];

export interface PestanaCamposMesaHandle {
  guardarConfiguracion: () => Promise<void>;
}

export interface PestanaCamposMesaProps {
  tipo: "incidente" | "solicitud";
  onEstadoGuardandoChange?: (guardando: boolean) => void;
}

export const PestanaCamposMesa = React.forwardRef<PestanaCamposMesaHandle, PestanaCamposMesaProps>(
  ({ tipo, onEstadoGuardandoChange }, ref) => {
    const [secciones, setSecciones] = useState<SeccionMesa[]>(
      tipo === "incidente" ? SECCIONES_INICIALES_INCIDENTE : SECCIONES_INICIALES_SOLICITUD
    );
    const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});
    const [campoEditando, setCampoEditando] = useState<{ seccionId: string; campo: CampoMesa } | null>(null);
    const [arrastrando, setArrastrando] = useState<{ seccionId: string; index: number } | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar configuración guardada y fusionar campos personalizados
  useEffect(() => {
    async function cargar() {
      try {
        const [resConfig, resCP] = await Promise.all([
          fetch("/api/operacion/configuracion?clave=formularios_solicitante_config"),
          fetch(`/api/tickets/configuracion/campos-personalizados?entidad=${tipo}`),
        ]);

        const dataConfig = await resConfig.json();
        const dataCP = await resCP.json();

        let baseSecciones = tipo === "incidente" ? SECCIONES_INICIALES_INCIDENTE : SECCIONES_INICIALES_SOLICITUD;

        if (dataConfig.configuracion?.valor?.[`secciones_${tipo}`]) {
          baseSecciones = dataConfig.configuracion.valor[`secciones_${tipo}`];
        }

        // Sanitización obligatoria:
        // 1. Quitar cualquier bandera `bloqueado: true` guardada previamente para que ningún campo quede bloqueado
        // 2. Limpiar sufijos residuales "(Opcional)" en las etiquetas
        baseSecciones = baseSecciones.map((sec) => ({
          ...sec,
          campos: (sec.campos || []).map((c) => ({
            ...c,
            bloqueado: false,
            etiqueta: (c.etiqueta || "").replace(/\s*\(Opcional\)\s*/gi, "").trim() || c.codigo,
          })),
        }));

        // Fusionar campos personalizados si aún no están en las secciones
        if (dataCP.ok && Array.isArray(dataCP.campos)) {
          const cpCampos = dataCP.campos;
          baseSecciones = baseSecciones.map((sec) => {
            const camposDeEstaSeccion = cpCampos.filter((cp: any) => cp.seccion === sec.id);
            const camposActualizados = [...sec.campos];

            camposDeEstaSeccion.forEach((cp: any) => {
              const idxExistente = camposActualizados.findIndex((c) => c.codigo === cp.codigo);
              const campoObjeto: CampoMesa = {
                codigo: cp.codigo,
                etiqueta: (cp.etiqueta || "").replace(/\s*\(Opcional\)\s*/gi, "").trim() || cp.codigo,
                tipo: cp.tipo,
                visible: cp.activo !== false,
                obligatorio: cp.obligatorio === "si" ? "si" : "no",
                ancho: "1/2",
                ayuda: cp.descripcion,
                es_personalizado: true,
                prioridad_minima: 5,
              };

              if (idxExistente === -1) {
                camposActualizados.push(campoObjeto);
              } else {
                camposActualizados[idxExistente] = {
                  ...camposActualizados[idxExistente],
                  etiqueta: (cp.etiqueta || "").replace(/\s*\(Opcional\)\s*/gi, "").trim() || cp.codigo,
                  visible: cp.activo !== false,
                };
              }
            });

            return { ...sec, campos: camposActualizados };
          });
        }

        setSecciones(baseSecciones);
      } catch (err) {
        console.error("Error al cargar secciones de formulario:", err);
      }
    }
    cargar();
  }, [tipo]);

  const toggleSeccion = (secId: string) => {
    setSeccionesColapsadas((prev) => ({ ...prev, [secId]: !prev[secId] }));
  };

  // Actualizar un campo y permitir opcionalmente moverlo a otra sección
  const actualizarCampo = (
    seccionId: string,
    codigo: string,
    patch: Partial<CampoMesa>,
    nuevaSeccionId?: string
  ) => {
    setSecciones((prev) => {
      if (nuevaSeccionId && nuevaSeccionId !== seccionId) {
        let campoAMover: CampoMesa | null = null;
        const sinCampo = prev.map((s) => {
          if (s.id !== seccionId) return s;
          const found = s.campos.find((c) => c.codigo === codigo);
          if (found) campoAMover = { ...found, ...patch };
          return { ...s, campos: s.campos.filter((c) => c.codigo !== codigo) };
        });

        if (campoAMover) {
          return sinCampo.map((s) => {
            if (s.id !== nuevaSeccionId) return s;
            return { ...s, campos: [...s.campos, campoAMover!] };
          });
        }
        return sinCampo;
      }

      // Misma sección
      return prev.map((sec) => {
        if (sec.id !== seccionId) return sec;
        return {
          ...sec,
          campos: sec.campos.map((c) => (c.codigo === codigo ? { ...c, ...patch } : c)),
        };
      });
    });
  };

  // Reordenar campos dentro de una sección con drag and drop
  const reordenarCampo = (seccionId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setSecciones((prev) =>
      prev.map((sec) => {
        if (sec.id !== seccionId) return sec;
        const nuevosCampos = [...sec.campos];
        const [removido] = nuevosCampos.splice(fromIndex, 1);
        nuevosCampos.splice(toIndex, 0, removido);
        return { ...sec, campos: nuevosCampos };
      })
    );
  };

  // Guardar configuración completa en el servidor
  const guardarConfiguracion = React.useCallback(async () => {
    setGuardando(true);
    onEstadoGuardandoChange?.(true);
    setError(null);
    setMensajeExito(null);

    try {
      const resActual = await fetch("/api/operacion/configuracion?clave=formularios_solicitante_config");
      const dataActual = await resActual.json();
      const valorPrevio = dataActual.configuracion?.valor || {};

      const seccionesSanitizadas = secciones.map((sec) => ({
        ...sec,
        campos: sec.campos.map((c) => ({
          ...c,
          bloqueado: false,
          etiqueta: (c.etiqueta || "").replace(/\s*\(Opcional\)\s*/gi, "").trim() || c.codigo,
        })),
      }));

      const nuevoValor = {
        ...valorPrevio,
        [`secciones_${tipo}`]: seccionesSanitizadas,
      };

      const res = await fetch("/api/operacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave: "formularios_solicitante_config",
          valor: nuevoValor,
          descripcion: "Estructura de secciones, orden de campos y distribución del formulario de Mesa de Servicio",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la configuración.");
        return;
      }

      setMensajeExito("Estructura y distribución del formulario guardadas exitosamente.");
      setTimeout(() => setMensajeExito(null), 3500);
    } catch {
      setError("Error de red al guardar la configuración.");
    } finally {
      setGuardando(false);
      onEstadoGuardandoChange?.(false);
    }
  }, [secciones, tipo, onEstadoGuardandoChange]);

  React.useImperativeHandle(
    ref,
    () => ({
      guardarConfiguracion,
    }),
    [guardarConfiguracion]
  );


  const seccionesOpciones = useMemo(
    () => secciones.map((s) => ({ id: s.id, label: s.titulo })),
    [secciones]
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Alertas */}
      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}
      {error && <div className="mensaje-error">{error}</div>}

      {/* Lienzo de secciones y campos (el formulario real se ve en "Registrar incidente/solicitud") */}
      <div>
        {/* COLUMNA IZQUIERDA: LIENZO DE SECCIONES Y CAMPOS ORDENABLES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {secciones.map((sec) => {
            const estaColapsada = Boolean(seccionesColapsadas[sec.id]);

            return (
              <div
                key={sec.id}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  overflow: "hidden",
                }}
              >
                {/* Cabecera de Sección */}
                <div
                  onClick={() => toggleSeccion(sec.id)}
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px 14px",
                    borderBottom: estaColapsada ? "none" : "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderLeft: `4px solid ${sec.color}`,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      style={{
                        color: "#64748b",
                        transform: estaColapsada ? "rotate(-90deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                      {sec.titulo}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11.5, color: "#64748b" }}>
                      {sec.campos.filter((c) => c.visible).length} / {sec.campos.length} visibles
                    </span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      {estaColapsada ? "(Expandir)" : "(Contraer)"}
                    </span>
                  </div>
                </div>

                {/* Lista de Campos con Drag and Drop */}
                {!estaColapsada && (
                  <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {sec.campos.map((campo, idx) => (
                      <div
                        key={campo.codigo}
                        draggable
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
                            console.error("Error al mover campo:", err);
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
                          opacity: arrastrando?.seccionId === sec.id && arrastrando?.index === idx ? 0.35 : 1,
                          transition: "all 0.15s ease",
                        }}
                      >
                        {/* 6 puntos, Etiqueta y Badges */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "grab",
                              color: "#94a3b8",
                              padding: "2px 4px",
                            }}
                            title="Arrastra los 6 puntos para ordenar este campo en el formulario"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="8" cy="5" r="2" />
                              <circle cx="16" cy="5" r="2" />
                              <circle cx="8" cy="12" r="2" />
                              <circle cx="16" cy="12" r="2" />
                              <circle cx="8" cy="19" r="2" />
                              <circle cx="16" cy="19" r="2" />
                            </svg>
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                              <span
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 600,
                                  color: campo.visible ? "#1e293b" : "#94a3b8",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {campo.etiqueta}
                              </span>

                              {/* Badge de Ancho */}
                              {campo.ancho && campo.ancho !== "completo" && (
                                <span
                                  style={{
                                    fontSize: 9.5,
                                    padding: "1px 5px",
                                    borderRadius: 3,
                                    backgroundColor: "#eff6ff",
                                    color: "#2563eb",
                                    border: "1px solid #bfdbfe",
                                  }}
                                >
                                  {campo.ancho === "1/2" ? "50%" : campo.ancho === "1/3" ? "33%" : "66%"}
                                </span>
                              )}

                              {/* Badge de Nivel Solicitante / VIP */}
                              {campo.prioridad_minima !== undefined && campo.prioridad_minima < 5 && (
                                <span
                                  style={{
                                    fontSize: 9.5,
                                    padding: "1px 6px",
                                    borderRadius: 4,
                                    fontWeight: 700,
                                    backgroundColor:
                                      campo.prioridad_minima === 1 ? "#f3e8ff" :
                                      campo.prioridad_minima === 2 ? "#eff6ff" :
                                      campo.prioridad_minima === 3 ? "#ecfeff" : "#ecfdf5",
                                    color:
                                      campo.prioridad_minima === 1 ? "#7c3aed" :
                                      campo.prioridad_minima === 2 ? "#2563eb" :
                                      campo.prioridad_minima === 3 ? "#0891b2" : "#059669",
                                    border: `1px solid ${
                                      campo.prioridad_minima === 1 ? "#d8b4fe" :
                                      campo.prioridad_minima === 2 ? "#bfdbfe" :
                                      campo.prioridad_minima === 3 ? "#a5f3fc" : "#a7f3d0"
                                    }`,
                                  }}
                                  title={`Visible solo para solicitantes nivel ${campo.prioridad_minima} o superior`}
                                >
                                  {campo.prioridad_minima === 1 ? "Solo VIP" :
                                   campo.prioridad_minima === 2 ? "Ejecutivo+" :
                                   campo.prioridad_minima === 3 ? "Preferente+" : "Operativo+ (Técnicos)"}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontFamily: "monospace" }}>
                              {campo.codigo} · {campo.tipo}
                            </span>
                          </div>
                        </div>

                        {/* Controles de la fila */}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                          {/* Selector de Obligatoriedad */}
                          <select
                            className="input-base"
                            value={campo.obligatorio}
                            onChange={(e) => actualizarCampo(sec.id, campo.codigo, { obligatorio: e.target.value as any })}
                            style={{ fontSize: 11, padding: "2px 6px", height: 26, width: "auto" }}
                          >
                            <option value="si">Obligatorio</option>
                            <option value="no">Opcional</option>
                            <option value="condicional">Condicional</option>
                            <option value="segun_prioridad">Según Prioridad</option>
                          </select>

                          {/* Botón de Visibilidad (Ojo) */}
                          <button
                            type="button"
                            onClick={() => actualizarCampo(sec.id, campo.codigo, { visible: !campo.visible })}
                            className="boton-icono boton-sm" aria-pressed={campo.visible}
                            title={campo.visible ? "Campo visible (clic para ocultar)" : "Campo oculto (clic para mostrar)"}
                          >
                            {campo.visible ? (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>

                          {/* Botón de Edición (Lápiz) */}
                          <button className="boton-secundario boton-sm"
                            type="button"
                            onClick={() => setCampoEditando({ seccionId: sec.id, campo })}
                            style={{ width: 26 }}
                            title="Editar propiedades del campo (sección, etiqueta, ayuda, ancho, jerarquía VIP)"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ModalEditarPropiedadesCampoMesa
        abierto={Boolean(campoEditando)}
        seccionId={campoEditando?.seccionId || ""}
        seccionesDisponibles={seccionesOpciones}
        campo={campoEditando?.campo || null}
        onCerrar={() => setCampoEditando(null)}
        onGuardar={actualizarCampo}
      />
    </div>
  );
});

PestanaCamposMesa.displayName = "PestanaCamposMesa";
