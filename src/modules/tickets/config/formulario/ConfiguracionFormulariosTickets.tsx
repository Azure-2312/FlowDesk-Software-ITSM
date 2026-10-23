"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface PrioridadUsuario {
  id: number;
  nombre: string;
  codigo: string;
  color: string;
  bg: string;
}

const NIVELES_PRIORIDAD_USUARIO: PrioridadUsuario[] = [
  { id: 1, nombre: "Prioridad VIP", codigo: "VIP", color: "#7c3aed", bg: "#f3e8ff" },
  { id: 2, nombre: "Prioridad Ejecutiva", codigo: "EJE", color: "#2563eb", bg: "#eff6ff" },
  { id: 3, nombre: "Prioridad Preferente", codigo: "PREF", color: "#0891b2", bg: "#ecfeff" },
  { id: 4, nombre: "Prioridad Operativa", codigo: "OPE", color: "#059669", bg: "#ecfdf5" },
  { id: 5, nombre: "Prioridad Estándar", codigo: "EST", color: "#475569", bg: "#f1f5f9" },
];

interface CampoFormulario {
  id: string;
  etiqueta: string;
  descripcion?: string;
  tipo: "texto" | "area" | "numero" | "fecha" | "lista" | "casilla";
  habilitado: boolean;
  obligatorio: boolean;
  prioridad_minima: number; // 1 (VIP) a 5 (Estándar)
  prioridades_visibles?: number[]; // Soporte retroactivo
  opciones?: string;
  ayuda?: string;
  es_personalizado?: boolean;
}

interface ServicioConSLA {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  sla_primera_respuesta: string;
  sla_solucion_definitiva: string;
  horario_cobertura: string;
  resumen_sla: string;
}

const SERVICIOS_SIMULADOS_INCIDENTE: ServicioConSLA[] = [
  {
    id: "srv-inc-1",
    codigo: "SRV-INC-RED-001",
    nombre: "Conectividad y Red Cableada Corporativa",
    categoria: "Redes y Telecomunicaciones",
    sla_primera_respuesta: "1 hora (Atención técnica inicial)",
    sla_solucion_definitiva: "4 horas hábiles (Restablecimiento operativo)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "1h Respuesta / 4h Solución",
  },
  {
    id: "srv-inc-2",
    codigo: "SRV-INC-SEC-002",
    nombre: "Incidente de Seguridad / Sospecha de Malware",
    categoria: "Ciberseguridad y Accesos",
    sla_primera_respuesta: "30 minutos (Atención crítica inmediata)",
    sla_solucion_definitiva: "2 horas (Aislamiento y contención)",
    horario_cobertura: "24x7 (Continuo institucional)",
    resumen_sla: "30m Respuesta / 2h Solución",
  },
  {
    id: "srv-inc-3",
    codigo: "SRV-INC-HW-003",
    nombre: "Falla de Hardware en Equipo de Cómputo",
    categoria: "Soporte Microinformático",
    sla_primera_respuesta: "2 horas (Inspección presencial)",
    sla_solucion_definitiva: "8 horas hábiles (Reparación o sustitución temporal)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "2h Respuesta / 8h Solución",
  },
  {
    id: "srv-inc-4",
    codigo: "SRV-INC-SW-004",
    nombre: "Error Crítico en Sistema ERP / Facturación",
    categoria: "Sistemas Institucionales",
    sla_primera_respuesta: "1.5 horas (Diagnóstico de mesa especializada N2)",
    sla_solucion_definitiva: "6 horas hábiles (Depuración y parche correctivo)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "1.5h Respuesta / 6h Solución",
  },
];

const SERVICIOS_SIMULADOS_SOLICITUD: ServicioConSLA[] = [
  {
    id: "srv-sol-1",
    codigo: "SRV-SOL-ACC-001",
    nombre: "Aprovisionamiento de Usuario y Correo Institucional",
    categoria: "Identidad y Accesos",
    sla_primera_respuesta: "2 horas (Validación de identidad y perfil)",
    sla_solucion_definitiva: "24 horas (Creación y entrega de credenciales)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "2h Confirmación / 24h Entrega",
  },
  {
    id: "srv-sol-2",
    codigo: "SRV-SOL-HW-002",
    nombre: "Asignación de Laptop Corporativa para Nuevo Ingreso",
    categoria: "Equipamiento y Activos",
    sla_primera_respuesta: "4 horas (Revisión de aprobación de jefatura)",
    sla_solucion_definitiva: "48 horas (Configuración e instalación física)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "4h Confirmación / 48h Despacho",
  },
  {
    id: "srv-sol-3",
    codigo: "SRV-SOL-SW-003",
    nombre: "Instalación de Software Especializado y Licencias",
    categoria: "Software y Productividad",
    sla_primera_respuesta: "2 horas (Comprobación de licencia disponible)",
    sla_solucion_definitiva: "12 horas (Despliegue e instalación remota)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "2h Confirmación / 12h Despliegue",
  },
  {
    id: "srv-sol-4",
    codigo: "SRV-SOL-PERM-004",
    nombre: "Modificación de Permisos en Carpetas Compartidas y VPN",
    categoria: "Redes y Accesos",
    sla_primera_respuesta: "1 hora (Verificación de matriz de accesos)",
    sla_solucion_definitiva: "8 horas (Aplicación en Directorio Activo)",
    horario_cobertura: "8x5 (Lunes a Viernes 08:00 - 18:00)",
    resumen_sla: "1h Confirmación / 8h Aplicación",
  },
];

const CAMPOS_INICIALES_INCIDENTE: CampoFormulario[] = [
  {
    id: "en_nombre_de_otro",
    etiqueta: "Registrar en nombre de otro usuario (Afectado)",
    descripcion: "Permite al solicitante registrar el incidente a nombre de un tercero o colaborador a su cargo.",
    tipo: "casilla",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 3, // Preferente o superior (1, 2, 3)
  },
  {
    id: "sede_atencion",
    etiqueta: "Sede o Ubicación Física de la Falla",
    descripcion: "Oficina, filial o piso exacto donde ocurre la incidencia para despacho presencial.",
    tipo: "lista",
    opciones: "Sede Central, Oficina Miraflores, Planta Industrial, Teletrabajo / Remoto",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 5, // Estándar (todos)
  },
  {
    id: "anexo_contacto_urgente",
    etiqueta: "Teléfono Móvil o Anexo de Contacto Urgente",
    descripcion: "Número telefónico directo del solicitante para coordinar el diagnóstico técnico inmediato.",
    tipo: "texto",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 5, // Estándar (todos)
  },
  {
    id: "centro_costos",
    etiqueta: "Centro de Costos / Proyecto Afectado",
    descripcion: "Identificador contable para registro y análisis de costos de mantenimiento y repuestos.",
    tipo: "texto",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 3, // Preferente o superior (1, 2, 3)
  },
];

const CAMPOS_INICIALES_SOLICITUD: CampoFormulario[] = [
  {
    id: "en_nombre_de_otro",
    etiqueta: "Registrar en nombre de otro usuario (Afectado / Beneficiario)",
    descripcion: "Permite registrar la solicitud de servicio para otro colaborador del departamento.",
    tipo: "casilla",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 3, // Preferente o superior (1, 2, 3)
  },
  {
    id: "sede_entrega",
    etiqueta: "Sede o Ubicación de Entrega del Recurso",
    descripcion: "Oficina física a la que debe enviarse el equipo o habilitarse el servicio provisto.",
    tipo: "lista",
    opciones: "Sede Central, Oficina Miraflores, Planta Industrial, Teletrabajo / Remoto",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 5, // Estándar (todos)
  },
  {
    id: "anexo_contacto_urgente",
    etiqueta: "Teléfono Móvil o Anexo de Contacto",
    descripcion: "Teléfono directo para coordinar la entrega física o validación remota del requerimiento.",
    tipo: "texto",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 5, // Estándar (todos)
  },
  {
    id: "centro_costos",
    etiqueta: "Centro de Costos / Aprobación Presupuestal",
    descripcion: "Código de área o centro de costos que asume el gasto o canon del servicio provisto.",
    tipo: "texto",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 3, // Preferente o superior (1, 2, 3)
  },
  {
    id: "modalidad_acceso",
    etiqueta: "Modalidad de Uso (Temporal o Definitivo)",
    descripcion: "Define si el acceso, licencia o equipo solicitado es por tiempo temporal o permanente.",
    tipo: "lista",
    opciones: "Permanente / Indefinido, Temporal (1 mes), Temporal (3 meses), Proyecto Especial",
    habilitado: true,
    obligatorio: false,
    prioridad_minima: 5, // Estándar (todos)
  },
];

function normalizarCampos(campos: CampoFormulario[]): CampoFormulario[] {
  return (campos || []).map((c) => {
    let prioridadMin = c.prioridad_minima;
    if (prioridadMin === undefined) {
      if (c.prioridades_visibles && c.prioridades_visibles.length > 0) {
        prioridadMin = Math.max(...c.prioridades_visibles);
      } else {
        prioridadMin = 5;
      }
    }
    return { ...c, prioridad_minima: prioridadMin };
  });
}

function ContenidoConfiguracionFormularios({ tipoFijo }: { tipoFijo?: "incidente" | "solicitud" } = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo");

  const tipoActual = useMemo(() => {
    if (tipoFijo) return tipoFijo;
    return tipoParam === "solicitud" ? "solicitud" : "incidente";
  }, [tipoParam, tipoFijo]);

  // Almacén general de campos por proceso (incidente / solicitud)
  const [camposPorProceso, setCamposPorProceso] = useState<Record<string, CampoFormulario[]>>({
    incidente: CAMPOS_INICIALES_INCIDENTE,
    solicitud: CAMPOS_INICIALES_SOLICITUD,
  });

  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de la Vista Previa (Derecha)
  const [vistaPreviaModo, setVistaPreviaModo] = useState<"formulario" | "ticket">("formulario");
  const [prioridadSimuladaId, setPrioridadSimuladaId] = useState<number>(5); // Estándar por defecto
  const [servicioSimuladoId, setServicioSimuladoId] = useState<string>("srv-inc-1");

  // Sincronizar servicio simulado al cambiar de tipo de proceso
  useEffect(() => {
    if (tipoActual === "incidente") {
      setServicioSimuladoId("srv-inc-1");
    } else {
      setServicioSimuladoId("srv-sol-1");
    }
  }, [tipoActual]);

  const serviciosDisponibles = useMemo(() => {
    return tipoActual === "incidente" ? SERVICIOS_SIMULADOS_INCIDENTE : SERVICIOS_SIMULADOS_SOLICITUD;
  }, [tipoActual]);

  const servicioSeleccionado = useMemo(() => {
    return serviciosDisponibles.find((s) => s.id === servicioSimuladoId) || serviciosDisponibles[0];
  }, [serviciosDisponibles, servicioSimuladoId]);

  // Formulario para Crear Nuevo Campo (Izquierda)
  const [nuevoCampoEtiqueta, setNuevoCampoEtiqueta] = useState("");
  const [nuevoCampoTipo, setNuevoCampoTipo] = useState<CampoFormulario["tipo"]>("texto");
  const [nuevoCampoOpciones, setNuevoCampoOpciones] = useState("");
  const [nuevoCampoDescripcion, setNuevoCampoDescripcion] = useState("");
  const [nuevoCampoHabilitado, setNuevoCampoHabilitado] = useState(true);
  const [nuevoCampoObligatorio, setNuevoCampoObligatorio] = useState(false);
  const [nuevoCampoPrioridadMinima, setNuevoCampoPrioridadMinima] = useState<number>(5); // Estándar por defecto (todos)

  // Cargar configuración guardada
  useEffect(() => {
    async function cargarConfiguracion() {
      setCargando(true);
      setError(null);
      try {
        const res = await fetch("/api/operacion/configuracion?clave=formularios_solicitante_config");
        const data = await res.json();
        if (data.configuracion?.valor) {
          const valor = data.configuracion.valor;
          setCamposPorProceso({
            incidente: normalizarCampos(valor.incidente || CAMPOS_INICIALES_INCIDENTE),
            solicitud: normalizarCampos(valor.solicitud || CAMPOS_INICIALES_SOLICITUD),
          });
        }
      } catch {
        setError("Error de conexión al cargar la configuración de campos.");
      } finally {
        setCargando(false);
      }
    }
    cargarConfiguracion();
  }, []);

  const camposActuales = camposPorProceso[tipoActual] || [];

  // Alternar propiedad booleana de un campo (habilitado u obligatorio)
  function togglePropiedadCampo(idCampo: string, propiedad: "habilitado" | "obligatorio") {
    setCamposPorProceso((prev) => {
      const lista = prev[tipoActual] || [];
      const actualizada = lista.map((c) =>
        c.id === idCampo ? { ...c, [propiedad]: !c[propiedad] } : c
      );
      return { ...prev, [tipoActual]: actualizada };
    });
  }

  // Cambiar la prioridad mínima requerida para ver el campo
  function cambiarPrioridadMinima(idCampo: string, nuevaPrioridadMinima: number) {
    setCamposPorProceso((prev) => {
      const lista = prev[tipoActual] || [];
      const actualizada = lista.map((c) =>
        c.id === idCampo ? { ...c, prioridad_minima: nuevaPrioridadMinima } : c
      );
      return { ...prev, [tipoActual]: actualizada };
    });
  }

  // Crear nuevo campo y agregarlo a la lista
  function agregarNuevoCampo(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoCampoEtiqueta.trim()) {
      alert("Ingrese una etiqueta válida para el campo.");
      return;
    }
    if (nuevoCampoTipo === "lista" && !nuevoCampoOpciones.trim()) {
      alert("Para campos de lista desplegable, especifique las opciones separadas por coma.");
      return;
    }

    const idGenerado = "c_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 5);
    const campoCreado: CampoFormulario = {
      id: idGenerado,
      etiqueta: nuevoCampoEtiqueta.trim(),
      descripcion: nuevoCampoDescripcion.trim() || undefined,
      tipo: nuevoCampoTipo,
      habilitado: nuevoCampoHabilitado,
      obligatorio: nuevoCampoObligatorio,
      prioridad_minima: nuevoCampoPrioridadMinima,
      opciones: nuevoCampoTipo === "lista" ? nuevoCampoOpciones.trim() : undefined,
      es_personalizado: true,
    };

    setCamposPorProceso((prev) => {
      const lista = prev[tipoActual] || [];
      return { ...prev, [tipoActual]: [...lista, campoCreado] };
    });

    // Resetear formulario de nuevo campo
    setNuevoCampoEtiqueta("");
    setNuevoCampoTipo("texto");
    setNuevoCampoOpciones("");
    setNuevoCampoDescripcion("");
    setNuevoCampoHabilitado(true);
    setNuevoCampoObligatorio(false);
    setNuevoCampoPrioridadMinima(5);
    setMensajeExito(`Campo "${campoCreado.etiqueta}" creado y añadido a la lista.`);
    setTimeout(() => setMensajeExito(null), 3000);
  }

  // Eliminar campo con confirmación previa (botón de tacho de basura)
  function eliminarCampo(idCampo: string, etiquetaCampo: string) {
    const confirmar = window.confirm(
      `¿Está seguro de que desea eliminar el campo "${etiquetaCampo}" de este formulario?`
    );
    if (!confirmar) return;

    setCamposPorProceso((prev) => {
      const lista = prev[tipoActual] || [];
      return { ...prev, [tipoActual]: lista.filter((c) => c.id !== idCampo) };
    });

    setMensajeExito(`Campo "${etiquetaCampo}" eliminado.`);
    setTimeout(() => setMensajeExito(null), 3500);
  }

  // Guardar configuración completa en el servidor
  async function guardarConfiguracion() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await fetch("/api/operacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave: "formularios_solicitante_config",
          valor: camposPorProceso,
          descripcion: "Configuración de visibilidad, obligatoriedad y prioridades de usuario para formularios y tickets de solicitantes",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la configuración.");
        return;
      }

      setMensajeExito("Configuración de formularios guardada exitosamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de red al guardar la configuración.");
    } finally {
      setGuardando(false);
    }
  }

  const prioridadSimulada = NIVELES_PRIORIDAD_USUARIO.find((p) => p.id === prioridadSimuladaId) || NIVELES_PRIORIDAD_USUARIO[4];

  // Filtro de campos visibles en la simulación: usuario puede ver el campo si su nivel es <= prioridad_minima (donde 1 es VIP y 5 es Estándar)
  const camposVisiblesEnSimulacion = useMemo(() => {
    return camposActuales.filter((c) => {
      if (!c.habilitado) return false;
      const minP = c.prioridad_minima ?? 5;
      return prioridadSimuladaId <= minP;
    });
  }, [camposActuales, prioridadSimuladaId]);

  // Saber si el solicitante simulado tiene permiso para ver comunicación técnica interna (como mínimo prioridad ejecutiva <= 2)
  const puedeVerComunicacionInterna = useMemo(() => {
    return prioridadSimuladaId <= 2;
  }, [prioridadSimuladaId]);

  // Saber si el solicitante simulado puede registrar en nombre de otro
  const puedeRegistrarEnNombreDeOtro = useMemo(() => {
    const campo = camposActuales.find((c) => c.id === "en_nombre_de_otro");
    if (!campo || !campo.habilitado) return false;
    const minP = campo.prioridad_minima ?? 3;
    return prioridadSimuladaId <= minP;
  }, [camposActuales, prioridadSimuladaId]);

  if (cargando) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "#64748b" }}>
        Cargando configuración institucional de formularios y campos...
      </div>
    );
  }

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal */}
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
              Configuración de Formulario: {tipoActual === "incidente" ? "Incidentes" : "Solicitudes de Servicio"}
            </h1>
            <p className="subtitulo" style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>
              {tipoActual === "incidente"
                ? "Defina los campos y permisos visibles para el usuario solicitante en el reporte de incidencias y fallas técnicas según su nivel de prioridad institucional. Los roles técnicos y de supervisión visualizan el ticket íntegro."
                : "Defina los campos y permisos visibles para el usuario solicitante en el requerimiento de servicios, accesos o equipamiento según su nivel de prioridad institucional. Los roles técnicos y de supervisión visualizan el ticket íntegro."}
            </p>
          </div>
        </div>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* PANTALLA DIVIDIDA: IZQUIERDA (CONFIGURACIÓN) / DERECHA (VISTAS PREVIAS) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* COLUMNA IZQUIERDA: CREAR CAMPOS Y LISTA DE CAMPOS COMPACTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* SECCIÓN 1: CREAR NUEVO CAMPO */}
          <div className="tarjeta" style={{ padding: 20, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#0f172a" }}>
                Crear Nuevo Campo para {tipoActual === "incidente" ? "Incidentes" : "Solicitudes"}
              </h2>
              <p style={{ margin: "2px 0 0 0", fontSize: 12, color: "#64748b" }}>
                Incorpore atributos personalizados para captura de información técnica u operativa.
              </p>
            </div>

            <form onSubmit={agregarNuevoCampo} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                <div className="campo">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Etiqueta del Campo *</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Ej. Código de Inventario, Aplicación Afectada..."
                    value={nuevoCampoEtiqueta}
                    onChange={(e) => setNuevoCampoEtiqueta(e.target.value)}
                    required
                  />
                </div>

                <div className="campo">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Tipo de Dato *</label>
                  <select
                    className="input-base"
                    value={nuevoCampoTipo}
                    onChange={(e) => setNuevoCampoTipo(e.target.value as any)}
                    style={{ backgroundColor: "white", fontSize: 12.5 }}
                  >
                    <option value="texto">Texto Corto</option>
                    <option value="area">Texto Multilínea</option>
                    <option value="numero">Numérico</option>
                    <option value="fecha">Fecha</option>
                    <option value="lista">Lista Desplegable</option>
                    <option value="casilla">Casilla (Sí/No)</option>
                  </select>
                </div>
              </div>

              {nuevoCampoTipo === "lista" && (
                <div className="campo">
                  <label style={{ fontSize: 12, fontWeight: 600 }}>Opciones de la lista (separadas por coma) *</label>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="Opción A, Opción B, Opción C"
                    value={nuevoCampoOpciones}
                    onChange={(e) => setNuevoCampoOpciones(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="campo">
                <label style={{ fontSize: 12, fontWeight: 600 }}>Descripción / Instrucción de Ayuda</label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="Texto explicativo para orientar al solicitante..."
                  value={nuevoCampoDescripcion}
                  onChange={(e) => setNuevoCampoDescripcion(e.target.value)}
                />
              </div>

              {/* Opciones de Estado y Obligatoriedad */}
              <div style={{ display: "flex", gap: 20, padding: "8px 12px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", fontWeight: 600, color: "#1e293b" }}>
                  <input
                    type="checkbox"
                    checked={nuevoCampoHabilitado}
                    onChange={(e) => setNuevoCampoHabilitado(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                  />
                  Habilitado
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, cursor: "pointer", fontWeight: 600, color: "#1e293b" }}>
                  <input
                    type="checkbox"
                    checked={nuevoCampoObligatorio}
                    onChange={(e) => setNuevoCampoObligatorio(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "#2563eb" }}
                  />
                  Obligatorio al registrar
                </label>
              </div>

              {/* Selector de Prioridad Mínima Requerida */}
              <div className="campo">
                <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>
                  Prioridad mínima requerida para visualizar este campo *
                </label>
                <select
                  className="input-base"
                  value={nuevoCampoPrioridadMinima}
                  onChange={(e) => setNuevoCampoPrioridadMinima(parseInt(e.target.value, 10))}
                  style={{ backgroundColor: "white", fontSize: 12.5 }}
                >
                  <option value={5}>Prioridad Estándar (Todos los usuarios pueden verlo)</option>
                  <option value={4}>Prioridad Operativa (Operativa, Preferente, Ejecutiva y VIP)</option>
                  <option value={3}>Prioridad Preferente (Jefaturas, Gerencias y VIP)</option>
                  <option value={2}>Prioridad Ejecutiva (Solo Gerencias y VIP)</option>
                  <option value={1}>Prioridad VIP (Exclusivo para usuarios con Prioridad VIP)</option>
                </select>
                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                  Los usuarios con igual o mayor nivel institucional de prioridad tendrán acceso a este campo en el formulario.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                <button
                  type="submit"
                  className="boton-primario"
                  style={{ width: "auto", padding: "7px 18px", fontSize: 12.5 }}
                >
                  Crear campo
                </button>
              </div>
            </form>
          </div>

          {/* SECCIÓN 2: LISTA DE CAMPOS COMPACTA EN FILAS SIMPLES */}
          <div className="tarjeta" style={{ padding: 20, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}>
            <div style={{ marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>
                Lista de Campos Creados y Elementos del Formulario
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                Cada campo se configura directamente en su fila: habilite el check, defina si es obligatorio u opcional, elija la prioridad mínima requerida y use el tacho de basura para eliminarlo.
              </p>
            </div>

            {camposActuales.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px dashed #cbd5e1", color: "#64748b", fontSize: 13 }}>
                No hay campos configurados para este proceso. Incorpore nuevos campos utilizando el formulario superior.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {camposActuales.map((campo) => {
                  const prioridadMin = campo.prioridad_minima ?? 5;
                  return (
                    <div
                      key={campo.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: `1px solid ${campo.habilitado ? "#cbd5e1" : "#e2e8f0"}`,
                        backgroundColor: campo.habilitado ? "#ffffff" : "#f8fafc",
                        boxShadow: campo.habilitado ? "0 1px 2px rgba(0,0,0,0.02)" : "none",
                        gap: 10,
                        opacity: campo.habilitado ? 1 : 0.65,
                        transition: "all 0.15s ease",
                      }}
                    >
                      {/* 1. Nombre y debajo descripción breve */}
                      <div style={{ flex: 1, minWidth: 160 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 13, color: "#0f172a" }}>
                            {campo.etiqueta}
                          </strong>
                          <span style={{ fontSize: 10.5, padding: "1px 5px", borderRadius: 4, backgroundColor: "#f1f5f9", color: "#475569", fontWeight: 600 }}>
                            {campo.tipo}
                          </span>
                          {campo.es_personalizado && (
                            <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 4, backgroundColor: "#eff6ff", color: "#2563eb", fontWeight: 700 }}>
                              Personalizado
                            </span>
                          )}
                        </div>
                        {campo.descripcion && (
                          <div
                            style={{
                              fontSize: 11.5,
                              color: "#64748b",
                              marginTop: 2,
                              lineHeight: 1.3,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: 320,
                            }}
                            title={campo.descripcion}
                          >
                            {campo.descripcion}
                          </div>
                        )}
                      </div>

                      {/* 2. Check para habilitarlo */}
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          color: campo.habilitado ? "#1e40af" : "#94a3b8",
                          userSelect: "none",
                          whiteSpace: "nowrap",
                        }}
                        title={campo.habilitado ? "Campo habilitado para el solicitante" : "Campo deshabilitado"}
                      >
                        <input
                          type="checkbox"
                          checked={campo.habilitado}
                          onChange={() => togglePropiedadCampo(campo.id, "habilitado")}
                          style={{ width: 16, height: 16, accentColor: "#2563eb", cursor: "pointer" }}
                        />
                        <span>{campo.habilitado ? "Habilitado" : "Inactivo"}</span>
                      </label>

                      {/* 3. Botón de obligatorio u opcional */}
                      <button
                        type="button"
                        disabled={!campo.habilitado}
                        onClick={() => togglePropiedadCampo(campo.id, "obligatorio")}
                        style={{
                          border: `1px solid ${campo.obligatorio ? "#fca5a5" : "#cbd5e1"}`,
                          backgroundColor: !campo.habilitado ? "#f1f5f9" : campo.obligatorio ? "#fef2f2" : "#ffffff",
                          color: !campo.habilitado ? "#94a3b8" : campo.obligatorio ? "#dc2626" : "#475569",
                          padding: "4px 10px",
                          borderRadius: 6,
                          fontSize: 11.5,
                          fontWeight: 600,
                          cursor: campo.habilitado ? "pointer" : "not-allowed",
                          whiteSpace: "nowrap",
                          transition: "all 0.15s ease",
                        }}
                        title="Haga clic para alternar entre obligatorio y opcional"
                      >
                        {campo.obligatorio ? "Obligatorio" : "Opcional"}
                      </button>

                      {/* 4. Lista desplegable con las prioridades para escoger la mínima requerida */}
                      <select
                        className="input-base"
                        disabled={!campo.habilitado}
                        value={prioridadMin}
                        onChange={(e) => cambiarPrioridadMinima(campo.id, parseInt(e.target.value, 10))}
                        style={{
                          fontSize: 11.5,
                          padding: "3px 8px",
                          height: 30,
                          backgroundColor: campo.habilitado ? "#ffffff" : "#f1f5f9",
                          cursor: campo.habilitado ? "pointer" : "not-allowed",
                          maxWidth: 180,
                        }}
                        title="Prioridad mínima requerida del solicitante para ver este campo"
                      >
                        <option value={5}>Mínimo: Estándar (Todos)</option>
                        <option value={4}>Mínimo: Operativa o sup.</option>
                        <option value={3}>Mínimo: Preferente (Jefes)</option>
                        <option value={2}>Mínimo: Ejecutiva (Gerentes)</option>
                        <option value={1}>Solo VIP</option>
                      </select>

                      {/* 5. Botón de tacho de basura para borrar */}
                      <button
                        type="button"
                        onClick={() => eliminarCampo(campo.id, campo.etiqueta)}
                        style={{
                          background: "#fef2f2",
                          border: "1px solid #fecaca",
                          color: "#dc2626",
                          padding: "5px 8px",
                          borderRadius: 6,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.15s ease",
                        }}
                        title={`Eliminar campo "${campo.etiqueta}"`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* BOTÓN DE GUARDAR AL FONDO DE TODA LA CONFIGURACIÓN */}
          <div
            style={{
              paddingTop: 16,
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              className="boton-primario"
              onClick={guardarConfiguracion}
              disabled={guardando}
              style={{
                width: "100%",
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: "#2563eb",
                borderRadius: 8,
              }}
            >
              {guardando ? "Guardando Configuración..." : "Guardar Configuración de Formularios y Campos"}
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: VISTAS PREVIAS INTERACTIVAS */}
        <div style={{ position: "sticky", top: 20 }}>
          <div
            className="tarjeta"
            style={{
              padding: 20,
              backgroundColor: "#ffffff",
              border: "2px solid #3b82f6",
              borderRadius: 10,
              boxShadow: "0 4px 14px rgba(59, 130, 246, 0.08)",
            }}
          >
            {/* DOS BOTONES EN LA PARTE SUPERIOR DE LA VISTA PREVIA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10, borderBottom: "1px solid #e2e8f0", paddingBottom: 12 }}>
              <div style={{ display: "flex", gap: 6, backgroundColor: "#f1f5f9", padding: 3, borderRadius: 8 }}>
                <button
                  type="button"
                  onClick={() => setVistaPreviaModo("formulario")}
                  style={{
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: vistaPreviaModo === "formulario" ? "#2563eb" : "transparent",
                    color: vistaPreviaModo === "formulario" ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease",
                  }}
                >
                  Vista de Formulario
                </button>
                <button
                  type="button"
                  onClick={() => setVistaPreviaModo("ticket")}
                  style={{
                    border: "none",
                    padding: "7px 14px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: vistaPreviaModo === "ticket" ? "#2563eb" : "transparent",
                    color: vistaPreviaModo === "ticket" ? "#ffffff" : "#475569",
                    transition: "all 0.15s ease",
                  }}
                >
                  Vista de Ticket Creado
                </button>
              </div>

              <span style={{ fontSize: 11.5, color: "#64748b", fontFamily: "monospace", fontWeight: 600 }}>
                {tipoActual === "incidente" ? "INCIDENTE" : "SOLICITUD"}
              </span>
            </div>

            {/* SIMULADOR DE PRIORIDAD DEL SOLICITANTE */}
            <div style={{ marginBottom: 16, padding: "10px 12px", backgroundColor: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: "#1e293b" }}>
                  Simular visualización como solicitante con:
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: prioridadSimulada.bg,
                    color: prioridadSimulada.color,
                  }}
                >
                  {prioridadSimulada.nombre}
                </span>
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                {NIVELES_PRIORIDAD_USUARIO.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPrioridadSimuladaId(p.id)}
                    style={{
                      border: `1px solid ${prioridadSimuladaId === p.id ? p.color : "#cbd5e1"}`,
                      backgroundColor: prioridadSimuladaId === p.id ? p.color : "#ffffff",
                      color: prioridadSimuladaId === p.id ? "#ffffff" : "#475569",
                      padding: "3px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {p.codigo} - {p.nombre.replace("Prioridad ", "")}
                  </button>
                ))}
              </div>

              {/* Selector de servicio para el entorno de simulación */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 6, borderTop: "1px dashed #cbd5e1", flexWrap: "wrap" }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569" }}>
                  Servicio simulado:
                </label>
                <select
                  value={servicioSeleccionado.id}
                  onChange={(e) => setServicioSimuladoId(e.target.value)}
                  style={{
                    fontSize: 11.5,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid #cbd5e1",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    flex: 1,
                    maxWidth: 380,
                  }}
                >
                  {serviciosDisponibles.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.codigo} · {srv.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CONTENIDO 1: VISTA DE FORMULARIO DE REGISTRO */}
            {vistaPreviaModo === "formulario" && (
              <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden", backgroundColor: "#f8fafc" }}>
                {/* Cabecera del Formulario */}
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
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                      {tipoActual === "incidente" ? "Reportar Nuevo Incidente Técnico" : "Registrar Nueva Solicitud de Servicio"}
                    </h4>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>
                      Formulario oficial visto por {prioridadSimulada.nombre}
                    </span>
                  </div>
                  <span className="badge-itil" style={{ backgroundColor: "#1e3a8a", color: "#bfdbfe", fontSize: 11 }}>
                    Nuevo Registro
                  </span>
                </div>

                {/* Banner de Modo Vista Previa */}
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    borderBottom: "1px solid #fef3c7",
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11.5,
                    color: "#92400e",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
                    <span>Vista previa del formulario: Controles y botones demostrativos no operativos.</span>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#b45309", fontWeight: 700, textTransform: "uppercase" }}>
                    Solo Lectura
                  </span>
                </div>

                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Si tiene habilitado registrar en nombre de otro usuario */}
                  {puedeRegistrarEnNombreDeOtro && (
                    <div style={{ padding: 10, backgroundColor: "#eff6ff", borderRadius: 6, border: "1px solid #bfdbfe" }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#1e40af", display: "block", marginBottom: 4 }}>
                        Registrar en nombre de otro usuario (Afectado)
                      </label>
                      <select className="input-base" style={{ backgroundColor: "#f1f5f9", fontSize: 12.5, cursor: "not-allowed" }} disabled tabIndex={-1}>
                        <option>Seleccione al colaborador afectado (ej. Carlos Mendoza - Contabilidad)...</option>
                      </select>
                    </div>
                  )}

                  {/* 1. Servicio de Catálogo Dinámico */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Servicio de Catálogo *
                    </label>
                    <select
                      className="input-base"
                      style={{ backgroundColor: "#f1f5f9", fontSize: 12.5, cursor: "not-allowed", border: "1px solid #cbd5e1", color: "#334155" }}
                      value={servicioSeleccionado.id}
                      disabled
                      tabIndex={-1}
                    >
                      <option value={servicioSeleccionado.id}>
                        {servicioSeleccionado.codigo} · {servicioSeleccionado.nombre}
                      </option>
                    </select>
                    <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                      Servicio simulado según la configuración seleccionada. Para alternar servicio, use el selector superior de simulación.
                    </span>
                  </div>

                  {/* 2. Acuerdos de Nivel de Servicio (SLAs Dinámicos como Campos Formales No Editables) */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        SLA Primera Respuesta Comprometido
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="input-base"
                        value={servicioSeleccionado.sla_primera_respuesta}
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#1e293b",
                          fontWeight: 600,
                          cursor: "not-allowed",
                          border: "1px solid #cbd5e1",
                          fontSize: 12,
                        }}
                      />
                      <span style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, display: "block" }}>
                        Tiempo normativo de primer contacto técnico.
                      </span>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                        SLA Solución Definitiva / Entrega
                      </label>
                      <input
                        type="text"
                        readOnly
                        className="input-base"
                        value={servicioSeleccionado.sla_solucion_definitiva}
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "#1e293b",
                          fontWeight: 600,
                          cursor: "not-allowed",
                          border: "1px solid #cbd5e1",
                          fontSize: 12,
                        }}
                      />
                      <span style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, display: "block" }}>
                        Tiempo normativo para restablecimiento o entrega.
                      </span>
                    </div>
                  </div>

                  {/* Metadatos normativos del SLA oficial */}
                  <div
                    style={{
                      padding: "8px 12px",
                      backgroundColor: "#f0fdf4",
                      borderRadius: 6,
                      border: "1px solid #bbf7d0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 11.5,
                    }}
                  >
                    <span style={{ color: "#166534", fontWeight: 600 }}>
                      Horario de Cobertura Catálogo: {servicioSeleccionado.horario_cobertura}
                    </span>
                    <span style={{ color: "#15803d", fontWeight: 700, fontFamily: "monospace" }}>
                      {servicioSeleccionado.resumen_sla}
                    </span>
                  </div>

                  {/* 3. Título del Ticket */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Título *
                    </label>
                    <input
                      type="text"
                      className="input-base"
                      placeholder={
                        tipoActual === "incidente"
                          ? "Resuma brevemente la falla (ej. Pérdida intermitente de enlace de red)..."
                          : "Resuma brevemente el requerimiento (ej. Solicitud de acceso a base de datos contable)..."
                      }
                      disabled
                      style={{ backgroundColor: "white", fontSize: 12.5 }}
                    />
                  </div>

                  {/* 4. Descripción con texto de fondo guía */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                      Descripción *
                    </label>
                    <textarea
                      className="input-base"
                      rows={4}
                      placeholder={
                        tipoActual === "incidente"
                          ? "Indique:\n1) Frecuencia de la falla: permanente, intermitente o puntual.\n2) Pasos previos que lo llevaron a la falla.\n3) Hora y tiempo de duración de la falla.\n4) Mensajes o códigos de error arrojados en pantalla..."
                          : "Detalle su requerimiento:\n1) Especificaciones técnicas del equipo o software requerido.\n2) Accesos, carpetas o permisos necesarios.\n3) Justificación operativa y modalidad de entrega..."
                      }
                      disabled
                      style={{ backgroundColor: "white", fontSize: 12 }}
                    />
                  </div>

                  {/* CAMPOS ESPECÍFICOS DE INCIDENTES: Urgencia, Impacto y Prioridad */}
                  {tipoActual === "incidente" && (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                            Nivel de Urgencia *
                          </label>
                          <select className="input-base" style={{ backgroundColor: "white", fontSize: 12.5 }} disabled>
                            <option>Media - Plazo estándar</option>
                            <option>Alta - Labor crítica detenida</option>
                            <option>Baja - Puede esperar</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                            Nivel de Impacto *
                          </label>
                          <select className="input-base" style={{ backgroundColor: "white", fontSize: 12.5 }} disabled>
                            <option>Media - Afecta un departamento</option>
                            <option>Alta - Afecta toda la entidad</option>
                            <option>Baja - Afecta a un solo usuario</option>
                          </select>
                        </div>
                      </div>

                      {/* Prioridad Calculada */}
                      <div
                        style={{
                          padding: "10px 14px",
                          backgroundColor: "#eff6ff",
                          borderRadius: 6,
                          border: "1px solid #bfdbfe",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: 12, color: "#1e40af", display: "block" }}>
                            Prioridad (Calculada Automáticamente por Urgencia e Impacto)
                          </strong>
                          <span style={{ fontSize: 11, color: "#3b82f6" }}>
                            Matriz institucional ITIL 4
                          </span>
                        </div>
                        <span
                          style={{
                            padding: "4px 10px",
                            backgroundColor: "#dbeafe",
                            color: "#1d4ed8",
                            borderRadius: 4,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          P3 - Media
                        </span>
                      </div>
                    </>
                  )}

                  {/* CAMPOS ESPECÍFICOS DE SOLICITUDES: Justificación y Fecha Límite Deseada */}
                  {tipoActual === "solicitud" && (
                    <>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          Justificación *
                        </label>
                        <textarea
                          className="input-base"
                          rows={2}
                          placeholder="Explique el motivo institucional o necesidad de negocio que sustenta esta solicitud..."
                          disabled
                          style={{ backgroundColor: "white", fontSize: 12 }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          Fecha Límite Deseada
                        </label>
                        <input
                          type="date"
                          className="input-base"
                          disabled
                          style={{ backgroundColor: "white", fontSize: 12.5 }}
                        />
                      </div>
                    </>
                  )}

                  {/* Elemento CMDB asignado al usuario solicitante */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                        Elemento CMDB (Ítems Tecnológicos Hardware / Software)
                      </label>
                      <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
                        Opcional
                      </span>
                    </div>
                    <select className="input-base" style={{ backgroundColor: "white", fontSize: 12.5 }} disabled>
                      <option>Seleccione un ítem asignado (o deje sin seleccionar si no está seguro)...</option>
                      <option>Hardware: LAPTOP-LENOVO-T14 (Serie: PF39X1 - En custodia del usuario)</option>
                      <option>Software: Licencia Microsoft 365 E3 (Asignada)</option>
                      <option>Periférico: Monitor Dell 24 P2419H (Activo: ACT-0042)</option>
                    </select>
                  </div>

                  {/* Campos adicionales habilitados para esta prioridad simulada */}
                  {camposVisiblesEnSimulacion
                    .filter((c) => c.id !== "en_nombre_de_otro")
                    .map((c) => (
                      <div key={c.id}>
                        <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                          {c.etiqueta} {c.obligatorio ? "*" : "(Opcional)"}
                        </label>
                        {c.tipo === "lista" ? (
                          <select className="input-base" style={{ backgroundColor: "white", fontSize: 12.5 }} disabled>
                            <option>Seleccione una opción...</option>
                            {(c.opciones || "").split(",").map((op, idx) => (
                              <option key={idx}>{op.trim()}</option>
                            ))}
                          </select>
                        ) : c.tipo === "area" ? (
                          <textarea className="input-base" rows={2} disabled style={{ backgroundColor: "white", fontSize: 12 }} />
                        ) : c.tipo === "casilla" ? (
                          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
                            <input type="checkbox" disabled />
                            <span>{c.descripcion || c.etiqueta}</span>
                          </label>
                        ) : (
                          <input type="text" className="input-base" placeholder={`Ingrese ${c.etiqueta.toLowerCase()}...`} disabled style={{ backgroundColor: "white", fontSize: 12.5 }} />
                        )}
                      </div>
                    ))}

                  {/* Carga de Evidencia de Archivos */}
                  <div
                    style={{
                      padding: 14,
                      backgroundColor: "#ffffff",
                      borderRadius: 8,
                      border: "2px dashed #cbd5e1",
                      textAlign: "center",
                    }}
                  >
                    <strong style={{ fontSize: 12.5, color: "#0f172a", display: "block" }}>
                      Carga de Evidencia de Archivos
                    </strong>
                    <span style={{ fontSize: 11, color: "#64748b", display: "block", marginTop: 2 }}>
                      Arrastre capturas de pantalla, archivos de error o documentos PDF de respaldo
                    </span>
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      title="Vista previa - Botón demostrativo no interactivo"
                      style={{
                        fontSize: 11.5,
                        padding: "5px 14px",
                        width: "auto",
                        marginTop: 8,
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#f1f5f9",
                        color: "#94a3b8",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }}
                    >
                      Seleccionar Archivos (Inactivo en vista previa)
                    </button>
                  </div>
                </div>

                {/* Pie del formulario (no funcional en vista previa) */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "12px 18px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    cursor: "not-allowed",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                    Botones no operativos (Modo vista previa)
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      title="Vista previa - Botón no interactivo"
                      style={{
                        width: "auto",
                        fontSize: 12.5,
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#f1f5f9",
                        color: "#94a3b8",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      title="Vista previa - Botón no interactivo"
                      style={{
                        width: "auto",
                        fontSize: 12.5,
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#e2e8f0",
                        color: "#64748b",
                        fontWeight: 700,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }}
                    >
                      {tipoActual === "incidente" ? "Registrar Incidente" : "Enviar Solicitud"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONTENIDO 2: VISTA DE TICKET CREADO (POST-REGISTRO) */}
            {vistaPreviaModo === "ticket" && (
              <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden", backgroundColor: "#f8fafc" }}>
                {/* Cabecera del Ticket */}
                <div
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#ffffff",
                    padding: "14px 18px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#60a5fa" }}>
                        {tipoActual === "incidente" ? "#INC-2026-0814" : "#SOL-2026-0422"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 4,
                          backgroundColor: prioridadSimulada.bg,
                          color: prioridadSimulada.color,
                        }}
                      >
                        {prioridadSimulada.nombre}
                      </span>
                    </div>
                    <span className="badge-itil" style={{ backgroundColor: "#1e3a8a", color: "#bfdbfe", fontSize: 11 }}>
                      {tipoActual === "incidente" ? "P2 - Alta" : `SLA: ${servicioSeleccionado.resumen_sla}`}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 4px 0", fontSize: 15, fontWeight: 700 }}>
                    {tipoActual === "incidente"
                      ? "Pérdida de conectividad intermitente en switch contable"
                      : "Aprovisionamiento de Laptop Corporativa para Nuevo Ingreso"}
                  </h3>
                  <div style={{ fontSize: 11.5, color: "#94a3b8" }}>
                    Servicio: {servicioSeleccionado.codigo} ({servicioSeleccionado.nombre}) - Creado hace 25 min
                  </div>
                </div>

                {/* Banner de Modo Vista Previa */}
                <div
                  style={{
                    backgroundColor: "#fffbeb",
                    borderBottom: "1px solid #fef3c7",
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: 11.5,
                    color: "#92400e",
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
                    <span>Vista previa de ticket creado: Acciones de gestión y datos demostrativos no operativos.</span>
                  </div>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, backgroundColor: "#fef3c7", color: "#b45309", fontWeight: 700, textTransform: "uppercase" }}>
                    Solo Lectura
                  </span>
                </div>

                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Línea de Tiempo de Estados ITIL (5 Puntos Secuenciales) */}
                  <div style={{ padding: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 12 }}>
                      Estado del {tipoActual === "incidente" ? "Incidente" : "Requerimiento"} (Línea de Tiempo Operativa)
                    </span>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
                      <div style={{ position: "absolute", top: 12, left: 18, right: 18, height: 3, backgroundColor: "#e2e8f0", zIndex: 1 }} />
                      <div style={{ position: "absolute", top: 12, left: 18, width: "25%", height: 3, backgroundColor: "#2563eb", zIndex: 2 }} />

                      {[
                        { num: 1, label: "Abierto", estado: "completado" },
                        { num: 2, label: "Asignado", estado: "actual" },
                        { num: 3, label: "En Pausa", estado: "pendiente" },
                        { num: 4, label: "Terminado", estado: "pendiente" },
                        { num: 5, label: "Cancelado", estado: "pendiente" },
                      ].map((paso) => (
                        <div key={paso.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 3 }}>
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              backgroundColor: paso.estado === "actual" ? "#2563eb" : paso.estado === "completado" ? "#16a34a" : "#ffffff",
                              border: paso.estado === "pendiente" ? "2px solid #cbd5e1" : "2px solid #2563eb",
                              color: paso.estado === "pendiente" ? "#94a3b8" : "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {paso.estado === "completado" ? "OK" : paso.num}
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: paso.estado === "actual" ? 700 : 500, color: paso.estado === "actual" ? "#1e40af" : "#64748b", marginTop: 4 }}>
                            {paso.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Espacio para Técnico Asignado y Datos del Solicitante */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                        Técnico Asignado
                      </span>
                      <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                        Ing. Roberto Sánchez
                      </strong>
                      <span style={{ fontSize: 11, color: "#2563eb" }}>Soporte N2 - Mesa de Redes</span>
                    </div>

                    <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                        Usuario Solicitante
                      </span>
                      <strong style={{ fontSize: 13, color: "#0f172a", display: "block", marginTop: 2 }}>
                        Carlos Mendoza
                      </strong>
                      <span style={{ fontSize: 11, color: prioridadSimulada.color, fontWeight: 600 }}>
                        {prioridadSimulada.nombre} (Contabilidad)
                      </span>
                    </div>
                  </div>

                  {/* En solicitudes: Beneficiario y Aprobador */}
                  {tipoActual === "solicitud" && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                          Usuario Beneficiario
                        </span>
                        <strong style={{ fontSize: 12.5, color: "#0f172a", display: "block", marginTop: 2 }}>
                          Ana Salazar (Mismo Departamento)
                        </strong>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Analista Contable Junior</span>
                      </div>

                      <div style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#64748b", display: "block" }}>
                          Aprobador Designado
                        </span>
                        <strong style={{ fontSize: 12.5, color: "#15803d", display: "block", marginTop: 2 }}>
                          Lic. Mariana Ramos - Aprobado
                        </strong>
                        <span style={{ fontSize: 11, color: "#64748b" }}>Jefatura de Finanzas y Control</span>
                      </div>
                    </div>
                  )}

                  {/* Resumen de Información Registrada del Formulario */}
                  <div style={{ padding: 14, backgroundColor: "#ffffff", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: "#475569", display: "block", marginBottom: 8 }}>
                      Detalles Registrados en el Ticket
                    </span>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <div>
                        <span style={{ color: "#64748b" }}>Elemento CMDB:</span> <strong>LAPTOP-LENOVO-T14</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Evidencias:</span> <strong>captura_error_red.png (1.1 MB)</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>Registrado en nombre de:</span>{" "}
                        <strong>{puedeRegistrarEnNombreDeOtro ? "Carlos Mendoza (Afectado)" : "No configurado"}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>SLA Respuesta:</span> <strong>{servicioSeleccionado.sla_primera_respuesta}</strong>
                      </div>
                      <div>
                        <span style={{ color: "#64748b" }}>SLA Solución:</span> <strong>{servicioSeleccionado.sla_solucion_definitiva}</strong>
                      </div>
                      {tipoActual === "incidente" ? (
                        <>
                          <div>
                            <span style={{ color: "#64748b" }}>Urgencia / Impacto:</span> <strong>Alta / Media</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Prioridad Deducida:</span> <strong style={{ color: "#2563eb" }}>P2 - Alta</strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span style={{ color: "#64748b" }}>Justificación:</span> <strong>Ingreso de nuevo personal</strong>
                          </div>
                          <div>
                            <span style={{ color: "#64748b" }}>Fecha Límite:</span> <strong>15/10/2026</strong>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* DESCRIPCIÓN DEL REPORTE */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: 14,
                    }}
                  >
                    <span style={{ display: "block", color: "#64748b", fontSize: 11.5, fontWeight: 700, marginBottom: 6 }}>
                      DESCRIPCIÓN DEL REPORTE
                    </span>
                    <div
                      style={{
                        backgroundColor: "#f8fafc",
                        padding: 12,
                        borderRadius: 6,
                        border: "1px solid #e2e8f0",
                        fontSize: 12.5,
                        lineHeight: 1.55,
                        color: "#1e293b",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {tipoActual === "incidente"
                        ? "Presento intermitencia recurrente al conectar la estación de trabajo a la red interna. La sesión ERP se desconecta periódicamente."
                        : "Se solicita asignación formal de equipo informático y credenciales de acceso institucional para colaborador ingresante."}
                    </div>
                  </div>

                  {/* EVIDENCIAS Y ARCHIVOS ADJUNTOS (VISTA PREVIA) */}
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                      <span style={{ color: "#64748b", fontSize: 11.5, fontWeight: 700 }}>
                        EVIDENCIAS Y ARCHIVOS ADJUNTOS (1)
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        Archivos y documentos de respaldo (Demostración no interactiva)
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                      <div
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          overflow: "hidden",
                          backgroundColor: "#f8fafc",
                          cursor: "not-allowed",
                          pointerEvents: "none",
                        }}
                        title="Vista previa - Archivo demostrativo no interactivo"
                      >
                        <div
                          style={{
                            height: 110,
                            backgroundColor: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94a3b8",
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          captura_error_red.png
                        </div>
                        <div style={{ padding: "8px 10px" }}>
                          <strong style={{ fontSize: 12, color: "#0f172a", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            captura_error_red.png
                          </strong>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, fontSize: 10.5, color: "#64748b" }}>
                            <span>1.1 MB</span>
                            <span style={{ color: "#64748b", fontWeight: 600, fontSize: 10, padding: "2px 6px", backgroundColor: "#e2e8f0", borderRadius: 4 }}>
                              Vista previa
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pie de acciones del ticket (no funcionales en vista previa) */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "12px 18px",
                    borderTop: "1px solid #e2e8f0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                    cursor: "not-allowed",
                  }}
                >
                  <span style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                    Acciones de gestión no operativas (Modo vista previa)
                  </span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      title="Vista previa - Botón no interactivo"
                      style={{
                        width: "auto",
                        fontSize: 12.5,
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#f1f5f9",
                        color: "#94a3b8",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }}
                    >
                      Volver
                    </button>
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      title="Vista previa - Botón no interactivo"
                      style={{
                        width: "auto",
                        fontSize: 12.5,
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#f1f5f9",
                        color: "#94a3b8",
                        fontWeight: 600,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }}
                    >
                      Escribir Mensaje
                    </button>
                    <button
                      type="button"
                      disabled
                      tabIndex={-1}
                      title="Vista previa - Botón no interactivo"
                      style={{
                        width: "auto",
                        fontSize: 12.5,
                        padding: "8px 16px",
                        borderRadius: 6,
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#e2e8f0",
                        color: "#64748b",
                        fontWeight: 700,
                        cursor: "not-allowed",
                        pointerEvents: "none",
                      }}
                    >
                      {tipoActual === "incidente" ? "Gestionar Incidente" : "Gestionar Solicitud"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaginaConfiguracionFormulariosTickets({ tipoFijo }: { tipoFijo?: "incidente" | "solicitud" } = {}) {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando configuración de formularios de creación...</p></div>}>
      <ContenidoConfiguracionFormularios tipoFijo={tipoFijo} />
    </Suspense>
  );
}
