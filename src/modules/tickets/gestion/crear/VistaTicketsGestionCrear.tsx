"use client";

import { useEffect, useState, FormEvent, Suspense, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CatalogosTickets, ServicioCatalogo, Usuario } from "@/types";
import {
  validarTexto,
  validarNombre,
  validarFechaNoPasada,
  validarArchivoAdjunto,
  validarNumeroPositivo,
  validarCorreo,
  validarSlaTiempos,
} from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

interface CampoConfigurado {
  id: string;
  etiqueta: string;
  descripcion?: string;
  tipo: "texto" | "area" | "numero" | "fecha" | "lista" | "casilla";
  habilitado: boolean;
  obligatorio: boolean;
  prioridad_minima: number;
  opciones?: string;
}

interface ArchivoAdjuntoLocal {
  nombre: string;
  tipo: string;
  tamano: number;
  base64: string;
}

interface UsuarioItemBusqueda {
  id_usuario: number;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string;
  correo_electronico: string;
  numero_documento?: string;
  cargo?: string;
  nivel_prioridad?: number;
  departamento_nombre?: string;
}

const EXTENSIONES_PROHIBIDAS = [".exe", ".bat", ".cmd", ".sh", ".ps1", ".vbs", ".js", ".msi", ".com", ".scr", ".jar"];
const TAMANO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

const NIVELES_PRIORIDAD_MAP: Record<number, { nombre: string; color: string; bg: string }> = {
  1: { nombre: "Prioridad VIP", color: "#7c3aed", bg: "#f3e8ff" },
  2: { nombre: "Prioridad Ejecutiva", color: "#2563eb", bg: "#eff6ff" },
  3: { nombre: "Prioridad Preferente", color: "#0891b2", bg: "#ecfeff" },
  4: { nombre: "Prioridad Operativa", color: "#059669", bg: "#ecfdf5" },
  5: { nombre: "Prioridad Estándar", color: "#475569", bg: "#f1f5f9" },
};

function deducirPrioridad(nivelImpacto: number, nivelUrgencia: number): { codigo: string; nombre: string; sla: number; color: string } {
  if (nivelImpacto === 3 && nivelUrgencia === 3) return { codigo: "P1", nombre: "Crítica", sla: 4, color: "#dc2626" };
  if (nivelImpacto === 3 && nivelUrgencia === 2) return { codigo: "P2", nombre: "Alta", sla: 8, color: "#ea580c" };
  if (nivelImpacto === 3 && nivelUrgencia === 1) return { codigo: "P3", nombre: "Media", sla: 24, color: "#d97706" };

  if (nivelImpacto === 2 && nivelUrgencia === 3) return { codigo: "P2", nombre: "Alta", sla: 8, color: "#ea580c" };
  if (nivelImpacto === 2 && nivelUrgencia === 2) return { codigo: "P3", nombre: "Media", sla: 24, color: "#d97706" };
  if (nivelImpacto === 2 && nivelUrgencia === 1) return { codigo: "P4", nombre: "Baja", sla: 72, color: "#2563eb" };

  if (nivelImpacto === 1 && nivelUrgencia === 3) return { codigo: "P3", nombre: "Media", sla: 24, color: "#d97706" };
  if (nivelImpacto === 1 && nivelUrgencia === 2) return { codigo: "P4", nombre: "Baja", sla: 72, color: "#2563eb" };
  return { codigo: "P4", nombre: "Baja", sla: 72, color: "#2563eb" };
}

function ContenidoCrearTicket() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramTipo = searchParams.get("tipo");
  const paramServicio = searchParams.get("servicio");
  const paramCat = searchParams.get("categoria");
  const paramTit = searchParams.get("titulo");

  // 1. Selector de las dos grandes categorías: 1 = Incidente, 2 = Solicitud
  const tipoInicial = paramTipo === "solicitud" || paramTipo === "2" ? 2 : 1;
  const [idTipo, setIdTipo] = useState<number>(tipoInicial);

  const [catalogos, setCatalogos] = useState<CatalogosTickets | null>(null);
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null);
  const [camposConfig, setCamposConfig] = useState<Record<string, CampoConfigurado[]>>({
    incidente: [],
    solicitud: [],
  });
  // SLA por defecto del administrador, indexados por código de prioridad (P1, P2, P3, P4)
  const [slaObjetivosAdmin, setSlaObjetivosAdmin] = useState<Record<string, { respuesta: number; resolucion: number }>>({
    P1: { respuesta: 1, resolucion: 4 },
    P2: { respuesta: 2, resolucion: 8 },
    P3: { respuesta: 4, resolucion: 24 },
    P4: { respuesta: 8, resolucion: 72 },
  });
  // SLA por defecto para solicitudes cuando no hay servicio seleccionado
  const [slaDefaultSolicitud, setSlaDefaultSolicitud] = useState<{ respuesta: number; resolucion: number }>({ respuesta: 4, resolucion: 72 });
  const [cargando, setCargando] = useState(true);

  // Campos principales del formulario
  const [idServicio, setIdServicio] = useState<number | "">("");
  const [idCategoria, setIdCategoria] = useState<number | "">("");
  const [canalComunicacion] = useState<string>("PORTAL_WEB");
  const [idImpacto, setIdImpacto] = useState<number>(2); // Media por defecto
  const [idUrgencia, setIdUrgencia] = useState<number>(2); // Media por defecto
  const [titulo, setTitulo] = useState(paramTit || "");
  const [descripcion, setDescripcion] = useState("");

  // Campos específicos de solicitud
  const [justificacion, setJustificacion] = useState("");
  const [fechaLimiteDeseada, setFechaLimiteDeseada] = useState("");

  // Elemento CMDB (Hardware / Software)
  const [elementoCmdb, setElementoCmdb] = useState("");

  // Registrar a nombre de otro / Selección de Solicitante
  const [perfilesIds, setPerfilesIds] = useState<number[]>([]);
  const [modoRegistro, setModoRegistro] = useState<"propio" | "otro">("propio");
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [usuariosEncontrados, setUsuariosEncontrados] = useState<UsuarioItemBusqueda[]>([]);
  const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItemBusqueda | null>(null);
  const [autoasignarTecnico, setAutoasignarTecnico] = useState(false);
  const [enNombreDeOtroValor, setEnNombreDeOtroValor] = useState("");
  const [imagenModal, setImagenModal] = useState<{ url: string; nombre: string } | null>(null);

  // Campos dinámicos configurados por el administrador
  const [camposDinamicos, setCamposDinamicos] = useState<Record<string, any>>({});

  // Archivos adjuntos
  const [archivos, setArchivos] = useState<ArchivoAdjuntoLocal[]>([]);
  const [errorArchivos, setErrorArchivos] = useState<string | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar catálogos, usuario actual y configuración de campos del administrador
  useEffect(() => {
    async function cargarTodo() {
      setCargando(true);
      setError(null);
      try {
        const [resCat, resUser, resConfig, resSla] = await Promise.all([
          fetch("/api/tickets/catalogos").then((r) => r.json()),
          fetch("/api/mi-cuenta").then((r) => r.json()),
          fetch("/api/admin/configuracion?clave=formularios_solicitante_config").then((r) => r.json()),
          fetch("/api/admin/sla").then((r) => r.json()),
        ]);

        setCatalogos(resCat);

        if (resUser.usuario) {
          setUsuarioActual(resUser.usuario);
        }

        if (resUser.perfiles) {
          setPerfilesIds(resUser.perfiles.map((p: any) => p.id_perfil));
        }

        if (resConfig.configuracion?.valor) {
          setCamposConfig(resConfig.configuracion.valor);
        }

        // Cargar objetivos SLA del administrador para calcular SLA cuando no hay servicio seleccionado
        if (resSla.objetivos_ola && Array.isArray(resSla.objetivos_ola)) {
          const mapa: Record<string, { respuesta: number; resolucion: number }> = {};
          for (const obj of resSla.objetivos_ola) {
            if (obj.prioridad_codigo) {
              mapa[obj.prioridad_codigo] = {
                respuesta: obj.primera_respuesta_horas || 4,
                resolucion: obj.resolucion_total_horas || 72,
              };
            }
          }
          if (Object.keys(mapa).length > 0) setSlaObjetivosAdmin(mapa);
        }
        // SLA por defecto para solicitudes: usar el menor de todos los objetivos (solicitudes normales = P3 o P4)
        if (resSla.objetivos_ola && Array.isArray(resSla.objetivos_ola)) {
          const objSolicitud = resSla.objetivos_ola.find((o: any) => o.prioridad_codigo === "P3") ||
            resSla.objetivos_ola.find((o: any) => o.prioridad_codigo === "P4");
          if (objSolicitud) {
            setSlaDefaultSolicitud({
              respuesta: objSolicitud.primera_respuesta_horas || 4,
              resolucion: objSolicitud.resolucion_total_horas || 72,
            });
          }
        }

        // Si viene preseleccionado por query param
        if (paramCat) {
          setIdCategoria(Number(paramCat));
        } else if (resCat.categorias && resCat.categorias.length > 0) {
          const catDefecto = resCat.categorias.find((c: any) => c.id_tipo_ticket === tipoInicial);
          if (catDefecto) setIdCategoria(catDefecto.id_categoria);
        }

        if (paramServicio && resCat.servicios && resCat.servicios.length > 0) {
          const srv = resCat.servicios.find(
            (s: ServicioCatalogo) =>
              s.codigo_servicio.toUpperCase() === paramServicio.toUpperCase() ||
              String(s.id_servicio) === paramServicio
          );
          if (srv) {
            setIdServicio(srv.id_servicio);
            setIdTipo(srv.id_tipo_ticket);
            setIdCategoria(srv.id_categoria);
            setTitulo(paramTit || `[${srv.codigo_servicio}] ${srv.nombre}`);
          }
        }
      } catch {
        setError("Error al cargar los datos del catálogo y configuración de formularios.");
      } finally {
        setCargando(false);
      }
    }
    cargarTodo();
  }, [paramCat, paramServicio, paramTit, tipoInicial]);

  // Al cambiar la categoría grande (Incidente <-> Solicitud)
  function cambiarCategoriaPrincipal(nuevoTipo: number) {
    if (nuevoTipo === idTipo) return;
    setIdTipo(nuevoTipo);
    setIdServicio("");
    setCamposDinamicos({});
    setTitulo("");
    setDescripcion("");
    setJustificacion("");
    setFechaLimiteDeseada("");
    setElementoCmdb("");
    setEnNombreDeOtroValor("");

    if (catalogos?.categorias) {
      const primeraCat = catalogos.categorias.find((c) => c.id_tipo_ticket === nuevoTipo);
      if (primeraCat) setIdCategoria(primeraCat.id_categoria);
      else setIdCategoria("");
    }
  }

  // Filtrar servicios acordes al tipo seleccionado (Incidente vs Solicitud)
  const serviciosDelTipo = (catalogos?.servicios || []).filter(
    (s) => s.id_tipo_ticket === idTipo
  );

  const servicioSeleccionado = serviciosDelTipo.find((s) => s.id_servicio === idServicio);

  function seleccionarServicio(id: number | "") {
    if (!id) {
      setIdServicio("");
      return;
    }
    const srv = serviciosDelTipo.find((s) => s.id_servicio === id);
    if (srv) {
      setIdServicio(srv.id_servicio);
      setIdCategoria(srv.id_categoria);
      setTitulo(`[${srv.codigo_servicio}] ${srv.nombre}`);
    }
  }

  // Búsqueda de usuarios con debounce para personal de soporte
  async function buscarUsuariosEnApi(termino: string) {
    setBuscandoUsuarios(true);
    try {
      const res = await fetch(`/api/tecnico/usuarios?q=${encodeURIComponent(termino.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setUsuariosEncontrados(data.usuarios || []);
      }
    } catch {
      console.error("Error al buscar usuarios.");
    } finally {
      setBuscandoUsuarios(false);
    }
  }

  useEffect(() => {
    if (modoRegistro === "otro" && !usuarioSeleccionado) {
      if (busquedaUsuario.trim().length < 2) {
        setUsuariosEncontrados([]);
        return;
      }
      const timer = setTimeout(() => {
        buscarUsuariosEnApi(busquedaUsuario);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [busquedaUsuario, modoRegistro, usuarioSeleccionado]);

  function seleccionarUsuario(u: UsuarioItemBusqueda) {
    setUsuarioSeleccionado(u);
    setEnNombreDeOtroValor(`${u.nombres} ${u.apellido_paterno}`);
    setUsuariosEncontrados([]);
    setBusquedaUsuario("");
  }

  function deseleccionarUsuario() {
    setUsuarioSeleccionado(null);
    setEnNombreDeOtroValor("");
  }

  // Detección de rol de personal técnico o de soporte
  const esPersonalTI = perfilesIds.some((id) => [1, 2, 4, 8].includes(id));

  // Campos del administrador visibles según la prioridad del usuario
  const esIncidente = idTipo === 1;
  const listaCamposAdmin = esIncidente ? camposConfig.incidente : camposConfig.solicitud;
  const nivelPrioridadUsuario = Number(usuarioSeleccionado?.nivel_prioridad || usuarioActual?.nivel_prioridad || 5);
  const infoPrioridad = NIVELES_PRIORIDAD_MAP[nivelPrioridadUsuario] || NIVELES_PRIORIDAD_MAP[5];

  const camposVisibles = (listaCamposAdmin || []).filter(
    (c) => c.habilitado && nivelPrioridadUsuario <= c.prioridad_minima
  );

  // Verificar si tiene habilitado el campo "en_nombre_de_otro"
  const campoEnNombreDeOtro = camposVisibles.find((c) => c.id === "en_nombre_de_otro");
  const puedeRegistrarEnNombreDeOtro = Boolean(campoEnNombreDeOtro) || esPersonalTI;

  // Categorías de ticket filtradas por tipo y activas en el catálogo
  const categoriasFiltradas = (catalogos?.categorias || []).filter(
    (c) => c.id_tipo_ticket === idTipo && c.estado_registro !== false
  );

  const categoriaActual = categoriasFiltradas.find((c) => c.id_categoria === idCategoria);

  // Cálculo de prioridad ITIL para incidentes (necesario antes del SLA dinámico)
  const nivelImpacto = catalogos?.impactos.find((i) => i.id_impacto === idImpacto)?.nivel || 2;
  const nivelUrgencia = catalogos?.urgencias.find((u) => u.id_urgencia === idUrgencia)?.nivel || 2;
  const prioridadCalculada = deducirPrioridad(nivelImpacto, nivelUrgencia);

  // SLA mostrado y validación en tiempo real:
  // - Con servicio: usa los SLA del servicio seleccionado del catálogo.
  // - Incidente sin servicio: usa el SLA del admin según prioridad calculada (urgencia x impacto).
  // - Solicitud sin servicio: usa el SLA por defecto configurado por el administrador (P3/P4).
  function calcularSlaDinamico(): { respuesta: number; resolucion: number; fuente: string } {
    if (servicioSeleccionado) {
      return {
        respuesta: servicioSeleccionado.sla_horas_respuesta,
        resolucion: servicioSeleccionado.sla_horas_resolucion,
        fuente: "catalogo",
      };
    }
    if (esIncidente) {
      const slaAdmin = slaObjetivosAdmin[prioridadCalculada.codigo];
      return {
        respuesta: slaAdmin?.respuesta || prioridadCalculada.sla,
        resolucion: slaAdmin?.resolucion || prioridadCalculada.sla * 6,
        fuente: "prioridad",
      };
    }
    // Solicitud sin servicio: SLA por defecto del admin
    return {
      respuesta: slaDefaultSolicitud.respuesta,
      resolucion: slaDefaultSolicitud.resolucion,
      fuente: "admin_default",
    };
  }

  const slaCalculado = calcularSlaDinamico();
  const slaRespuestaMostrar = slaCalculado.respuesta;
  const slaResolucionMostrar = slaCalculado.resolucion;
  const valSlaTicket = validarSlaTiempos(slaRespuestaMostrar, slaResolucionMostrar);

  // Validaciones reactivas en tiempo real del formulario de ticket (Incidentes y Solicitudes)
  const valTitulo = validarTexto(titulo, 5, 150, "El título", true);
  const valDescripcion = validarTexto(descripcion, 15, 3000, "La descripción", true);
  const valJustificacion = esIncidente ? { valido: true } : validarTexto(justificacion, 10, 1000, "La justificación", true);
  const valFechaDeseada = !esIncidente && fechaLimiteDeseada ? validarFechaNoPasada(fechaLimiteDeseada, "La fecha límite deseada") : { valido: true };
  const valBeneficiario = modoRegistro === "otro" && esPersonalTI ? usuarioSeleccionado !== null : true;
  const valCategoria = Boolean(idCategoria);

  // Campos dinámicos requeridos faltantes
  const camposDinamicosFaltantes = camposVisibles.filter((c) => {
    if (!c.obligatorio || c.id === "en_nombre_de_otro") return false;
    const v = camposDinamicos[c.id];
    return v === undefined || v === null || String(v).trim() === "";
  });

  const formularioTicketValido =
    valTitulo.valido &&
    valDescripcion.valido &&
    valCategoria &&
    valJustificacion.valido &&
    valFechaDeseada.valido &&
    valBeneficiario &&
    valSlaTicket.valido &&
    camposDinamicosFaltantes.length === 0;

  function actualizarCampoDinamico(idCampo: string, valor: any) {
    setCamposDinamicos((prev) => ({
      ...prev,
      [idCampo]: valor,
    }));
  }

  async function manejarSeleccionArchivos(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setErrorArchivos(null);

    const nuevosArchivos: ArchivoAdjuntoLocal[] = [];
    const files = Array.from(e.target.files);

    for (const file of files) {
      const valArch = validarArchivoAdjunto(file.name, file.size, 5);
      if (!valArch.valido) {
        setErrorArchivos(valArch.mensaje!);
        return;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        nuevosArchivos.push({
          nombre: file.name,
          tipo: file.type || "application/octet-stream",
          tamano: file.size,
          base64,
        });
      } catch {
        setErrorArchivos(`Error al procesar el archivo "${file.name}".`);
      }
    }

    setArchivos((prev) => [...prev, ...nuevosArchivos]);
    e.target.value = "";
  }

  function eliminarArchivo(index: number) {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  }

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const vTit = validarTexto(titulo, 5, 150, "El título del ticket", true);
    if (!vTit.valido) {
      setError(vTit.mensaje!);
      return;
    }

    const vDesc = validarTexto(descripcion, 15, 3000, "La descripción del ticket", true);
    if (!vDesc.valido) {
      setError(vDesc.mensaje!);
      return;
    }

    if (!idCategoria) {
      setError("Debes seleccionar una categoría para clasificar tu requerimiento.");
      return;
    }

    if (!esIncidente) {
      const vJust = validarTexto(justificacion, 10, 1000, "La justificación institucional de tu solicitud", true);
      if (!vJust.valido) {
        setError(vJust.mensaje!);
        return;
      }
      if (fechaLimiteDeseada) {
        const vFecha = validarFechaNoPasada(fechaLimiteDeseada, "La fecha límite deseada");
        if (!vFecha.valido) {
          setError(vFecha.mensaje!);
          return;
        }
      }
    }

    if (enNombreDeOtroValor) {
      const vEnNombre = validarNombre(enNombreDeOtroValor, "El nombre del colaborador representado", false);
      if (!vEnNombre.valido) {
        setError(vEnNombre.mensaje!);
        return;
      }
    }

    // Validar campos dinámicos obligatorios según configuración del administrador
    for (const campo of camposVisibles) {
      if (campo.obligatorio && campo.id !== "en_nombre_de_otro") {
        const valor = camposDinamicos[campo.id];
        if (valor === undefined || valor === null || String(valor).trim() === "") {
          setError(`El campo "${campo.etiqueta}" es obligatorio.`);
          return;
        }
        if (campo.tipo === "numero") {
          const vNum = validarNumeroPositivo(valor, campo.etiqueta);
          if (!vNum.valido) {
            setError(vNum.mensaje!);
            return;
          }
        }
      }
    }

    setGuardando(true);
    try {
      const payloadCamposAdicionales: Record<string, any> = {
        ...camposDinamicos,
      };

      if (elementoCmdb) {
        payloadCamposAdicionales["elemento_cmdb"] = elementoCmdb;
      }
      if (enNombreDeOtroValor) {
        payloadCamposAdicionales["en_nombre_de_otro_valor"] = enNombreDeOtroValor;
      }
      if (!esIncidente) {
        payloadCamposAdicionales["justificacion"] = justificacion.trim();
        if (fechaLimiteDeseada) {
          payloadCamposAdicionales["fecha_limite_deseada"] = fechaLimiteDeseada;
        }
      }

      const endpoint = esIncidente ? "/api/incidentes" : "/api/solicitudes";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          id_tipo_ticket: idTipo,
          id_categoria: idCategoria,
          id_servicio: idServicio ? Number(idServicio) : null,
          canal_comunicacion: canalComunicacion,
          id_impacto: esIncidente ? idImpacto : 1,
          id_urgencia: esIncidente ? idUrgencia : 1,
          campos_adicionales: payloadCamposAdicionales,
          id_usuario_solicitante: usuarioSeleccionado ? usuarioSeleccionado.id_usuario : undefined,
          autoasignar_tecnico: autoasignarTecnico,
          archivos: archivos.map((a) => ({
            nombre: a.nombre,
            tipo: a.tipo,
            tamano: a.tamano,
            base64: a.base64,
          })),
        }),
      });

      const datos = await res.json();
      if (!res.ok) {
        setError(datos.error || "No se pudo registrar el ticket");
        return;
      }

      // Redirigir directamente a la página completa del ticket creado
      router.refresh();
      if (datos.ticket?.id_ticket) {
        router.push(`/tickets/${datos.ticket.id_ticket}`);
      } else {
        router.push("/tickets/gestion/mios");
      }
    } catch {
      setError("Error de conexión al enviar el ticket.");
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ color: "#2563eb", fontWeight: 600, fontSize: 14 }}>
          Cargando configuración de la Mesa de Servicio...
        </div>
      </div>
    );
  }

  return (
    <div className="vista-contenedor" style={{ maxWidth: 860, margin: "0 auto", paddingBottom: 60 }}>
      {/* Encabezado */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          Crear Ticket en Mesa de Servicio
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4, marginBottom: 0 }}>
          Selecciona el tipo de proceso para habilitar el formulario oficial correspondiente.
        </p>
      </div>

      {/* 1.1 DOS CATEGORÍAS CON ICONOS GRANDES Y BREVE DEFINICIÓN */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Tarjeta 1: INCIDENTE */}
        <div
          onClick={() => cambiarCategoriaPrincipal(1)}
          style={{
            backgroundColor: "#ffffff",
            border: idTipo === 1 ? "2.5px solid #ea580c" : "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "20px 22px",
            cursor: "pointer",
            boxShadow: idTipo === 1 ? "0 4px 12px rgba(234, 88, 12, 0.12)" : "0 1px 3px rgba(0,0,0,0.03)",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            position: "relative",
          }}
        >
          {/* Icono Grande de Incidente */}
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              backgroundColor: idTipo === 1 ? "#fff7ed" : "#f8fafc",
              color: idTipo === 1 ? "#ea580c" : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: idTipo === 1 ? "#c2410c" : "#0f172a", margin: 0 }}>
                Incidente
              </h2>
              {idTipo === 1 && (
                <span style={{ fontSize: 10.5, fontWeight: 700, backgroundColor: "#ffedd5", color: "#9a3412", padding: "2px 8px", borderRadius: 10 }}>
                  Seleccionado
                </span>
              )}
            </div>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Reporte de fallas, averías técnicas, caídas de red o interrupciones no planificadas que impiden tu trabajo.
            </p>
          </div>
        </div>

        {/* Tarjeta 2: SOLICITUD DE SERVICIO */}
        <div
          onClick={() => cambiarCategoriaPrincipal(2)}
          style={{
            backgroundColor: "#ffffff",
            border: idTipo === 2 ? "2.5px solid #2563eb" : "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "20px 22px",
            cursor: "pointer",
            boxShadow: idTipo === 2 ? "0 4px 12px rgba(37, 99, 235, 0.12)" : "0 1px 3px rgba(0,0,0,0.03)",
            transition: "all 0.15s ease",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            position: "relative",
          }}
        >
          {/* Icono Grande de Solicitud */}
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 12,
              backgroundColor: idTipo === 2 ? "#eff6ff" : "#f8fafc",
              color: idTipo === 2 ? "#2563eb" : "#64748b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              <path d="m9 14 2 2 4-4" />
            </svg>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: idTipo === 2 ? "#1d4ed8" : "#0f172a", margin: 0 }}>
                Solicitud de Servicio
              </h2>
              {idTipo === 2 && (
                <span style={{ fontSize: 10.5, fontWeight: 700, backgroundColor: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: 10 }}>
                  Seleccionado
                </span>
              )}
            </div>
            <p style={{ fontSize: 12.5, color: "#64748b", margin: 0, lineHeight: 1.5 }}>
              Petición de nuevo equipamiento, creación de usuarios y accesos, licencias de software o peticiones estándar de TI.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FORMULARIO OFICIAL CORRESPONDIENTE (ESTRUCTURA IDÉNTICA A LA VISTA PREVIA)*/}
      {/* ========================================================================= */}
      <div style={{ border: "1px solid #cbd5e1", borderRadius: 10, overflow: "hidden", backgroundColor: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {/* Cabecera del Formulario Oficial */}
        <div
          style={{
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "16px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
              {esIncidente ? "Reportar Nuevo Incidente Técnico" : "Registrar Nueva Solicitud de Servicio"}
            </h2>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>
              Formulario oficial configurado para {infoPrioridad.nombre}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 6,
              backgroundColor: infoPrioridad.bg,
              color: infoPrioridad.color,
            }}
          >
            {infoPrioridad.nombre}
          </span>
        </div>

        {error && (
          <div style={{ margin: 20, marginBottom: 0, padding: 14, backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8, color: "#991b1b", fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={manejarEnvio} style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Selector de Solicitante (Personal técnico/admin o usuario con permiso) */}
          {puedeRegistrarEnNombreDeOtro && (
            <div style={{ padding: 14, backgroundColor: "#eff6ff", borderRadius: 8, border: "1px solid #bfdbfe" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1e40af", margin: 0 }}>
                  Solicitante / Beneficiario del Ticket
                </label>
                {esPersonalTI && (
                  <div style={{ display: "flex", gap: 14 }}>
                    <label style={{ fontSize: 12, color: "#1e3a8a", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontWeight: modoRegistro === "propio" ? 700 : 500 }}>
                      <input
                        type="radio"
                        name="modoRegistro"
                        checked={modoRegistro === "propio"}
                        onChange={() => {
                          setModoRegistro("propio");
                          deseleccionarUsuario();
                        }}
                      />
                      A mi nombre ({usuarioActual?.nombres || "Personal TI"})
                    </label>
                    <label style={{ fontSize: 12, color: "#1e3a8a", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", fontWeight: modoRegistro === "otro" ? 700 : 500 }}>
                      <input
                        type="radio"
                        name="modoRegistro"
                        checked={modoRegistro === "otro"}
                        onChange={() => setModoRegistro("otro")}
                      />
                      En nombre de un usuario institucional
                    </label>
                  </div>
                )}
              </div>

              {modoRegistro === "otro" ? (
                <div>
                  {usuarioSeleccionado ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#ffffff", padding: "10px 14px", borderRadius: 6, border: "1px solid #93c5fd" }}>
                      <div>
                        <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>
                          {usuarioSeleccionado.nombres} {usuarioSeleccionado.apellido_paterno} {usuarioSeleccionado.apellido_materno || ""}
                        </strong>
                        <div style={{ fontSize: 11.5, color: "#64748b" }}>
                          {usuarioSeleccionado.correo_electronico} · Doc: {usuarioSeleccionado.numero_documento || "S/D"} · Área: {usuarioSeleccionado.departamento_nombre || "General"}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={deseleccionarUsuario}
                        className="boton-secundario"
                        style={{ fontSize: 11.5, padding: "4px 10px", width: "auto" }}
                      >
                        Cambiar usuario
                      </button>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <input
                        type="text"
                        className="input-base"
                        placeholder="Buscar usuario por nombre, apellido, correo o documento..."
                        value={busquedaUsuario}
                        onChange={(e) => setBusquedaUsuario(e.target.value)}
                        style={{ backgroundColor: "white", fontSize: 12.5 }}
                      />
                      {buscandoUsuarios && (
                        <div style={{ fontSize: 11, color: "#2563eb", marginTop: 4 }}>Buscando usuarios...</div>
                      )}
                      {usuariosEncontrados.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            backgroundColor: "#ffffff",
                            border: "1px solid #cbd5e1",
                            borderRadius: 6,
                            marginTop: 4,
                            maxHeight: 220,
                            overflowY: "auto",
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            zIndex: 30,
                          }}
                        >
                          {usuariosEncontrados.map((u) => (
                            <div
                              key={u.id_usuario}
                              onClick={() => seleccionarUsuario(u)}
                              style={{
                                padding: "8px 12px",
                                borderBottom: "1px solid #f1f5f9",
                                cursor: "pointer",
                                fontSize: 12,
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f8fafc")}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                              <strong style={{ color: "#0f172a" }}>
                                {u.nombres} {u.apellido_paterno}
                              </strong>{" "}
                              <span style={{ color: "#64748b" }}>({u.correo_electronico})</span>
                              <div style={{ fontSize: 10.5, color: "#64748b", marginTop: 2 }}>
                                Doc/DNI: {u.numero_documento || "S/D"} · Área: {u.departamento_nombre || "General"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!buscandoUsuarios && busquedaUsuario.trim().length >= 2 && usuariosEncontrados.length === 0 && (
                        <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 6, padding: "6px 8px", backgroundColor: "#f8fafc", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
                          No se encontraron usuarios coincidentes con &quot;{busquedaUsuario}&quot;.
                        </div>
                      )}
                      {busquedaUsuario.trim().length > 0 && busquedaUsuario.trim().length < 2 && (
                        <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 6, padding: "6px 8px", backgroundColor: "#f8fafc", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
                          Ingrese al menos 2 caracteres para buscar usuarios.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                !esPersonalTI && (
                  <div>
                    <input
                      type="text"
                      className="input-base"
                      maxLength={100}
                      placeholder="Nombre, correo o colaborador afectado..."
                      value={enNombreDeOtroValor}
                      onChange={(e) => setEnNombreDeOtroValor(e.target.value)}
                      style={{ backgroundColor: "white", fontSize: 12.5 }}
                    />
                    {enNombreDeOtroValor.trim().length > 0 && enNombreDeOtroValor.trim().length < 2 && (
                      <AlertaCampo error="Debe tener al menos 2 caracteres." />
                    )}
                  </div>
                )
              )}

              {esPersonalTI && (
                <div style={{ marginTop: 10 }}>
                  <label style={{ fontSize: 12, color: "#1e3a8a", display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={autoasignarTecnico}
                      onChange={(e) => setAutoasignarTecnico(e.target.checked)}
                    />
                    Autoasignarme este ticket para atención técnica inmediata
                  </label>
                </div>
              )}
            </div>
          )}

          {/* 1. Servicio de Catálogo Dinámico (Opcional) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Servicio de Catálogo (Opcional)
              </label>
              <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
                Opcional - Puede ser un requerimiento nuevo no clasificado
              </span>
            </div>
            <select
              className="input-base"
              style={{ backgroundColor: "white", fontSize: 13, cursor: "pointer", width: "100%" }}
              value={idServicio}
              onChange={(e) => seleccionarServicio(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Sin servicio específico / Requerimiento nuevo no catalogado...</option>
              {serviciosDelTipo.map((srv) => (
                <option key={srv.id_servicio} value={srv.id_servicio}>
                  {srv.codigo_servicio} · {srv.nombre}
                </option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: "#64748b", marginTop: 4, display: "block" }}>
              {servicioSeleccionado
                ? `Servicio seleccionado: ${servicioSeleccionado.nombre}. Los SLAs se rigen por la ficha del servicio.`
                : esIncidente
                ? `Al no seleccionar servicio, el SLA se calcula dinámicamente según la matriz de prioridad (urgencia vs impacto: ${prioridadCalculada.codigo} - ${prioridadCalculada.nombre}).`
                : "Al no seleccionar servicio, el SLA adopta el valor institucional por defecto configurado por el administrador."}
            </span>
          </div>

          {/* 2. Acuerdos de Nivel de Servicio (SLAs Dinámicos como Campos Formales No Editables) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                SLA Primera Respuesta Comprometido
              </label>
              <input
                type="text"
                readOnly
                className="input-base"
                value={`${slaRespuestaMostrar} horas (${servicioSeleccionado ? "Catálogo" : esIncidente ? "Prioridad " + prioridadCalculada.codigo : "Por defecto administrativo"})`}
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#1e293b",
                  fontWeight: 600,
                  cursor: "not-allowed",
                  border: "1px solid #cbd5e1",
                  fontSize: 12.5,
                }}
              />
              <span style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, display: "block" }}>
                Tiempo normativo de primer contacto ({servicioSeleccionado ? "Ficha de servicio" : esIncidente ? "Urgencia × Impacto" : "Objetivo SLA global"}).
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
                value={`${slaResolucionMostrar} horas (${servicioSeleccionado ? "Catálogo" : esIncidente ? "Prioridad " + prioridadCalculada.codigo : "Por defecto administrativo"})`}
                style={{
                  backgroundColor: "#f1f5f9",
                  color: "#1e293b",
                  fontWeight: 600,
                  cursor: "not-allowed",
                  border: "1px solid #cbd5e1",
                  fontSize: 12.5,
                }}
              />
              <span style={{ fontSize: 10.5, color: "#64748b", marginTop: 2, display: "block" }}>
                Tiempo normativo de restablecimiento o entrega ({servicioSeleccionado ? "Ficha de servicio" : esIncidente ? "Urgencia × Impacto" : "Objetivo SLA global"}).
              </span>
            </div>
          </div>

          {/* Alerta de SLA solo en caso de incoherencia o error */}
          {!valSlaTicket.valido && (
            <div style={{ marginTop: -4 }}>
              <AlertaCampo error={valSlaTicket.mensaje} />
            </div>
          )}

          {/* Selector de Categoría Funcional */}
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
              Categoría Funcional *
            </label>
            <select
              className="input-base"
              value={idCategoria}
              onChange={(e) => setIdCategoria(Number(e.target.value))}
              required
              style={{
                backgroundColor: "white",
                fontSize: 13,
                width: "100%",
                borderColor: !idCategoria ? "#f59e0b" : undefined,
              }}
            >
              <option value="">Seleccione una categoría...</option>
              {categoriasFiltradas.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre}
                </option>
              ))}
            </select>
            {!idCategoria && (
              <AlertaCampo error="Debe seleccionar una categoría funcional para clasificar el requerimiento según estándares ITIL v4." />
            )}
          </div>

          {/* 3. Título del Ticket */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Título *
              </label>
              <span style={{ fontSize: 11, color: titulo.length >= 140 ? "#dc2626" : "#64748b" }}>
                {titulo.length} / 150
              </span>
            </div>
            <input
              type="text"
              className="input-base"
              maxLength={150}
              placeholder={
                esIncidente
                  ? "Resuma brevemente la falla (ej. Pérdida intermitente de enlace de red)..."
                  : "Resuma brevemente el requerimiento (ej. Solicitud de acceso a base de datos contable)..."
              }
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={{
                backgroundColor: titulo.length > 0 && titulo.trim().length < 5 ? "#fef2f2" : "white",
                borderColor: titulo.length > 0 && titulo.trim().length < 5 ? "#ef4444" : undefined,
                fontSize: 13,
              }}
            />
            {titulo.length > 0 && titulo.trim().length < 5 && (
              <AlertaCampo error={`El título debe tener al menos 5 caracteres (has ingresado ${titulo.trim().length} de 5).`} />
            )}
            {titulo.length === 0 && (
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                Mínimo 5 caracteres. Ingrese una síntesis clara del requerimiento.
              </span>
            )}
          </div>

          {/* 4. Descripción con texto de fondo guía */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Descripción *
              </label>
              <span style={{ fontSize: 11, color: descripcion.length >= 2900 ? "#dc2626" : "#64748b" }}>
                {descripcion.length} / 3000
              </span>
            </div>
            <textarea
              className="input-base"
              maxLength={3000}
              rows={4}
              placeholder={
                esIncidente
                  ? "Indique:\n1) Frecuencia de la falla: permanente, intermitente o puntual.\n2) Pasos previos que lo llevaron a la falla.\n3) Hora y tiempo de duración de la falla.\n4) Mensajes o códigos de error arrojados en pantalla..."
                  : "Detalle su requerimiento:\n1) Especificaciones técnicas del equipo o software requerido.\n2) Accesos, carpetas o permisos necesarios.\n3) Justificación operativa y modalidad de entrega..."
              }
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              style={{
                backgroundColor: descripcion.length > 0 && descripcion.trim().length < 15 ? "#fef2f2" : "white",
                borderColor: descripcion.length > 0 && descripcion.trim().length < 15 ? "#ef4444" : undefined,
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            />
            {descripcion.length > 0 && descripcion.trim().length < 15 && (
              <AlertaCampo error={`La descripción debe tener al menos 15 caracteres (has ingresado ${descripcion.trim().length} de 15).`} />
            )}
            {descripcion.length === 0 && (
              <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                Mínimo 15 caracteres. Describa en detalle los antecedentes y contexto del ticket.
              </span>
            )}
          </div>

          {/* CAMPOS ESPECÍFICOS DE INCIDENTES: Urgencia, Impacto y Prioridad */}
          {esIncidente && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    Nivel de Urgencia *
                  </label>
                  <select
                    className="input-base"
                    style={{ backgroundColor: "white", fontSize: 12.5 }}
                    value={idUrgencia}
                    onChange={(e) => setIdUrgencia(Number(e.target.value))}
                  >
                    {catalogos?.urgencias.map((u) => (
                      <option key={u.id_urgencia} value={u.id_urgencia}>
                        {u.nombre} - {u.descripcion}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    Nivel de Impacto *
                  </label>
                  <select
                    className="input-base"
                    style={{ backgroundColor: "white", fontSize: 12.5 }}
                    value={idImpacto}
                    onChange={(e) => setIdImpacto(Number(e.target.value))}
                  >
                    {catalogos?.impactos.map((i) => (
                      <option key={i.id_impacto} value={i.id_impacto}>
                        {i.nombre} - {i.descripcion}
                      </option>
                    ))}
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
                    color: prioridadCalculada.color,
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {prioridadCalculada.codigo} - {prioridadCalculada.nombre}
                </span>
              </div>
            </>
          )}

          {/* CAMPOS ESPECÍFICOS DE SOLICITUDES: Justificación y Fecha Límite Deseada */}
          {!esIncidente && (
            <>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                    Justificación Institucional *
                  </label>
                  <span style={{ fontSize: 11, color: justificacion.length >= 950 ? "#dc2626" : "#64748b" }}>
                    {justificacion.length} / 1000
                  </span>
                </div>
                <textarea
                  className="input-base"
                  maxLength={1000}
                  rows={2}
                  placeholder="Explique el motivo institucional o necesidad de negocio que sustenta esta solicitud..."
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  required
                  style={{
                    backgroundColor: justificacion.length > 0 && justificacion.trim().length < 10 ? "#fef2f2" : "white",
                    borderColor: justificacion.length > 0 && justificacion.trim().length < 10 ? "#ef4444" : undefined,
                    fontSize: 12.5,
                  }}
                />
                {justificacion.length > 0 && justificacion.trim().length < 10 && (
                  <AlertaCampo error={`La justificación debe tener al menos 10 caracteres (has ingresado ${justificacion.trim().length} de 10).`} />
                )}
                {justificacion.length === 0 && (
                  <span style={{ fontSize: 11, color: "#64748b", marginTop: 3, display: "block" }}>
                    Obligatorio en ITIL v4: Indique la necesidad de negocio para evaluación y compuertas de aprobación.
                  </span>
                )}
              </div>

              <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                  Fecha Límite Deseada (Opcional)
                </label>
                <input
                  type="date"
                  className="input-base"
                  value={fechaLimiteDeseada}
                  onChange={(e) => setFechaLimiteDeseada(e.target.value)}
                  style={{ backgroundColor: "white", fontSize: 12.5 }}
                />
                {fechaLimiteDeseada && (() => {
                  const v = validarFechaNoPasada(fechaLimiteDeseada, "La fecha límite deseada");
                  if (!v.valido) {
                    return <AlertaCampo error={v.mensaje} />;
                  }
                  const ahora = new Date();
                  const dDeseada = new Date(fechaLimiteDeseada);
                  const diffHoras = (dDeseada.getTime() - ahora.getTime()) / (1000 * 3600);
                  if (diffHoras > 0 && diffHoras < slaResolucionMostrar) {
                    return (
                      <AlertaCampo info={`Nota ITIL: La fecha deseada está dentro de ${Math.round(diffHoras)}h, menor al SLA estándar de resolución (${slaResolucionMostrar}h). La mesa de ayuda evaluará viabilidad operativa.`} />
                    );
                  }
                  return null;
                })()}
              </div>
            </>
          )}

          {/* Elemento CMDB asignado al usuario solicitante */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", margin: 0 }}>
                Elemento CMDB (Ítems Tecnológicos Hardware / Software)
              </label>
              <span style={{ fontSize: 11, color: "#64748b", fontStyle: "italic" }}>
                Opcional
              </span>
            </div>
            <select
              className="input-base"
              style={{ backgroundColor: "white", fontSize: 12.5 }}
              value={elementoCmdb}
              onChange={(e) => setElementoCmdb(e.target.value)}
            >
              <option value="">Seleccione un ítem asignado (o deje sin seleccionar si no está seguro)...</option>
              <option value="LAPTOP-LENOVO-T14">Hardware: LAPTOP-LENOVO-T14 (Serie: PF39X1 - En custodia del usuario)</option>
              <option value="M365-E3">Software: Licencia Microsoft 365 E3 (Asignada)</option>
              <option value="MON-DELL-P2419H">Periférico: Monitor Dell 24 P2419H (Activo: ACT-0042)</option>
              <option value="OTRO">Otro elemento o equipo no listado</option>
            </select>
          </div>

          {/* Campos adicionales habilitados para esta prioridad por el administrador */}
          {camposVisibles
            .filter((c) => c.id !== "en_nombre_de_otro")
            .map((c) => {
              const valorActual = camposDinamicos[c.id] ?? "";

              return (
                <div key={c.id}>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a", display: "block", marginBottom: 4 }}>
                    {c.etiqueta} {c.obligatorio ? "*" : "(Opcional)"}
                  </label>
                  {c.descripcion && (
                    <span style={{ display: "block", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                      {c.descripcion}
                    </span>
                  )}

                  {c.tipo === "lista" ? (
                    <select
                      className="input-base"
                      style={{ backgroundColor: "white", fontSize: 12.5 }}
                      value={valorActual}
                      onChange={(e) => actualizarCampoDinamico(c.id, e.target.value)}
                      required={c.obligatorio}
                    >
                      <option value="">Seleccione una opción...</option>
                      {(c.opciones || "").split(",").map((op, idx) => (
                        <option key={idx} value={op.trim()}>
                          {op.trim()}
                        </option>
                      ))}
                    </select>
                  ) : c.tipo === "area" ? (
                    <textarea
                      className="input-base"
                      rows={2}
                      value={valorActual}
                      onChange={(e) => actualizarCampoDinamico(c.id, e.target.value)}
                      required={c.obligatorio}
                      style={{ backgroundColor: "white", fontSize: 12.5 }}
                    />
                  ) : c.tipo === "casilla" ? (
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(valorActual)}
                        onChange={(e) => actualizarCampoDinamico(c.id, e.target.checked)}
                      />
                      <span>{c.descripcion || c.etiqueta}</span>
                    </label>
                  ) : (
                    <input
                      type={c.tipo === "numero" ? "number" : c.tipo === "fecha" ? "date" : "text"}
                      className="input-base"
                      placeholder={`Ingrese ${c.etiqueta.toLowerCase()}...`}
                      value={valorActual}
                      onChange={(e) => actualizarCampoDinamico(c.id, e.target.value)}
                      required={c.obligatorio}
                      style={{ backgroundColor: "white", fontSize: 12.5 }}
                    />
                  )}
                </div>
              );
            })}

          {/* Carga de Evidencia de Archivos */}
          <div
            style={{
              padding: 16,
              backgroundColor: "#ffffff",
              borderRadius: 8,
              border: "2px dashed #cbd5e1",
              textAlign: "center",
            }}
          >
            <strong style={{ fontSize: 13, color: "#0f172a", display: "block" }}>
              Carga de Evidencia de Archivos
            </strong>
            <span style={{ fontSize: 11.5, color: "#64748b", display: "block", marginTop: 2, marginBottom: 10 }}>
              Arrastre capturas de pantalla, archivos de error o documentos PDF de respaldo (máx. 5 MB por archivo)
            </span>

            <label
              className="boton-secundario"
              style={{
                fontSize: 12,
                padding: "6px 16px",
                width: "auto",
                display: "inline-block",
                cursor: "pointer",
              }}
            >
              Seleccionar Archivos
              <input
                type="file"
                multiple
                onChange={manejarSeleccionArchivos}
                style={{ display: "none" }}
              />
            </label>

            {errorArchivos && (
              <div style={{ color: "#dc2626", fontSize: 12, marginTop: 8, fontWeight: 600 }}>
                {errorArchivos}
              </div>
            )}

            {archivos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
                {archivos.map((a, idx) => {
                  const esImg = a.tipo.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(a.nombre);
                  return (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #cbd5e1",
                        borderRadius: 6,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        position: "relative",
                      }}
                    >
                      {esImg && a.base64 ? (
                        <div
                          onClick={() => setImagenModal({ url: a.base64, nombre: a.nombre })}
                          style={{ height: 100, backgroundColor: "#0f172a", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}
                          title="Clic para ver foto"
                        >
                          <img src={a.base64} alt={a.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                      ) : (
                        <div style={{ height: 60, backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#64748b", fontWeight: 600 }}>
                          Documento / Archivo
                        </div>
                      )}
                      <div style={{ padding: "6px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4 }}>
                        <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#1e293b", fontWeight: 600 }} title={a.nombre}>
                          {a.nombre}
                        </span>
                        <button
                          type="button"
                          onClick={() => eliminarArchivo(idx)}
                          style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 12, padding: "2px 4px" }}
                          title="Eliminar archivo"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Validación reactiva previa al envío */}
          {!formularioTicketValido && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#991b1b" }}>
              <strong style={{ display: "block", marginBottom: 4 }}>Condiciones pendientes antes de registrar el ticket:</strong>
              <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
                {titulo.trim().length < 5 && <li>El título debe tener al menos 5 caracteres (actualmente: {titulo.trim().length}).</li>}
                {descripcion.trim().length < 15 && <li>La descripción debe tener al menos 15 caracteres (actualmente: {descripcion.trim().length}).</li>}
                {!idCategoria && <li>Debe seleccionar una categoría funcional para clasificar el requerimiento.</li>}
                {!esIncidente && justificacion.trim().length < 10 && <li>La justificación de la solicitud debe tener al menos 10 caracteres (actualmente: {justificacion.trim().length}).</li>}
                {!esIncidente && fechaLimiteDeseada && !validarFechaNoPasada(fechaLimiteDeseada).valido && <li>La fecha límite deseada no puede ser anterior a la fecha actual.</li>}
                {!valSlaTicket.valido && <li>{valSlaTicket.mensaje}</li>}
                {modoRegistro === "otro" && esPersonalTI && !usuarioSeleccionado && <li>Debe seleccionar un colaborador institucional beneficiario del ticket.</li>}
                {camposDinamicosFaltantes.map((c) => (
                  <li key={c.id}>El campo obligatorio &quot;{c.etiqueta}&quot; debe completarse.</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pie del formulario con botones de acción */}
          <div
            style={{
              backgroundColor: "#ffffff",
              paddingTop: 16,
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button
              type="button"
              className="boton-secundario"
              onClick={() => router.push("/tickets/gestion/mios")}
              style={{ width: "auto", fontSize: 13, padding: "8px 18px" }}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-primario"
              disabled={guardando || !formularioTicketValido}
              style={{
                width: "auto",
                fontSize: 13,
                padding: "8px 24px",
                opacity: !formularioTicketValido || guardando ? 0.6 : 1,
                cursor: !formularioTicketValido || guardando ? "not-allowed" : "pointer",
              }}
              title={!formularioTicketValido ? "Complete todos los campos obligatorios para registrar el ticket." : ""}
            >
              {guardando
                ? "Registrando..."
                : esIncidente
                ? "Registrar Incidente"
                : "Enviar Solicitud"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal Visor de Evidencias */}
      {imagenModal && (
        <div
          onClick={() => setImagenModal(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 10,
              maxWidth: "92vw",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#ffffff",
              }}
            >
              <strong style={{ fontSize: 13, color: "#0f172a" }}>{imagenModal.nombre}</strong>
              <button
                type="button"
                onClick={() => setImagenModal(null)}
                className="boton-primario"
                style={{ fontSize: 12, padding: "5px 14px", width: "auto" }}
              >
                Cerrar
              </button>
            </div>
            <div
              style={{
                padding: 16,
                overflow: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0f172a",
              }}
            >
              <img
                src={imagenModal.url}
                alt={imagenModal.nombre}
                style={{ maxWidth: "100%", maxHeight: "78vh", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaginaCrearTicket() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: "center" }}>Cargando formulario...</div>}>
      <ContenidoCrearTicket />
    </Suspense>
  );
}
