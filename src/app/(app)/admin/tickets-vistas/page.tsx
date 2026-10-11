"use client";

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

function ContenidoConfiguracionVistasTickets() {
  const searchParams = useSearchParams();
  const seccionParam = searchParams.get("seccion");
  const tipoParam = searchParams.get("tipo");

  const [pestanaPrincipal, setPestanaPrincipal] = useState<"vistas" | "estados">(
    seccionParam === "estados" ? "estados" : "vistas"
  );

  const [tipoTicket, setTipoTicket] = useState<string>(
    tipoParam && ["incidente", "solicitud", "problema", "cambio"].includes(tipoParam) ? tipoParam : "incidente"
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
    if (seccionParam === "estados") {
      setPestanaPrincipal("estados");
    }
  }, [seccionParam]);

  useEffect(() => {
    if (tipoParam && ["incidente", "solicitud", "problema", "cambio"].includes(tipoParam)) {
      setTipoTicket(tipoParam);
    }
  }, [tipoParam]);

  async function cargarConfiguracion() {
    setCargando(true);
    try {
      const [resUsuarios, resPerfiles, resVistas, resEstados] = await Promise.all([
        fetch("/api/usuarios").then((r) => r.json()),
        fetch("/api/perfiles").then((r) => r.json()),
        fetch("/api/admin/configuracion?clave=vistas_ticket_perfil").then((r) => r.json()),
        fetch("/api/admin/configuracion?clave=flujo_estados_acciones").then((r) => r.json()),
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

  // Clave en el objeto vistas (ej: "perfil_3", "usuario_5", o claves legadas "solicitante", "tecnico")
  const claveActual = useMemo(() => {
    if (modoSeleccion === "perfil") {
      // Compatibilidad con claves legadas
      if (claveSeleccionada === "1") return "administrador";
      if (claveSeleccionada === "2") return "tecnico";
      if (claveSeleccionada === "3") return "solicitante";
      if (claveSeleccionada === "4") return "supervisor";
      if (claveSeleccionada === "5") return "gestor_area";
      return `perfil_${claveSeleccionada}`;
    }
    return `usuario_${claveSeleccionada}`;
  }, [modoSeleccion, claveSeleccionada]);

  // Configuración resuelta para la clave actual
  const configActual: ConfiguracionPerfil = useMemo(() => {
    if (vistas[claveActual]) {
      return vistas[claveActual];
    }

    // Si es usuario sin config directa, heredar de su perfil
    if (modoSeleccion === "usuario") {
      const u = usuarios.find((usr) => String(usr.id_usuario) === claveSeleccionada);
      const perfilId = u?.perfiles?.[0]?.id_perfil;
      if (perfilId) {
        let claveLegada = `perfil_${perfilId}`;
        if (perfilId === 1) claveLegada = "administrador";
        if (perfilId === 2) claveLegada = "tecnico";
        if (perfilId === 3) claveLegada = "solicitante";
        if (perfilId === 4) claveLegada = "supervisor";
        if (perfilId === 5) claveLegada = "gestor_area";
        if (vistas[claveLegada]) {
          return vistas[claveLegada];
        }
      }
    }

    // Default si no existe
    const esTecnicoOSupervisor = claveActual === "tecnico" || claveActual === "supervisor";
    return {
      habilitado: true,
      ver_incidentes: true,
      ver_solicitudes: true,
      ver_problemas: esTecnicoOSupervisor,
      ver_cambios: esTecnicoOSupervisor,
      seccion_notas_internas: esTecnicoOSupervisor,
      seccion_respuestas_publicas: true,
      seccion_cmdb: esTecnicoOSupervisor,
      seccion_costos_sla: esTecnicoOSupervisor,
      seccion_transiciones: esTecnicoOSupervisor,
    };
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
      const res = await fetch("/api/admin/configuracion", {
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
      const res = await fetch("/api/admin/configuracion", {
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
      <div className="cabecera-pagina">
        <div>
          <h1>{infoEncabezado.titulo}</h1>
          <p className="subtitulo">{infoEncabezado.subtitulo}</p>
        </div>
      </div>

      {mensajeExito && (
        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500 }}>
          {mensajeExito}
        </div>
      )}

      {error && <div className="mensaje-error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Pestañas Principales (solo si no se especificó sección ni tipo estricto en la URL) */}
      {!seccionParam && !tipoParam && (
        <div style={{ display: "flex", gap: 10, marginBottom: 18, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
          <button
            type="button"
            onClick={() => setPestanaPrincipal("vistas")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: pestanaPrincipal === "vistas" ? 700 : 500,
              backgroundColor: pestanaPrincipal === "vistas" ? "#2563eb" : "#f1f5f9",
              color: pestanaPrincipal === "vistas" ? "#ffffff" : "#475569",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Vistas y Permisos por Perfil / Usuario
          </button>
          <button
            type="button"
            onClick={() => setPestanaPrincipal("estados")}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: pestanaPrincipal === "estados" ? 700 : 500,
              backgroundColor: pestanaPrincipal === "estados" ? "#2563eb" : "#f1f5f9",
              color: pestanaPrincipal === "estados" ? "#ffffff" : "#475569",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            Flujo de Estados y Acciones (Ciclo de Vida)
          </button>
        </div>
      )}

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
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setModoSeleccion("perfil");
                    setClaveSeleccionada("3");
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: modoSeleccion === "perfil" ? 700 : 500,
                    backgroundColor: modoSeleccion === "perfil" ? "#0f172a" : "#f8fafc",
                    color: modoSeleccion === "perfil" ? "#ffffff" : "#475569",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
                >
                  Ver por Perfil
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModoSeleccion("usuario");
                    if (usuarios.length > 0) setClaveSeleccionada(String(usuarios[0].id_usuario));
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: modoSeleccion === "usuario" ? 700 : 500,
                    backgroundColor: modoSeleccion === "usuario" ? "#0f172a" : "#f8fafc",
                    color: modoSeleccion === "usuario" ? "#ffffff" : "#475569",
                    border: "1px solid #cbd5e1",
                    cursor: "pointer",
                  }}
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
                      style={{
                        padding: "8px 14px",
                        borderRadius: 6,
                        fontSize: 12.5,
                        fontWeight: activo ? 700 : 500,
                        backgroundColor: activo ? "#2563eb" : "#f8fafc",
                        color: activo ? "#ffffff" : "#334155",
                        border: activo ? "1px solid #2563eb" : "1px solid #cbd5e1",
                        whiteSpace: "nowrap",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
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
                        style={{
                          padding: "8px 12px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: activo ? 700 : 500,
                          backgroundColor: activo ? "#2563eb" : "#f8fafc",
                          color: activo ? "#ffffff" : "#334155",
                          border: activo ? "1px solid #2563eb" : "1px solid #cbd5e1",
                          whiteSpace: "nowrap",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
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
              <button
                type="button"
                onClick={() => toggleHabilitacionTipo(true)}
                style={{
                  padding: "9px 18px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
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
              <button
                type="button"
                onClick={() => toggleHabilitacionTipo(false)}
                style={{
                  padding: "6px 14px",
                  backgroundColor: "#fee2e2",
                  color: "#b91c1c",
                  border: "1px solid #fca5a5",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
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
                  Active o desactive los componentes. Observe cómo la vista previa inferior se actualiza en tiempo real reflejando los cambios.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
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

              {/* VISTA PREVIA INTERACTIVA EN TIEMPO REAL */}
              <div className="contenedor-tabla" style={{ padding: 22, backgroundColor: "#ffffff", border: "2px solid #3b82f6" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, borderBottom: "1px solid #e2e8f0", paddingBottom: 10 }}>
                  <div>
                    <span style={{ display: "inline-block", padding: "3px 8px", backgroundColor: "#dbeafe", color: "#1d4ed8", borderRadius: 4, fontSize: 11, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                      Simulador en Vivo de Interfaz
                    </span>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a" }}>
                      Vista Previa Exacta: Así observa el ticket {nombreSujeto}
                    </h3>
                  </div>
                  <span style={{ fontSize: 12, color: "#64748b", fontFamily: "monospace" }}>
                    Tipo: {tipoTicket.toUpperCase()}
                  </span>
                </div>

                {/* FICHA SIMULADA DEL TICKET */}
                <div style={{ border: "1px solid #cbd5e1", borderRadius: 8, overflow: "hidden", backgroundColor: "#f8fafc" }}>
                  {/* Barra de Título del Ticket */}
                  <div style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, backgroundColor: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 4 }}>
                        #{tipoTicket === "incidente" ? "INC-2026-0042" : tipoTicket === "solicitud" ? "SOL-2026-0089" : tipoTicket === "problema" ? "PRB-2026-0012" : "RFC-2026-0007"}
                      </span>
                      <strong style={{ fontSize: 14 }}>
                        {tipoTicket === "incidente" ? "Falla de conectividad VPN al servidor de base de datos" :
                         tipoTicket === "solicitud" ? "Requerimiento de nueva estación de trabajo y monitor" :
                         tipoTicket === "problema" ? "Degradación recurrente de ancho de banda en sede central" :
                         "Actualización de firmware de switch central de distribución"}
                      </strong>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, backgroundColor: "#dbeafe", color: "#1e40af" }}>
                        En Proceso
                      </span>
                      <span style={{ padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700, backgroundColor: "#fee2e2", color: "#991b1b" }}>
                        Prioridad Alta
                      </span>
                    </div>
                  </div>

                  {/* LÍNEA DE TIEMPO DEL ESTADO DEL TICKET (ABIERTO -> ASIGNADO -> EN PAUSA -> TERMINADO -> CANCELADO) */}
                  <div style={{ padding: "14px 18px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b" }}>
                        Línea de Tiempo del Estado: {tipoTicket === "incidente" ? "Incidente" : "Solicitud de Servicio"}
                      </span>
                      <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>
                        Estado Actual: Asignado (En Atención)
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
                      <div
                        style={{
                          position: "absolute",
                          top: 14,
                          left: 24,
                          right: 24,
                          height: 2,
                          backgroundColor: "#cbd5e1",
                          zIndex: 0,
                        }}
                      />

                      {/* 1. Abierto */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#16a34a", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#16a34a", marginTop: 4 }}>Abierto</span>
                        <span style={{ fontSize: 9.5, color: "#64748b" }}>Registrado</span>
                      </div>

                      {/* 2. Asignado (Punto actual) */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#2563eb", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, boxShadow: "0 0 0 4px #dbeafe" }}>
                          2
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "#2563eb", marginTop: 4 }}>Asignado</span>
                        <span style={{ fontSize: 9.5, color: "#2563eb", fontWeight: 600 }}>Técnico Activo</span>
                      </div>

                      {/* 3. En Pausa */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#ffffff", border: "2px solid #cbd5e1", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          3
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginTop: 4 }}>En Pausa</span>
                        <span style={{ fontSize: 9.5, color: "#94a3b8" }}>Espera / Terceros</span>
                      </div>

                      {/* 4. Terminado */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#ffffff", border: "2px solid #cbd5e1", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          4
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginTop: 4 }}>Terminado</span>
                        <span style={{ fontSize: 9.5, color: "#94a3b8" }}>Resuelto / Solución</span>
                      </div>

                      {/* 5. Cancelado */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 1 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: "#ffffff", border: "2px solid #cbd5e1", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          5
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#475569", marginTop: 4 }}>Cancelado</span>
                        <span style={{ fontSize: 9.5, color: "#94a3b8" }}>Cerrado / Anulado</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadatos y Partes Interesadas (con Prioridad Institucional del Solicitante, Beneficiario y Aprobador) */}
                  <div style={{ padding: "14px 18px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Usuario Solicitante:</span>
                      <strong style={{ color: "#0f172a" }}>Laura Morales (Finanzas)</strong>
                      {/* Nivel de Prioridad del Solicitante (No visible para el solicitante) */}
                      <div style={{ marginTop: 4 }}>
                        <span style={{ padding: "2px 6px", backgroundColor: "#fee2e2", color: "#991b1b", borderRadius: 4, fontSize: 10.5, fontWeight: 700 }}>
                          Prioridad VIP (Directorio)
                        </span>
                        <span style={{ fontSize: 10, color: "#94a3b8", display: "block", marginTop: 2 }}>
                          (Oculto para el usuario solicitante)
                        </span>
                      </div>
                    </div>

                    {/* En Solicitud: Usuario Beneficiario (mismo departamento) */}
                    {tipoTicket === "solicitud" && (
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Usuario Beneficiario:</span>
                        <strong style={{ color: "#0f172a" }}>Carlos Mendoza (Finanzas)</strong>
                        <span style={{ fontSize: 10.5, color: "#64748b", display: "block" }}>
                          Colaborador del mismo departamento
                        </span>
                      </div>
                    )}

                    {/* En Solicitud: Sección para Determinar Aprobador */}
                    {tipoTicket === "solicitud" && (
                      <div>
                        <span style={{ color: "#64748b", display: "block" }}>Aprobador Designado:</span>
                        <strong style={{ color: "#0f172a" }}>Ing. Roberto Flores (Gerencia)</strong>
                        <span style={{ padding: "2px 6px", backgroundColor: "#fef3c7", color: "#92400e", borderRadius: 4, fontSize: 10.5, fontWeight: 700, display: "inline-block", marginTop: 2 }}>
                          Aprobación Pendiente
                        </span>
                      </div>
                    )}

                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Espacio para Técnico:</span>
                      <strong style={{ color: "#0f172a" }}>Carlos Quispe (Nivel 2)</strong>
                      <span style={{ fontSize: 10.5, color: "#16a34a", display: "block" }}>
                        Asignado formalmente
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Prioridad Operativa del Ticket:</span>
                      <strong style={{ color: "#dc2626" }}>P2 · Severidad Alta</strong>
                      <span style={{ fontSize: 10, color: "#94a3b8", display: "block", marginTop: 2 }}>
                        (Oculto para el usuario solicitante)
                      </span>
                    </div>

                    <div>
                      <span style={{ color: "#64748b", display: "block" }}>Fecha de Registro:</span>
                      <strong style={{ color: "#0f172a" }}>01/10/2026 09:30 AM</strong>
                    </div>
                  </div>

                  {/* Panel de Compromiso SLA (SI ESTÁ HABILITADO) */}
                  {configActual.seccion_costos_sla ? (
                    <div style={{ padding: "10px 18px", backgroundColor: "#eff6ff", borderBottom: "1px solid #bfdbfe", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <strong style={{ color: "#1e40af" }}>Reloj de SLA de Solución:</strong>
                        <span style={{ color: "#1d4ed8" }}>3 horas 25 minutos restantes (75% transcurrido)</span>
                      </div>
                      <div style={{ width: 140, height: 8, backgroundColor: "#bfdbfe", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "75%", height: "100%", backgroundColor: "#2563eb" }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: "6px 18px", backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: 11, fontStyle: "italic" }}>
                      [Panel de SLA oculto para este rol]
                    </div>
                  )}

                  {/* Panel CMDB (SI ESTÁ HABILITADO) */}
                  {configActual.seccion_cmdb && (
                    <div style={{ padding: "10px 18px", backgroundColor: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
                      <strong style={{ color: "#334155" }}>Elemento CMDB Afectado:</strong>
                      <span style={{ padding: "2px 8px", backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 4, fontFamily: "monospace", color: "#0f172a", fontWeight: 600 }}>
                        CI: SRV-DB-PROD01 (Servidor Linux RedHat / Servidor Central de Base de Datos)
                      </span>
                    </div>
                  )}

                  {/* Cuerpo del Ticket */}
                  <div style={{ padding: "16px 18px", backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0" }}>
                    <h4 style={{ margin: "0 0 6px 0", fontSize: 13, color: "#475569" }}>Descripción del Caso:</h4>
                    <p style={{ margin: 0, fontSize: 13, color: "#0f172a", lineHeight: 1.5 }}>
                      Al intentar conectarse al software institucional desde el segmento de red comercial, la conexión se interrumpe tras 30 segundos arrojando un error de timeout. No es posible generar los reportes de ventas del cierre diario.
                    </p>
                  </div>

                  {/* Pestañas de Conversación y Notas */}
                  <div style={{ backgroundColor: "#ffffff", padding: "14px 18px" }}>
                    <div style={{ display: "flex", gap: 8, borderBottom: "1px solid #e2e8f0", paddingBottom: 8, marginBottom: 12 }}>
                      {configActual.seccion_respuestas_publicas && (
                        <span style={{ padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700, backgroundColor: "#e2e8f0", color: "#0f172a" }}>
                          Respuestas al Solicitante
                        </span>
                      )}
                      {configActual.seccion_notas_internas && (
                        <span style={{ padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700, backgroundColor: "#fef3c7", color: "#92400e" }}>
                          Notas Técnicas Internas (Work Notes)
                        </span>
                      )}
                    </div>

                    {/* Mensajes Simulados */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {configActual.seccion_respuestas_publicas && (
                        <div style={{ padding: "10px 14px", backgroundColor: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                            <strong>Laura Morales (Solicitante)</strong>
                            <span>01/10/2026 09:35 AM</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12.5, color: "#334155" }}>
                            Por favor necesitamos su apoyo pronto, tenemos facturas pendientes por emitir antes del mediodía.
                          </p>
                        </div>
                      )}

                      {configActual.seccion_notas_internas ? (
                        <div style={{ padding: "10px 14px", backgroundColor: "#fffbeb", borderRadius: 6, border: "1px solid #fde68a" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#b45309", marginBottom: 4 }}>
                            <strong>Carlos Quispe (Técnico N2) - Nota Interna</strong>
                            <span>01/10/2026 09:42 AM</span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12.5, color: "#78350f" }}>
                            Se revisó la tabla de conexiones en iptables. El puerto 5432 estaba saturado por sesiones huérfanas del pool anterior. Se ejecutó script de purga de sockets en el servidor.
                          </p>
                        </div>
                      ) : (
                        <div style={{ padding: "8px 12px", backgroundColor: "#fafafa", borderRadius: 4, border: "1px dashed #e2e8f0", color: "#94a3b8", fontSize: 11.5, textAlign: "center" }}>
                          [Pestaña de Notas Técnicas Internas Oculta por Política de Privacidad para {nombreSujeto}]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Barra de Acciones y Botones Operativos en el Fondo */}
                  <div style={{ backgroundColor: "#f1f5f9", padding: "12px 18px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                    {configActual.seccion_transiciones ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button type="button" disabled tabIndex={-1} title="Vista previa - Botón no interactivo" style={{ padding: "6px 12px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, pointerEvents: "none", cursor: "not-allowed", opacity: 0.65 }}>
                          Iniciar Atención
                        </button>
                        <button type="button" disabled tabIndex={-1} title="Vista previa - Botón no interactivo" style={{ padding: "6px 12px", backgroundColor: "#f59e0b", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, pointerEvents: "none", cursor: "not-allowed", opacity: 0.65 }}>
                          Poner En Espera
                        </button>
                        <button type="button" disabled tabIndex={-1} title="Vista previa - Botón no interactivo" style={{ padding: "6px 12px", backgroundColor: "#7c3aed", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, pointerEvents: "none", cursor: "not-allowed", opacity: 0.65 }}>
                          Elevar a Problema ITIL
                        </button>
                        <button type="button" disabled tabIndex={-1} title="Vista previa - Botón no interactivo" style={{ padding: "6px 12px", backgroundColor: "#16a34a", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, pointerEvents: "none", cursor: "not-allowed", opacity: 0.65 }}>
                          Resolver Ticket
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
                          Modo Consulta / Usuario Final (Sin atribuciones de transición operativa de estado)
                        </span>
                        <button type="button" disabled tabIndex={-1} title="Vista previa - Botón no interactivo" style={{ padding: "6px 12px", backgroundColor: "#0f172a", color: "#ffffff", border: "none", borderRadius: 4, fontSize: 12, fontWeight: 600, pointerEvents: "none", cursor: "not-allowed", opacity: 0.65 }}>
                          Responder Ticket
                        </button>
                      </div>
                    )}

                    <span style={{ fontSize: 11.5, color: "#64748b" }}>
                      Previsualización fiel ISO 20000 / ITIL v4
                    </span>
                  </div>
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

      {/* BARRA INFERIOR DE FINALIZACIÓN Y GUARDADO */}
      <div
        className="contenedor-tabla"
        style={{
          marginTop: 24,
          padding: "20px 24px",
          backgroundColor: "#ffffff",
          border: "1px solid #cbd5e1",
          borderRadius: 8,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <strong style={{ fontSize: 14, color: "#0f172a", display: "block" }}>
              Finalizar y Guardar Configuración
            </strong>
            <span style={{ fontSize: 12.5, color: "#64748b" }}>
              {pestanaPrincipal === "vistas"
                ? `Guarde para persistir la configuración de visibilidad y permisos para ${nombreSujeto}.`
                : "Guarde para persistir las reglas del ciclo de vida, reaperturas y pausas de SLA."}
            </span>
          </div>
          <button
            type="button"
            className="boton-primario"
            style={{ width: "auto", minWidth: 240, padding: "12px 28px", fontSize: 13.5, fontWeight: 700 }}
            onClick={pestanaPrincipal === "vistas" ? guardarCambiosVistas : guardarCambiosFlujoEstados}
            disabled={guardando || cargando}
          >
            {guardando ? "Guardando..." : "Guardar Configuración"}
          </button>
        </div>

        {mensajeExito && (
          <div
            style={{
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              padding: "10px 14px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {mensajeExito}
          </div>
        )}

        {error && (
          <div className="mensaje-error" style={{ margin: 0 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaginaConfiguracionVistasTickets() {
  return (
    <Suspense fallback={<div className="vista-contenedor"><p>Cargando vistas y flujos de tickets...</p></div>}>
      <ContenidoConfiguracionVistasTickets />
    </Suspense>
  );
}
