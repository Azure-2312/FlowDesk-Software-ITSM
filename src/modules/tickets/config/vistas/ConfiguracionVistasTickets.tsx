"use client";

import { clavePerfil, resolverReglasVistaTicket, type VistasTicketConfig } from "@/modules/tickets/reglasVistaTicket";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { UsuarioConPerfiles, Perfil } from "@/types";

interface ConfiguracionPerfil {
  ver_incidentes: boolean;
  ver_solicitudes: boolean;
  ver_problemas: boolean;
  ver_cambios: boolean;
  seccion_notas_internas: boolean;
  seccion_respuestas_publicas: boolean;
  seccion_cmdb: boolean;
  seccion_costos_sla: boolean;
  seccion_transiciones: boolean;
  habilitado?: boolean;
}

type VistasPorClave = Record<string, ConfiguracionPerfil>;

interface ConfiguracionFlujoEstados {
  pausar_sla_en_espera: boolean;
  horas_reapertura: number;
  exigir_solucion_al_resolver: boolean;
  horas_cierre_tacito: number;
  permitir_autoasignacion_n1: boolean;
}

export interface ConfiguracionVistasTicketsProps {
  seccionInicial?: "vistas" | "estados";
  tipoFijo?: "incidente" | "solicitud" | "problema" | "cambio";
  ocultarTabsSuperiores?: boolean;
  ocultarCabecera?: boolean;
}

function ContenidoConfiguracionVistasTickets({
  seccionInicial,
  tipoFijo,
  ocultarTabsSuperiores = false,
  ocultarCabecera = false,
}: ConfiguracionVistasTicketsProps = {}) {
  const searchParams = useSearchParams();
  const seccionParam = searchParams.get("seccion");
  const tipoParam = searchParams.get("tipo");

  const [pestanaPrincipal, setPestanaPrincipal] = useState<"vistas" | "estados">(
    seccionInicial || (seccionParam === "estados" ? "estados" : "vistas")
  );

  const [tipoTicket, setTipoTicket] = useState<string>(
    tipoFijo || (tipoParam && ["incidente", "solicitud", "problema", "cambio"].includes(tipoParam) ? tipoParam : "incidente")
  );

  // Lista de usuarios y perfiles
  const [usuarios, setUsuarios] = useState<UsuarioConPerfiles[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<"perfil" | "usuario">("perfil");
  const [claveSeleccionada, setClaveSeleccionada] = useState<string>("3"); // Solicitante por defecto
  const [busquedaUsuario, setBusquedaUsuario] = useState<string>("");

  const [vistas, setVistas] = useState<VistasPorClave>({});
  const [flujoEstados, setFlujoEstados] = useState<ConfiguracionFlujoEstados>({
    pausar_sla_en_espera: true,
    horas_reapertura: 48,
    exigir_solucion_al_resolver: true,
    horas_cierre_tacito: 48,
    permitir_autoasignacion_n1: true,
  });

  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (seccionInicial) {
      setPestanaPrincipal(seccionInicial);
    } else if (seccionParam === "estados") {
      setPestanaPrincipal("estados");
    }
  }, [seccionInicial, seccionParam]);

  useEffect(() => {
    if (tipoFijo) {
      setTipoTicket(tipoFijo);
    } else if (tipoParam && ["incidente", "solicitud", "problema", "cambio"].includes(tipoParam)) {
      setTipoTicket(tipoParam);
    }
  }, [tipoFijo, tipoParam]);

  async function cargarConfiguracion() {
    setCargando(true);
    try {
      const [resUsuarios, resPerfiles, resVistas, resEstados] = await Promise.all([
        fetch("/api/usuarios").then((r) => r.json()),
        fetch("/api/identidades/perfiles").then((r) => r.json()),
        fetch("/api/operacion/configuracion?clave=vistas_ticket_perfil").then((r) => r.json()),
        fetch("/api/operacion/configuracion?clave=flujo_estados_acciones").then((r) => r.json()),
      ]);

      if (resUsuarios.usuarios) setUsuarios(resUsuarios.usuarios);
      if (resPerfiles.perfiles) setPerfiles(resPerfiles.perfiles);

      if (resVistas.configuracion?.valor) {
        setVistas(resVistas.configuracion.valor);
      }
      if (resEstados.configuracion?.valor) {
        setFlujoEstados(resEstados.configuracion.valor);
      }
    } catch {
      setError("Error al cargar la configuración de vistas y flujos.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  // Claves y valores por defecto compartidos con el detalle del ticket
  // (src/modules/tickets/reglasVistaTicket.ts): lo configurado aquí es lo que se ve allí.
  const claveActual = useMemo(() => {
    if (modoSeleccion === "perfil") return clavePerfil(Number(claveSeleccionada));
    return `usuario_${claveSeleccionada}`;
  }, [modoSeleccion, claveSeleccionada]);

  const configActual: ConfiguracionPerfil = useMemo(() => {
    if (modoSeleccion === "perfil") {
      return resolverReglasVistaTicket(vistas as VistasTicketConfig, Number(claveSeleccionada), null);
    }
    const u = usuarios.find((usr) => String(usr.id_usuario) === claveSeleccionada);
    const perfilId = u?.perfiles?.[0]?.id_perfil ?? null;
    return resolverReglasVistaTicket(vistas as VistasTicketConfig, perfilId, Number(claveSeleccionada));
  }, [vistas, claveActual, modoSeleccion, claveSeleccionada, usuarios]);

  // Verificar si está habilitado para el tipo de ticket actual
  const estaHabilitadoParaTipo = useMemo(() => {
    if (configActual.habilitado === false) return false;
    if (tipoTicket === "incidente") return configActual.ver_incidentes;
    if (tipoTicket === "solicitud") return configActual.ver_solicitudes;
    if (tipoTicket === "problema") return configActual.ver_problemas;
    if (tipoTicket === "cambio") return configActual.ver_cambios;
    return true;
  }, [configActual, tipoTicket]);

  function actualizarCampo(campo: keyof ConfiguracionPerfil, valor: boolean) {
    setVistas((prev) => ({
      ...prev,
      [claveActual]: {
        ...configActual,
        [campo]: valor,
      },
    }));
  }

  function toggleHabilitacionTipo(habilitar: boolean) {
    const campoTipo =
      tipoTicket === "incidente" ? "ver_incidentes" :
      tipoTicket === "solicitud" ? "ver_solicitudes" :
      tipoTicket === "problema" ? "ver_problemas" : "ver_cambios";

    setVistas((prev) => ({
      ...prev,
      [claveActual]: {
        ...configActual,
        habilitado: true,
        [campoTipo]: habilitar,
      },
    }));
  }

  async function guardarCambiosVistas() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/operacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave: "vistas_ticket_perfil",
          valor: vistas,
          descripcion: "Políticas de visibilidad y acceso a tipos de ticket y secciones por perfil y usuario",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la configuración.");
        return;
      }

      setMensajeExito("Políticas de vistas actualizadas y registradas en auditoría exitosamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar cambios.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarCambiosFlujoEstados() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const res = await fetch("/api/operacion/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clave: "flujo_estados_acciones",
          valor: flujoEstados,
          descripcion: "Parámetros y compuertas de la máquina de estados y ciclo de vida de tickets",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar la configuración de estados.");
        return;
      }

      setMensajeExito("Reglas del flujo de estados y acciones actualizadas con éxito.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar reglas del flujo.");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarConfiguracionTotal() {
    setGuardando(true);
    setError(null);
    setMensajeExito(null);
    try {
      const [resVistas, resEstados] = await Promise.all([
        fetch("/api/operacion/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clave: "vistas_ticket_perfil",
            valor: vistas,
            descripcion: "Políticas de visibilidad y acceso a tipos de ticket y secciones por perfil y usuario",
          }),
        }),
        fetch("/api/operacion/configuracion", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clave: "flujo_estados_acciones",
            valor: flujoEstados,
            descripcion: "Parámetros y compuertas de la máquina de estados y ciclo de vida de tickets",
          }),
        }),
      ]);

      const [dataVistas, dataEstados] = await Promise.all([resVistas.json(), resEstados.json()]);
      if (!resVistas.ok) {
        setError(dataVistas.error || "No se pudo guardar la configuración de vistas.");
        return;
      }
      if (!resEstados.ok) {
        setError(dataEstados.error || "No se pudo guardar la configuración de flujo.");
        return;
      }

      setMensajeExito("Configuración de visibilidad y flujo de estados guardada exitosamente.");
      setTimeout(() => setMensajeExito(null), 4000);
    } catch {
      setError("Error de conexión al guardar configuración.");
    } finally {
      setGuardando(false);
    }
  }

  const usuariosFiltrados = useMemo(() => {
    if (!busquedaUsuario.trim()) return usuarios;
    const q = busquedaUsuario.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombres.toLowerCase().includes(q) ||
        u.apellido_paterno.toLowerCase().includes(q) ||
        u.correo_electronico.toLowerCase().includes(q) ||
        u.perfiles?.some((p) => p.nombre.toLowerCase().includes(q))
    );
  }, [usuarios, busquedaUsuario]);

  const usuarioSeleccionadoObj = useMemo(() => {
    if (modoSeleccion === "usuario") {
      return usuarios.find((u) => String(u.id_usuario) === claveSeleccionada);
    }
    return null;
  }, [modoSeleccion, claveSeleccionada, usuarios]);

  const perfilSeleccionadoObj = useMemo(() => {
    if (modoSeleccion === "perfil") {
      return perfiles.find((p) => String(p.id_perfil) === claveSeleccionada);
    }
    return null;
  }, [modoSeleccion, claveSeleccionada, perfiles]);

  const nombreSujeto = useMemo(() => {
    if (modoSeleccion === "usuario" && usuarioSeleccionadoObj) {
      return `${usuarioSeleccionadoObj.nombres} ${usuarioSeleccionadoObj.apellido_paterno} (${usuarioSeleccionadoObj.perfiles?.[0]?.nombre || "Usuario"})`;
    }
    if (perfilSeleccionadoObj) {
      return `Perfil: ${perfilSeleccionadoObj.nombre}`;
    }
    return `Sujeto ${claveActual}`;
  }, [modoSeleccion, usuarioSeleccionadoObj, perfilSeleccionadoObj, claveActual]);

  // Información contextual del encabezado
  const infoEncabezado = useMemo(() => {
    if (pestanaPrincipal === "estados") {
      if (tipoTicket === "solicitud") {
        return {
          titulo: "Flujo de Atención y Aprobaciones: Solicitudes de Servicio",
          subtitulo: "Como Administrador, gobierne el circuito de aprobación por jefaturas, transiciones autorizadas de aprovisionamiento y compuertas de entrega para solicitudes según ITIL v4.",
        };
      }
      return {
        titulo: "Flujo de Estados y Acciones: Incidentes",
        subtitulo: "Como Administrador, defina las reglas de transición por rol, pausas automáticas de SLA y plazos de reapertura o cierre tácito para el ciclo de vida de los incidentes.",
      };
    }
    switch (tipoTicket) {
      case "solicitud":
        return {
          titulo: "Vistas Previas por Perfil y Usuario: Solicitudes de Servicio",
          subtitulo: "Como Administrador, previsualice y controle qué secciones (notas internas, respuestas públicas, CMDB) observa cada perfil o usuario en solicitudes de servicio.",
        };
      case "problema":
        return {
          titulo: "Vistas Previas por Perfil y Usuario: Problemas ITIL",
          subtitulo: "Como Administrador, previsualice y controle los permisos de visualización de secciones y campos para expedientes de problemas ITIL según el perfil o usuario.",
        };
      case "cambio":
        return {
          titulo: "Vistas Previas por Perfil y Usuario: Cambios (RFC)",
          subtitulo: "Como Administrador, previsualice y controle los permisos de visualización de secciones y campos para solicitudes de cambio según el perfil o usuario.",
        };
      case "incidente":
      default:
        return {
          titulo: "Vistas Previas por Perfil y Usuario: Incidentes",
          subtitulo: "Como Administrador, previsualice y controle qué secciones (notas internas, respuestas públicas, CMDB) observa cada perfil o usuario en los tickets de incidentes.",
        };
    }
  }, [pestanaPrincipal, tipoTicket]);

  return (
    <div className="vista-contenedor">
      {/* Pestañas Principales (solo si no se especificó sección ni tipo estricto en la URL y no se ocultaron) */}
      {!ocultarTabsSuperiores && !seccionParam && !tipoParam && (
        <div className="pestanas" style={{ marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setPestanaPrincipal("vistas")}
            className={pestanaPrincipal === "vistas" ? "pestana pestana-activa" : "pestana"}
          >
            Vistas y Permisos por Perfil / Usuario
          </button>
          <button
            type="button"
            onClick={() => setPestanaPrincipal("estados")}
            className={pestanaPrincipal === "estados" ? "pestana pestana-activa" : "pestana"}
          >
            Flujo de Estados y Acciones (Ciclo de Vida)
          </button>
        </div>
      )}

      {!ocultarCabecera && (
        <div className="cabecera-pagina" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "nowrap", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="titulo-pagina">{infoEncabezado.titulo}</h1>
            <p className="descripcion-pagina">{infoEncabezado.subtitulo}</p>
          </div>
          <button
            type="button"
            className="boton-primario"
            style={{ flexShrink: 0 }}
            onClick={guardarConfiguracionTotal}
            disabled={guardando || cargando}
          >
            {guardando ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>
      )}

      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {cargando ? (
        <div className="contenedor-tabla" style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
          Cargando configuración de vistas y usuarios...
        </div>
      ) : pestanaPrincipal === "vistas" ? (
        <div>

          {/* BARRA SUPERIOR: SELECTOR COMPLETO DE USUARIOS Y PERFILES */}
          <div className="contenedor-tabla" style={{ padding: 16, marginBottom: 20, backgroundColor: "#ffffff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
              <div>
                <strong style={{ fontSize: 13.5, color: "#0f172a" }}>Seleccionar Usuario / Perfil para Previsualización y Control</strong>
                <span style={{ display: "block", fontSize: 12, color: "#64748b" }}>
                  Al seleccionar un usuario o perfil, se renderiza exactamente cómo observará el ticket en producción.
                </span>
              </div>
              <div className="pestanas" data-ambito="panel">
                <button
                  type="button"
                  onClick={() => {
                    setModoSeleccion("perfil");
                    setClaveSeleccionada("3");
                  }}
                  className={modoSeleccion === "perfil" ? "pestana pestana-activa" : "pestana"}
                >
                  Ver por Perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoSeleccion("usuario");
                    if (usuarios.length > 0) setClaveSeleccionada(String(usuarios[0].id_usuario));
                  }}
                  className={modoSeleccion === "usuario" ? "pestana pestana-activa" : "pestana"}
                >
                  Ver por Usuario Específico
                </button>
              </div>
            </div>

            {modoSeleccion === "perfil" ? (
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
                {perfiles.map((p) => {
                  const activo = claveSeleccionada === String(p.id_perfil);
                  return (
                    <button
                      key={p.id_perfil}
                      type="button"
                      onClick={() => setClaveSeleccionada(String(p.id_perfil))}
                      className={activo ? "opcion-seleccionable opcion-seleccionada" : "opcion-seleccionable"} style={{ width: "auto" }}
                    >
                      <span>{p.nombre}</span>
                      <span style={{ fontSize: 10.5, opacity: 0.85 }}>ID: {p.id_perfil}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre, correo o perfil..."
                    className="input-base"
                    value={busquedaUsuario}
                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                    style={{ maxWidth: 360, padding: "6px 10px", fontSize: 12.5 }}
                  />
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, maxHeight: 110 }}>
                  {usuariosFiltrados.map((u) => {
                    const activo = claveSeleccionada === String(u.id_usuario);
                    const perfilNombre = u.perfiles?.[0]?.nombre || "Sin Perfil";
                    return (
                      <button
                        key={u.id_usuario}
                        type="button"
                        onClick={() => setClaveSeleccionada(String(u.id_usuario))}
                        className={activo ? "opcion-seleccionable opcion-seleccionada" : "opcion-seleccionable"} style={{ width: "auto" }}
                      >
                        <div style={{ fontWeight: 600 }}>{u.nombres} {u.apellido_paterno}</div>
                        <div style={{ fontSize: 11, opacity: 0.85 }}>{u.correo_electronico}</div>
                        <div style={{ fontSize: 10.5, marginTop: 2, fontWeight: 700, color: activo ? "#ffffff" : "#2563eb" }}>
                          {perfilNombre}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* BANNER DE ESTADO CON BOTÓN A LA IZQUIERDA */}
          {!estaHabilitadoParaTipo ? (
            <div
              style={{
                backgroundColor: "#fff1f2",
                border: "1px solid #fecdd3",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <button className="boton-primario"
                type="button"
                onClick={() => toggleHabilitacionTipo(true)}
              >
                Habilitar para este usuario
              </button>
              <div>
                <strong style={{ fontSize: 14, color: "#9f1239", display: "block" }}>
                  No habilitado para este usuario / perfil
                </strong>
                <span style={{ fontSize: 12.5, color: "#be123c" }}>
                  {nombreSujeto} no tiene permiso para consultar ni visualizar tickets de tipo {tipoTicket.toUpperCase()}. Haga clic en el botón de la izquierda para habilitar la visualización y previsualizar su interfaz.
                </span>
              </div>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: 8,
                padding: "12px 18px",
                marginBottom: 20,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div>
                <strong style={{ fontSize: 13.5, color: "#166534", display: "block" }}>
                  Habilitado para este usuario ({nombreSujeto})
                </strong>
                <span style={{ fontSize: 12, color: "#15803d" }}>
                  Este usuario/perfil tiene acceso activo a la ficha de {tipoTicket.toUpperCase()}. Abajo puede calibrar qué componentes y secciones observa.
                </span>
              </div>
              <button className="boton-peligro boton-sm"
                type="button"
                onClick={() => toggleHabilitacionTipo(false)}
              >
                Deshabilitar para este usuario
              </button>
            </div>
          )}

          {estaHabilitadoParaTipo && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* CONTROLES DE VISIBILIDAD DE SECCIONES */}
              <div className="contenedor-tabla" style={{ padding: 20, backgroundColor: "#ffffff" }}>
                <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  Secciones Visibles en la Ficha del Ticket para {nombreSujeto}
                </h3>
                <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
                  Active o desactive los componentes. Los cambios se aplican al guardar.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: 14 }}>
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6, backgroundColor: configActual.seccion_notas_internas ? "#f8faff" : "#ffffff" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Pestaña: Notas Técnicas Internas</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Apuntes privados entre especialistas técnicos (confidenciales).</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configActual.seccion_notas_internas}
                      onChange={(e) => actualizarCampo("seccion_notas_internas", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6, backgroundColor: configActual.seccion_respuestas_publicas ? "#f8faff" : "#ffffff" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Pestaña: Respuestas al Solicitante</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Mensajería bidireccional pública del caso.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configActual.seccion_respuestas_publicas}
                      onChange={(e) => actualizarCampo("seccion_respuestas_publicas", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6, backgroundColor: configActual.seccion_cmdb ? "#f8faff" : "#ffffff" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Panel de Infraestructura CMDB</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Visualización del servidor o CI vinculado al ticket.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configActual.seccion_cmdb}
                      onChange={(e) => actualizarCampo("seccion_cmdb", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6, backgroundColor: configActual.seccion_costos_sla ? "#f8faff" : "#ffffff" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Panel de Compromiso SLA y Métricas</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Barra de progreso de tiempo restante y cumplimiento.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configActual.seccion_costos_sla}
                      onChange={(e) => actualizarCampo("seccion_costos_sla", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>

                  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 6, backgroundColor: configActual.seccion_transiciones ? "#f8faff" : "#ffffff" }}>
                    <div>
                      <strong style={{ fontSize: 13, color: "#0f172a" }}>Botones Operativos de Transición</strong>
                      <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Iniciar Atención, En Espera, Elevar a Problema o Resolver.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={configActual.seccion_transiciones}
                      onChange={(e) => actualizarCampo("seccion_transiciones", e.target.checked)}
                      style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                    />
                  </label>
                </div>
              </div>

            </div>
          )}
        </div>
      ) : (
        /* PESTAÑA: FLUJO DE ESTADOS Y ACCIONES (CICLO DE VIDA) */
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              {tipoTicket === "solicitud"
                ? "Ciclo de Vida Formal de Solicitudes y Circuito de Aprobación ITIL"
                : "Ciclo de Vida Formal de Estados y Transiciones ITIL"}
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
              {tipoTicket === "solicitud"
                ? "Flujo oficial de transiciones válidas según la práctica de Gestión de Solicitudes de Servicio ITIL v4 (Fulfillment & Approvals)."
                : "Flujo oficial de transiciones válidas según la práctica de Service Desk y Gestión de Incidentes ITIL v4."}
            </p>

            <table className="tabla-datos">
              <thead>
                <tr>
                  <th style={{ width: 140 }}>Estado Origen</th>
                  <th style={{ width: 170 }}>Estados Destino Permitidos</th>
                  <th>Roles Autorizados para Transicionar</th>
                  <th>Compuerta / Regla de Negocio Exigida</th>
                </tr>
              </thead>
              {tipoTicket === "solicitud" ? (
                <tbody>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Abierto (1)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>Pendiente de Aprobación</span></td>
                    <td>Sistema (automático)</td>
                    <td>Enrutamiento al Gestor de Área si el servicio requiere autorización de jefatura o presupuesto.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>Pendiente de Aprobación</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Aprobado / Asignado</span></td>
                    <td>Gestor de Área (Jefatura)</td>
                    <td>Visto bueno formal registrado en bandeja de aprobaciones. Se reanuda el SLA.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>Pendiente de Aprobación</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>Rechazado (Cancelado)</span></td>
                    <td>Gestor de Área (Jefatura)</td>
                    <td>Rechazo formal con sustento obligatorio. Notifica al solicitante y cierra el expediente.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Aprobado / Asignado</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso</span></td>
                    <td>Técnico Asignado</td>
                    <td>Inicio de actividades de aprovisionamiento, configuración de equipo o creación de accesos.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>En Espera</span></td>
                    <td>Técnico Asignado</td>
                    <td>Espera de información adicional del solicitante o compra/despacho de proveedor. Pausa de SLA.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Cumplido / Entregado</span></td>
                    <td>Técnico Asignado, Supervisor</td>
                    <td>Entrega física del recurso o habilitación de credenciales con comprobante o acta.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Cumplido / Entregado</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>Cerrado</span></td>
                    <td>Solicitante, Sistema (automático)</td>
                    <td>Conformidad explícita del solicitante o aceptación tácita automática tras 48 horas hábiles.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Cualquiera</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>Cancelado</span></td>
                    <td>Solicitante, Gestor de Área, Supervisor</td>
                    <td>Desistimiento justificado o anulación formal antes de entrega.</td>
                  </tr>
                </tbody>
              ) : (
                <tbody>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Abierto (1)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Asignado / En Proceso</span></td>
                    <td>Técnico, Supervisor</td>
                    <td>Asignación de especialista o toma directa respetando límite WIP.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>Asignado (2)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso (3)</span></td>
                    <td>Técnico Asignado</td>
                    <td>El especialista confirma inicio de diagnóstico técnico.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso (3)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>En Espera (4)</span></td>
                    <td>Técnico Asignado, Supervisor</td>
                    <td>Motivo de pausa obligatorio (información de usuario o repuesto proveedor). Pausa el reloj de SLA.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>En Espera (4)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso (3)</span></td>
                    <td>Solicitante, Técnico</td>
                    <td>Reanudación automática al recibir respuesta o desbloquear el insumo. Reactiva reloj de SLA.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso (3)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Resuelto (5)</span></td>
                    <td>Técnico Asignado, Supervisor</td>
                    <td>Exige descripción de la solución aplicada y clasificación de resolución. Notifica al usuario.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Resuelto (5)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#f1f5f9", color: "#0f172a" }}>Cerrado (6)</span></td>
                    <td>Solicitante, Sistema (automático)</td>
                    <td>Conformidad explícita del usuario o aceptación tácita automática tras 48 horas hábiles.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#dcfce7", color: "#15803d" }}>Resuelto (5)</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e0e7ff", color: "#4338ca" }}>En Proceso (3)</span></td>
                    <td>Solicitante</td>
                    <td>Reapertura justificada permitida únicamente dentro de las primeras 48 horas tras resolución.</td>
                  </tr>
                  <tr>
                    <td><span className="badge-itil" style={{ backgroundColor: "#e2e8f0", color: "#334155" }}>Cualquiera</span></td>
                    <td><span className="badge-itil" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>Cancelado (7)</span></td>
                    <td>Solicitante, Gestor de Área, Supervisor</td>
                    <td>Sustento obligatorio de anulación. Registro definitivo no reabrible.</td>
                  </tr>
                </tbody>
              )}
            </table>
          </div>

          {/* Parámetros Operativos del Flujo */}
          <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff" }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
              Parámetros de Compuertas y Reglas de Negocio
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: 12.5, color: "#64748b" }}>
              Configure los tiempos y controles automáticos que gobiernan las transiciones del servicio.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>Pausar Cronómetro de SLA en Espera</strong>
                  <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Detiene el conteo de tiempo cuando el ticket pasa a En Espera.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flujoEstados.pausar_sla_en_espera}
                  onChange={(e) => setFlujoEstados((p) => ({ ...p, pausar_sla_en_espera: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>Exigir Solución Detallada al Resolver</strong>
                  <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Impide marcar Resuelto sin registrar el sustento técnico.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flujoEstados.exigir_solucion_al_resolver}
                  onChange={(e) => setFlujoEstados((p) => ({ ...p, exigir_solucion_al_resolver: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#0f172a" }}>Permitir Autoasignación N1 Directa</strong>
                  <span style={{ display: "block", fontSize: 11.5, color: "#64748b" }}>Faculta al técnico a tomar tickets de la bandeja si su WIP lo permite.</span>
                </div>
                <input
                  type="checkbox"
                  checked={flujoEstados.permitir_autoasignacion_n1}
                  onChange={(e) => setFlujoEstados((p) => ({ ...p, permitir_autoasignacion_n1: e.target.checked }))}
                  style={{ width: 18, height: 18, accentColor: "#2563eb" }}
                />
              </label>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <strong style={{ fontSize: 13, color: "#0f172a" }}>Ventana Máxima de Reapertura (Horas)</strong>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>Tiempo límite tras resolución durante el cual el usuario puede reabrir el caso.</span>
                <input
                  type="number"
                  min="1"
                  max="168"
                  className="input-base"
                  value={flujoEstados.horas_reapertura}
                  onChange={(e) => setFlujoEstados((p) => ({ ...p, horas_reapertura: Number(e.target.value) }))}
                  style={{ width: 140, marginTop: 4 }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "12px", border: "1px solid #e2e8f0", borderRadius: 6 }}>
                <strong style={{ fontSize: 13, color: "#0f172a" }}>Plazo de Cierre Tácito Automático (Horas)</strong>
                <span style={{ fontSize: 11.5, color: "#64748b" }}>Horas para cerrar formalmente el caso si el solicitante no emite confirmación ni queja.</span>
                <input
                  type="number"
                  min="1"
                  max="336"
                  className="input-base"
                  value={flujoEstados.horas_cierre_tacito}
                  onChange={(e) => setFlujoEstados((p) => ({ ...p, horas_cierre_tacito: Number(e.target.value) }))}
                  style={{ width: 140, marginTop: 4 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaginaConfiguracionVistasTickets(props: ConfiguracionVistasTicketsProps = {}) {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando vistas y flujos de tickets...</p></div>}>
      <ContenidoConfiguracionVistasTickets {...props} />
    </Suspense>
  );
}
