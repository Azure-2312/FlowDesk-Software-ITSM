"use client";

import { useEffect, useState, useRef, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Usuario, Perfil } from "@/types";

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

interface PerfilActivoInfo {
  id_perfil: number;
  nombre: string;
}

interface Props {
  datosIniciales?: {
    usuario: Usuario;
    perfiles: Perfil[];
    detalleTecnico?: DetalleTecnico | null;
    perfilActivo?: PerfilActivoInfo;
  } | null;
  perfilActivo?: PerfilActivoInfo;
}

export default function PaginaMiCuenta({ datosIniciales, perfilActivo: propsPerfilActivo }: Props = {}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [usuario, setUsuario] = useState<Usuario | null>(datosIniciales?.usuario ?? null);
  const [perfiles, setPerfiles] = useState<Perfil[]>(datosIniciales?.perfiles ?? []);
  const [detalleTecnico, setDetalleTecnico] = useState<DetalleTecnico | null>(datosIniciales?.detalleTecnico ?? null);
  const [perfilActivo, setPerfilActivo] = useState<PerfilActivoInfo | null>(
    datosIniciales?.perfilActivo || propsPerfilActivo || null
  );
  const [cargando, setCargando] = useState(!datosIniciales?.usuario);

  // Foto de perfil
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(datosIniciales?.usuario?.foto_perfil ?? null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  // Formulario de cambio de clave (Único editable junto a la foto de perfil)
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
        if (data.perfilActivo) setPerfilActivo(data.perfilActivo);
        if (data.usuario.foto_perfil) setFotoPerfil(data.usuario.foto_perfil);
      }
    } catch {
      setErrorFoto("No se pudo cargar la información de tu perfil de usuario");
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

  // Manejo de subida de foto de perfil
  async function manejarSeleccionarFoto(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
      setErrorFoto("El archivo seleccionado debe ser una imagen (PNG, JPG o WebP).");
      return;
    }

    if (archivo.size > 5 * 1024 * 1024) {
      setErrorFoto("La imagen seleccionada supera el límite máximo permitido de 5 MB.");
      return;
    }

    setErrorFoto(null);
    setSubiendoFoto(true);

    const lector = new FileReader();
    lector.onload = async () => {
      const dataUrl = lector.result as string;
      try {
        const res = await fetch("/api/mi-cuenta", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ foto_perfil: dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorFoto(data.error || "No se pudo actualizar la foto de perfil");
          return;
        }

        setFotoPerfil(dataUrl);
        if (usuario) {
          setUsuario({ ...usuario, foto_perfil: dataUrl });
        }
        mostrarExito("¡Foto de perfil actualizada con éxito!");
      } catch {
        setErrorFoto("Error al conectarse con el servidor para subir la foto.");
      } finally {
        setSubiendoFoto(false);
      }
    };
    lector.onerror = () => {
      setErrorFoto("Error al procesar el archivo de imagen.");
      setSubiendoFoto(false);
    };
    lector.readAsDataURL(archivo);
  }

  async function manejarEliminarFoto() {
    if (!confirm("¿Deseas quitar tu foto de perfil actual?")) return;

    setErrorFoto(null);
    setSubiendoFoto(true);
    try {
      const res = await fetch("/api/mi-cuenta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto_perfil: null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorFoto(data.error || "No se pudo quitar la foto de perfil");
        return;
      }

      setFotoPerfil(null);
      if (usuario) {
        setUsuario({ ...usuario, foto_perfil: null });
      }
      mostrarExito("Foto de perfil eliminada.");
    } catch {
      setErrorFoto("Error de conexión al eliminar la foto.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  // Cambio de contraseña
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
          No se pudo encontrar tu información de usuario o la sesión requiere sincronización.
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

  // Discriminación del rol activo actual en la sesión
  const esTecnicoActivo = Boolean(
    perfilActivo?.id_perfil === 2 ||
    perfilActivo?.nombre?.toLowerCase().includes("tecnic")
  );

  const esSolicitanteActivo = Boolean(
    perfilActivo?.id_perfil === 3 ||
    perfilActivo?.nombre?.toLowerCase().includes("solicitante")
  );

  const nivelPrioridad = Number(usuario.nivel_prioridad || 5);
  const prioridadInfo =
    CONFIG_PRIORIDAD_SOLICITANTE[nivelPrioridad] || CONFIG_PRIORIDAD_SOLICITANTE[5];

  const nivelTecnico = Number(detalleTecnico?.nivel_soporte || 2);
  const tecnicoInfo =
    CONFIG_NIVEL_TECNICO[nivelTecnico] || CONFIG_NIVEL_TECNICO[2];

  const iniciales = (usuario.nombres || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  // Determinación del área / departamento según el perfil activo
  const areaTrabajo = esTecnicoActivo
    ? (detalleTecnico?.departamento_nombre || usuario.departamento_ti_nombre || usuario.departamento_empresa_nombre || "Mesa de Ayuda y Triaje (Nivel 1)")
    : (usuario.departamento_empresa_nombre || usuario.departamento_ti_nombre || "Finanzas / Área General");

  const idEmpresarial = `EMP-${String(usuario.id_usuario).padStart(4, "0")}`;

  return (
    <div className="vista-contenedor" style={{ maxWidth: 1400 }}>
      {/* Cabecera de Página informativa */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px 0", color: "#0f172a" }}>Mi Perfil de Usuario</h1>
        <p className="descripcion" style={{ margin: 0, fontSize: 13, color: "#64748b" }}>
          Ficha institucional del colaborador, información empresarial y seguridad de credenciales.
        </p>
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

      {errorFoto && (
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
          {errorFoto}
        </div>
      )}

      {/* Input oculto para subir foto de perfil */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        style={{ display: "none" }}
        onChange={manejarSeleccionarFoto}
      />

      {/* Encabezado de perfil (Ficha de Colaborador con Foto de Perfil interactiva y Etiquetas de Roles) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 20,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 8,
          padding: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Contenedor de Foto de Perfil con Acciones */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "#2563eb",
              color: "white",
              fontSize: 22,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "3px solid #e2e8f0",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              position: "relative",
            }}
          >
            {fotoPerfil ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fotoPerfil}
                alt="Foto de perfil"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{iniciales}</span>
            )}
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={subiendoFoto}
              style={{
                fontSize: 11,
                padding: "3px 8px",
                borderRadius: 4,
                border: "1px solid #cbd5e1",
                backgroundColor: "#f8fafc",
                color: "#1e293b",
                cursor: subiendoFoto ? "wait" : "pointer",
                fontWeight: 600,
              }}
              title="Subir o cambiar foto de perfil"
            >
              {subiendoFoto ? "Cargando..." : "Cambiar foto"}
            </button>
            {fotoPerfil && (
              <button
                type="button"
                onClick={manejarEliminarFoto}
                disabled={subiendoFoto}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 4,
                  border: "1px solid #fecaca",
                  backgroundColor: "#fef2f2",
                  color: "#dc2626",
                  cursor: subiendoFoto ? "wait" : "pointer",
                  fontWeight: 600,
                }}
                title="Quitar foto de perfil"
              >
                Quitar
              </button>
            )}
          </div>
        </div>

        {/* Información personal del colaborador y etiquetas de roles asignados */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <h2 style={{ fontSize: 18, margin: "0 0 10px 0", color: "#0f172a" }}>
            {usuario.nombres} {usuario.apellido_paterno} {usuario.apellido_materno ?? ""}
          </h2>

          {/* Etiquetas simples de roles asignados debajo del nombre */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {perfiles.map((p) => (
              <span key={p.id_perfil} className="chip-perfil">
                {p.nombre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de 2 Columnas: Datos Empresariales y Datos Personales (Solo Lectura) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20, alignItems: "start", marginBottom: 20 }}>
        
        {/* SECCIÓN: DATOS EMPRESARIALES */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ fontSize: 16, margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              Datos empresariales
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#475569",
                backgroundColor: "#f1f5f9",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid #e2e8f0",
              }}
            >
              Ficha Institucional
            </span>
          </div>
          <p className="descripcion" style={{ marginBottom: 16 }}>
            Adscripción organizacional y configuración operativa asignada en la empresa.
          </p>

          <div className="formulario-grid">
            {/* 1. Área o departamento de trabajo */}
            <div className="campo campo-ancho">
              <label>Área o departamento de trabajo</label>
              <input
                value={areaTrabajo}
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#0f172a", fontWeight: 600 }}
              />
            </div>

            {/* 2. Correo empresarial */}
            <div className="campo">
              <label>Correo empresarial</label>
              <input
                value={usuario.correo_electronico}
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
              />
            </div>

            {/* 3. ID empresarial */}
            <div className="campo">
              <label>ID empresarial</label>
              <input
                value={idEmpresarial}
                disabled
                style={{ backgroundColor: "#f8fafc", color: "#0f172a", fontWeight: 600 }}
              />
            </div>

            {/* 4. Nivel técnico (SE MUESTRA ÚNICAMENTE SI EL PERFIL ACTIVO ES TÉCNICO) */}
            {esTecnicoActivo && (
              <div className="campo">
                <label>Nivel técnico</label>
                <input
                  value={`Nivel ${nivelTecnico} (${tecnicoInfo.codigo})`}
                  disabled
                  style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                />
              </div>
            )}

            {/* 5. Nivel solicitante (SE MUESTRA ÚNICAMENTE SI EL PERFIL ACTIVO ES SOLICITANTE) */}
            {esSolicitanteActivo && (
              <div className="campo">
                <label>Nivel solicitante</label>
                <input
                  value={`Prioridad ${prioridadInfo.corto} (Nivel ${nivelPrioridad})`}
                  disabled
                  style={{ backgroundColor: "#f8fafc", color: "#0f172a" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* SECCIÓN: DATOS PERSONALES (SOLO LECTURA) */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 style={{ fontSize: 16, margin: 0, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              Datos personales
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                backgroundColor: "#f8fafc",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid #cbd5e1",
              }}
            >
              Solo lectura
            </span>
          </div>
          <p className="descripcion" style={{ marginBottom: 16 }}>
            Información de identidad personal administrada por Gestión del Talento.
          </p>

          <div className="formulario-grid">
            <div className="campo">
              <label>DNI</label>
              <input value={usuario.dni} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div className="campo">
              <label>Celular</label>
              <input value={usuario.celular || "No registrado"} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div className="campo">
              <label>Nombres</label>
              <input value={usuario.nombres} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div className="campo">
              <label>Apellido paterno</label>
              <input value={usuario.apellido_paterno} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div className="campo">
              <label>Apellido materno</label>
              <input value={usuario.apellido_materno || "—"} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>

            <div className="campo">
              <label>Correo personal</label>
              <input value={usuario.correo_personal || "No registrado"} disabled style={{ backgroundColor: "#f8fafc" }} />
            </div>
          </div>

          <div
            style={{
              marginTop: 16,
              fontSize: 11.5,
              color: "#64748b",
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 6,
              padding: "8px 12px",
            }}
          >
            ℹ️ Los datos del perfil son de solo lectura. Para actualizar tu información de identidad o contacto, comunícate con el área de Talento Humano o Mesa de Servicio.
          </div>
        </div>
      </div>

      {/* SECCIÓN: SEGURIDAD Y CONTRASEÑA (ÚNICA SECCIÓN EDITABLE) */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
          Seguridad y contraseña
        </h2>
        <p className="descripcion">Cambia tu contraseña periódicamente para mantener tu cuenta corporativa protegida.</p>

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
  );
}
