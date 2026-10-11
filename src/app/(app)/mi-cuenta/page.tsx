"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Usuario, Perfil } from "@/types";
import { validarNombre, validarCelular } from "@/lib/validaciones";
import { AlertaCampo } from "@/components/ui/AlertaCampo";

export default function PaginaMiCuenta() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);

  // Formulario de datos personales
  const [nombres, setNombres] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [celular, setCelular] = useState("");
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
    cargarDatos();
  }, []);

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
      <div className="vista-contenedor" style={{ maxWidth: 640 }}>
        <h2>Mi perfil</h2>
        <p className="descripcion">No se pudo encontrar tu información de usuario.</p>
      </div>
    );
  }

  const iniciales = nombres
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="vista-contenedor" style={{ maxWidth: 740 }}>
      <div className="cabecera-pagina" style={{ marginBottom: 20 }}>
        <h1>Mi Perfil de Usuario</h1>
        <p>
          Gestión de información personal, credenciales de acceso corporativas y roles asignados.
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

      {/* Encabezado de perfil */}
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
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {perfiles.map((p) => (
              <span key={p.id_perfil} className="chip-perfil">
                {p.nombre}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario 1: Datos Personales */}
      <div style={{ marginBottom: 20, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
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
              style={{ width: "auto" }}
              disabled={guardandoDatos}
            >
              {guardandoDatos ? "Guardando..." : "Guardar cambios personales"}
            </button>
          </div>
        </form>
      </div>

      {/* Formulario 2: Seguridad y Cambio de Contraseña */}
      <div style={{ marginBottom: 20, backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
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

      {/* Sección 3: Mis Roles y Permisos */}
      <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: 20 }}>
        <h2 style={{ fontSize: 16, margin: 0, marginBottom: 4, color: "#0f172a" }}>Tus roles asignados</h2>
        <p className="descripcion">Los perfiles que tienes habilitados en tu usuario:</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {perfiles.map((p) => (
            <div
              key={p.id_perfil}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
              }}
            >
              <div>
                <strong>{p.nombre}</strong>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                  {p.descripcion || "Acceso estándar según el catálogo de roles"}
                </p>
              </div>
              <span className="badge-activo">Asignado</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
