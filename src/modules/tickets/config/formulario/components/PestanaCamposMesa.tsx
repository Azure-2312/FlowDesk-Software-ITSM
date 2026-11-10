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

interface PestanaCamposMesaProps {
  tipo: "incidente" | "solicitud";
}

export const PestanaCamposMesa: React.FC<PestanaCamposMesaProps> = ({ tipo }) => {
  const [secciones, setSecciones] = useState<SeccionMesa[]>(
    tipo === "incidente" ? SECCIONES_INICIALES_INCIDENTE : SECCIONES_INICIALES_SOLICITUD
  );
  const [seccionesColapsadas, setSeccionesColapsadas] = useState<Record<string, boolean>>({});
  const [filtro, setFiltro] = useState<"todos" | "obligatorios" | "ocultos">("todos");
  const [campoEditando, setCampoEditando] = useState<{ seccionId: string; campo: CampoMesa } | null>(null);
  const [arrastrando, setArrastrando] = useState<{ seccionId: string; index: number } | null>(null);

  // Estados interactivos para el simulador
  const [vistaPreviaModo, setVistaPreviaModo] = useState<"formulario" | "ticket">("formulario");
  const [nivelSimulado, setNivelSimulado] = useState<number>(5); // 5 = Estándar por defecto
  const [simulandoCrearParaOtro, setSimulandoCrearParaOtro] = useState<boolean>(false);
  const [subTabTicket, setSubTabTicket] = useState<"detalle" | "chat" | "notas">("detalle");
  const [modalEditarSlaAbierto, setModalEditarSlaAbierto] = useState<boolean>(false);
  const [slaHorasResolucion, setSlaHorasResolucion] = useState<number>(4);
  const [motivoSla, setMotivoSla] = useState<string>("");
  const [slaModificadoExito, setSlaModificadoExito] = useState<boolean>(false);
  const [categoriaServicioSimulada, setCategoriaServicioSimulada] = useState<string>("");
  const [tipoActivoSimulado, setTipoActivoSimulado] = useState<string>("");

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
  const guardarConfiguracion = async () => {
    setGuardando(true);
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
    }
  };

  const totalCampos = useMemo(
    () => secciones.reduce((acc, s) => acc + s.campos.length, 0),
    [secciones]
  );
  const totalVisibles = useMemo(
    () => secciones.reduce((acc, s) => acc + s.campos.filter((c) => c.visible).length, 0),
    [secciones]
  );
  const totalObligatorios = useMemo(
    () => secciones.reduce((acc, s) => acc + s.campos.filter((c) => c.visible && c.obligatorio === "si").length, 0),
    [secciones]
  );

  const nivelSimuladoObj = useMemo(
    () => NIVELES_SOLICITANTE.find((p) => p.id === nivelSimulado) || NIVELES_SOLICITANTE[4],
    [nivelSimulado]
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

      {/* Nota de Información Automática del Usuario */}
      <div
        style={{
          padding: "10px 14px",
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 8,
          fontSize: 12.5,
          color: "#1e40af",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>
          <strong>Información Automática:</strong> La sede física, departamento de la empresa, correo corporativo y teléfono no se piden al solicitante; el sistema los mapea directamente de su ficha institucional al momento de reportar.
        </span>
      </div>

      {/* Barra de Filtros y Estadísticas */}
      <div
        className="tarjeta"
        style={{
          padding: "12px 18px",
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
            Formulario: {tipo === "incidente" ? "Registro de Incidente" : "Registro de Solicitud"}
          </span>
          <span style={{ fontSize: 12, color: "#64748b" }}>
            · {totalVisibles} de {totalCampos} campos visibles ({totalObligatorios} obligatorios estrictos)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setFiltro("todos")}
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: filtro === "todos" ? 700 : 500,
              backgroundColor: filtro === "todos" ? "#0f172a" : "#f1f5f9",
              color: filtro === "todos" ? "#ffffff" : "#475569",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
            }}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setFiltro("obligatorios")}
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: filtro === "obligatorios" ? 700 : 500,
              backgroundColor: filtro === "obligatorios" ? "#0f172a" : "#f1f5f9",
              color: filtro === "obligatorios" ? "#ffffff" : "#475569",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
            }}
          >
            Solo Obligatorios
          </button>
          <button
            type="button"
            onClick={() => setFiltro("ocultos")}
            style={{
              padding: "4px 10px",
              borderRadius: 5,
              fontSize: 12,
              fontWeight: filtro === "ocultos" ? 700 : 500,
              backgroundColor: filtro === "ocultos" ? "#0f172a" : "#f1f5f9",
              color: filtro === "ocultos" ? "#ffffff" : "#475569",
              border: "1px solid #cbd5e1",
              cursor: "pointer",
            }}
          >
            Solo Ocultos
          </button>
          <button
            type="button"
            className="boton-primario"
            onClick={guardarConfiguracion}
            disabled={guardando}
            style={{
              padding: "6px 16px",
              fontSize: 12.5,
              fontWeight: 600,
              marginLeft: 8,
            }}
          >
            {guardando ? "Guardando..." : "Guardar Distribución"}
          </button>
        </div>
      </div>

      {/* Grid de 2 Columnas: Izquierda Lienzo de Campos / Derecha Simulador en Vivo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(380px, 1fr) minmax(360px, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* COLUMNA IZQUIERDA: LIENZO DE SECCIONES Y CAMPOS ORDENABLES */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {secciones.map((sec) => {
            const estaColapsada = Boolean(seccionesColapsadas[sec.id]);
            const camposFiltrados = sec.campos.filter((c) => {
              if (filtro === "obligatorios") return c.visible && c.obligatorio === "si";
              if (filtro === "ocultos") return !c.visible;
              return true;
            });

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
                    {camposFiltrados.map((campo, idx) => (
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
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              border: `1px solid ${campo.visible ? "#bbf7d0" : "#e2e8f0"}`,
                              backgroundColor: campo.visible ? "#f0fdf4" : "#f8fafc",
                              color: campo.visible ? "#16a34a" : "#94a3b8",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
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
                          <button
                            type="button"
                            onClick={() => setCampoEditando({ seccionId: sec.id, campo })}
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 4,
                              border: "1px solid #bfdbfe",
                              backgroundColor: "#eff6ff",
                              color: "#2563eb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
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

        {/* COLUMNA DERECHA: SIMULADOR INTERACTIVO EN VIVO */}
        <div style={{ position: "sticky", top: 18 }}>
          <div
            className="tarjeta"
            style={{
              padding: 16,
              backgroundColor: "#ffffff",
              border: "2px solid #3b82f6",
              borderRadius: 10,
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.08)",
            }}
          >
            {/* Cabecera del Simulador */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
              <div style={{ display: "flex", gap: 6, backgroundColor: "#f1f5f9", padding: 3, borderRadius: 6 }}>
                <button
                  type="button"
                  onClick={() => setVistaPreviaModo("formulario")}
                  style={{
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: vistaPreviaModo === "formulario" ? "#2563eb" : "transparent",
                    color: vistaPreviaModo === "formulario" ? "#ffffff" : "#475569",
                  }}
                >
                  Vista de Formulario
                </button>
                <button
                  type="button"
                  onClick={() => setVistaPreviaModo("ticket")}
                  style={{
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: vistaPreviaModo === "ticket" ? "#2563eb" : "transparent",
                    color: vistaPreviaModo === "ticket" ? "#ffffff" : "#475569",
                  }}
                >
                  Vista de Ticket Creado
                </button>
              </div>

              <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>
                Simulador en Vivo · {tipo}
              </span>
            </div>

            {/* BARRA INTERACTIVA DE SIMULACIÓN DE NIVEL DEL SOLICITANTE */}
            <div style={{ marginBottom: 12, padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>
                  Simular visualización como solicitante con nivel:
                </span>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: nivelSimuladoObj.bg,
                    color: nivelSimuladoObj.color,
                  }}
                >
                  {nivelSimuladoObj.nombre}
                </span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {NIVELES_SOLICITANTE.map((p) => {
                  const activo = nivelSimulado === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setNivelSimulado(p.id);
                        if (p.id > 4 && subTabTicket === "notas") {
                          setSubTabTicket("detalle");
                        }
                      }}
                      style={{
                        border: `1px solid ${activo ? p.color : "#cbd5e1"}`,
                        backgroundColor: activo ? p.color : "#ffffff",
                        color: activo ? "#ffffff" : "#475569",
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                      title={`Simular con ${p.nombre}`}
                    >
                      {p.codigo}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contenedor del Formulario Simulado */}
            {vistaPreviaModo === "formulario" ? (
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  maxHeight: "65vh",
                  overflowY: "auto",
                }}
              >
                <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 8 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                    {tipo === "incidente" ? "Formulario de Reporte de Incidente" : "Formulario de Solicitud de Servicio"}
                  </h4>
                  <p style={{ margin: "2px 0 0 0", fontSize: 11.5, color: "#64748b" }}>
                    Renderizado dinámico según el nivel institucional seleccionado ({nivelSimuladoObj.codigo}).
                  </p>
                </div>

                {secciones.map((sec) => {
                  // Filtrar campos visibles por estado Y por nivel del solicitante simulado
                  const camposVisibles = sec.campos.filter((c) => {
                    if (!c.visible) return false;
                    const minP = c.prioridad_minima ?? 5;
                    // El usuario ve el campo si su nivel <= minP (1=VIP, 4=Operativo, 5=Estándar)
                    if (nivelSimulado > minP) return false;

                    // Si es el selector de usuario afectado, solo mostrarlo si la casilla está marcada en el simulador
                    if (c.codigo === "usuario_afectado_id" && !simulandoCrearParaOtro) {
                      return false;
                    }

                    return true;
                  });

                  if (camposVisibles.length === 0) return null;

                  return (
                    <div key={sec.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {/* Vista limpia de cara al usuario sin etiquetas internas administrativas (Sección A, B, etc.) */}
                      {secciones.indexOf(sec) > 0 && (
                        <div style={{ borderTop: "1px dashed #e2e8f0", margin: "4px 0" }} />
                      )}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(12, 1fr)",
                          gap: 10,
                        }}
                      >
                        {camposVisibles.map((c) => {
                          const colSpan = c.ancho === "1/2" ? 6 : c.ancho === "1/3" ? 4 : c.ancho === "2/3" ? 8 : 12;
                          const etiquetaLimpia = (c.etiqueta || "").replace(/\s*\(Opcional\)\s*/gi, "").trim();
                          const sufijoObligatorio =
                            c.obligatorio === "si"
                              ? " *"
                              : c.obligatorio === "condicional"
                              ? " (Condicional)"
                              : c.obligatorio === "segun_prioridad"
                              ? " (Según Prioridad)"
                              : " (Opcional)";

                          return (
                            <div key={c.codigo} style={{ gridColumn: `span ${colSpan}` }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                <label style={{ fontSize: 11.5, fontWeight: 600, color: "#1e293b", margin: 0 }}>
                                  {etiquetaLimpia}{sufijoObligatorio}
                                </label>
                                {c.prioridad_minima !== undefined && c.prioridad_minima < 5 && (
                                  <span style={{ fontSize: 9, color: "#7c3aed", fontWeight: 700 }}>
                                    [Exclusivo N{c.prioridad_minima}]
                                  </span>
                                )}
                              </div>

                              {c.tipo === "area" ? (
                                <textarea
                                  className="input-base"
                                  rows={2}
                                  placeholder={c.placeholder || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", fontSize: 12 }}
                                />
                              ) : c.tipo === "casilla" ? (
                                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", backgroundColor: "#ffffff", padding: "6px 8px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                                  <input
                                    type="checkbox"
                                    checked={c.codigo === "en_nombre_de_otro" ? simulandoCrearParaOtro : false}
                                    onChange={(e) => {
                                      if (c.codigo === "en_nombre_de_otro") {
                                        setSimulandoCrearParaOtro(e.target.checked);
                                      }
                                    }}
                                    style={{ accentColor: "#2563eb", cursor: "pointer" }}
                                  />
                                  <span>{etiquetaLimpia}</span>
                                </label>
                              ) : c.tipo === "selector_categoria_servicio" ? (
                                <select
                                  className="input-base"
                                  value={categoriaServicioSimulada}
                                  onChange={(e) => setCategoriaServicioSimulada(e.target.value)}
                                  style={{ backgroundColor: "#ffffff", fontSize: 12 }}
                                >
                                  <option value="">Seleccione categoría (o deje en blanco)...</option>
                                  {(c.opciones || "").split(",").map((op, i) => (
                                    <option key={i} value={op.trim()}>{op.trim()}</option>
                                  ))}
                                </select>
                              ) : c.tipo === "selector_servicio" ? (
                                <select
                                  className="input-base"
                                  disabled={false}
                                  style={{ backgroundColor: "#ffffff", fontSize: 12 }}
                                >
                                  <option value="">
                                    {categoriaServicioSimulada
                                      ? `Servicios de "${categoriaServicioSimulada}" (o dejar en blanco)`
                                      : "Seleccione servicio del catálogo (o dejar en blanco si aún no existe)..."}
                                  </option>
                                  {(c.opciones || "").split(",").map((op, i) => (
                                    <option key={i} value={op.trim()}>{op.trim()}</option>
                                  ))}
                                </select>
                              ) : c.tipo === "lista" && c.codigo === "tipo_activo_cmdb" ? (
                                <select
                                  className="input-base"
                                  value={tipoActivoSimulado}
                                  onChange={(e) => setTipoActivoSimulado(e.target.value)}
                                  style={{ backgroundColor: "#ffffff", fontSize: 12 }}
                                >
                                  <option value="">Seleccione tipo de activo / licencia...</option>
                                  {(c.opciones || "").split(",").map((op, i) => (
                                    <option key={i} value={op.trim()}>{op.trim()}</option>
                                  ))}
                                </select>
                              ) : c.tipo === "selector_cmdb_usuario" ? (
                                <select
                                  className="input-base"
                                  style={{ backgroundColor: "#ffffff", fontSize: 12 }}
                                >
                                  <option value="">
                                    {tipoActivoSimulado
                                      ? `Activos de ${tipoActivoSimulado} asignados a este usuario...`
                                      : "Seleccione un activo asignado a su persona..."}
                                  </option>
                                  <option value="1">Laptop Lenovo ThinkPad T14 (Serie: PF39X1 - En custodia)</option>
                                  <option value="2">Licencia Microsoft 365 E3 (Asignada)</option>
                                  <option value="3">Monitor Dell 24 P2419H (Activo: ACT-0042)</option>
                                </select>
                              ) : c.tipo === "selector_usuario" ? (
                                <select className="input-base" style={{ backgroundColor: "#ffffff", fontSize: 12 }}>
                                  <option>Seleccione colaborador a nombre de quien reporta...</option>
                                  <option>Carlos Mendoza (Finanzas - Sede Miraflores)</option>
                                  <option>Lucía Valdivia (Recursos Humanos - Sede Central)</option>
                                  <option>Jorge Ramos (Operaciones - Planta Industrial)</option>
                                </select>
                              ) : c.tipo === "fecha" ? (
                                <input type="date" className="input-base" disabled style={{ backgroundColor: "#ffffff", fontSize: 12 }} />
                              ) : c.tipo === "archivos" ? (
                                <div style={{ border: "2px dashed #cbd5e1", borderRadius: 6, padding: "8px 12px", textAlign: "center", fontSize: 11, color: "#64748b", backgroundColor: "#ffffff" }}>
                                  Haga clic o arrastre capturas o documentos
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  className="input-base"
                                  placeholder={c.placeholder || ""}
                                  disabled
                                  style={{ backgroundColor: "#ffffff", fontSize: 12 }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  disabled
                  className="boton-primario"
                  style={{ width: "100%", padding: "8px 16px", fontSize: 12.5, opacity: 0.7, marginTop: 4 }}
                >
                  {tipo === "incidente" ? "Registrar Incidente" : "Enviar Solicitud"}
                </button>
              </div>
            ) : (
              /* Vista de Ticket Creado - EXPEDIENTE COMPLETO DEL TICKET */
              <div
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  padding: 14,
                  maxHeight: "68vh",
                  overflowY: "auto",
                }}
              >
                {/* 1. Cabecera del Caso con Códigos, Badges y Prioridad */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, borderBottom: "1px solid #f1f5f9", paddingBottom: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#2563eb", fontWeight: 800, backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: 4, border: "1px solid #bfdbfe" }}>
                        {tipo === "incidente" ? "#INC-2026-0042" : "#SOL-2026-0018"}
                      </span>
                      <span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1e40af", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4 }}>
                        En Atención (Triaje N2)
                      </span>
                      <span style={{ backgroundColor: "#ffedd5", color: "#9a3412", fontWeight: 700, fontSize: 11, padding: "2px 8px", borderRadius: 4, border: "1px solid #fed7aa" }}>
                        Prioridad: P2 - Alta
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        Registrado: Hoy, 08:30 AM
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.35 }}>
                      {tipo === "incidente"
                        ? "Falla de conectividad a base de datos de facturación PostgreSQL"
                        : "Aprovisionamiento de Laptop Lenovo ThinkPad T14 con Acceso VPN"}
                    </h3>
                  </div>
                </div>

                {/* 2. Línea de Flujo / Workflow Stepper del Ciclo de Vida */}
                <div style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", display: "block", marginBottom: 6 }}>
                    {tipo === "incidente" ? "Línea de Flujo del Incidente (ITIL 4)" : "Línea de Flujo de la Solicitud (ITIL 4)"}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                    {(tipo === "incidente"
                      ? [
                          { num: "1", label: "Registrado", estado: "completado" },
                          { num: "2", label: "En Atención / Triaje", estado: "activo" },
                          { num: "3", label: "En Espera", estado: "pendiente" },
                          { num: "4", label: "Resuelto", estado: "pendiente" },
                          { num: "5", label: "Cerrado", estado: "pendiente" },
                        ]
                      : [
                          { num: "1", label: "Registrado", estado: "completado" },
                          { num: "2", label: "En Evaluación", estado: "activo" },
                          { num: "3", label: "En Provisión", estado: "pendiente" },
                          { num: "4", label: "Entregado", estado: "pendiente" },
                          { num: "5", label: "Cerrado", estado: "pendiente" },
                        ]
                    ).map((step, sIdx) => {
                      const esCompleto = step.estado === "completado";
                      const esActivo = step.estado === "activo";
                      return (
                        <React.Fragment key={step.num}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 10,
                                fontWeight: 800,
                                backgroundColor: esCompleto ? "#16a34a" : esActivo ? "#2563eb" : "#e2e8f0",
                                color: esCompleto || esActivo ? "#ffffff" : "#64748b",
                              }}
                            >
                              {esCompleto ? "✓" : step.num}
                            </span>
                            <span style={{ fontSize: 10.5, fontWeight: esActivo ? 700 : 500, color: esActivo ? "#1e40af" : esCompleto ? "#15803d" : "#94a3b8" }}>
                              {step.label}
                            </span>
                          </div>
                          {sIdx < 4 && (
                            <div style={{ flex: 1, height: 2, backgroundColor: esCompleto ? "#86efac" : "#e2e8f0", margin: "0 2px" }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Ficha Institucional del Solicitante / Colaborador */}
                <div style={{ backgroundColor: "#f8fafc", padding: "10px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11.5 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 26, height: 26, borderRadius: "50%", backgroundColor: nivelSimuladoObj.color, color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                        MA
                      </span>
                      <div>
                        <strong style={{ fontSize: 12.5, color: "#0f172a" }}>Miguel Apaza</strong>
                        <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>apazamiguel88@gmail.com</span>
                      </div>
                    </div>
                    <span style={{ padding: "2px 7px", borderRadius: 4, backgroundColor: nivelSimuladoObj.bg, color: nivelSimuladoObj.color, fontSize: 10.5, fontWeight: 700 }}>
                      {nivelSimuladoObj.codigo} ({nivelSimuladoObj.nombre.replace(/Nivel \d — /, "")})
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", color: "#475569", fontSize: 11, marginTop: 4 }}>
                    <div><strong>Departamento:</strong> Tecnologías de la Información</div>
                    <div><strong>Sede Física:</strong> Sede Central — Edificio B, Piso 4</div>
                    <div><strong>Cargo:</strong> Especialista de Infraestructura</div>
                    <div><strong>Anexo Telefónico:</strong> +51 (1) 411-8000 Anx 4210</div>
                  </div>

                  {simulandoCrearParaOtro && (
                    <div style={{ marginTop: 8, padding: "5px 8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, color: "#166534", fontSize: 11 }}>
                      <strong>Registro a Terceros:</strong> Creado por <em>Juan Pérez (Técnico Soporte N2)</em> a nombre de <em>Miguel Apaza (Colaborador Afectado)</em>.
                    </div>
                  )}
                </div>

                {/* 4. Pestañas de Trabajo del Expediente */}
                <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => setSubTabTicket("detalle")}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      padding: "6px 12px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      borderBottom: subTabTicket === "detalle" ? "2px solid #2563eb" : "2px solid transparent",
                      color: subTabTicket === "detalle" ? "#2563eb" : "#64748b",
                      marginBottom: -2,
                    }}
                  >
                    📋 Detalle del Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubTabTicket("chat")}
                    style={{
                      border: "none",
                      backgroundColor: "transparent",
                      padding: "6px 12px",
                      fontSize: 11.5,
                      fontWeight: 700,
                      cursor: "pointer",
                      borderBottom: subTabTicket === "chat" ? "2px solid #2563eb" : "2px solid transparent",
                      color: subTabTicket === "chat" ? "#2563eb" : "#64748b",
                      marginBottom: -2,
                    }}
                  >
                    💬 Conversación (2)
                  </button>
                  {/* Pestaña de Notas Técnicas: Si el nivel no tiene autorización, ni siquiera aparece en el menú */}
                  {nivelSimulado <= 4 && (
                    <button
                      type="button"
                      onClick={() => setSubTabTicket("notas")}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        padding: "6px 12px",
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        borderBottom: subTabTicket === "notas" ? "2px solid #2563eb" : "2px solid transparent",
                        color: subTabTicket === "notas" ? "#2563eb" : "#64748b",
                        marginBottom: -2,
                      }}
                    >
                      🔒 Notas Técnicas Internas
                    </button>
                  )}
                </div>

                {/* 5. Contenido Dinámico de la Pestaña Seleccionada */}
                {subTabTicket === "detalle" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 11.5 }}>
                    {tipo === "incidente" ? (
                      <>
                        {/* Bloque Incidente: Título y Descripción */}
                        <div style={{ padding: 10, borderRadius: 6, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                            Descripción y Síntomas Reportados
                          </span>
                          <p style={{ margin: "4px 0 0 0", color: "#1e293b", lineHeight: 1.45, fontSize: 12 }}>
                            Desde las 08:30 AM se observa latencia severa y desconexión intermitente en las transacciones del módulo de facturación al conectar con el cluster PostgreSQL. Los usuarios reciben error 'Connection timeout to backend 5432'.
                          </p>
                        </div>

                        {/* Bloque Incidente: Catálogo de Servicios y Clasificación */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Categoría de Servicio
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600, fontSize: 11.5 }}>
                              {categoriaServicioSimulada || "Software y Aplicaciones (Llenado)"}
                            </span>
                          </div>

                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Servicio Específico del Catálogo
                            </span>
                            <span style={{ color: "#475569", fontSize: 11.5, fontStyle: "italic" }}>
                              Sin catalogar (Campo opcional dejado en blanco)
                            </span>
                          </div>
                        </div>

                        {/* Bloque Incidente: Severidad y Cálculo de Prioridad */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, display: "block" }}>Urgencia</span>
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>Alta (Crítica)</span>
                          </div>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10, color: "#64748b", fontWeight: 700, display: "block" }}>Impacto</span>
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>Media (Área)</span>
                          </div>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#ffedd5", border: "1px solid #fed7aa" }}>
                            <span style={{ fontSize: 10, color: "#9a3412", fontWeight: 700, display: "block" }}>Prioridad Deducida</span>
                            <span style={{ color: "#9a3412", fontWeight: 800 }}>P2 — Alta</span>
                          </div>
                        </div>

                        {/* Bloque Incidente: Activos CMDB */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Tipo de Activo / Licencia
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>
                              {tipoActivoSimulado || "Software / Licencia"}
                            </span>
                          </div>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Activo en Custodia
                            </span>
                            <span style={{ color: "#64748b", fontStyle: "italic" }}>
                              No seleccionado por el usuario (Opcional)
                            </span>
                          </div>
                        </div>

                        {/* Bloque Incidente: Evidencias Técnicas */}
                        <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4 }}>
                            Archivos Adjuntos y Capturas
                          </span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10.5, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 8px", color: "#334155" }}>
                              📎 captura_error_sql.png (340 KB)
                            </span>
                            <span style={{ fontSize: 10.5, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 8px", color: "#334155" }}>
                              📎 traza_red_timeout.log (45 KB)
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Bloque Solicitud: Justificación y Motivo */}
                        <div style={{ padding: 10, borderRadius: 6, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                            Justificación Operativa / Motivo del Requerimiento
                          </span>
                          <p style={{ margin: "4px 0 0 0", color: "#1e293b", lineHeight: 1.45, fontSize: 12 }}>
                            Se solicita aprovisionamiento de equipo portátil y accesos para el ingreso de nuevo personal al área de Finanzas. Se requiere perfil estándar con suite ofimática M365 y cliente VPN corporativo configurado.
                          </p>
                        </div>

                        {/* Bloque Solicitud: Catálogo y Servicio */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Categoría de Requerimiento
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600, fontSize: 11.5 }}>
                              {categoriaServicioSimulada || "Equipamiento y Activos (Llenado)"}
                            </span>
                          </div>

                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Servicio de Provisión Solicitado
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600, fontSize: 11.5 }}>
                              Aprovisionamiento de Laptop Lenovo ThinkPad T14
                            </span>
                          </div>
                        </div>

                        {/* Bloque Solicitud: Modalidad y Fecha Límite */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Modalidad de Uso
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>Permanente / Indefinido</span>
                          </div>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Fecha Límite Deseada
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>2026-11-20 (Dentro de 11 días)</span>
                          </div>
                        </div>

                        {/* Bloque Solicitud: Activos CMDB */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Categoría de Activo
                            </span>
                            <span style={{ color: "#0f172a", fontWeight: 600 }}>
                              {tipoActivoSimulado || "Equipo de Cómputo / Laptop"}
                            </span>
                          </div>
                          <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                            <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block" }}>
                              Activo Vinculado
                            </span>
                            <span style={{ color: "#64748b", fontStyle: "italic" }}>
                              No seleccionado (Equipo nuevo a aprovisionar)
                            </span>
                          </div>
                        </div>

                        {/* Bloque Solicitud: Documentación Adjunta */}
                        <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                          <span style={{ fontSize: 10.5, color: "#64748b", fontWeight: 700, display: "block", marginBottom: 4 }}>
                            Documentación y Formatos Firmados
                          </span>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 10.5, backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, padding: "2px 8px", color: "#334155" }}>
                              📎 formato_solicitud_ingreso_finanzas.pdf (185 KB)
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* SLA como texto simple informativo */}
                    <div style={{ marginTop: 6, borderTop: "1px solid #f1f5f9", paddingTop: 8, fontSize: 11.5, color: "#475569" }}>
                      <span>
                        <strong>Acuerdos de Servicio (SLA):</strong> Primera respuesta:{" "}
                        <span style={{ color: "#0f172a", fontWeight: 600 }}>{nivelSimulado <= 2 ? "30 min" : "1 hora"}</span>
                        {" · "}
                        Solución/Entrega:{" "}
                        <span style={{ color: "#0f172a", fontWeight: 600 }}>{slaHorasResolucion} horas</span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Sub-pestaña: Conversación con el Técnico */}
                {subTabTicket === "chat" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5 }}>
                    <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <strong style={{ color: "#1e40af" }}>Técnico Resolutor (Juan Pérez)</strong>
                        <span style={{ fontSize: 10, color: "#64748b" }}>08:42 AM</span>
                      </div>
                      <span style={{ color: "#1e293b" }}>
                        {tipo === "incidente"
                          ? "Estimado Miguel, hemos tomado su reporte. Estamos revisando los logs del servicio PostgreSQL en el nodo 2. Por favor confirme si el fallo ocurre en todas las terminales."
                          : "Estimado Miguel, hemos tomado su solicitud de equipamiento. El equipo se encuentra en fase de clonación con la imagen corporativa."}
                      </span>
                    </div>

                    <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <strong style={{ color: "#334155" }}>Miguel Apaza (Solicitante)</strong>
                        <span style={{ fontSize: 10, color: "#64748b" }}>08:46 AM</span>
                      </div>
                      <span style={{ color: "#1e293b" }}>
                        {tipo === "incidente"
                          ? "Confirmado, afecta a los 4 colaboradores del área de facturación. No permite emitir comprobantes."
                          : "Muchas gracias. Favor coordinar la entrega física en la Sede Central, Edificio B."}
                      </span>
                    </div>
                  </div>
                )}

                {/* Sub-pestaña: Notas Técnicas Internas (Confidenciales - Solo para niveles autorizados) */}
                {subTabTicket === "notas" && nivelSimulado <= 4 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 11.5 }}>
                    <div style={{ padding: "6px 10px", backgroundColor: "#fef3c7", border: "1px solid #fde68a", borderRadius: 4, color: "#92400e", fontSize: 11, fontWeight: 700 }}>
                      🔒 Notas Técnicas y Coordinación Interna
                    </div>

                    {/* Tiempo transcurrido de SLA y restante dentro de la conversación interna */}
                    <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "#1e40af", textTransform: "uppercase" }}>
                          ⏱️ Monitoreo de SLA y Tiempos de Atención
                        </span>
                        {nivelSimulado === 4 && (
                          <button
                            type="button"
                            onClick={() => setModalEditarSlaAbierto(true)}
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              padding: "2px 7px",
                              borderRadius: 4,
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8",
                              border: "1px solid #bfdbfe",
                              cursor: "pointer",
                            }}
                          >
                            ✏️ Ajustar SLA
                          </button>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                        <div style={{ backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                          <span style={{ color: "#64748b", fontSize: 10, display: "block" }}>Primera Respuesta:</span>
                          <span style={{ fontWeight: 700, color: "#166534" }}>✓ Cumplido en 12 min</span>
                        </div>
                        <div style={{ backgroundColor: "#ffffff", padding: "5px 8px", borderRadius: 4, border: "1px solid #e2e8f0" }}>
                          <span style={{ color: "#64748b", fontSize: 10, display: "block" }}>Tiempo Transcurrido / Restante:</span>
                          <span style={{ fontWeight: 700, color: "#b45309" }}>1h 15m transcurridos</span>
                          <span style={{ color: "#0f172a", fontWeight: 700, marginLeft: 4 }}>· Restan 2h 45m</span>
                        </div>
                      </div>

                      {slaModificadoExito && (
                        <div style={{ marginTop: 6, padding: "5px 8px", backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, color: "#166534", fontSize: 11 }}>
                          ✓ Plazo de SLA modificado a {slaHorasResolucion} horas. Motivo registrado en auditoría.
                        </div>
                      )}

                      {/* Modal simulado para ajustar SLA */}
                      {modalEditarSlaAbierto && (
                        <div style={{ marginTop: 8, padding: 10, backgroundColor: "#ffffff", border: "2px solid #2563eb", borderRadius: 6, display: "flex", flexDirection: "column", gap: 8 }}>
                          <strong style={{ fontSize: 11.5, color: "#1e40af" }}>Ajustar Plazo de SLA (Técnico Nivel 4)</strong>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <label style={{ fontSize: 11, color: "#334155" }}>Nuevo plazo límite:</label>
                            <select
                              className="input-base"
                              value={slaHorasResolucion}
                              onChange={(e) => setSlaHorasResolucion(Number(e.target.value))}
                              style={{ fontSize: 11, padding: "2px 6px", width: "auto" }}
                            >
                              <option value={2}>2 horas (Urgente)</option>
                              <option value={4}>4 horas (Estándar)</option>
                              <option value={8}>8 horas (Extensión justificada)</option>
                              <option value={24}>24 horas (Espera de proveedor)</option>
                            </select>
                          </div>
                          <input
                            type="text"
                            className="input-base"
                            placeholder="Motivo técnico de la modificación..."
                            value={motivoSla}
                            onChange={(e) => setMotivoSla(e.target.value)}
                            style={{ fontSize: 11, padding: "4px 8px" }}
                          />
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => setModalEditarSlaAbierto(false)}
                              className="boton-secundario"
                              style={{ fontSize: 10.5, padding: "3px 8px" }}
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModalEditarSlaAbierto(false);
                                setSlaModificadoExito(true);
                                setTimeout(() => setSlaModificadoExito(false), 4000);
                              }}
                              className="boton-primario"
                              style={{ fontSize: 10.5, padding: "3px 10px" }}
                            >
                              Confirmar Ajuste
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mensajes de Notas Técnicas */}
                    <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <strong style={{ color: "#b45309" }}>Técnico N2 (Juan Pérez) · Diagnóstico</strong>
                        <span style={{ fontSize: 10, color: "#78350f" }}>08:50 AM</span>
                      </div>
                      <span style={{ color: "#451a03" }}>
                        {tipo === "incidente"
                          ? "Se evidencia saturación del pool con 100/100 conexiones en estado 'idle in transaction' por un proceso batch no liberado. Se solicita al DBA reiniciar el worker."
                          : "Se validó stock en almacén: laptop disponible en lote TI-LOTE-2026-B. Pendiente asignación de licencia M365 en Azure AD."}
                      </span>
                    </div>

                    <div style={{ padding: 8, borderRadius: 6, backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <strong style={{ color: "#b45309" }}>{tipo === "incidente" ? "DBA Senior (María Torres) · Acción" : "Administrador SysOps · Provisión"}</strong>
                        <span style={{ fontSize: 10, color: "#78350f" }}>08:55 AM</span>
                      </div>
                      <span style={{ color: "#451a03" }}>
                        {tipo === "incidente"
                          ? "Se cancelaron las sesiones bloqueantes mediante pg_terminate_backend(). Pool restablecido al 15%. Monitoreando latencia."
                          : "Cuenta de usuario provisionada en grupo VPN-Seguro. Imagen de Windows 11 desplegada mediante Intune."}
                      </span>
                    </div>

                    {/* Bitácora de Transiciones (Auditoría Inmutable) dentro de conversación interna */}
                    <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 8, marginTop: 4 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                        Bitácora de Transiciones (Auditoría Inmutable)
                      </span>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, color: "#475569", fontSize: 10.5 }}>
                        <div>• <strong>08:30:12</strong> — Ticket generado con código {tipo === "incidente" ? "#INC-2026-0042" : "#SOL-2026-0018"} por Miguel Apaza.</div>
                        {tipo === "incidente" ? (
                          <>
                            <div>• <strong>08:30:15</strong> — Prioridad calculada como P2 - Alta por matriz institucional.</div>
                            <div>• <strong>08:32:00</strong> — Asignado automáticamente al departamento de Infraestructura TI.</div>
                            <div>• <strong>08:35:10</strong> — Técnico Juan Pérez aceptó la atención del incidente.</div>
                          </>
                        ) : (
                          <>
                            <div>• <strong>08:31:00</strong> — Solicitud validada automáticamente contra política de accesos.</div>
                            <div>• <strong>08:33:15</strong> — Requerimiento derivado a Provisión de Hardware TI.</div>
                            <div>• <strong>08:36:00</strong> — Técnico especialista asignado para configuración de equipo.</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
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
};
