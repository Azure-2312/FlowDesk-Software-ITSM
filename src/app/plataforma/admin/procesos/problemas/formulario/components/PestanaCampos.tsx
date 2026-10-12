"use client";

import React, { useState, useEffect } from "react";

export interface CampoPersonalizadoProblema {
  id_campo: number;
  codigo: string;
  etiqueta: string;
  descripcion?: string;
  tipo: string;
  activo: boolean;
  obligatorio: string; // "si" | "no" | "condicional"
  propiedades?: {
    prioridad_minima?: number; // 1=P1 Crítica, 2=P2 Alta, 3=P3 Media, 4=P4 Baja, 5=P5 Planificada (todos)
    opciones?: string[];
    unidad?: string;
    incluir_busqueda?: boolean;
    incluir_reportes?: boolean;
    incluir_auditoria?: boolean;
    [key: string]: any;
  };
  orden?: number;
}

interface PestanaCamposProps {
  secciones?: any[];
  camposPersonalizadosDisponibles?: any[];
  onActualizarSecciones?: (secciones: any[]) => void;
  puedeEditar: boolean;
}

// Matriz Institucional de Prioridad de Problemas (P1 a P5)
const PRIORIDADES_PROBLEMA = [
  { nivel: 1, codigo: "P1", nombre: "P1 - Crítica", color: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
  { nivel: 2, codigo: "P2", nombre: "P2 - Alta", color: "#c2410c", bg: "#ffedd5", border: "#fdba74" },
  { nivel: 3, codigo: "P3", nombre: "P3 - Media", color: "#854d0e", bg: "#fef9c3", border: "#fde047" },
  { nivel: 4, codigo: "P4", nombre: "P4 - Baja", color: "#1d4ed8", bg: "#dbeafe", border: "#93c5fd" },
  { nivel: 5, codigo: "P5", nombre: "P5 - Planificada", color: "#475569", bg: "#f1f5f9", border: "#cbd5e1" },
];

const TIPOS_CAMPO_DISPONIBLES = [
  { id: "texto_corto", nombre: "Texto corto", desc: "Hasta 255 caracteres en una sola línea" },
  { id: "texto_largo", nombre: "Texto largo / Área", desc: "Comentarios, análisis o descripciones extensas" },
  { id: "numero_entero", nombre: "Número entero", desc: "Cantidades, códigos numéricos o contadores" },
  { id: "numero_decimal", nombre: "Número decimal", desc: "Costos, horas estimadas o porcentajes" },
  { id: "fecha", nombre: "Fecha", desc: "Selector de día, mes y año" },
  { id: "fecha_hora", nombre: "Fecha y hora", desc: "Marcas temporales precisas para eventos" },
  { id: "si_no", nombre: "Sí / No (Booleano)", desc: "Interruptor binario de confirmación" },
  { id: "lista", nombre: "Lista desplegable", desc: "Selección única entre opciones predefinidas" },
  { id: "seleccion_multiple", nombre: "Selección múltiple", desc: "Múltiples opciones elegibles de un catálogo" },
  { id: "casillas", nombre: "Casillas de verificación", desc: "Checkboxes independientes de verificación" },
  { id: "usuario", nombre: "Usuario del sistema", desc: "Búsqueda en el directorio corporativo" },
  { id: "url", nombre: "Enlace URL", desc: "Dirección web institucional o externa" },
  { id: "archivo", nombre: "Archivo adjunto", desc: "Carga de documento, reporte o evidencia técnica" },
  { id: "referencia_ci", nombre: "Referencia a CI (CMDB)", desc: "Vínculo a activo tecnológico de configuración" },
  { id: "referencia_ticket", nombre: "Referencia a ticket", desc: "Vínculo a incidente, problema o cambio RFC" },
];

interface IncidenteDisponible {
  id: string;
  codigo: string;
  titulo: string;
  servicio_codigo: string;
  servicio_nombre: string;
  prioridad: string;
  prioridad_color: string;
  estado: string;
  fecha: string;
}

const INCIDENTES_CATALOGO: IncidenteDisponible[] = [
  {
    id: "1",
    codigo: "INC-2026-0814",
    titulo: "Caída intermitente en enlace switch core Datacenter",
    servicio_codigo: "SRV-WAN-001",
    servicio_nombre: "Enlace WAN Principal y Red",
    prioridad: "P2 - Alta",
    prioridad_color: "#c2410c",
    estado: "En Curso",
    fecha: "Hoy 08:30",
  },
  {
    id: "2",
    codigo: "INC-2026-0820",
    titulo: "Pérdida de paquetes persistente en túnel VPN sedes remotas",
    servicio_codigo: "SRV-WAN-001",
    servicio_nombre: "Enlace WAN Principal y Red",
    prioridad: "P2 - Alta",
    prioridad_color: "#c2410c",
    estado: "Asignado",
    fecha: "Hoy 09:15",
  },
  {
    id: "3",
    codigo: "INC-2026-0831",
    titulo: "Bloqueo de acceso y degradación de red en Contabilidad sede sur",
    servicio_codigo: "SRV-WAN-001",
    servicio_nombre: "Enlace WAN Principal y Red",
    prioridad: "P3 - Media",
    prioridad_color: "#854d0e",
    estado: "Abierto",
    fecha: "Ayer 17:40",
  },
  {
    id: "4",
    codigo: "INC-2026-0845",
    titulo: "Falla de sincronización en réplica de Base de Datos SAP",
    servicio_codigo: "SRV-ERP-002",
    servicio_nombre: "Sistema de Gestión Financiera SAP",
    prioridad: "P1 - Crítica",
    prioridad_color: "#b91c1c",
    estado: "Bajo Diagnóstico",
    fecha: "Hoy 10:00",
  },
  {
    id: "5",
    codigo: "INC-2026-0850",
    titulo: "Demora en autenticación SSO en portal corporativo",
    servicio_codigo: "SRV-AUTH-003",
    servicio_nombre: "Directorio Activo y SSO",
    prioridad: "P3 - Media",
    prioridad_color: "#854d0e",
    estado: "Abierto",
    fecha: "Hoy 10:20",
  },
  {
    id: "6",
    codigo: "INC-2026-0862",
    titulo: "Latencia alta en consultas del servicio de facturación",
    servicio_codigo: "SRV-ERP-002",
    servicio_nombre: "Sistema de Gestión Financiera SAP",
    prioridad: "P2 - Alta",
    prioridad_color: "#c2410c",
    estado: "Asignado",
    fecha: "Hoy 11:05",
  },
];

export const PestanaCampos: React.FC<PestanaCamposProps> = ({
  puedeEditar,
}) => {
  // Lista de campos personalizados gestionados
  const [campos, setCampos] = useState<CampoPersonalizadoProblema[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Sub-pestaña de la columna derecha: formulario vs ticket creado
  const [subpestanaDerecha, setSubpestanaDerecha] = useState<"formulario" | "ticket">("formulario");

  // Variables de Urgencia e Impacto para el cálculo dinámico por matriz
  // Urgencia: 3 Alta, 2 Media, 1 Baja
  // Impacto: 3 Alto, 2 Medio, 1 Bajo
  const [urgencia, setUrgencia] = useState<number>(3);
  const [impacto, setImpacto] = useState<number>(3);

  // Función de la Matriz Institucional Impacto x Urgencia
  function calcularPrioridadMatriz(imp: number, urg: number) {
    if (imp === 3 && urg === 3) return PRIORIDADES_PROBLEMA[0]; // P1 - Crítica
    if ((imp === 3 && urg === 2) || (imp === 2 && urg === 3)) return PRIORIDADES_PROBLEMA[1]; // P2 - Alta
    if ((imp === 2 && urg === 2) || (imp === 3 && urg === 1) || (imp === 1 && urg === 3)) return PRIORIDADES_PROBLEMA[2]; // P3 - Media
    if ((imp === 2 && urg === 1) || (imp === 1 && urg === 2)) return PRIORIDADES_PROBLEMA[3]; // P4 - Baja
    return PRIORIDADES_PROBLEMA[4]; // P5 - Planificada
  }

  const prioridadCalculada = calcularPrioridadMatriz(impacto, urgencia);

  // Estado del Campo 14: Incidentes Asociados
  const [incidentesVinculadosIds, setIncidentesVinculadosIds] = useState<string[]>(["1", "2", "3"]);
  const [modalIncidentesAbierto, setModalIncidentesAbierto] = useState<boolean>(false);
  const [busquedaIncidente, setBusquedaIncidente] = useState<string>("");
  const [filtroServicioInc, setFiltroServicioInc] = useState<string>("todos");

  // Asistente Modal de 5 Pasos para crear un nuevo campo
  const [asistenteAbierto, setAsistenteAbierto] = useState(false);
  const [pasoAsistente, setPasoAsistente] = useState(1);
  const [errorAsistente, setErrorAsistente] = useState("");
  const [creandoCampo, setCreandoCampo] = useState(false);

  // Formulario del Asistente
  const [nuevoTipo, setNuevoTipo] = useState("texto_corto");
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("");
  const [nuevoCodigo, setNuevoCodigo] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [nuevasOpciones, setNuevasOpciones] = useState("Opción 1\nOpción 2\nOpción 3");
  const [nuevaUnidad, setNuevaUnidad] = useState("");
  const [nuevoHabilitado, setNuevoHabilitado] = useState(true);
  const [nuevoObligatorio, setNuevoObligatorio] = useState(false);
  const [nuevaPrioridadMinima, setNuevaPrioridadMinima] = useState(5);

  // Cargar campos personalizados desde el backend
  const cargarCampos = async () => {
    try {
      setCargando(true);
      setMensajeError(null);
      const res = await fetch("/api/admin/problemas/campos-personalizados?entidad=problema");
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al cargar campos personalizados");

      const lista = (data.campos || []).map((c: any) => ({
        id_campo: c.id_campo,
        codigo: c.codigo,
        etiqueta: c.etiqueta,
        descripcion: c.descripcion || "",
        tipo: c.tipo,
        activo: Boolean(c.activo),
        obligatorio: c.obligatorio || "no",
        propiedades: {
          prioridad_minima: c.propiedades?.prioridad_minima ?? 5,
          opciones: c.propiedades?.opciones ?? [],
          unidad: c.propiedades?.unidad ?? "",
          ...c.propiedades,
        },
        orden: c.orden || 1,
      }));

      setCampos(lista);
    } catch (err: any) {
      setMensajeError(err.message || "Error al conectar con la base de datos.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarCampos();
  }, []);

  // Generar código con prefijo cf_
  const handleEtiquetaChange = (valor: string) => {
    setNuevaEtiqueta(valor);
    const sugerido = "cf_" + valor
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 30);
    setNuevoCodigo(sugerido);
  };

  const abrirAsistenteNuevoCampo = () => {
    setPasoAsistente(1);
    setNuevoTipo("texto_corto");
    setNuevaEtiqueta("");
    setNuevoCodigo("cf_");
    setNuevaDescripcion("");
    setNuevasOpciones("Opción 1\nOpción 2\nOpción 3");
    setNuevaUnidad("");
    setNuevoHabilitado(true);
    setNuevoObligatorio(false);
    setNuevaPrioridadMinima(5);
    setErrorAsistente("");
    setAsistenteAbierto(true);
  };

  // Crear campo a través del asistente de 5 pasos
  const handleCrearCampoSubmit = async () => {
    try {
      setCreandoCampo(true);
      setErrorAsistente("");

      const payload = {
        entidad: "problema",
        codigo: nuevoCodigo.trim(),
        etiqueta: nuevaEtiqueta.trim(),
        descripcion: nuevaDescripcion.trim() || undefined,
        tipo: nuevoTipo,
        activo: nuevoHabilitado,
        obligatorio: nuevoObligatorio ? "si" : "no",
        propiedades: {
          prioridad_minima: nuevaPrioridadMinima,
          opciones: nuevoTipo.includes("lista") || nuevoTipo.includes("seleccion")
            ? nuevasOpciones.split("\n").map((o) => o.trim()).filter(Boolean)
            : undefined,
          unidad: nuevaUnidad.trim() || undefined,
          incluir_busqueda: true,
          incluir_reportes: true,
          incluir_auditoria: true,
        },
        formularios_visibles: ["registro", "edicion"],
        orden: campos.length + 1,
      };

      const res = await fetch("/api/admin/problemas/campos-personalizados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "No se pudo crear el campo.");

      setAsistenteAbierto(false);
      setMensajeExito(`Campo "${nuevaEtiqueta}" creado y agregado exitosamente.`);
      await cargarCampos();
    } catch (err: any) {
      setErrorAsistente(err.message || "Error al registrar el campo.");
    } finally {
      setCreandoCampo(false);
    }
  };

  // Alternar habilitado de un campo en la lista
  const toggleHabilitado = (id_campo: number) => {
    if (!puedeEditar) return;
    setCampos((prev) =>
      prev.map((c) => (c.id_campo === id_campo ? { ...c, activo: !c.activo } : c))
    );
  };

  // Alternar obligatorio/opcional
  const toggleObligatorio = (id_campo: number) => {
    if (!puedeEditar) return;
    setCampos((prev) =>
      prev.map((c) => {
        if (c.id_campo !== id_campo) return c;
        const nuevo = c.obligatorio === "si" ? "no" : "si";
        return { ...c, obligatorio: nuevo };
      })
    );
  };

  // Cambiar prioridad mínima del problema requerida para exigir este campo
  const cambiarPrioridadMinima = (id_campo: number, nivel: number) => {
    if (!puedeEditar) return;
    setCampos((prev) =>
      prev.map((c) => {
        if (c.id_campo !== id_campo) return c;
        return {
          ...c,
          propiedades: {
            ...c.propiedades,
            prioridad_minima: nivel,
          },
        };
      })
    );
  };

  // Eliminar campo personalizado
  const eliminarCampo = async (id_campo: number, etiqueta: string) => {
    if (!puedeEditar) return;
    const confirma = window.confirm(
      `¿Está seguro de eliminar permanentemente el campo personalizado "${etiqueta}"?`
    );
    if (!confirma) return;

    try {
      const res = await fetch(`/api/admin/problemas/campos-personalizados?id=${id_campo}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "No se pudo eliminar el campo.");

      setMensajeExito(`Campo "${etiqueta}" eliminado correctamente.`);
      setCampos((prev) => prev.filter((c) => c.id_campo !== id_campo));
    } catch (err: any) {
      setMensajeError(err.message || "Error al eliminar el campo.");
    }
  };

  // Guardar configuración de todos los campos personalizados en batch
  const guardarCambios = async () => {
    try {
      setGuardando(true);
      setMensajeError(null);
      setMensajeExito(null);

      const res = await fetch("/api/admin/problemas/campos-personalizados", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campos }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Error al guardar cambios");

      setMensajeExito("Configuración de campos personalizados guardada exitosamente.");
    } catch (err: any) {
      setMensajeError(err.message || "Error al guardar cambios de campos personalizados.");
    } finally {
      setGuardando(false);
    }
  };

  // Campos personalizados visibles según la prioridad calculada del problema
  // Los campos con prioridad_minima 5 aplican a todos (P1 a P5).
  // Los campos con prioridad_minima 1 solo aplican si el problema es P1 (Crítica).
  const camposVisiblesEnSimulacion = campos.filter((c) => {
    if (!c.activo) return false;
    const prioMin = c.propiedades?.prioridad_minima ?? 5;
    return prioridadCalculada.nivel <= prioMin;
  });

  // Filtrado de incidentes en el modal de vinculación
  const incidentesFiltrados = INCIDENTES_CATALOGO.filter((inc) => {
    const matchBusqueda =
      !busquedaIncidente.trim() ||
      inc.codigo.toLowerCase().includes(busquedaIncidente.toLowerCase()) ||
      inc.titulo.toLowerCase().includes(busquedaIncidente.toLowerCase());
    const matchServicio =
      filtroServicioInc === "todos" || inc.servicio_codigo === filtroServicioInc;
    return matchBusqueda && matchServicio;
  });

  return (
    <div>
      {/* Mensajes de Alerta */}
      {mensajeError && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          {mensajeError}
        </div>
      )}

      {mensajeExito && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {mensajeExito}
        </div>
      )}

      {/* DISPOSICIÓN PRINCIPAL EN DOS COLUMNAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "480px 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* COLUMNA IZQUIERDA: GESTIÓN DE CAMPOS PERSONALIZADOS */}
        <div
          className="tarjeta"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Cabecera de la sección izquierda: Título y Botón + */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: 14,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                  Campos personalizados
                </h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                    backgroundColor: "#eff6ff",
                    color: "#2563eb",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  {campos.length} creados
                </span>
              </div>
              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#64748b" }}>
                Campos adicionales condicionados por la prioridad del problema (P1 a P5).
              </p>
            </div>

            {/* Botón + para agregar un nuevo campo mediante el modal flotante */}
            <button
              type="button"
              onClick={abrirAsistenteNuevoCampo}
              disabled={!puedeEditar}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "7px 14px",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: puedeEditar ? "pointer" : "not-allowed",
                boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
              }}
              title="Abrir asistente para crear un nuevo campo personalizado"
            >
              <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1 }}>+</span>
              <span>Nuevo campo</span>
            </button>
          </div>

          {/* Lista de Campos Creados (solo campos personalizados; sin campos base) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cargando ? (
              <div style={{ padding: 24, textAlign: "center", color: "#64748b", fontSize: 12.5 }}>
                Cargando campos personalizados...
              </div>
            ) : campos.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                  borderRadius: 8,
                  border: "1px dashed #cbd5e1",
                  color: "#64748b",
                  fontSize: 12.5,
                }}
              >
                No hay campos personalizados creados. Haga clic en el botón <strong>+ Nuevo campo</strong> para añadir uno.
              </div>
            ) : (
              campos.map((campo) => {
                const prioridadMin = campo.propiedades?.prioridad_minima ?? 5;
                return (
                  <div
                    key={campo.id_campo}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: `1px solid ${campo.activo ? "#cbd5e1" : "#e2e8f0"}`,
                      backgroundColor: campo.activo ? "#ffffff" : "#f8fafc",
                      boxShadow: campo.activo ? "0 1px 2px rgba(0,0,0,0.02)" : "none",
                      opacity: campo.activo ? 1 : 0.65,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Fila superior: Nombre del campo y etiqueta técnica */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>
                            {campo.etiqueta}
                          </strong>
                          <span
                            style={{
                              fontSize: 10,
                              padding: "1px 5px",
                              borderRadius: 4,
                              backgroundColor: "#f1f5f9",
                              color: "#475569",
                              fontWeight: 600,
                              fontFamily: "monospace",
                            }}
                          >
                            {campo.tipo}
                          </span>
                        </div>
                        {campo.descripcion && (
                          <div
                            style={{
                              fontSize: 11,
                              color: "#64748b",
                              marginTop: 2,
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 420,
                            }}
                            title={campo.descripcion}
                          >
                            {campo.descripcion}
                          </div>
                        )}
                      </div>

                      {/* Botón tacho de basura para eliminar */}
                      <button
                        type="button"
                        onClick={() => eliminarCampo(campo.id_campo, campo.etiqueta)}
                        disabled={!puedeEditar}
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#dc2626",
                          padding: "4px 7px",
                          borderRadius: 6,
                          cursor: puedeEditar ? "pointer" : "not-allowed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        title={`Eliminar campo "${campo.etiqueta}"`}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>

                    {/* Fila inferior: Controles compactos (Check habilitar, Botón obligatorio, Select prioridad del problema) */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        paddingTop: 6,
                        borderTop: "1px dashed #e2e8f0",
                      }}
                    >
                      {/* Check para habilitarlo */}
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: puedeEditar ? "pointer" : "not-allowed",
                          color: campo.activo ? "#1e40af" : "#94a3b8",
                          userSelect: "none",
                        }}
                        title={campo.activo ? "Campo activo en formularios" : "Campo inactivo"}
                      >
                        <input
                          type="checkbox"
                          checked={campo.activo}
                          disabled={!puedeEditar}
                          onChange={() => toggleHabilitado(campo.id_campo)}
                          style={{ width: 15, height: 15, accentColor: "#2563eb", cursor: "pointer" }}
                        />
                        <span>{campo.activo ? "Habilitado" : "Inactivo"}</span>
                      </label>

                      {/* Botón de obligatorio u opcional */}
                      <button
                        type="button"
                        disabled={!puedeEditar || !campo.activo}
                        onClick={() => toggleObligatorio(campo.id_campo)}
                        style={{
                          border: `1px solid ${campo.obligatorio === "si" ? "#fca5a5" : "#cbd5e1"}`,
                          backgroundColor: !campo.activo
                            ? "#f1f5f9"
                            : campo.obligatorio === "si"
                            ? "#fef2f2"
                            : "#ffffff",
                          color: !campo.activo
                            ? "#94a3b8"
                            : campo.obligatorio === "si"
                            ? "#dc2626"
                            : "#475569",
                          padding: "3px 9px",
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 600,
                          cursor: puedeEditar && campo.activo ? "pointer" : "not-allowed",
                          whiteSpace: "nowrap",
                        }}
                        title="Alternar obligatoriedad"
                      >
                        {campo.obligatorio === "si" ? "Obligatorio" : "Opcional"}
                      </button>

                      {/* Selector de prioridad del problema requerida */}
                      <select
                        disabled={!puedeEditar || !campo.activo}
                        value={prioridadMin}
                        onChange={(e) => cambiarPrioridadMinima(campo.id_campo, parseInt(e.target.value, 10))}
                        style={{
                          fontSize: 11,
                          padding: "3px 6px",
                          height: 28,
                          backgroundColor: campo.activo ? "#ffffff" : "#f1f5f9",
                          border: "1px solid #cbd5e1",
                          borderRadius: 6,
                          color: "#1e293b",
                          cursor: puedeEditar && campo.activo ? "pointer" : "not-allowed",
                          maxWidth: 175,
                        }}
                        title="Prioridad mínima calculada del problema requerida para exigir este campo"
                      >
                        <option value={5}>Para todos (P1 a P5)</option>
                        <option value={4}>Exclusivo P4 a P1 (Media a Crítica)</option>
                        <option value={3}>Exclusivo P3 a P1 (Mínimo Media)</option>
                        <option value={2}>Exclusivo P2 y P1 (Alta y Crítica)</option>
                        <option value={1}>Exclusivo P1 (Solo Críticos)</option>
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Botón de Guardar al Fondo de la Columna Izquierda */}
          <div style={{ paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
            <button
              type="button"
              onClick={guardarCambios}
              disabled={!puedeEditar || guardando}
              style={{
                width: "100%",
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 600,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                cursor: !puedeEditar || guardando ? "not-allowed" : "pointer",
                boxShadow: "0 1px 2px rgba(37,99,235,0.2)",
              }}
            >
              {guardando ? "Guardando Cambios..." : "Guardar Cambios de Campos Personalizados"}
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: VISTAS PREVIAS DINÁMICAS (FORMULARIO Y TICKET CREADO) */}
        <div
          className="tarjeta"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 20,
            boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Cabecera de la Columna Derecha: Sub-Pestañas y Selector del Simulador */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: 14,
            }}
          >
            {/* Sub-Pestañas: Vista de Formulario vs Vista de Ticket Creado */}
            <div style={{ display: "flex", gap: 6, backgroundColor: "#f1f5f9", padding: 3, borderRadius: 8 }}>
              <button
                type="button"
                onClick={() => setSubpestanaDerecha("formulario")}
                style={{
                  padding: "6px 14px",
                  fontSize: 12.5,
                  fontWeight: subpestanaDerecha === "formulario" ? 700 : 500,
                  backgroundColor: subpestanaDerecha === "formulario" ? "#ffffff" : "transparent",
                  color: subpestanaDerecha === "formulario" ? "#2563eb" : "#64748b",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  boxShadow: subpestanaDerecha === "formulario" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                Vista de Formulario
              </button>
              <button
                type="button"
                onClick={() => setSubpestanaDerecha("ticket")}
                style={{
                  padding: "6px 14px",
                  fontSize: 12.5,
                  fontWeight: subpestanaDerecha === "ticket" ? 700 : 500,
                  backgroundColor: subpestanaDerecha === "ticket" ? "#ffffff" : "transparent",
                  color: subpestanaDerecha === "ticket" ? "#2563eb" : "#64748b",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  boxShadow: subpestanaDerecha === "ticket" ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                }}
              >
                Vista de Ticket Creado
              </button>
            </div>

            {/* Simulador Interactivo por Prioridad de Problema (Sincronizado con Matriz Impacto x Urgencia) */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: "#64748b" }}>
                Prioridad del Problema:
              </span>
              <select
                value={prioridadCalculada.nivel}
                onChange={(e) => {
                  const niv = parseInt(e.target.value, 10);
                  if (niv === 1) { setImpacto(3); setUrgencia(3); }
                  else if (niv === 2) { setImpacto(3); setUrgencia(2); }
                  else if (niv === 3) { setImpacto(2); setUrgencia(2); }
                  else if (niv === 4) { setImpacto(2); setUrgencia(1); }
                  else { setImpacto(1); setUrgencia(1); }
                }}
                style={{
                  padding: "5px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: prioridadCalculada.bg,
                  color: prioridadCalculada.color,
                  border: `1px solid ${prioridadCalculada.border}`,
                  cursor: "pointer",
                }}
              >
                {PRIORIDADES_PROBLEMA.map((p) => (
                  <option key={p.nivel} value={p.nivel}>
                    {p.codigo} - {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mensaje descriptivo de simulación técnica */}
          <div
            style={{
              padding: "8px 12px",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              fontSize: 11.5,
              color: "#475569",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              Severidad técnica: <strong>{prioridadCalculada.nombre}</strong> (Impacto {impacto === 3 ? "Alto" : impacto === 2 ? "Medio" : "Bajo"} × Urgencia {urgencia === 3 ? "Alta" : urgencia === 2 ? "Media" : "Baja"}).
            </span>
            <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 600 }}>
              {camposVisiblesEnSimulacion.length} campos personalizados activos visibles
            </span>
          </div>

          {/* CONTENIDO 1: VISTA DE FORMULARIO DE PROBLEMA (LOS 14 CAMPOS ITIL BASE + PERSONALIZADOS) */}
          {subpestanaDerecha === "formulario" && (
            <div
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                backgroundColor: "#f8fafc",
                overflow: "hidden",
              }}
            >
              {/* Barra superior de formulario */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "12px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                    Formulario de Registro de Problemas (ITIL v4)
                  </h3>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    Gestión reactiva y proactiva de errores técnicos organizacionales
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 4,
                    backgroundColor: prioridadCalculada.bg,
                    color: prioridadCalculada.color,
                  }}
                >
                  Prioridad: {prioridadCalculada.codigo}
                </span>
              </div>

              {/* Cuerpo del formulario con los 14 campos ITIL base inmutables */}
              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {/* 1. Código del problema (autogenerado, de solo lectura) */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      1. Código de Problema *
                    </label>
                    <input
                      type="text"
                      readOnly
                      value="PRB-2026-0042 (Autogenerado)"
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        fontWeight: 600,
                        backgroundColor: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: "#334155",
                        cursor: "not-allowed",
                        fontFamily: "monospace",
                      }}
                    />
                  </div>

                  {/* 2. Título del Problema */}
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      2. Título del Problema *
                    </label>
                    <input
                      type="text"
                      disabled
                      placeholder="Resuma la causa o falla recurrente (ej. Caída intermitente en troncal MPLS sede central)..."
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        color: "#0f172a",
                      }}
                    />
                  </div>
                </div>

                {/* 3. Descripción Detallada y Síntomas */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    3. Descripción Detallada y Síntomas Detectados *
                  </label>
                  <textarea
                    rows={3}
                    disabled
                    placeholder="Describa el comportamiento anómalo recurrente, impacto en usuarios, mensajes de error y patrones identificados..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      color: "#0f172a",
                      resize: "vertical",
                    }}
                  />
                </div>

                {/* 4. Categoría ITIL y 5. Servicio Afectado */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      4. Categoría del Problema *
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>Redes y Telecomunicaciones &gt; Enlaces WAN / MPLS</option>
                      <option>Sistemas &gt; Base de Datos Oracle</option>
                      <option>Hardware &gt; Servidores Virtuales Nutanix</option>
                      <option>Seguridad &gt; Firewall Perimetral</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      5. Servicio de Negocio Afectado *
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>SRV-WAN-001 · Enlace Principal WAN y Red Corporativa</option>
                      <option>SRV-ERP-002 · Sistema de Gestión Financiera SAP</option>
                      <option>SRV-AUTH-003 · Directorio Activo y Autenticación SSO</option>
                    </select>
                  </div>
                </div>

                {/* 6. Activos / Elemento CI de la CMDB Afectado */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    6. Elemento de Configuración (CI CMDB) Afectado
                  </label>
                  <select
                    disabled
                    style={{
                      width: "100%",
                      padding: "7px 10px",
                      fontSize: 12,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                    }}
                  >
                    <option>SW-CORE-CISCO-9300 (Switch Capa 3 - Datacenter Sede Central)</option>
                    <option>SRV-PROD-DB01 (Servidor Físico Base de Datos Principal)</option>
                    <option>FW-FORTINET-600E (Firewall Perimetral Primario)</option>
                  </select>
                </div>

                {/* 7. Urgencia, 8. Impacto y 9. Prioridad Calculada por Matriz */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      7. Nivel de Urgencia *
                    </label>
                    <select
                      value={urgencia}
                      onChange={(e) => setUrgencia(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <option value={3}>Alta - Labor crítica detenida</option>
                      <option value={2}>Media - Degradación con bypass</option>
                      <option value={1}>Baja - Impacto diferible</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      8. Nivel de Impacto *
                    </label>
                    <select
                      value={impacto}
                      onChange={(e) => setImpacto(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      <option value={3}>Alto - Toda la entidad / +100 usuarios</option>
                      <option value={2}>Medio - Departamento o sede</option>
                      <option value={1}>Bajo - Función accesoria reducida</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      9. Prioridad Calculada (Matriz) *
                    </label>
                    <div
                      style={{
                        padding: "7px 10px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 700,
                        backgroundColor: prioridadCalculada.bg,
                        color: prioridadCalculada.color,
                        border: `1px solid ${prioridadCalculada.border}`,
                        textAlign: "center",
                      }}
                    >
                      {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                    </div>
                  </div>
                </div>

                {/* 10. Grupo Resolutor y 11. Especialista Responsable */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      10. Grupo Técnico Asignado *
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>Mesa de Telecomunicaciones y Conectividad N3</option>
                      <option>Administración de Servidores e Infraestructura</option>
                      <option>Equipo de Base de Datos y Almacenamiento</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      11. Investigador / Responsable Asignado
                    </label>
                    <select
                      disabled
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        fontSize: 12,
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                      }}
                    >
                      <option>Ing. Roberto Sánchez (Especialista N3 Redes)</option>
                      <option>Ing. Patricia Alarcón (Arquitectura Cloud)</option>
                      <option>Por asignar (Bandeja del grupo resolutor)</option>
                    </select>
                  </div>
                </div>

                {/* 12. Causa Raíz / Análisis Causal RCA */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    12. Causa Raíz / Análisis RCA Preliminar
                  </label>
                  <textarea
                    rows={2}
                    disabled
                    placeholder="Hipótesis de investigación, análisis causal o diagnóstico preliminar del origen técnico..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      color: "#0f172a",
                    }}
                  />
                </div>

                {/* 13. Solución Temporal / Workaround */}
                <div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    13. Solución Temporal Documentada (Workaround)
                  </label>
                  <textarea
                    rows={2}
                    disabled
                    placeholder="Procedimiento temporal de mitigación o desvío para restablecer el servicio a los usuarios..."
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: 12,
                      backgroundColor: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      color: "#0f172a",
                    }}
                  />
                </div>

                {/* 14. INCIDENTES ASOCIADOS AL PROBLEMA CON SELECTOR INTERACTIVO Y ACCIÓN ASISTIDA */}
                <div
                  style={{
                    padding: "14px 16px",
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <strong style={{ fontSize: 12.5, color: "#166534" }}>
                          14. Incidentes Asociados al Problema
                        </strong>
                        <span
                          style={{
                            padding: "2px 8px",
                            backgroundColor: "#dcfce7",
                            color: "#15803d",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            border: "1px solid #86efac",
                          }}
                        >
                          {incidentesVinculadosIds.length} incidentes vinculados
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "#4b5563", marginTop: 2, display: "block" }}>
                        Seleccione fallas concurrentes para consolidar la investigación y notificar a los afectados.
                      </span>
                    </div>

                    {/* Botones de acción: Sugerir por servicio actual y modal de búsqueda completa */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          const idsServicio = INCIDENTES_CATALOGO
                            .filter((i) => i.servicio_codigo === "SRV-WAN-001")
                            .map((i) => i.id);
                          const combinados = Array.from(new Set([...incidentesVinculadosIds, ...idsServicio]));
                          setIncidentesVinculadosIds(combinados);
                        }}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 10px",
                          borderRadius: 6,
                          border: "1px solid #86efac",
                          backgroundColor: "#ffffff",
                          color: "#15803d",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                        title="Vincular automáticamente los incidentes abiertos del servicio SRV-WAN-001"
                      >
                        <span>Sugerir por Servicio (3)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalIncidentesAbierto(true)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "5px 12px",
                          borderRadius: 6,
                          border: "none",
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow: "0 1px 2px rgba(22,163,74,0.2)",
                        }}
                      >
                        <span>+ Buscar y Vincular Incidentes</span>
                      </button>
                    </div>
                  </div>

                  {/* Lista interactiva de incidentes asociados */}
                  {incidentesVinculadosIds.length === 0 ? (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "#ffffff",
                        border: "1px dashed #86efac",
                        borderRadius: 6,
                        color: "#475569",
                        fontSize: 11.5,
                        textAlign: "center",
                      }}
                    >
                      No hay incidentes vinculados aún. Utilice <strong>+ Buscar y Vincular Incidentes</strong> o <strong>Sugerir por Servicio</strong>.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {incidentesVinculadosIds.map((id) => {
                        const inc = INCIDENTES_CATALOGO.find((i) => i.id === id);
                        if (!inc) return null;
                        return (
                          <div
                            key={inc.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "7px 10px",
                              backgroundColor: "#ffffff",
                              border: "1px solid #d1fae5",
                              borderRadius: 6,
                              fontSize: 11.5,
                              gap: 8,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                              <span
                                style={{
                                  fontFamily: "monospace",
                                  fontWeight: 700,
                                  color: "#1e40af",
                                  backgroundColor: "#eff6ff",
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  fontSize: 11,
                                }}
                              >
                                #{inc.codigo}
                              </span>
                              <strong style={{ color: "#0f172a" }}>{inc.titulo}</strong>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  padding: "1px 6px",
                                  borderRadius: 4,
                                  backgroundColor: "#fef3c7",
                                  color: "#92400e",
                                  fontWeight: 600,
                                }}
                              >
                                {inc.prioridad}
                              </span>
                              <span style={{ color: "#64748b", fontSize: 11 }}>
                                · {inc.servicio_nombre} ({inc.fecha})
                              </span>
                            </div>

                            {/* Botón quitar incidente */}
                            <button
                              type="button"
                              onClick={() => setIncidentesVinculadosIds((prev) => prev.filter((item) => item !== inc.id))}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#dc2626",
                                cursor: "pointer",
                                padding: "2px 6px",
                                fontSize: 13,
                                fontWeight: 700,
                                borderRadius: 4,
                              }}
                              title={`Desvincular #${inc.codigo}`}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CAMPOS PERSONALIZADOS DINÁMICOS SEGÚN SIMULACIÓN */}
                {camposVisiblesEnSimulacion.length > 0 && (
                  <div
                    style={{
                      paddingTop: 12,
                      borderTop: "2px dashed #cbd5e1",
                      display: "flex",
                      flexDirection: "column",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          backgroundColor: "#fef3c7",
                          color: "#92400e",
                          border: "1px solid #fde68a",
                        }}
                      >
                        Campos Personalizados Activos ({camposVisiblesEnSimulacion.length})
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        (Visibles para severidad técnica {prioridadCalculada.nombre})
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {camposVisiblesEnSimulacion.map((c) => (
                        <div key={c.id_campo}>
                          <label
                            style={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              color: "#0f172a",
                              display: "block",
                              marginBottom: 4,
                            }}
                          >
                            {c.etiqueta} {c.obligatorio === "si" ? "*" : "(Opcional)"}
                          </label>

                          {c.tipo === "lista" || c.tipo === "seleccion_multiple" ? (
                            <select
                              disabled
                              style={{
                                width: "100%",
                                padding: "7px 10px",
                                fontSize: 12,
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                              }}
                            >
                              <option>Seleccione una opción...</option>
                              {(c.propiedades?.opciones || []).map((op: string, idx: number) => (
                                <option key={idx}>{op}</option>
                              ))}
                            </select>
                          ) : c.tipo === "texto_largo" ? (
                            <textarea
                              rows={2}
                              disabled
                              placeholder={`Ingrese ${c.etiqueta.toLowerCase()}...`}
                              style={{
                                width: "100%",
                                padding: "7px 10px",
                                fontSize: 12,
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                              }}
                            />
                          ) : c.tipo === "si_no" || c.tipo === "casillas" ? (
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                              <input type="checkbox" disabled />
                              <span>{c.descripcion || c.etiqueta}</span>
                            </label>
                          ) : (
                            <input
                              type="text"
                              disabled
                              placeholder={`Ingrese ${c.etiqueta.toLowerCase()}...`}
                              style={{
                                width: "100%",
                                padding: "7px 10px",
                                fontSize: 12,
                                backgroundColor: "#ffffff",
                                border: "1px solid #cbd5e1",
                                borderRadius: 6,
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zona de Evidencias Técnicas / Adjuntos */}
                <div
                  style={{
                    padding: 14,
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    border: "2px dashed #cbd5e1",
                    textAlign: "center",
                  }}
                >
                  <strong style={{ fontSize: 12, color: "#0f172a", display: "block" }}>
                    Carga de Evidencia Técnica y Registros de Diagnóstico
                  </strong>
                  <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2 }}>
                    Adjunte capturas de pantalla, archivos de volcado de memoria (dumps), trazas de red o logs
                  </span>
                  <button
                    type="button"
                    disabled
                    style={{
                      marginTop: 8,
                      fontSize: 11.5,
                      padding: "4px 12px",
                      backgroundColor: "#f1f5f9",
                      border: "1px solid #cbd5e1",
                      borderRadius: 6,
                      color: "#475569",
                      cursor: "not-allowed",
                    }}
                  >
                    Seleccionar Archivos
                  </button>
                </div>
              </div>

              {/* Pie del Formulario con Botones */}
              <div
                style={{
                  backgroundColor: "#ffffff",
                  padding: "12px 18px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  disabled
                  style={{
                    padding: "7px 16px",
                    fontSize: 12.5,
                    backgroundColor: "#ffffff",
                    border: "1px solid #cbd5e1",
                    borderRadius: 6,
                    color: "#64748b",
                    cursor: "not-allowed",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled
                  style={{
                    padding: "7px 16px",
                    fontSize: 12.5,
                    backgroundColor: "#2563eb",
                    border: "none",
                    borderRadius: 6,
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "not-allowed",
                  }}
                >
                  Registrar Problema
                </button>
              </div>
            </div>
          )}

          {/* CONTENIDO 2: VISTA DE TICKET CREADO CON LÍNEA DINÁMICA DE WORKFLOW */}
          {subpestanaDerecha === "ticket" && (
            <div
              style={{
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                backgroundColor: "#f8fafc",
                overflow: "hidden",
              }}
            >
              {/* Cabecera del Ticket */}
              <div
                style={{
                  backgroundColor: "#0f172a",
                  color: "#ffffff",
                  padding: "16px 20px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#60a5fa" }}>
                      #PRB-2026-0042
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 4,
                        backgroundColor: prioridadCalculada.bg,
                        color: prioridadCalculada.color,
                      }}
                    >
                      {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: 4,
                      backgroundColor: "#1e3a8a",
                      color: "#bfdbfe",
                    }}
                  >
                    Estado: Bajo Investigación
                  </span>
                </div>

                <h3 style={{ margin: "0 0 6px 0", fontSize: 16, fontWeight: 700 }}>
                  Pérdida intermitente de paquetes y latencia en enlace troncal MPLS sede central
                </h3>
                <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                  Registrado el 03/10/2026 10:30 hrs por Carlos Mendoza (Gestor de Problemas) · Servicio: SRV-WAN-001
                </div>
              </div>

              <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                {/* LÍNEA DINÁMICA DE ESTADOS DEL WORKFLOW ESTÁNDAR DE PROBLEMAS (7 ESTADOS ITIL) */}
                <div
                  style={{
                    padding: 16,
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#334155",
                      display: "block",
                      marginBottom: 14,
                    }}
                  >
                    Ciclo de Vida ITIL: Flujo Estándar de Gestión de Problemas
                  </span>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      position: "relative",
                      padding: "0 8px",
                    }}
                  >
                    {/* Barra de progreso de fondo */}
                    <div
                      style={{
                        position: "absolute",
                        top: 13,
                        left: 24,
                        right: 24,
                        height: 3,
                        backgroundColor: "#e2e8f0",
                        zIndex: 1,
                      }}
                    />
                    {/* Barra de progreso completada hasta 'Bajo Investigación' (paso 3 de 7 = ~33%) */}
                    <div
                      style={{
                        position: "absolute",
                        top: 13,
                        left: 24,
                        width: "33%",
                        height: 3,
                        backgroundColor: "#2563eb",
                        zIndex: 2,
                      }}
                    />

                    {[
                      { num: 1, label: "Registrado", estado: "completado" },
                      { num: 2, label: "Asignado", estado: "completado" },
                      { num: 3, label: "Bajo Investigación", estado: "actual" },
                      { num: 4, label: "Causa Identificada", estado: "pendiente" },
                      { num: 5, label: "Solución Propuesta", estado: "pendiente" },
                      { num: 6, label: "Resuelto", estado: "pendiente" },
                      { num: 7, label: "Cerrado", estado: "pendiente" },
                    ].map((paso) => (
                      <div
                        key={paso.num}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          zIndex: 3,
                          width: 80,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            backgroundColor:
                              paso.estado === "actual"
                                ? "#2563eb"
                                : paso.estado === "completado"
                                ? "#16a34a"
                                : "#ffffff",
                            border:
                              paso.estado === "pendiente"
                                ? "2px solid #cbd5e1"
                                : paso.estado === "actual"
                                ? "2px solid #1d4ed8"
                                : "2px solid #16a34a",
                            color: paso.estado === "pendiente" ? "#94a3b8" : "#ffffff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            boxShadow: paso.estado === "actual" ? "0 0 0 3px rgba(37,99,235,0.2)" : "none",
                          }}
                        >
                          {paso.estado === "completado" ? "OK" : paso.num}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: paso.estado === "actual" ? 700 : 500,
                            color: paso.estado === "actual" ? "#1e40af" : "#64748b",
                            marginTop: 6,
                            lineHeight: 1.2,
                          }}
                        >
                          {paso.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tarjetas de Responsables */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Investigador Responsable
                    </span>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                      Ing. Roberto Sánchez
                    </strong>
                    <span style={{ fontSize: 11, color: "#2563eb" }}>
                      Mesa de Telecomunicaciones y Conectividad N3
                    </span>
                  </div>

                  <div
                    style={{
                      padding: 12,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                      Gestor del Problema (Registrador)
                    </span>
                    <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                      Carlos Mendoza
                    </strong>
                    <span style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>
                      Oficina de Gestión de Servicios TI
                    </span>
                  </div>
                </div>

                {/* Detalles Registrados del Problema */}
                <div
                  style={{
                    padding: 14,
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 10 }}>
                    Detalles Registrados en el Problema
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <div>
                      <span style={{ color: "#64748b" }}>Categoría ITIL:</span>{" "}
                      <strong>Redes y Telecomunicaciones &gt; Enlaces WAN</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Servicio de Negocio:</span>{" "}
                      <strong>SRV-WAN-001 (Red Corporativa)</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Activo CI CMDB:</span>{" "}
                      <strong>SW-CORE-CISCO-9300 (Switch Capa 3)</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Urgencia / Impacto:</span>{" "}
                      <strong>{urgencia === 3 ? "Alta" : urgencia === 2 ? "Media" : "Baja"} / {impacto === 3 ? "Alto" : impacto === 2 ? "Medio" : "Bajo"}</strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Prioridad Deducida por Matriz:</span>{" "}
                      <strong style={{ color: prioridadCalculada.color }}>
                        {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#64748b" }}>Incidentes Vinculados:</span>{" "}
                      <strong style={{ color: "#16a34a" }}>{incidentesVinculadosIds.length} incidentes vinculados</strong>
                    </div>

                    {/* Campos personalizados simulados en el ticket creado */}
                    {camposVisiblesEnSimulacion.map((c) => (
                      <div key={c.id_campo}>
                        <span style={{ color: "#64748b" }}>{c.etiqueta}:</span>{" "}
                        <strong style={{ color: "#0f172a" }}>
                          {c.tipo === "si_no" ? "Sí" : c.tipo === "lista" ? (c.propiedades?.opciones?.[0] || "Valor 1") : "Información registrada"}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workaround y Causa Raíz */}
                <div
                  style={{
                    padding: 14,
                    backgroundColor: "#ffffff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#334155", display: "block", marginBottom: 6 }}>
                    Workaround (Solución Temporal)
                  </span>
                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.4, fontSize: 12 }}>
                    Se habilitó temporalmente la ruta de contingencia por túnel IPsec secundario a través del proveedor B. La degradación de ancho de banda bajó al 12%.
                  </p>
                </div>

                {/* Evidencias Técnicas Registradas */}
                <div
                  style={{
                    padding: 12,
                    backgroundColor: "#f8fafc",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 11.5,
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                    Archivos y Evidencias Técnicas Adjuntas (2 archivos)
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        color: "#334155",
                      }}
                    >
                      captura_alerta_snmp_core.png (850 KB)
                    </span>
                    <span
                      style={{
                        padding: "3px 8px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: 4,
                        fontFamily: "monospace",
                        color: "#334155",
                      }}
                    >
                      dump_trazas_bgp.log (3.4 MB)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL PARA VINCULAR INCIDENTES ABIERTOS AL PROBLEMA */}
      {modalIncidentesAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e2e8f0",
              width: "100%",
              maxWidth: 720,
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Cabecera del modal */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  Vincular Incidentes Abiertos al Problema
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Seleccione uno o varios incidentes concurrentes para asociarlos a la investigación del problema.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalIncidentesAbierto(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  color: "#94a3b8",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Buscador y filtro por servicio */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                gap: 10,
                backgroundColor: "#ffffff",
              }}
            >
              <input
                type="text"
                placeholder="Buscar por código (#INC-...) o título del incidente..."
                value={busquedaIncidente}
                onChange={(e) => setBusquedaIncidente(e.target.value)}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  fontSize: 12.5,
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                }}
              />
              <select
                value={filtroServicioInc}
                onChange={(e) => setFiltroServicioInc(e.target.value)}
                style={{
                  padding: "7px 10px",
                  fontSize: 12,
                  border: "1px solid #cbd5e1",
                  borderRadius: 6,
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="todos">Todos los servicios</option>
                <option value="SRV-WAN-001">SRV-WAN-001 (Enlace WAN Principal)</option>
                <option value="SRV-ERP-002">SRV-ERP-002 (SAP Financiero)</option>
                <option value="SRV-AUTH-003">SRV-AUTH-003 (SSO / Directorio Activo)</option>
              </select>
            </div>

            {/* Tabla de incidentes disponibles */}
            <div style={{ padding: 16, overflowY: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", textAlign: "left" }}>
                    <th style={{ padding: "8px 10px", width: 40 }}>Sel.</th>
                    <th style={{ padding: "8px 10px" }}>Código</th>
                    <th style={{ padding: "8px 10px" }}>Título del Incidente</th>
                    <th style={{ padding: "8px 10px" }}>Servicio</th>
                    <th style={{ padding: "8px 10px" }}>Prioridad</th>
                    <th style={{ padding: "8px 10px" }}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {incidentesFiltrados.map((inc) => {
                    const estaSeleccionado = incidentesVinculadosIds.includes(inc.id);
                    return (
                      <tr
                        key={inc.id}
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          backgroundColor: estaSeleccionado ? "#f0fdf4" : "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (estaSeleccionado) {
                            setIncidentesVinculadosIds((prev) => prev.filter((id) => id !== inc.id));
                          } else {
                            setIncidentesVinculadosIds((prev) => [...prev, inc.id]);
                          }
                        }}
                      >
                        <td style={{ padding: "8px 10px" }}>
                          <input
                            type="checkbox"
                            checked={estaSeleccionado}
                            onChange={() => {}}
                            style={{ width: 16, height: 16, accentColor: "#16a34a", cursor: "pointer" }}
                          />
                        </td>
                        <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 700, color: "#1e40af" }}>
                          #{inc.codigo}
                        </td>
                        <td style={{ padding: "8px 10px", color: "#0f172a", fontWeight: 500 }}>
                          {inc.titulo}
                        </td>
                        <td style={{ padding: "8px 10px", color: "#64748b" }}>
                          {inc.servicio_nombre}
                        </td>
                        <td style={{ padding: "8px 10px" }}>
                          <span
                            style={{
                              padding: "2px 6px",
                              borderRadius: 4,
                              fontSize: 10.5,
                              fontWeight: 600,
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                            }}
                          >
                            {inc.prioridad}
                          </span>
                        </td>
                        <td style={{ padding: "8px 10px", color: "#16a34a", fontWeight: 600 }}>
                          {inc.estado}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pie del modal */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 12, color: "#475569" }}>
                <strong>{incidentesVinculadosIds.length}</strong> incidentes seleccionados para asociar al problema
              </span>
              <button
                type="button"
                onClick={() => setModalIncidentesAbierto(false)}
                style={{
                  padding: "7px 18px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  cursor: "pointer",
                }}
              >
                Confirmar y Guardar Selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASISTENTE MODAL FLOTANTE DE 5 PASOS PARA CREAR NUEVO CAMPO PERSONALIZADO */}
      {asistenteAbierto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 12,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              border: "1px solid #e2e8f0",
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Cabecera del Modal */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                  Asistente: Nuevo Campo Personalizado
                </h3>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Paso {pasoAsistente} de 5:{" "}
                  {pasoAsistente === 1 && "Selección de tipo de dato"}
                  {pasoAsistente === 2 && "Identificación y etiquetas"}
                  {pasoAsistente === 3 && "Propiedades según tipo"}
                  {pasoAsistente === 4 && "Severidad técnica y reglas"}
                  {pasoAsistente === 5 && "Resumen y confirmación"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAsistenteAbierto(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  color: "#94a3b8",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Barra de Progreso de 5 Pasos */}
            <div style={{ display: "flex", backgroundColor: "#f1f5f9", height: 4 }}>
              {[1, 2, 3, 4, 5].map((p) => (
                <div
                  key={p}
                  style={{
                    flex: 1,
                    backgroundColor: p <= pasoAsistente ? "#2563eb" : "#e2e8f0",
                    transition: "background-color 0.2s ease",
                  }}
                />
              ))}
            </div>

            {/* Cuerpo del Asistente */}
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
              {errorAsistente && (
                <div className="mensaje-error" style={{ marginBottom: 14 }}>
                  {errorAsistente}
                </div>
              )}

              {/* PASO 1: SELECCIÓN DE TIPO DE CONTROL */}
              {pasoAsistente === 1 && (
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 10 }}>
                    Seleccione el tipo de dato o control para el campo:
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      maxHeight: 380,
                      overflowY: "auto",
                      paddingRight: 4,
                    }}
                  >
                    {TIPOS_CAMPO_DISPONIBLES.map((t) => {
                      const sel = nuevoTipo === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setNuevoTipo(t.id)}
                          style={{
                            padding: "9px 12px",
                            borderRadius: 8,
                            border: `1.5px solid ${sel ? "#2563eb" : "#e2e8f0"}`,
                            backgroundColor: sel ? "#eff6ff" : "#ffffff",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: sel ? "#1d4ed8" : "#0f172a" }}>
                            {t.nombre}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* PASO 2: IDENTIFICACIÓN DEL CAMPO */}
              {pasoAsistente === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Etiqueta o Nombre del Campo *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Costo Estimado de Indisponibilidad"
                      value={nuevaEtiqueta}
                      onChange={(e) => handleEtiquetaChange(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 13,
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                      }}
                      autoFocus
                    />
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                      Nombre que visualizarán los especialistas técnicos en el problema.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Código Técnico Sugerido (Inmutable) *
                    </label>
                    <input
                      type="text"
                      value={nuevoCodigo}
                      onChange={(e) => setNuevoCodigo(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 12.5,
                        fontFamily: "monospace",
                        backgroundColor: "#f8fafc",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                      }}
                    />
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                      Identificador de base de datos con prefijo normativo cf_.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Descripción Breve / Texto de Ayuda
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Valor aproximado de impacto financiero durante el análisis de causa..."
                      value={nuevaDescripcion}
                      onChange={(e) => setNuevaDescripcion(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 12.5,
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* PASO 3: PROPIEDADES SEGÚN TIPO */}
              {pasoAsistente === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {nuevoTipo.includes("lista") || nuevoTipo.includes("seleccion") ? (
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Opciones de la Lista (una opción por cada línea) *
                      </label>
                      <textarea
                        rows={6}
                        value={nuevasOpciones}
                        onChange={(e) => setNuevasOpciones(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: 12.5,
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                        Escriba cada elemento seleccionable en un renglón independiente.
                      </span>
                    </div>
                  ) : nuevoTipo.includes("numero") ? (
                    <div>
                      <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        Unidad de Medida (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. USD, Horas, %, MB"
                        value={nuevaUnidad}
                        onChange={(e) => setNuevaUnidad(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: 12.5,
                          borderRadius: 6,
                          border: "1px solid #cbd5e1",
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13, backgroundColor: "#f8fafc", borderRadius: 8 }}>
                      El tipo de control <strong>{nuevoTipo}</strong> no requiere propiedades adicionales. Puede continuar al siguiente paso.
                    </div>
                  )}
                </div>
              )}

              {/* PASO 4: REGLAS Y PRIORIDAD MÍNIMA DEL PROBLEMA */}
              {pasoAsistente === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Habilitado y Obligatorio */}
                  <div style={{ display: "flex", gap: 20 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={nuevoHabilitado}
                        onChange={(e) => setNuevoHabilitado(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                      />
                      Habilitar campo al crear
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={nuevoObligatorio}
                        onChange={(e) => setNuevoObligatorio(e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                      />
                      Obligatorio al registrar
                    </label>
                  </div>

                  {/* Prioridad mínima del problema */}
                  <div>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Severidad / Prioridad Mínima del Problema para Exigir este Campo *
                    </label>
                    <select
                      value={nuevaPrioridadMinima}
                      onChange={(e) => setNuevaPrioridadMinima(parseInt(e.target.value, 10))}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: 12.5,
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                      }}
                    >
                      <option value={5}>Para todas las prioridades del problema (P1 a P5)</option>
                      <option value={4}>Exclusivo para severidad P4 a P1 (Mínimo Baja)</option>
                      <option value={3}>Exclusivo para severidad P3 a P1 (Mínimo Media)</option>
                      <option value={2}>Exclusivo para severidad P2 y P1 (Alta y Crítica)</option>
                      <option value={1}>Exclusivo para severidad P1 (Solo Problemas Críticos / Mayores)</option>
                    </select>
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                      En Gestión de Problemas y Cambios, los campos condicionales dependen de la severidad del ticket (P1 a P5), no del perfil del usuario.
                    </span>
                  </div>
                </div>
              )}

              {/* PASO 5: RESUMEN Y CONFIRMACIÓN */}
              {pasoAsistente === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: 14, backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div><span style={{ color: "#64748b" }}>Etiqueta:</span> <strong>{nuevaEtiqueta}</strong></div>
                      <div><span style={{ color: "#64748b" }}>Código:</span> <code style={{ color: "#2563eb" }}>{nuevoCodigo}</code></div>
                      <div><span style={{ color: "#64748b" }}>Tipo:</span> <strong>{nuevoTipo}</strong></div>
                      <div><span style={{ color: "#64748b" }}>Estado:</span> <strong>{nuevoHabilitado ? "Habilitado" : "Inactivo"}</strong></div>
                      <div><span style={{ color: "#64748b" }}>Obligatorio:</span> <strong>{nuevoObligatorio ? "Sí" : "No"}</strong></div>
                      <div><span style={{ color: "#64748b" }}>Severidad Mínima:</span> <strong>Prioridad Nivel {nuevaPrioridadMinima}</strong></div>
                    </div>
                  </div>

                  {/* Vista Previa del Control */}
                  <div style={{ padding: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #cbd5e1" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 6 }}>
                      VISTA PREVIA DEL CONTROL EN EL FORMULARIO
                    </span>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      {nuevaEtiqueta} {nuevoObligatorio && <span style={{ color: "#dc2626" }}>*</span>}
                    </label>

                    {nuevoTipo.includes("lista") ? (
                      <select style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #cbd5e1" }}>
                        <option>Seleccione una opción...</option>
                        {nuevasOpciones.split("\n").map((o, idx) => (
                          <option key={idx}>{o.trim()}</option>
                        ))}
                      </select>
                    ) : nuevoTipo === "texto_largo" ? (
                      <textarea rows={2} placeholder="Texto de prueba..." style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #cbd5e1" }} />
                    ) : nuevoTipo === "si_no" ? (
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <input type="checkbox" /> Confirmar
                      </label>
                    ) : (
                      <input type="text" placeholder={`Ingrese ${nuevaEtiqueta.toLowerCase()}...`} style={{ width: "100%", padding: "7px 10px", fontSize: 12, borderRadius: 6, border: "1px solid #cbd5e1" }} />
                    )}
                    {nuevaDescripcion && (
                      <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                        {nuevaDescripcion}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Pie del Asistente con Botones de Navegación */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
              }}
            >
              <button
                type="button"
                onClick={() => setAsistenteAbierto(false)}
                style={{
                  padding: "7px 14px",
                  fontSize: 12.5,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#ffffff",
                  color: "#475569",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>

              <div style={{ display: "flex", gap: 8 }}>
                {pasoAsistente > 1 && (
                  <button
                    type="button"
                    onClick={() => setPasoAsistente(pasoAsistente - 1)}
                    disabled={creandoCampo}
                    style={{
                      padding: "7px 14px",
                      fontSize: 12.5,
                      borderRadius: 6,
                      border: "1px solid #cbd5e1",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      cursor: "pointer",
                    }}
                  >
                    Atrás
                  </button>
                )}

                {pasoAsistente < 5 ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (pasoAsistente === 2 && (!nuevaEtiqueta.trim() || !nuevoCodigo.trim())) {
                        setErrorAsistente("La etiqueta y el código son obligatorios.");
                        return;
                      }
                      setErrorAsistente("");
                      setPasoAsistente(pasoAsistente + 1);
                    }}
                    style={{
                      padding: "7px 16px",
                      fontSize: 12.5,
                      fontWeight: 600,
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#2563eb",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCrearCampoSubmit}
                    disabled={creandoCampo}
                    style={{
                      padding: "7px 18px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      borderRadius: 6,
                      border: "none",
                      backgroundColor: "#16a34a",
                      color: "#ffffff",
                      cursor: creandoCampo ? "not-allowed" : "pointer",
                    }}
                  >
                    {creandoCampo ? "Creando..." : "Crear Campo Personalizado"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
