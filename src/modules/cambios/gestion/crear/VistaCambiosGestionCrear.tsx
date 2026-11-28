"use client";

import { useEffect, useState, FormEvent, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ElementoConfiguracion, Problema, SesionUsuario } from "@/types";
import { validarTexto, validarFechaNoPasada } from "@/shared/lib/validaciones";

interface CatalogoItem {
  id_item: number;
  catalogo: string;
  id_padre: number | null;
  codigo: string;
  nombre: string;
  descripcion?: string;
  color?: string;
  orden?: number;
}

interface ServicioCatalogo {
  id_servicio: number;
  codigo_servicio: string;
  nombre: string;
  descripcion_comercial?: string;
}

interface IncidenteRelacion {
  id_ticket: number;
  codigo_ticket: string;
  titulo: string;
  id_prioridad: number;
  fecha_creacion: string;
}

interface AprobadorEmergencia {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  perfil_nombre: string;
}

interface PreguntaRiesgo {
  id: number;
  texto: string;
  peso: number;
  activa: boolean;
  opciones: Array<{
    valor: string;
    texto: string;
    puntaje: number;
    eleva_minimo?: string;
  }>;
}

interface NivelRiesgo {
  id: string;
  nombre: string;
  min: number;
  max: number;
  color: string;
}

interface ModeloEstandar {
  id_modelo: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria_id: number | null;
  estado: string;
  version_modelo: number;
  contenido_prellenado?: {
    motivo?: string;
    plan_implementacion?: string;
    plan_rollback?: string;
    plan_pruebas?: string;
    criterios_exito?: string;
    duracion_estimada?: string;
  };
  lista_elegibilidad?: string[];
}

export default function VistaCambiosGestionCrear() {
  const router = useRouter();
  // Desde el detalle de una solicitud se llega con ?solicitud=<id_ticket>
  const solicitudInicial = useSearchParams().get("solicitud") ?? "";

  // Estados de sesión y configuración
  const [sesion, setSesion] = useState<SesionUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Catálogos maestros
  const [cis, setCis] = useState<ElementoConfiguracion[]>([]);
  const [servicios, setServicios] = useState<ServicioCatalogo[]>([]);
  const [problemas, setProblemas] = useState<Problema[]>([]);
  const [incidentes, setIncidentes] = useState<IncidenteRelacion[]>([]);
  const [aprobadoresEmergencia, setAprobadoresEmergencia] = useState<AprobadorEmergencia[]>([]);
  const [modelosEstandar, setModelosEstandar] = useState<ModeloEstandar[]>([]);
  const [categoriasCambio, setCategoriasCambio] = useState<CatalogoItem[]>([]);
  const [entornos, setEntornos] = useState<CatalogoItem[]>([]);
  const [origenesMotivos, setOrigenesMotivos] = useState<CatalogoItem[]>([]);
  const [mediosEmergencia, setMediosEmergencia] = useState<CatalogoItem[]>([]);

  // Configuración de riesgo ponderado
  const [preguntasRiesgo, setPreguntasRiesgo] = useState<PreguntaRiesgo[]>([]);
  const [nivelesRiesgo, setNivelesRiesgo] = useState<NivelRiesgo[]>([]);
  const [modalRiesgoAbierto, setModalRiesgoAbierto] = useState(false);
  const [respuestasRiesgo, setRespuestasRiesgo] = useState<Record<number, string>>({});
  const [nivelRiesgoCalculado, setNivelRiesgoCalculado] = useState<string>("Bajo");
  const [colorRiesgoCalculado, setColorRiesgoCalculado] = useState<string>("#16a34a");
  const [puntajeRiesgoCalculado, setPuntajeRiesgoCalculado] = useState<number>(0);

  // Configuración general RFC
  const [configRfc, setConfigRfc] = useState<{
    perfiles_solicitantes: number[];
    tipos_rfc: string[];
    exige_ci: boolean;
    exige_plan_pruebas: boolean;
    permite_emergencia: boolean;
    exige_rollback: boolean;
    duracion_maxima_horas: number;
  }>({
    perfiles_solicitantes: [1, 2, 8],
    tipos_rfc: ["NORMAL", "ESTANDAR", "EMERGENCIA"],
    exige_ci: true,
    exige_plan_pruebas: true,
    permite_emergencia: true,
    exige_rollback: true,
    duracion_maxima_horas: 24,
  });

  // Campos principales del Formulario
  const [tipoCambio, setTipoCambio] = useState<"NORMAL" | "ESTANDAR" | "EMERGENCIA">("NORMAL");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [entorno, setEntorno] = useState("Producción");
  const [motivoCambio, setMotivoCambio] = useState("Mantenimiento preventivo");
  const [justificacion, setJustificacion] = useState("");
  const [idImpacto, setIdImpacto] = useState<number>(2);
  const [idUrgencia, setIdUrgencia] = useState<number>(2);
  const [idPrioridad, setIdPrioridad] = useState<number>(3);
  const [idCiAfectado, setIdCiAfectado] = useState<number | "">("");

  // Caída de servicio
  const [requiereInterrupcion, setRequiereInterrupcion] = useState(false);
  const [idServicioAfectado, setIdServicioAfectado] = useState<number | "">("");

  // Relaciones
  const [habilitarRelaciones, setHabilitarRelaciones] = useState(Boolean(solicitudInicial));
  const [idIncidenteOrigen, setIdIncidenteOrigen] = useState<number | "">("");
  const [idProblemaOrigen, setIdProblemaOrigen] = useState<number | "">("");
  const [idSolicitudOrigen, setIdSolicitudOrigen] = useState<number | "">(
    /^\d+$/.test(solicitudInicial) ? Number(solicitudInicial) : ""
  );
  const [solicitudes, setSolicitudes] = useState<IncidenteRelacion[]>([]);

  // Ventana de fechas
  const [ventanaInicio, setVentanaInicio] = useState("");
  const [ventanaFin, setVentanaFin] = useState("");

  // Planes técnicos
  const [planImplementacion, setPlanImplementacion] = useState("");
  const [planRollback, setPlanRollback] = useState("");
  const [planPruebas, setPlanPruebas] = useState("");
  const [criteriosExito, setCriteriosExito] = useState("");
  const [evidencias, setEvidencias] = useState("");

  // Específicos de Cambio Estándar
  const [categoriaFiltroId, setCategoriaFiltroId] = useState<number | "">("");
  const [subcategoriaFiltroId, setSubcategoriaFiltroId] = useState<number | "">("");
  const [modeloSeleccionadoId, setModeloSeleccionadoId] = useState<number | "">("");
  const [checklistElegibilidad, setChecklistElegibilidad] = useState<Record<number, boolean>>({});

  // Específicos de Cambio de Emergencia
  const [medioAutorizacion, setMedioAutorizacion] = useState("Llamada telefónica");
  const [idUsuarioAutorizador, setIdUsuarioAutorizador] = useState<number | "">("");
  const [justificacionUrgencia, setJustificacionUrgencia] = useState("");

  // Campos personalizados dinámicos configurados por administración
  const [camposPersonalizadosDef, setCamposPersonalizadosDef] = useState<Array<{
    codigo: string;
    etiqueta: string;
    tipo: string;
    obligatorio: boolean;
    opciones?: string[];
    ayuda?: string;
  }>>([]);
  const [valoresPersonalizados, setValoresPersonalizados] = useState<Record<string, any>>({});

  // Carga inicial de datos
  useEffect(() => {
    async function cargarRecursos() {
      try {
        const [
          resSesion,
          resCis,
          resServicios,
          resPrb,
          resInc,
          resAprob,
          resModelos,
          resCatalogos,
          resConfigRfc,
          resRiesgo,
          resCamposPers,
        ] = await Promise.all([
          fetch("/api/menu").then((r) => r.json()).catch(() => null),
          fetch("/api/activos/cmdb").then((r) => r.json()).catch(() => ({ elementos: [] })),
          fetch("/api/servicios").then((r) => r.json()).catch(() => ({ servicios: [] })),
          fetch("/api/problemas").then((r) => r.json()).catch(() => []),
          fetch("/api/cambios/incidentes-relacion").then((r) => r.json()).catch(() => ({ incidentes: [] })),
          fetch("/api/cambios/aprobadores-emergencia").then((r) => r.json()).catch(() => ({ aprobadores: [] })),
          fetch("/api/cambios/configuracion/modelos-estandar").then((r) => r.json()).catch(() => ({ modelos: [] })),
          fetch("/api/cambios/configuracion/catalogos").then((r) => r.json()).catch(() => ({ catalogos: {} })),
          fetch("/api/cambios/configuracion/rfc").then((r) => r.json()).catch(() => null),
          fetch("/api/cambios/configuracion/cuestionario-riesgo").then((r) => r.json()).catch(() => null),
          fetch("/api/cambios/configuracion/campos-personalizados").then((r) => r.json()).catch(() => ({ campos: [] })),
        ]);

        if (resSesion?.sesion) setSesion(resSesion.sesion);
        if (Array.isArray(resCis?.elementos)) setCis(resCis.elementos);
        if (Array.isArray(resServicios?.servicios)) setServicios(resServicios.servicios);
        if (Array.isArray(resPrb)) setProblemas(resPrb);
        if (Array.isArray(resInc?.incidentes)) setIncidentes(resInc.incidentes);
        if (Array.isArray(resInc?.solicitudes)) setSolicitudes(resInc.solicitudes);
        if (Array.isArray(resAprob?.aprobadores)) setAprobadoresEmergencia(resAprob.aprobadores);
        if (Array.isArray(resModelos?.modelos)) setModelosEstandar(resModelos.modelos);

        if (resCatalogos?.catalogos) {
          const cats = resCatalogos.catalogos;
          if (Array.isArray(cats.categorias_cambio)) setCategoriasCambio(cats.categorias_cambio);
          if (Array.isArray(cats.entornos)) {
            setEntornos(cats.entornos);
            if (cats.entornos.length > 0) setEntorno(cats.entornos[0].nombre);
          }
          if (Array.isArray(cats.origenes)) {
            setOrigenesMotivos(cats.origenes);
            if (cats.origenes.length > 0) setMotivoCambio(cats.origenes[0].nombre);
          }
          if (Array.isArray(cats.medios_emergencia)) {
            setMediosEmergencia(cats.medios_emergencia);
            if (cats.medios_emergencia.length > 0) setMedioAutorizacion(cats.medios_emergencia[0].nombre);
          }
        }

        if (resConfigRfc) {
          setConfigRfc({
            perfiles_solicitantes: Array.isArray(resConfigRfc.perfiles_solicitantes)
              ? resConfigRfc.perfiles_solicitantes
              : [1, 2, 8],
            tipos_rfc: Array.isArray(resConfigRfc.tipos_rfc)
              ? resConfigRfc.tipos_rfc
              : ["NORMAL", "ESTANDAR", "EMERGENCIA"],
            exige_ci: resConfigRfc.exige_ci !== false,
            exige_plan_pruebas: resConfigRfc.exige_plan_pruebas !== false,
            permite_emergencia: resConfigRfc.permite_emergencia !== false,
            exige_rollback: resConfigRfc.exige_rollback !== false,
            duracion_maxima_horas: Number(resConfigRfc.duracion_maxima_horas) || 24,
          });
        }

        // Cargar y unificar campos personalizados activos configurados por administración
        const camposUnificados: Array<{
          codigo: string;
          etiqueta: string;
          tipo: string;
          obligatorio: boolean;
          opciones?: string[];
          ayuda?: string;
        }> = [];

        if (Array.isArray(resCamposPers?.campos)) {
          for (const cp of resCamposPers.campos) {
            if (cp.activo !== false) {
              camposUnificados.push({
                codigo: cp.codigo,
                etiqueta: cp.etiqueta,
                tipo: cp.tipo || "texto",
                obligatorio: cp.obligatorio === "si",
                opciones: cp.propiedades?.opciones || [],
                ayuda: cp.descripcion || cp.propiedades?.ayuda || "",
              });
            }
          }
        }

        if (Array.isArray(resConfigRfc?.campos_personalizados)) {
          for (const c of resConfigRfc.campos_personalizados) {
            if (!camposUnificados.some((u) => u.codigo === c.clave)) {
              camposUnificados.push({
                codigo: c.clave,
                etiqueta: c.etiqueta,
                tipo: c.tipo || "texto",
                obligatorio: Boolean(c.obligatorio),
                opciones: c.opciones || [],
                ayuda: c.ayuda || "",
              });
            }
          }
        }

        setCamposPersonalizadosDef(camposUnificados);

        if (resRiesgo?.preguntas) {
          setPreguntasRiesgo(resRiesgo.preguntas);
          if (Array.isArray(resRiesgo.niveles)) setNivelesRiesgo(resRiesgo.niveles);
          // Inicializar respuestas por defecto
          const iniciales: Record<number, string> = {};
          for (const p of resRiesgo.preguntas) {
            if (p.activa && p.opciones?.[0]?.valor) {
              iniciales[p.id] = p.opciones[0].valor;
            }
          }
          setRespuestasRiesgo(iniciales);
        }

        // Ventana por defecto: sábado siguiente de 22:00 a 02:00
        const d = new Date();
        d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
        d.setHours(22, 0, 0, 0);
        const isoIni = d.toISOString().slice(0, 16);
        d.setHours(26, 0, 0, 0);
        const isoFin = d.toISOString().slice(0, 16);
        setVentanaInicio(isoIni);
        setVentanaFin(isoFin);

        // Lectura de URL query params para preselección de modelo estándar
        if (typeof window !== "undefined") {
          const sp = new URLSearchParams(window.location.search);
          const tipoParam = sp.get("tipo");
          const modParam = sp.get("modelo");
          if (tipoParam === "ESTANDAR" || modParam) {
            setTipoCambio("ESTANDAR");
            if (modParam) {
              setModeloSeleccionadoId(Number(modParam));
              const mod = (resModelos?.modelos || []).find((m: any) => m.id_modelo === Number(modParam));
              if (mod) {
                setTitulo(mod.nombre);
                setDescripcion(mod.descripcion || "");
                if (mod.contenido_prellenado) {
                  const cp = mod.contenido_prellenado;
                  if (cp.motivo) setMotivoCambio(cp.motivo);
                  if (cp.plan_implementacion) setPlanImplementacion(cp.plan_implementacion);
                  if (cp.plan_rollback) setPlanRollback(cp.plan_rollback);
                  if (cp.plan_pruebas) setPlanPruebas(cp.plan_pruebas);
                  if (cp.criterios_exito) setCriteriosExito(cp.criterios_exito);
                }
              }
            }
          }
        }
      } catch (err: any) {
        setError("Error al cargar dependencias del formulario de cambios.");
      } finally {
        setCargando(false);
      }
    }

    cargarRecursos();
  }, []);

  // Cálculo automático de prioridad según matriz Impacto x Urgencia
  useEffect(() => {
    if (tipoCambio === "ESTANDAR") {
      setIdPrioridad(4); // Baja
      return;
    }
    if (tipoCambio === "EMERGENCIA") {
      setIdPrioridad(1); // Crítica
      return;
    }
    // Matriz Normal: (Impacto + Urgencia)
    const suma = idImpacto + idUrgencia;
    if (suma >= 6) setIdPrioridad(1); // Crítica
    else if (suma === 5) setIdPrioridad(2); // Alta
    else if (suma === 4) setIdPrioridad(3); // Media
    else setIdPrioridad(4); // Baja
  }, [tipoCambio, idImpacto, idUrgencia]);

  // Manejo de cambio de tipo de cambio desde la cabecera
  const cambiarTipoCambio = (nuevoTipo: "NORMAL" | "ESTANDAR" | "EMERGENCIA") => {
    setTipoCambio(nuevoTipo);
    setError(null);

    if (nuevoTipo === "ESTANDAR") {
      setIdImpacto(1);
      setIdUrgencia(1);
      setIdPrioridad(4);
      if (modeloSeleccionadoId) {
        aplicarModelo(modeloSeleccionadoId);
      }
    } else if (nuevoTipo === "EMERGENCIA") {
      setIdImpacto(3);
      setIdUrgencia(3);
      setIdPrioridad(1);
      setHabilitarRelaciones(true);
    } else {
      setIdImpacto(2);
      setIdUrgencia(2);
      setIdPrioridad(3);
    }
  };

  // Filtrado en cascada de categorías y subcategorías para modelos estándar
  const categoriasPrincipales = useMemo(() => {
    return categoriasCambio.filter((c) => c.id_padre === null);
  }, [categoriasCambio]);

  const subcategoriasDisponibles = useMemo(() => {
    if (!categoriaFiltroId) return [];
    return categoriasCambio.filter((c) => c.id_padre === Number(categoriaFiltroId));
  }, [categoriasCambio, categoriaFiltroId]);

  const modelosFiltrados = useMemo(() => {
    return modelosEstandar.filter((m) => {
      if (subcategoriaFiltroId) {
        return m.categoria_id === Number(subcategoriaFiltroId);
      }
      if (categoriaFiltroId) {
        // Coincide con la principal o con alguna de sus hijas
        const idsHijas = subcategoriasDisponibles.map((s) => s.id_item);
        return m.categoria_id === Number(categoriaFiltroId) || (m.categoria_id && idsHijas.includes(m.categoria_id));
      }
      return true;
    });
  }, [modelosEstandar, categoriaFiltroId, subcategoriaFiltroId, subcategoriasDisponibles]);

  // Aplicación automática de datos del modelo estándar
  const aplicarModelo = (idMod: number | "") => {
    setModeloSeleccionadoId(idMod);
    setChecklistElegibilidad({});
    if (!idMod) return;

    const mod = modelosEstandar.find((m) => m.id_modelo === Number(idMod));
    if (!mod) return;

    setTitulo(mod.nombre);
    setDescripcion(mod.descripcion || `[RFC Estándar] ${mod.nombre}`);
    if (mod.contenido_prellenado) {
      if (mod.contenido_prellenado.motivo) {
        setMotivoCambio(mod.contenido_prellenado.motivo);
        setJustificacion(mod.contenido_prellenado.motivo);
      }
      if (mod.contenido_prellenado.plan_implementacion) {
        setPlanImplementacion(mod.contenido_prellenado.plan_implementacion);
      }
      if (mod.contenido_prellenado.plan_rollback) {
        setPlanRollback(mod.contenido_prellenado.plan_rollback);
      }
      if (mod.contenido_prellenado.plan_pruebas) {
        setPlanPruebas(mod.contenido_prellenado.plan_pruebas);
      }
      if (mod.contenido_prellenado.criterios_exito) {
        setCriteriosExito(mod.contenido_prellenado.criterios_exito);
      }
    }
    setIdImpacto(1);
    setIdUrgencia(1);
    setIdPrioridad(4);
  };

  // Evaluación interactiva de riesgo ponderado
  const calcularRiesgoPonderado = () => {
    let puntaje = 0;
    let elevaMaximo: string | null = null;
    const ordenRiesgo = ["bajo", "medio", "alto", "critico"];

    for (const preg of preguntasRiesgo) {
      if (!preg.activa) continue;
      const valorSeleccionado = respuestasRiesgo[preg.id];
      const opcion = preg.opciones.find((o) => o.valor === valorSeleccionado) || preg.opciones[0];
      const pts = (opcion?.puntaje || 0) * (preg.peso || 1);
      puntaje += pts;

      if (opcion?.eleva_minimo) {
        if (!elevaMaximo || ordenRiesgo.indexOf(opcion.eleva_minimo) > ordenRiesgo.indexOf(elevaMaximo)) {
          elevaMaximo = opcion.eleva_minimo;
        }
      }
    }

    setPuntajeRiesgoCalculado(puntaje);

    let nivelFinal = "Bajo";
    let colorFinal = "#16a34a";

    for (const niv of nivelesRiesgo) {
      if (puntaje >= niv.min && puntaje <= niv.max) {
        nivelFinal = niv.nombre;
        colorFinal = niv.color;
        break;
      }
    }

    if (elevaMaximo) {
      const nivElevado = nivelesRiesgo.find((n) => n.id.toLowerCase() === elevaMaximo?.toLowerCase());
      if (nivElevado && ordenRiesgo.indexOf(nivElevado.id.toLowerCase()) > ordenRiesgo.indexOf(nivelFinal.toLowerCase())) {
        nivelFinal = nivElevado.nombre;
        colorFinal = nivElevado.color;
      }
    }

    setNivelRiesgoCalculado(nivelFinal);
    setColorRiesgoCalculado(colorFinal);
    setModalRiesgoAbierto(false);
  };

  // Envío final del Formulario
  async function manejarSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setMensajeExito(null);

    const perfilId = sesion?.perfilActivo?.id_perfil || 0;
    if (perfilId !== 1 && !configRfc.perfiles_solicitantes.includes(perfilId)) {
      setError("El perfil activo no está habilitado para presentar RFC según la configuración del sistema.");
      return;
    }

    if (!idCiAfectado) {
      setError("Debe seleccionar el elemento de configuración (CI / Activo afectado).");
      return;
    }

    if (!ventanaInicio || !ventanaFin) {
      setError("Por favor indique las fechas y horas de inicio y fin de la ventana de cambio.");
      return;
    }

    const vFecha = validarFechaNoPasada(ventanaInicio, "El inicio de la ventana de cambio");
    if (!vFecha.valido) {
      setError(vFecha.mensaje!);
      return;
    }

    const iniMs = new Date(ventanaInicio).getTime();
    const finMs = new Date(ventanaFin).getTime();
    if (finMs <= iniMs) {
      setError("La fecha y hora de fin debe ser posterior a la fecha y hora de inicio.");
      return;
    }

    const duracionHoras = (finMs - iniMs) / 3600000;
    if (duracionHoras > configRfc.duracion_maxima_horas) {
      setError(`La ventana seleccionada (${duracionHoras.toFixed(1)} hrs) supera la duración máxima permitida de ${configRfc.duracion_maxima_horas} horas.`);
      return;
    }

    if (requiereInterrupcion && !idServicioAfectado) {
      setError("Ha indicado que el cambio requiere caída del servicio; debe seleccionar el servicio afectado del catálogo.");
      return;
    }

    // Validaciones por Tipo
    if (tipoCambio === "ESTANDAR") {
      if (!modeloSeleccionadoId) {
        setError("Debe seleccionar un Modelo de Cambio Estándar preautorizado.");
        return;
      }
      const mod = modelosEstandar.find((m) => m.id_modelo === Number(modeloSeleccionadoId));
      const condiciones = Array.isArray(mod?.lista_elegibilidad) ? mod.lista_elegibilidad : [];
      if (condiciones.length > 0) {
        const todasConfirmadas = condiciones.every((_, idx) => checklistElegibilidad[idx] === true);
        if (!todasConfirmadas) {
          setError("Debe confirmar todas las condiciones de la lista de verificación de elegibilidad antes de registrar el cambio.");
          return;
        }
      }
    } else if (tipoCambio === "EMERGENCIA") {
      if (!configRfc.permite_emergencia) {
        setError("Las solicitudes de cambio de emergencia están deshabilitadas por configuración.");
        return;
      }
      if (!medioAutorizacion.trim()) {
        setError("Debe especificar el medio por el cual se autorizó la emergencia.");
        return;
      }
      if (!idUsuarioAutorizador) {
        setError("Debe seleccionar la autoridad facultada que autorizó la ejecución de emergencia.");
        return;
      }
      const vUrg = validarTexto(justificacionUrgencia, 10, 2000, "La justificación de urgencia", true);
      if (!vUrg.valido) {
        setError(vUrg.mensaje!);
        return;
      }
      if (!idIncidenteOrigen) {
        setError("Los cambios de emergencia deben vincularse obligatoriamente al incidente que detona la contingencia.");
        return;
      }
      const vTit = validarTexto(titulo, 5, 150, "El título del cambio", true);
      if (!vTit.valido) {
        setError(vTit.mensaje!);
        return;
      }
    } else {
      // NORMAL
      const vTit = validarTexto(titulo, 5, 150, "El título del cambio", true);
      if (!vTit.valido) {
        setError(vTit.mensaje!);
        return;
      }
      const vJust = validarTexto(justificacion, 10, 2000, "La justificación de negocio", true);
      if (!vJust.valido) {
        setError(vJust.mensaje!);
        return;
      }
      const vPlan = validarTexto(planImplementacion, 10, 3000, "El plan de implementación", true);
      if (!vPlan.valido) {
        setError(vPlan.mensaje!);
        return;
      }
      if (!planRollback.trim()) {
        setError("El plan de rollback / contingencia es obligatorio para cambios normales.");
        return;
      }
      if (!planPruebas.trim()) {
        setError("El plan de pruebas de validación es obligatorio para cambios normales.");
        return;
      }
      if (!criteriosExito.trim()) {
        setError("Los criterios de éxito son obligatorios para cambios normales.");
        return;
      }
    }

    // Validar campos complementarios personalizados si están marcados como obligatorios
    for (const cp of camposPersonalizadosDef) {
      const val = valoresPersonalizados[cp.codigo];
      if (cp.obligatorio && (val === undefined || val === null || String(val).trim() === "")) {
        setError(`El campo complementario "${cp.etiqueta}" es obligatorio.`);
        return;
      }
    }

    setGuardando(true);
    try {
      const payload = {
        tipo_cambio: tipoCambio,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || `[RFC ${tipoCambio}] ${titulo.trim()}`,
        entorno,
        motivo_cambio: motivoCambio,
        justificacion: justificacion.trim() || (tipoCambio === "EMERGENCIA" ? justificacionUrgencia.trim() : ""),
        id_impacto: idImpacto,
        id_urgencia: idUrgencia,
        id_prioridad: idPrioridad,
        id_ci_afectado: Number(idCiAfectado),
        requiere_interrupcion: requiereInterrupcion,
        id_servicio_afectado: requiereInterrupcion && idServicioAfectado ? Number(idServicioAfectado) : null,
        ventana_inicio: new Date(ventanaInicio).toISOString(),
        ventana_fin: new Date(ventanaFin).toISOString(),
        plan_implementacion: planImplementacion.trim() || null,
        plan_rollback: planRollback.trim() || null,
        plan_pruebas: planPruebas.trim() || null,
        criterios_exito: criteriosExito.trim() || null,
        evidencias: evidencias.trim() || null,
        id_incidente_origen: idIncidenteOrigen ? Number(idIncidenteOrigen) : null,
        id_problema_origen: idProblemaOrigen ? Number(idProblemaOrigen) : null,
        id_solicitud_origen:
          tipoCambio !== "EMERGENCIA" && habilitarRelaciones && idSolicitudOrigen ? Number(idSolicitudOrigen) : null,
        // Estándar
        id_modelo_estandar: tipoCambio === "ESTANDAR" && modeloSeleccionadoId ? Number(modeloSeleccionadoId) : null,
        checklist_elegibilidad: tipoCambio === "ESTANDAR" ? checklistElegibilidad : null,
        // Emergencia
        medio_autorizacion_emergencia: tipoCambio === "EMERGENCIA" ? medioAutorizacion : null,
        id_usuario_autorizador_emergencia: tipoCambio === "EMERGENCIA" && idUsuarioAutorizador ? Number(idUsuarioAutorizador) : null,
        justificacion_urgencia: tipoCambio === "EMERGENCIA" ? justificacionUrgencia.trim() : null,
        // Riesgo
        cuestionario_riesgo: tipoCambio === "NORMAL" ? {
          respuestas: respuestasRiesgo,
          puntaje: puntajeRiesgoCalculado,
          nivel: nivelRiesgoCalculado,
        } : null,
        nivel_riesgo: tipoCambio === "ESTANDAR" ? "Bajo" : nivelRiesgoCalculado,
        campos_personalizados: valoresPersonalizados,
      };

      const res = await fetch("/api/cambios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar la solicitud de cambio.");
        return;
      }

      setMensajeExito(`Solicitud de cambio registrada exitosamente con código ${data.codigo_cambio}.`);
      setTimeout(() => {
        router.push("/plataforma/cambios/gestion?vista=historial");
      }, 1600);
    } catch {
      setError("Error de conexión al registrar la solicitud de cambio.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: 48, textAlign: "center" }}>
        <p style={{ color: "#2563eb", fontWeight: 600, fontSize: 15 }}>Cargando catálogo CMDB y formulario ITIL v4...</p>
      </div>
    );
  }

  // Misma regla que la ruta: solo los perfiles habilitados en la configuración de RFC
  const perfilActual = sesion?.perfilActivo?.id_perfil || 0;
  if (sesion && perfilActual !== 1 && !configRfc.perfiles_solicitantes.includes(perfilActual)) {
    return (
      <div className="vista-contenedor">
        <h1 className="titulo-pagina">Nueva solicitud de cambio</h1>
        <div className="estado-vacio">
          Tu perfil no está habilitado para presentar RFC. Si el cambio afecta a tu área, pídele al Gestor de Cambios que lo registre.
        </div>
      </div>
    );
  }

  return (
    <div className="vista-contenedor">
      {/* Cabecera Principal */}
      <div
        className="cabecera-pagina"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                padding: "3px 8px",
                borderRadius: 4,
                textTransform: "uppercase",
              }}
            >
              Gestión de Cambios &amp; RFC (ITIL v4)
            </span>
          </div>
          <h1 className="titulo-pagina">
            Registrar Solicitud de Cambio (RFC - Request for Change)
          </h1>
          <p className="descripcion-pagina">
            Control exhaustivo de intervenciones técnicas: justificación de negocio, evaluación de riesgo, planes de contingencia y ventanas de ejecución.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/plataforma/cambios/gestion?vista=historial");
            }
          }}
          className="boton-secundario"
        >
          Volver al Historial
        </button>
      </div>

      {/* Ficha Informativa del Solicitante */}
      {sesion && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
            gap: 12,
            fontSize: 12.5,
          }}
        >
          <div>
            <span style={{ color: "#64748b", display: "block" }}>Presentado por:</span>
            <strong style={{ color: "#1e293b" }}>{sesion.nombres}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>Perfil / Rol activo:</span>
            <strong style={{ color: "#1e293b" }}>{sesion.perfilActivo?.nombre || "Técnico"}</strong>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>Correo corporativo:</span>
            <span style={{ color: "#1e293b" }}>{sesion.correo_electronico}</span>
          </div>
          <div>
            <span style={{ color: "#64748b", display: "block" }}>Fecha de Registro:</span>
            <span style={{ color: "#1e293b" }}>{new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
        </div>
      )}

      {/* Selector Destacado del Tipo de Cambio */}
      <div
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 10,
          padding: 16,
          marginBottom: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", textTransform: "uppercase" }}>
            1. Seleccione el Tipo de Cambio (ITIL v4)
          </label>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
            El tipo de cambio orquesta la visibilidad, los requisitos técnicos y el flujo de autorización correspondiente.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 12 }}>
          {/* Opción NORMAL */}
          <button
            type="button"
            onClick={() => cambiarTipoCambio("NORMAL")}
            className={tipoCambio === "NORMAL" ? "opcion-seleccionable opcion-seleccionada" : "opcion-seleccionable"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#2563eb" }}></span>
              <strong style={{ fontSize: 14, color: tipoCambio === "NORMAL" ? "#1e40af" : "#1e293b" }}>
                Cambio Normal
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: "#64748b", lineHeight: 1.4 }}>
              Requiere evaluación técnica completa, análisis de riesgo ponderado y aprobación formal del comité CAB.
            </p>
          </button>

          {/* Opción ESTANDAR */}
          <button
            type="button"
            onClick={() => cambiarTipoCambio("ESTANDAR")}
            className={tipoCambio === "ESTANDAR" ? "opcion-seleccionable opcion-seleccionada" : "opcion-seleccionable"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#16a34a" }}></span>
              <strong style={{ fontSize: 14, color: tipoCambio === "ESTANDAR" ? "#166534" : "#1e293b" }}>
                Cambio Estándar
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: "#64748b", lineHeight: 1.4 }}>
              Procedimiento recurrente preaprobado, de bajo riesgo e impacto mínimo. Requiere checklist de elegibilidad.
            </p>
          </button>

          {/* Opción EMERGENCIA */}
          <button
            type="button"
            onClick={() => cambiarTipoCambio("EMERGENCIA")}
            className={tipoCambio === "EMERGENCIA" ? "opcion-seleccionable opcion-seleccionada" : "opcion-seleccionable"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#dc2626" }}></span>
              <strong style={{ fontSize: 14, color: tipoCambio === "EMERGENCIA" ? "#991b1b" : "#1e293b" }}>
                Cambio de Emergencia
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 11.5, color: "#64748b", lineHeight: 1.4 }}>
              Restablecimiento urgente ante un incidente mayor activo. Autorización verbal/inmediata del ECAB.
            </p>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {error}
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
            marginBottom: 20,
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {mensajeExito} Redirigiendo al panel de cambios...
        </div>
      )}

      <form onSubmit={manejarSubmit}>
        {/* BLOQUE ESPECIAL 1: CAMBIO ESTÁNDAR (Filtros de Catálogo y Modelo) */}
        {tipoCambio === "ESTANDAR" && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #86efac",
              borderRadius: 8,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#166534", display: "flex", alignItems: "center", gap: 8 }}>
              <span>Catálogo de Modelos de Cambio Estándar Autorizados</span>
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#14532d" }}>
              Filtre por categoría y subcategoría técnica para ubicar el modelo estándar correspondiente. Al seleccionarlo, se autocompletarán los datos y planes preaprobados.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label className="etiqueta" style={{ color: "#166534" }}>Categoría Técnica</label>
                <select
                  className="input-base"
                  value={categoriaFiltroId}
                  onChange={(e) => {
                    setCategoriaFiltroId(e.target.value ? Number(e.target.value) : "");
                    setSubcategoriaFiltroId("");
                  }}
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <option value="">Todas las categorías...</option>
                  {categoriasPrincipales.map((c) => (
                    <option key={c.id_item} value={c.id_item}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="etiqueta" style={{ color: "#166534" }}>Subcategoría Técnica</label>
                <select
                  className="input-base"
                  value={subcategoriaFiltroId}
                  onChange={(e) => setSubcategoriaFiltroId(e.target.value ? Number(e.target.value) : "")}
                  disabled={!categoriaFiltroId}
                  style={{ backgroundColor: "#ffffff" }}
                >
                  <option value="">Todas las subcategorías...</option>
                  {subcategoriasDisponibles.map((s) => (
                    <option key={s.id_item} value={s.id_item}>
                      {s.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="etiqueta" style={{ color: "#166534", fontWeight: 700 }}>
                  Modelo Estándar Autorizado *
                </label>
                <select
                  className="input-base"
                  value={modeloSeleccionadoId}
                  onChange={(e) => aplicarModelo(e.target.value ? Number(e.target.value) : "")}
                  style={{ borderColor: "#16a34a", backgroundColor: "#ffffff" }}
                  required
                >
                  <option value="">Seleccione el modelo estándar preautorizado...</option>
                  {modelosFiltrados.map((m) => (
                    <option key={m.id_modelo} value={m.id_modelo}>
                      [{m.codigo}] {m.nombre} (v{m.version_modelo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Checklist de Elegibilidad Mandatorio */}
            {modeloSeleccionadoId !== "" && (() => {
              const mod = modelosEstandar.find((m) => m.id_modelo === Number(modeloSeleccionadoId));
              const elegibles = Array.isArray(mod?.lista_elegibilidad) ? mod.lista_elegibilidad : [];
              if (elegibles.length === 0) return null;

              return (
                <div style={{ backgroundColor: "#ffffff", padding: 14, borderRadius: 6, border: "1px solid #bbf7d0" }}>
                  <span style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#166534", marginBottom: 8 }}>
                    Lista de Verificación de Elegibilidad Obligatoria:
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {elegibles.map((texto, idx) => (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          fontSize: 12.5,
                          color: "#1e293b",
                          padding: "8px 12px",
                          borderRadius: 4,
                          backgroundColor: checklistElegibilidad[idx] ? "#dcfce7" : "#f8fafc",
                          border: checklistElegibilidad[idx] ? "1px solid #86efac" : "1px solid #e2e8f0",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={!!checklistElegibilidad[idx]}
                          onChange={(e) =>
                            setChecklistElegibilidad((prev) => ({
                              ...prev,
                              [idx]: e.target.checked,
                            }))
                          }
                        />
                        <span>{texto}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* BLOQUE ESPECIAL 2: CAMBIO DE EMERGENCIA (Autorización ECAB e Incidente) */}
        {tipoCambio === "EMERGENCIA" && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 15, color: "#991b1b" }}>
              Protocolo de Autorización de Emergencia (ECAB)
            </h3>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#7f1d1d" }}>
              Conforme a ITIL v4, los cambios de emergencia se aplican para restablecer servicios ante caídas críticas. Requieren registro del medio de aprobación y la autoridad que dio el visto bueno.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <label className="etiqueta" style={{ color: "#991b1b" }}>Medio de Autorización de Emergencia *</label>
                <select
                  className="input-base"
                  value={medioAutorizacion}
                  onChange={(e) => setMedioAutorizacion(e.target.value)}
                  style={{ backgroundColor: "#ffffff", borderColor: "#fca5a5" }}
                  required
                >
                  {mediosEmergencia.length > 0 ? (
                    mediosEmergencia.map((m) => (
                      <option key={m.id_item} value={m.nombre}>{m.nombre}</option>
                    ))
                  ) : (
                    <>
                      <option value="Llamada telefónica">Llamada telefónica</option>
                      <option value="Sala de crisis / War Room">Sala de crisis / War Room</option>
                      <option value="Mensajería instantánea institucional">Mensajería instantánea institucional</option>
                      <option value="Correo electrónico urgente">Correo electrónico urgente</option>
                      <option value="Aprobación verbal presencial">Aprobación verbal presencial</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="etiqueta" style={{ color: "#991b1b" }}>Aprobador Facultado que Autorizó *</label>
                <select
                  className="input-base"
                  value={idUsuarioAutorizador}
                  onChange={(e) => setIdUsuarioAutorizador(e.target.value ? Number(e.target.value) : "")}
                  style={{ backgroundColor: "#ffffff", borderColor: "#fca5a5" }}
                  required
                >
                  <option value="">Seleccione el aprobador facultado (Admin / Supervisor / CAB)...</option>
                  {aprobadoresEmergencia.map((ap) => (
                    <option key={ap.id_usuario} value={ap.id_usuario}>
                      {ap.nombre_completo} ({ap.perfil_nombre})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="etiqueta" style={{ color: "#991b1b" }}>
                Justificación de Urgencia / Impacto del Negocio si no se aplica de inmediato *
              </label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="Detalle la criticidad del fallo, usuarios afectados y por qué no es posible postergar a una ventana normal..."
                value={justificacionUrgencia}
                onChange={(e) => setJustificacionUrgencia(e.target.value)}
                style={{ backgroundColor: "#ffffff" }}
                required
              />
            </div>

            <div>
              <label className="etiqueta" style={{ color: "#991b1b" }}>
                Incidente Origen que detona la Emergencia *
              </label>
              <select
                className="input-base"
                value={idIncidenteOrigen}
                onChange={(e) => setIdIncidenteOrigen(e.target.value ? Number(e.target.value) : "")}
                style={{ backgroundColor: "#ffffff", borderColor: "#fca5a5" }}
                required
              >
                <option value="">Seleccione el ticket de incidente crítico...</option>
                {incidentes.map((inc) => (
                  <option key={inc.id_ticket} value={inc.id_ticket}>
                    [{inc.codigo_ticket}] {inc.titulo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* SECCIÓN 1: IDENTIFICACIÓN GENERAL */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#1e293b" }}>
            2. Datos Generales del Cambio
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">Título Descriptivo del Cambio *</label>
              <input
                type="text"
                className="input-base"
                placeholder="Ej. Actualización de firmware en switches de distribución piso 4"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={guardando || tipoCambio === "ESTANDAR"}
                required
              />
            </div>

            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">Entorno Afectado *</label>
              <select
                className="input-base"
                value={entorno}
                onChange={(e) => setEntorno(e.target.value)}
                disabled={guardando}
                required
              >
                {entornos.length > 0 ? (
                  entornos.map((ent) => (
                    <option key={ent.id_item} value={ent.nombre}>{ent.nombre}</option>
                  ))
                ) : (
                  <>
                    <option value="Producción">Producción</option>
                    <option value="Preproducción / Staging">Preproducción / Staging</option>
                    <option value="Pruebas / QA">Pruebas / QA</option>
                    <option value="Desarrollo / Dev">Desarrollo / Dev</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="campo" style={{ marginBottom: 16 }}>
            <label className="etiqueta">Descripción Detallada del Cambio *</label>
            <textarea
              className="input-base"
              rows={3}
              placeholder="Describa el alcance exacto de la modificación técnica a realizar..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={guardando || tipoCambio === "ESTANDAR"}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">Elemento de Configuración (CI / Activo afectado) *</label>
              <select
                className="input-base"
                value={idCiAfectado}
                onChange={(e) => setIdCiAfectado(e.target.value ? Number(e.target.value) : "")}
                disabled={guardando}
                required
              >
                <option value="">Seleccionar elemento de configuración de la CMDB...</option>
                {cis.map((ci) => (
                  <option key={ci.id_ci} value={ci.id_ci}>
                    [{ci.codigo_ci}] {ci.nombre} ({ci.ambiente})
                  </option>
                ))}
              </select>
            </div>

            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">Motivo del Cambio *</label>
              <select
                className="input-base"
                value={motivoCambio}
                onChange={(e) => setMotivoCambio(e.target.value)}
                disabled={guardando || tipoCambio === "ESTANDAR"}
                required
              >
                {origenesMotivos.length > 0 ? (
                  origenesMotivos.map((ori) => (
                    <option key={ori.id_item} value={ori.nombre}>{ori.nombre}</option>
                  ))
                ) : (
                  <>
                    <option value="Mantenimiento preventivo">Mantenimiento preventivo</option>
                    <option value="Parche o actualización de fabricante">Parche o actualización de fabricante</option>
                    <option value="Corrección de error / bug">Corrección de error / bug</option>
                    <option value="Mejora continua">Mejora continua</option>
                    <option value="Requisito normativo o auditoría">Requisito normativo o auditoría</option>
                    <option value="Proyecto estratégico">Proyecto estratégico</option>
                    <option value="Otro">Otro</option>
                  </>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: INTERRUPCIÓN DE SERVICIO Y RELACIONES */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#1e293b" }}>
            3. Impacto en Servicios y Relaciones ITIL
          </h2>

          {/* Toggle Requiere caída de servicio */}
          <div style={{ marginBottom: 18 }}>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: 6,
                backgroundColor: requiereInterrupcion ? "#fff7ed" : "#f8fafc",
                border: requiereInterrupcion ? "1px solid #fdba74" : "1px solid #e2e8f0",
              }}
            >
              <input
                type="checkbox"
                checked={requiereInterrupcion}
                onChange={(e) => {
                  setRequiereInterrupcion(e.target.checked);
                  if (!e.target.checked) setIdServicioAfectado("");
                }}
              />
              <span style={{ fontSize: 13, fontWeight: 600, color: requiereInterrupcion ? "#c2410c" : "#334155" }}>
                ¿Requiere caída o interrupción temporal de algún servicio?
              </span>
            </label>

            {requiereInterrupcion && (
              <div style={{ marginTop: 12, paddingLeft: 12, borderLeft: "3px solid #f97316" }}>
                <label className="etiqueta" style={{ color: "#c2410c" }}>
                  Servicio Institucional Caído / Interrumpido (Catálogo de Servicios) *
                </label>
                <select
                  className="input-base"
                  value={idServicioAfectado}
                  onChange={(e) => setIdServicioAfectado(e.target.value ? Number(e.target.value) : "")}
                  required={requiereInterrupcion}
                  style={{ maxWidth: 600 }}
                >
                  <option value="">Seleccione el servicio que quedará temporalmente fuera de línea...</option>
                  {servicios.map((srv) => (
                    <option key={srv.id_servicio} value={srv.id_servicio}>
                      [{srv.codigo_servicio}] {srv.nombre}
                    </option>
                  ))}
                </select>
                <p style={{ margin: "4px 0 0", fontSize: 11.5, color: "#9a3412" }}>
                  Al registrar el cambio se generará un aviso preventivo para los usuarios del catálogo.
                </p>
              </div>
            )}
          </div>

          {/* Toggle Relaciones (Incidente / Problema) */}
          {tipoCambio !== "EMERGENCIA" && (
            <div>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "8px 12px",
                  borderRadius: 6,
                  backgroundColor: habilitarRelaciones ? "#f1f5f9" : "#f8fafc",
                  border: "1px solid #cbd5e1",
                }}
              >
                <input
                  type="checkbox"
                  checked={habilitarRelaciones}
                  onChange={(e) => setHabilitarRelaciones(e.target.checked)}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                  Vincular con Incidente, Problema o Solicitud existente (Opcional)
                </span>
              </label>

              {habilitarRelaciones && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", gap: 16, marginTop: 14 }}>
                  <div>
                    <label className="etiqueta" htmlFor="rfc-solicitud-origen">Solicitud de servicio que origina el cambio</label>
                    <select
                      id="rfc-solicitud-origen"
                      className="input-base"
                      value={idSolicitudOrigen}
                      onChange={(e) => setIdSolicitudOrigen(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Ninguna / Sin solicitud asociada</option>
                      {idSolicitudOrigen !== "" && !solicitudes.some((s) => s.id_ticket === idSolicitudOrigen) && (
                        <option value={idSolicitudOrigen}>Solicitud #{idSolicitudOrigen}</option>
                      )}
                      {solicitudes.map((s) => (
                        <option key={s.id_ticket} value={s.id_ticket}>
                          [{s.codigo_ticket}] {s.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="etiqueta">Incidente Relacionado</label>
                    <select
                      className="input-base"
                      value={idIncidenteOrigen}
                      onChange={(e) => setIdIncidenteOrigen(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Ninguno / Sin incidente asociado</option>
                      {incidentes.map((inc) => (
                        <option key={inc.id_ticket} value={inc.id_ticket}>
                          [{inc.codigo_ticket}] {inc.titulo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="etiqueta">Problema Relacionado</label>
                    <select
                      className="input-base"
                      value={idProblemaOrigen}
                      onChange={(e) => setIdProblemaOrigen(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Ninguno / Sin problema asociado</option>
                      {problemas.map((prb) => (
                        <option key={prb.id_problema} value={prb.id_problema}>
                          [{prb.codigo_problema}] {prb.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN 3: JUSTIFICACIÓN, IMPACTO Y RIESGO */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#1e293b" }}>
            4. Justificación de Negocio, Impacto y Análisis de Riesgo
          </h2>

          <div className="campo" style={{ marginBottom: 16 }}>
            <label className="etiqueta">Justificación de Negocio *</label>
            <textarea
              className="input-base"
              rows={3}
              placeholder="Beneficio cuantificable para la institución y consecuencias de no implementar el cambio..."
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              disabled={guardando || tipoCambio === "ESTANDAR"}
              required={tipoCambio !== "EMERGENCIA"}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, alignItems: "end" }}>
            <div>
              <label className="etiqueta">Impacto en el Negocio *</label>
              <select
                className="input-base"
                value={idImpacto}
                onChange={(e) => setIdImpacto(Number(e.target.value))}
                disabled={guardando || tipoCambio === "ESTANDAR"}
              >
                <option value={1}>1 - Bajo (Sin impacto a usuarios)</option>
                <option value={2}>2 - Medio (Departamento o grupo)</option>
                <option value={3}>3 - Alto (Sede completa o core de negocio)</option>
              </select>
            </div>

            <div>
              <label className="etiqueta">Urgencia Técnica *</label>
              <select
                className="input-base"
                value={idUrgencia}
                onChange={(e) => setIdUrgencia(Number(e.target.value))}
                disabled={guardando || tipoCambio === "ESTANDAR"}
              >
                <option value={1}>1 - Baja (Mejora programable)</option>
                <option value={2}>2 - Media (Mantenimiento rutinario)</option>
                <option value={3}>3 - Alta (Falla potencial o incidente activo)</option>
              </select>
            </div>

            <div>
              <label className="etiqueta">Prioridad (Matriz ITIL)</label>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  backgroundColor: idPrioridad === 1 ? "#fef2f2" : idPrioridad === 2 ? "#fff7ed" : "#f8fafc",
                  border: idPrioridad === 1 ? "1px solid #fecaca" : idPrioridad === 2 ? "1px solid #fed7aa" : "1px solid #e2e8f0",
                  fontWeight: 700,
                  fontSize: 13,
                  color: idPrioridad === 1 ? "#dc2626" : idPrioridad === 2 ? "#ea580c" : "#334155",
                }}
              >
                {idPrioridad === 1 ? "Crítica (P1)" : idPrioridad === 2 ? "Alta (P2)" : idPrioridad === 3 ? "Media (P3)" : "Baja (P4)"}
              </div>
            </div>

            {/* Nivel de Riesgo y Botón para Modal */}
            <div>
              <label className="etiqueta">Nivel de Riesgo</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "#ffffff",
                    backgroundColor: colorRiesgoCalculado,
                  }}
                >
                  {tipoCambio === "ESTANDAR" ? "Bajo (Preaprobado)" : nivelRiesgoCalculado}
                </span>

                {tipoCambio === "NORMAL" && preguntasRiesgo.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModalRiesgoAbierto(true)}
                    className="boton-secundario"
                  >
                    Cuestionario Ponderado
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: VENTANAS DE EJECUCIÓN */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 16px", color: "#1e293b" }}>
            5. Ventana de Mantenimiento Planificada
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">Fecha y Hora de Inicio Planificada *</label>
              <input
                type="datetime-local"
                className="input-base"
                value={ventanaInicio}
                onChange={(e) => setVentanaInicio(e.target.value)}
                disabled={guardando}
                required
              />
            </div>

            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">Fecha y Hora de Fin Planificada *</label>
              <input
                type="datetime-local"
                className="input-base"
                value={ventanaFin}
                onChange={(e) => setVentanaFin(e.target.value)}
                disabled={guardando}
                required
              />
            </div>
          </div>
        </div>

        {/* SECCIÓN 5: PLANES TÉCNICOS (IMPLEMENTACIÓN, ROLLBACK, PRUEBAS Y CRITERIOS) */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: "#1e293b" }}>
              6. Planes Técnicos de Ejecución, Pruebas y Rollback
            </h2>
            {tipoCambio === "EMERGENCIA" && (
              <span style={{ fontSize: 12, color: "#991b1b", backgroundColor: "#fee2e2", padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>
                Opcional durante el registro urgente; obligatorio para resolver o cerrar.
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">
                Plan Paso a Paso de Implementación {tipoCambio === "NORMAL" ? "*" : ""}
              </label>
              <textarea
                className="input-base"
                rows={5}
                placeholder="1. Respaldo previo.&#10;2. Detención de procesos.&#10;3. Aplicación de cambios.&#10;4. Puesta en marcha..."
                value={planImplementacion}
                onChange={(e) => setPlanImplementacion(e.target.value)}
                disabled={guardando || tipoCambio === "ESTANDAR"}
                required={tipoCambio === "NORMAL"}
              />
            </div>

            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">
                Plan de Rollback / Contingencia {tipoCambio === "NORMAL" ? "*" : ""}
              </label>
              <textarea
                className="input-base"
                rows={5}
                placeholder="Instrucciones paso a paso para revertir el cambio si falla la validación o se supera el tiempo límite..."
                value={planRollback}
                onChange={(e) => setPlanRollback(e.target.value)}
                disabled={guardando || tipoCambio === "ESTANDAR"}
                required={tipoCambio === "NORMAL"}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">
                Plan de Pruebas de Calidad {tipoCambio === "NORMAL" ? "*" : ""}
              </label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="Pruebas de humo, healthchecks y validaciones técnicas post-cambio..."
                value={planPruebas}
                onChange={(e) => setPlanPruebas(e.target.value)}
                disabled={guardando || tipoCambio === "ESTANDAR"}
                required={tipoCambio === "NORMAL"}
              />
            </div>

            <div className="campo" style={{ margin: 0 }}>
              <label className="etiqueta">
                Criterios de Éxito {tipoCambio === "NORMAL" ? "*" : ""}
              </label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="Condiciones comprobables para declarar la intervención como completada satisfactoriamente..."
                value={criteriosExito}
                onChange={(e) => setCriteriosExito(e.target.value)}
                disabled={guardando || tipoCambio === "ESTANDAR"}
                required={tipoCambio === "NORMAL"}
              />
            </div>
          </div>

          <div className="campo" style={{ margin: 0 }}>
            <label className="etiqueta">Evidencias Adjuntas / Notas de Validación (Opcional)</label>
            <input
              type="text"
              className="input-base"
              placeholder="URLs a repositorios, tickets Jira/GitLab, capturas de pantalla o logs de referencia..."
              value={evidencias}
              onChange={(e) => setEvidencias(e.target.value)}
              disabled={guardando}
            />
          </div>
        </div>

        {/* SECCIÓN 7: CAMPOS TÉCNICOS COMPLEMENTARIOS (Configurados por Administración) */}
        {camposPersonalizadosDef.length > 0 && (
          <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18, marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", color: "#1e293b" }}>
              7. Campos Técnicos Complementarios
            </h2>
            <p style={{ margin: "0 0 16px", fontSize: 12.5, color: "#64748b" }}>
              Campos parametrizados en la política de cambios por la administración.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))", gap: 16 }}>
              {camposPersonalizadosDef.map((cp) => (
                <div key={cp.codigo} className="campo" style={{ margin: 0 }}>
                  <label className="etiqueta">
                    {cp.etiqueta} {cp.obligatorio && <span style={{ color: "#dc2626" }}>*</span>}
                  </label>
                  {cp.tipo === "lista" ? (
                    <select
                      className="input-base"
                      value={valoresPersonalizados[cp.codigo] || ""}
                      onChange={(e) => setValoresPersonalizados((prev) => ({ ...prev, [cp.codigo]: e.target.value }))}
                      disabled={guardando}
                      required={cp.obligatorio}
                    >
                      <option value="">Seleccione una opción...</option>
                      {(cp.opciones || []).map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                  ) : cp.tipo === "area" ? (
                    <textarea
                      className="input-base"
                      rows={3}
                      placeholder={cp.ayuda || ""}
                      value={valoresPersonalizados[cp.codigo] || ""}
                      onChange={(e) => setValoresPersonalizados((prev) => ({ ...prev, [cp.codigo]: e.target.value }))}
                      disabled={guardando}
                      required={cp.obligatorio}
                    />
                  ) : (
                    <input
                      type={cp.tipo === "numero" ? "number" : cp.tipo === "fecha" ? "date" : cp.tipo === "correo" ? "email" : "text"}
                      className="input-base"
                      placeholder={cp.ayuda || ""}
                      value={valoresPersonalizados[cp.codigo] || ""}
                      onChange={(e) => setValoresPersonalizados((prev) => ({ ...prev, [cp.codigo]: e.target.value }))}
                      disabled={guardando}
                      required={cp.obligatorio}
                    />
                  )}
                  {cp.ayuda && <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>{cp.ayuda}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                router.back();
              } else {
                router.push("/plataforma/cambios/gestion?vista=historial");
              }
            }}
            className="boton-secundario"
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="boton-primario"
            disabled={guardando}
          >
            {guardando
              ? "Registrando..."
              : tipoCambio === "EMERGENCIA"
              ? "Registrar Cambio de Emergencia"
              : tipoCambio === "ESTANDAR"
              ? "Registrar Cambio Estándar"
              : "Registrar Solicitud de Cambio"}
          </button>
        </div>
      </form>

      {/* MODAL / POPUP INTERACTIVO: CUESTIONARIO DE RIESGO PONDERADO */}
      {modalRiesgoAbierto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(2px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#1e293b" }}>
                  Cuestionario de Riesgo Ponderado (ITIL v4)
                </h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#64748b" }}>
                  Responda a los siguientes criterios para determinar el nivel ponderado de riesgo del cambio.
                </p>
              </div>
              <button className="boton-enlace"
                type="button"
                onClick={() => setModalRiesgoAbierto(false)}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 20 }}>
              {preguntasRiesgo.map((p, idx) => (
                <div key={p.id} style={{ padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 8 }}>
                    {idx + 1}. {p.texto} <span style={{ fontSize: 11, color: "#64748b" }}>(Peso: x{p.peso})</span>
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.opciones.map((op) => (
                      <label
                        key={op.valor}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontSize: 12.5,
                          cursor: "pointer",
                          color: "#334155",
                        }}
                      >
                        <input
                          type="radio"
                          name={`preg_${p.id}`}
                          value={op.valor}
                          checked={respuestasRiesgo[p.id] === op.valor}
                          onChange={() =>
                            setRespuestasRiesgo((prev) => ({
                              ...prev,
                              [p.id]: op.valor,
                            }))
                          }
                        />
                        <span>{op.texto}</span>
                        {op.eleva_minimo && (
                          <span style={{ fontSize: 10.5, color: "#dc2626", fontWeight: 600 }}>
                            [Eleva mín a {op.eleva_minimo}]
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button
                type="button"
                onClick={() => setModalRiesgoAbierto(false)}
                className="boton-secundario"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={calcularRiesgoPonderado}
                className="boton-primario"
              >
                Aplicar Evaluación de Riesgo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
