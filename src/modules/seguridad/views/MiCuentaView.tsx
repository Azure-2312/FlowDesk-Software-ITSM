"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Usuario, Perfil } from "@/types";
import { validarNombre, validarCelular } from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

interface DetalleTecnico {
  nivel_soporte: number;
  especialidad_principal: string | null;
  capacidad_maxima_tickets: number | null;
  estado_operativo: string | null;
  departamento_nombre: string | null;
}

const CONFIG_PRIORIDAD_SOLICITANTE: Record<
  number,
  {
    nombre: string;
    corto: string;
    categoria: string;
    descripcion: string;
    colorFondo: string;
    colorTexto: string;
    borde: string;
  }
> = {
  1: {
    nombre: "Nivel 1: Prioridad VIP",
    corto: "VIP",
    categoria: "Alta Dirección y Presidencia",
    descripcion: "Atención prioritaria inmediata con canal de escalamiento preferente y resolución crítica.",
    colorFondo: "#fee2e2",
    colorTexto: "#991b1b",
    borde: "#fca5a5",
  },
  2: {
    nombre: "Nivel 2: Prioridad Ejecutiva",
    corto: "Ejecutiva",
    categoria: "Gerencias y Subgerencias",
    descripcion: "Atención ejecutiva con resolución de alta prioridad y tiempos acelerados.",
    colorFondo: "#ffedd5",
    colorTexto: "#9a3412",
    borde: "#fdba74",
  },
  3: {
    nombre: "Nivel 3: Prioridad Preferente",
    corto: "Preferente",
    categoria: "Jefaturas y Coordinaciones de Área",
    descripcion: "Atención prioritaria intermedia para líderes funcionales y coordinadores.",
    colorFondo: "#fef3c7",
    colorTexto: "#92400e",
    borde: "#fcd34d",
  },
  4: {
    nombre: "Nivel 4: Prioridad Técnica",
    corto: "Técnica",
    categoria: "Especialistas y Analistas Operativos",
    descripcion: "Atención especializada para personal técnico operativo y sistemas de soporte continuo.",
    colorFondo: "#e0e7ff",
    colorTexto: "#3730a3",
    borde: "#a5b4fc",
  },
  5: {
    nombre: "Nivel 5: Prioridad Estándar",
    corto: "Estándar",
    categoria: "Colaboradores y Usuarios Generales",
    descripcion: "Atención regular estándar según los acuerdos de nivel de servicio (SLA) institucional.",
    colorFondo: "#f1f5f9",
    colorTexto: "#475569",
    borde: "#cbd5e1",
  },
};

const CONFIG_NIVEL_TECNICO: Record<
  number,
  {
    codigo: "N1" | "N2" | "N3";
    nombre: string;
    rolSoporte: string;
    descripcion: string;
    colorFondo: string;
    colorTexto: string;
    borde: string;
  }
> = {
  1: {
    codigo: "N1",
    nombre: "Técnico Nivel 1 (N1)",
    rolSoporte: "Mesa de Ayuda / Primer Contacto",
    descripcion: "Recepción, triage, diagnóstico y atención de incidentes frecuentes y solicitudes de servicio.",
    colorFondo: "#eff6ff",
    colorTexto: "#1d4ed8",
    borde: "#bfdbfe",
  },
  2: {
    codigo: "N2",
    nombre: "Técnico Nivel 2 (N2)",
    rolSoporte: "Soporte Especializado de Segundo Nivel",
    descripcion: "Atención avanzada en estaciones de trabajo, redes locales, accesos y soporte a aplicativos.",
    colorFondo: "#f0fdf4",
    colorTexto: "#15803d",
    borde: "#bbf7d0",
  },
  3: {
    codigo: "N3",
    nombre: "Técnico Nivel 3 (N3)",
    rolSoporte: "Ingeniería de Infraestructura y Tercer Nivel",
    descripcion: "Especialistas senior de servidores, bases de datos, redes corporativas y problemas de raíz.",
    colorFondo: "#faf5ff",
    colorTexto: "#6b21a8",
    borde: "#e9d5ff",
  },
};

interface Props {
  datosIniciales?: {
    usuario: Usuario;
    perfiles: Perfil[];
    detalleTecnico?: DetalleTecnico | null;
  } | null;
}

export default function PaginaMiCuenta({ datosIniciales }: Props = {}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(datosIniciales?.usuario ?? null);
  const [perfiles, setPerfiles] = useState<Perfil[]>(datosIniciales?.perfiles ?? []);
  const [detalleTecnico, setDetalleTecnico] = useState<DetalleTecnico | null>(datosIniciales?.detalleTecnico ?? null);
  const [cargando, setCargando] = useState(!datosIniciales?.usuario);

  // Formulario de datos personales
  const [nombres, setNombres] = useState(datosIniciales?.usuario?.nombres || "");
  const [apellidoPaterno, setApellidoPaterno] = useState(datosIniciales?.usuario?.apellido_paterno || "");
  const [apellidoMaterno, setApellidoMaterno] = useState(datosIniciales?.usuario?.apellido_materno || "");
  const [celular, setCelular] = useState(datosIniciales?.usuario?.celular || "");
  const [guardandoDatos, setGuardandoDatos] = useState(false);

  // Formulario de cambio de clave
  const [claveActual, setClaveActual] = useState("");
  const [claveNueva, setClaveNueva] = useState("");
  const [claveConfirmacion, setClaveConfirmacion] = useState("");
  const [guardandoClave, setGuardandoClave] = useState(false);

  // Validación de requisitos de nueva contraseña
  const tieneLongitud = claveNueva.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(claveNueva);
  const tieneMinuscula = /[a-z]/.test(claveNueva);
  const tieneNumero = /\d/.test(claveNueva);
  const tieneSimbolo = /[\W_]/.test(claveNueva);
  const cumpleTodosRequisitos =
    tieneLongitud && tieneMayuscula && tieneMinuscula && tieneNumero && tieneSimbolo;
  const clavesCoinciden =
    claveNueva.length > 0 && claveConfirmacion.length > 0 && claveNueva === claveConfirmacion;

  // Alertas
  const [errorDatos, setErrorDatos] = useState<string | null>(null);
  const [errorClave, setErrorClave] = useState<string | null>(null);
  const [exito, setExito] = useState<string | null>(null);

  async function cargarDatos() {
    setCargando(true);
    try {
      const res = await fetch("/api/mi-cuenta");
      const data = await res.json();
      if (res.ok && data.usuario) {
        setUsuario(data.usuario);
        setPerfiles(data.perfiles ?? []);
        setDetalleTecnico(data.detalleTecnico ?? null);
        setNombres(data.usuario.nombres || "");
        setApellidoPaterno(data.usuario.apellido_paterno || "");
        setApellidoMaterno(data.usuario.apellido_materno || "");
        setCelular(data.usuario.celular || "");
      }
    } catch {
      setErrorDatos("No se pudo cargar la información de tu perfil de usuario");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!datosIniciales?.usuario) {
      cargarDatos();
    }
  }, [datosIniciales]);

  function mostrarExito(msj: string) {
    setExito(msj);
    setTimeout(() => setExito(null), 4000);
  }

  async function manejarGuardarDatos(e: FormEvent) {
    e.preventDefault();
    setErrorDatos(null);

    const vNom = validarNombre(nombres, "El nombre", true);
    if (!vNom.valido) {
      setErrorDatos(vNom.mensaje!);
      return;
    }
    const vPat = validarNombre(apellidoPaterno, "El apellido paterno", true);
    if (!vPat.valido) {
      setErrorDatos(vPat.mensaje!);
      return;
    }
    const vMat = validarNombre(apellidoMaterno, "El apellido materno", false);
    if (!vMat.valido) {
      setErrorDatos(vMat.mensaje!);
      return;
    }
    const vCel = validarCelular(celular, false);
    if (!vCel.valido) {
      setErrorDatos(vCel.mensaje!);
      return;
    }

    setGuardandoDatos(true);

    try {
      const res = await fetch("/api/mi-cuenta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          celular,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorDatos(data.error ?? "No se pudieron guardar los datos");
        return;
      }

      mostrarExito("Tus datos personales se han actualizado correctamente");
      await cargarDatos();
      router.refresh();
    } catch {
      setErrorDatos("Error de conexión al actualizar datos");
    } finally {
      setGuardandoDatos(false);
    }
  }

  async function manejarCambiarClave(e: FormEvent) {
    e.preventDefault();
    setErrorClave(null);

    if (!cumpleTodosRequisitos) {
      setErrorClave("La nueva contraseña no cumple con todos los requisitos de seguridad");
      return;
    }

    if (!clavesCoinciden) {
      setErrorClave("La nueva contraseña y su confirmación no coinciden");
      return;
    }

    setGuardandoClave(true);

    try {
      const res = await fetch("/api/mi-cuenta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres,
          apellido_paterno: apellidoPaterno,
          apellido_materno: apellidoMaterno,
          celular,
          clave_actual: claveActual,
          clave_nueva: claveNueva,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorClave(data.error ?? "No se pudo cambiar la contraseña");
        return;
      }

      setClaveActual("");
      setClaveNueva("");
      setClaveConfirmacion("");
      mostrarExito("¡Contraseña actualizada con éxito!");
    } catch {
      setErrorClave("Error de conexión al cambiar la contraseña");
    } finally {
      setGuardandoClave(false);
    }
  }

  if (cargando) {
    return (
      <div className="vista-contenedor" style={{ maxWidth: 640 }}>
        <p className="descripcion">Cargando datos de tu perfil...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="vista-contenedor" style={{ maxWidth: 640, backgroundColor: "#ffffff", padding: 24, borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 8px 0", color: "#0f172a" }}>Mi perfil</h2>
        <p className="descripcion" style={{ color: "#64748b" }}>
          {errorDatos || "No se pudo encontrar tu información de usuario o la sesión requiere sincronización."}
        </p>
        <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={() => cargarDatos()}
            className="boton-primario"
            style={{ width: "auto", padding: "8px 16px" }}
          >
            Reintentar cargar información
          </button>
          <button
            type="button"
            onClick={() => router.refresh()}
            className="boton-secundario"
            style={{ width: "auto", padding: "8px 16px" }}
          >
            Refrescar página
          </button>
        </div>
      </div>
    );
  }

  const nivelPrioridad = Number(usuario.nivel_prioridad || 5);
  const prioridadInfo =
    CONFIG_PRIORIDAD_SOLICITANTE[nivelPrioridad] || CONFIG_PRIORIDAD_SOLICITANTE[5];

  const nivelTecnico = Number(detalleTecnico?.nivel_soporte || 2);
  const tecnicoInfo =
    CONFIG_NIVEL_TECNICO[nivelTecnico] || CONFIG_NIVEL_TECNICO[2];

  const tienePerfilSolicitante = perfiles.some(
    (p) => p.id_perfil === 3 || p.nombre.toLowerCase().includes("solicitante")
  );
  const tienePerfilTecnico =
    perfiles.some((p) => p.id_perfil === 2 || p.nombre.toLowerCase().includes("tecnic")) ||
    Boolean(detalleTecnico);

  const iniciales = nombres
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1400 }}>
      {/* Cabecera de Página con Botón de Guardar en la Esquina Superior Derecha */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>Mi Perfil de Usuario</h1>
          <p className="descripcion" style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
            Gestión de información personal, credenciales de acceso corporativas y roles asignados.
          </p>
        </div>
        <button
          type="button"
          onClick={manejarGuardarDatos}
          className="boton-primario"
          style={{ width: "auto", padding: "8px 20px", fontSize: 13, flexShrink: 0 }}
          disabled={guardandoDatos}
        >
          {guardandoDatos ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {exito && (
        <div
          style={{
            backgroundColor: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#065f46",
            padding: "12px 16px",
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {exito}
        </div>
      )}

      {/* Encabezado de perfil (Ficha de Colaborador) */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 18 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: 18,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {iniciales}
        </div>
        <div>
          <h2 style={{ fontSize: 17, marginBottom: 2, color: "#0f172a" }}>
            {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno ?? ""}
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>{usuario.correo_electronico}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {perfiles.map((p) => {
              const esSolicitante = p.id_perfil === 3 || p.nombre.toLowerCase().includes("solicitante");
              const esTecnico = p.id_perfil === 2 || p.nombre.toLowerCase().includes("tecnic");

              if (esSolicitante) {
                return (
                  <span
                    key={p.id_perfil}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                      fontWeight: 700,
                      backgroundColor: prioridadInfo.colorFondo,
                      color: prioridadInfo.colorTexto,
                      border: `1px solid ${prioridadInfo.borde}`,
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                    title={`Solicitante con prioridad: ${prioridadInfo.nombre}`}
                  >
                    📌 Solicitante · Prioridad {prioridadInfo.corto}
                  </span>
                );
              }

              if (esTecnico) {
                return (
                  <span
                    key={p.id_perfil}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 11.5,
                      fontWeight: 700,
                      backgroundColor: tecnicoInfo.colorFondo,
                      color: tecnicoInfo.colorTexto,
                      border: `1px solid ${tecnicoInfo.borde}`,
                      padding: "3px 10px",
                      borderRadius: 999,
                    }}
                    title={`Técnico con acreditación ITIL: Nivel ${nivelTecnico} (${tecnicoInfo.codigo})`}
                  >
                    🛠️ Técnico · Nivel {nivelTecnico} ({tecnicoInfo.codigo})
                  </span>
                );
              }

              return (
                <span key={p.id_perfil} className="chip-perfil">
                  {p.nombre}
                </span>
              );
            })}
            {detalleTecnico && !perfiles.some((p) => p.id_perfil === 2 || p.nombre.toLowerCase().includes("tecnic")) && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  backgroundColor: tecnicoInfo.colorFondo,
                  color: tecnicoInfo.colorTexto,
                  border: `1px solid ${tecnicoInfo.borde}`,
                  padding: "3px 10px",
                  borderRadius: 999,
                }}
              >
                🛠️ Técnico · Nivel {nivelTecnico} ({tecnicoInfo.codigo})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tarjeta de Acreditación y Nivel de Prioridad de Solicitante */}
      {tienePerfilSolicitante && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: prioridadInfo.colorTexto,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              📌
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                Nivel de Prioridad del Solicitante · Mesa de Servicios
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>Prioridad {prioridadInfo.corto}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    backgroundColor: prioridadInfo.colorFondo,
                    color: prioridadInfo.colorTexto,
                    border: `1px solid ${prioridadInfo.borde}`,
                  }}
                >
                  Nivel {nivelPrioridad}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
                  — {prioridadInfo.categoria}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "#475569", marginTop: 3 }}>
                <strong>Alcance del servicio:</strong> {prioridadInfo.descripcion}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Nivel Institucional</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: prioridadInfo.colorTexto }}>
                Nivel {nivelPrioridad} ({prioridadInfo.corto})
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Atención en Mesa</div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: prioridadInfo.colorFondo,
                  color: prioridadInfo.colorTexto,
                  padding: "3px 8px",
                  borderRadius: 4,
                  marginTop: 2,
                  border: `1px solid ${prioridadInfo.borde}`,
                }}
              >
                ● {prioridadInfo.corto.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta de Acreditación y Nivel de Soporte Técnico */}
      {tienePerfilTecnico && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #cbd5e1",
            borderRadius: 8,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                backgroundColor: "#2563eb",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              🛡️
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.5px" }}>
                Acreditación Operativa ITIL v4 · Soporte Técnico
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 2, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span>Técnico Nivel {nivelTecnico}</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 999,
                    backgroundColor: tecnicoInfo.colorFondo,
                    color: tecnicoInfo.colorTexto,
                    border: `1px solid ${tecnicoInfo.borde}`,
                  }}
                >
                  {tecnicoInfo.codigo}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
                  — {tecnicoInfo.rolSoporte}
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: "#475569", marginTop: 3 }}>
                <strong>Especialidad:</strong> {detalleTecnico?.especialidad_principal || "Resolución de incidentes y requerimientos técnicos"}
                {detalleTecnico?.departamento_nombre && ` · ${detalleTecnico.departamento_nombre}`}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Nivel Operativo</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: tecnicoInfo.colorTexto }}>
                Nivel {nivelTecnico} ({tecnicoInfo.codigo})
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Capacidad Concurrente</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
                {detalleTecnico?.capacidad_maxima_tickets ?? 10} tickets max.
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Estado Operativo</div>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  backgroundColor: "#ecfdf5",
                  color: "#065f46",
                  padding: "3px 8px",
                  borderRadius: 4,
                  marginTop: 2,
                }}
              >
                ● {detalleTecnico?.estado_operativo || "DISPONIBLE"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Distribución en 2 Columnas para aprovechar todo el ancho de pantalla */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, alignItems: "start" }}>
        {/* Formulario 1: Datos Personales */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a" }}>Datos personales</h2>
          <p className="descripcion">Actualiza tu nombre, apellidos y teléfono de contacto.</p>

          {errorDatos && <div className="mensaje-error">{errorDatos}</div>}

          <form onSubmit={manejarGuardarDatos}>
            <div className="formulario-grid">
              <div className="campo">
                <label>DNI</label>
                <input value={usuario.dni} disabled title="El DNI es tu identificador único y no se puede modificar" />
              </div>

              <div className="campo">
                <label>Correo electrónico</label>
                <input value={usuario.correo_electronico} disabled title="El correo electrónico es tu credencial de acceso" />
              </div>

              <div className="campo">
                <label>Nombres *</label>
                <input
                  value={nombres}
                  maxLength={100}
                  onChange={(e) => setNombres(e.target.value)}
                  required
                />
                {nombres.length > 0 && (() => {
                  const v = validarNombre(nombres, "El nombre", true);
                  return v.valido ? (
                    <AlertaCampo exito="Nombre válido." />
                  ) : (
                    <AlertaCampo error={v.mensaje} />
                  );
                })()}
              </div>

              <div className="campo">
                <label>Apellido paterno *</label>
                <input
                  value={apellidoPaterno}
                  maxLength={100}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  required
                />
                {apellidoPaterno.length > 0 && (() => {
                  const v = validarNombre(apellidoPaterno, "El apellido paterno", true);
                  return v.valido ? (
                    <AlertaCampo exito="Apellido paterno válido." />
                  ) : (
                    <AlertaCampo error={v.mensaje} />
                  );
                })()}
              </div>

              <div className="campo">
                <label>Apellido materno</label>
                <input
                  value={apellidoMaterno}
                  maxLength={100}
                  onChange={(e) => setApellidoMaterno(e.target.value)}
                />
                {apellidoMaterno.length > 0 && (() => {
                  const v = validarNombre(apellidoMaterno, "El apellido materno", false);
                  return v.valido ? (
                    <AlertaCampo exito="Apellido materno válido." />
                  ) : (
                    <AlertaCampo error={v.mensaje} />
                  );
                })()}
              </div>

              <div className="campo">
                <label>Celular</label>
                <input
                  value={celular}
                  maxLength={9}
                  onChange={(e) => setCelular(e.target.value.replace(/\D/g, "").slice(0, 9))}
                  placeholder="Ej. 999999999"
                />
                {celular.length > 0 && (
                  celular.length < 9 ? (
                    <AlertaCampo error={`El celular debe tener 9 dígitos numéricos (has ingresado ${celular.length} de 9).`} />
                  ) : !celular.startsWith("9") ? (
                    <AlertaCampo error="El celular debe iniciar con 9." />
                  ) : (
                    <AlertaCampo exito="Número de celular válido (9 dígitos)." />
                  )
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                className="boton-primario"
                style={{ width: "auto", padding: "8px 18px", fontSize: 13 }}
                disabled={guardandoDatos}
              >
                {guardandoDatos ? "Guardando..." : "Guardar datos personales"}
              </button>
            </div>
          </form>
        </div>

        {/* Formulario 2: Seguridad y Cambio de Contraseña */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a" }}>Seguridad y contraseña</h2>
          <p className="descripcion">Cambia tu contraseña de acceso periódicamente para mayor seguridad.</p>

          {errorClave && <div className="mensaje-error">{errorClave}</div>}

          <form onSubmit={manejarCambiarClave}>
            <div className="formulario-grid">
              <div className="campo campo-ancho">
                <label>Contraseña actual *</label>
                <input
                  type="password"
                  value={claveActual}
                  onChange={(e) => setClaveActual(e.target.value)}
                  placeholder="Ingresa tu contraseña actual"
                  required
                />
              </div>

              <div className="campo">
                <label>Nueva contraseña *</label>
                <input
                  type="password"
                  value={claveNueva}
                  onChange={(e) => setClaveNueva(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                />
              </div>

              <div className="campo">
                <label>Confirmar nueva contraseña *</label>
                <input
                  type="password"
                  value={claveConfirmacion}
                  onChange={(e) => setClaveConfirmacion(e.target.value)}
                  placeholder="Repite la nueva contraseña"
                  required
                />
                {claveConfirmacion.length > 0 && (
                  <span
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      display: "block",
                      fontWeight: 500,
                      color: clavesCoinciden ? "#059669" : "#dc2626",
                    }}
                  >
                    {clavesCoinciden ? "Las contraseñas coinciden" : "Las contraseñas no coinciden"}
                  </span>
                )}
              </div>

              {/* Checklist de requisitos de seguridad en tiempo real */}
              <div className="lista-requisitos-clave campo campo-ancho" style={{ margin: "4px 0" }}>
                <div className={`requisito-item ${tieneLongitud ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Mínimo 8 caracteres
                </div>
                <div className={`requisito-item ${tieneMayuscula ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos una letra mayúscula (A-Z)
                </div>
                <div className={`requisito-item ${tieneMinuscula ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos una letra minúscula (a-z)
                </div>
                <div className={`requisito-item ${tieneNumero ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos un número (0-9)
                </div>
                <div className={`requisito-item ${tieneSimbolo ? "requisito-valido" : "requisito-invalido"}`}>
                  <span className="requisito-punto" /> Al menos un signo o carácter especial (!@#$%...)
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                type="submit"
                className="boton-primario"
                style={{
                  width: "auto",
                  padding: "8px 18px",
                  fontSize: 13,
                  backgroundColor: !cumpleTodosRequisitos || !clavesCoinciden || !claveActual ? "#9ca3af" : "#1e40af",
                  cursor: !cumpleTodosRequisitos || !clavesCoinciden || !claveActual ? "not-allowed" : "pointer"
                }}
                disabled={!cumpleTodosRequisitos || !clavesCoinciden || !claveActual || guardandoClave}
              >
                {guardandoClave ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sección 3: Mis Roles y Permisos (Full width debajo) */}
      <div style={{ marginTop: 20, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a" }}>Tus roles asignados</h2>
        <p className="descripcion">Los perfiles que tienes habilitados en tu usuario:</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12 }}>
          {perfiles.map((p) => {
            const esSolicitante = p.id_perfil === 3 || p.nombre.toLowerCase().includes("solicitante");
            const esTecnico = p.id_perfil === 2 || p.nombre.toLowerCase().includes("tecnic");

            return (
              <div
                key={p.id_perfil}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  backgroundColor: "#f9fafb",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <strong style={{ fontSize: 14, color: "#0f172a" }}>{p.nombre}</strong>
                    {esSolicitante && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: prioridadInfo.colorFondo,
                          color: prioridadInfo.colorTexto,
                          border: `1px solid ${prioridadInfo.borde}`,
                          padding: "1px 7px",
                          borderRadius: 4,
                        }}
                      >
                        Prioridad {prioridadInfo.corto} (Nivel {nivelPrioridad})
                      </span>
                    )}
                    {esTecnico && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: tecnicoInfo.colorFondo,
                          color: tecnicoInfo.colorTexto,
                          border: `1px solid ${tecnicoInfo.borde}`,
                          padding: "1px 7px",
                          borderRadius: 4,
                        }}
                      >
                        Nivel {nivelTecnico} ({tecnicoInfo.codigo})
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 0 0" }}>
                    {esSolicitante
                      ? `Prioridad asignada: ${prioridadInfo.nombre} — ${prioridadInfo.descripcion}`
                      : esTecnico
                      ? `Nivel de soporte operativo: ${tecnicoInfo.nombre} — ${tecnicoInfo.descripcion}`
                      : p.descripcion || "Acceso estándar según el catálogo de roles institucional."}
                  </p>
                </div>
                <span className="badge-activo" style={{ flexShrink: 0 }}>Asignado</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
