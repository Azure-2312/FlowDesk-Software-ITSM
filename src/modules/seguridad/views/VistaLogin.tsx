// ============================================================================
// SEGURIDAD Y ACCESO: PANTALLA OFICIAL DE AUTENTICACIÓN (LOGIN)
// ============================================================================
// Inicio de sesión seguro, selección de perfil activo para usuarios multi-rol
// y flujo completo de recuperación de contraseña con código de verificación.
// ============================================================================

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PerfilBasico } from "@/types";
import { validarCorreo } from "@/shared/lib/validaciones";
import { DOMINIO_CORPORATIVO } from "@/shared/lib/constants";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

type PasoLogin = "credenciales" | "seleccionar-perfil";

export default function PaginaLogin() {
  const router = useRouter();

  // --------------------------------------------------------------------------
  // 1. ESTADOS LOCALES: Credenciales y multi-perfil
  // --------------------------------------------------------------------------
  const [pasoLogin, setPasoLogin] = useState<PasoLogin>("credenciales");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [mensajeExitoLogin, setMensajeExitoLogin] = useState<string | null>(null);
  const [mostrarModalOlvideClave, setMostrarModalOlvideClave] = useState(false);

  // Datos para selección de múltiples perfiles
  const [tokenPreSesion, setTokenPreSesion] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [perfilesDisponibles, setPerfilesDisponibles] = useState<PerfilBasico[]>([]);

  // --------------------------------------------------------------------------
  // 2. CAPTCHA Y BLOQUEOS: Protección anti-fuerza bruta y cuenta bloqueada
  // --------------------------------------------------------------------------
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaRespuesta, setCaptchaRespuesta] = useState("");
  const [cargandoCaptcha, setCargandoCaptcha] = useState(false);
  const [errorCaptcha, setErrorCaptcha] = useState("");

  // Estados de Alerta de Bloqueo por Fuerza Bruta
  const [mostrarModalAlertaBloqueo, setMostrarModalAlertaBloqueo] = useState(false);
  const [cuentaBloqueadaDefinitivo, setCuentaBloqueadaDefinitivo] = useState(false);

  async function cargarNuevoCaptcha() {
    setCargandoCaptcha(true);
    try {
      const res = await fetch("/api/auth/captcha");
      const datos = await res.json();
      if (!res.ok || !datos.token || !datos.svg) {
        throw new Error("No se recibió el desafío CAPTCHA.");
      }
      setCaptchaToken(datos.token);
      setCaptchaSvg(datos.svg);
      setCaptchaRespuesta("");
      setErrorCaptcha("");
    } catch {
      setCaptchaToken("");
      setCaptchaSvg("");
      setCaptchaRespuesta("");
      setErrorCaptcha("No se pudo cargar el código de seguridad. Pulsa recargar o reinicia el servidor.");
    } finally {
      setCargandoCaptcha(false);
    }
  }

  useEffect(() => {
    cargarNuevoCaptcha();
  }, []);

  // --------------------------------------------------------------------------
  // 4. AUTENTICACIÓN: Validación de credenciales y selección de rol
  // --------------------------------------------------------------------------
  async function manejarEnvioCredenciales(e: FormEvent) {
    e.preventDefault();
    setErrorLogin(null);
    setMensajeExitoLogin(null);

    const valCorreo = validarCorreo(correo, "El correo electrónico", true);
    if (!valCorreo.valido) {
      setErrorLogin(valCorreo.mensaje!);
      return;
    }

    if (!clave) {
      setErrorLogin("Ingresa tu contraseña");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo_electronico: correo,
          clave,
          captcha_token: captchaToken,
          captcha_respuesta: captchaRespuesta,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorLogin(datos.error ?? "Usuario o contraseña incorrectos");
        cargarNuevoCaptcha();

        if (datos.alerta_bloqueo) {
          setMostrarModalAlertaBloqueo(true);
        }

        if (datos.cuenta_bloqueada) {
          setCuentaBloqueadaDefinitivo(true);
        }

        return;
      }

      if (datos.requiereSeleccionPerfil) {
        setTokenPreSesion(datos.tokenPreSesion);
        setNombreUsuario(datos.nombres);
        setPerfilesDisponibles(datos.perfiles);
        setPasoLogin("seleccionar-perfil");
        return;
      }

      router.push("/plataforma/inicio");
      router.refresh();
    } catch {
      setErrorLogin("Error de conexión. Intenta de nuevo.");
      cargarNuevoCaptcha();
    } finally {
      setCargando(false);
    }
  }

  async function manejarSeleccionPerfil(idPerfil: number) {
    setErrorLogin(null);
    setCargando(true);

    try {
      const respuesta = await fetch("/api/auth/seleccionar-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokenPreSesion, id_perfil: idPerfil }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setErrorLogin(datos.error ?? "No se pudo completar el ingreso");
        setPasoLogin("credenciales");
        return;
      }

      router.push("/plataforma/inicio");
      router.refresh();
    } catch {
      setErrorLogin("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }





  // ==========================================
  // VISTA: SELECCIÓN DE MÚLTIPLES PERFILES
  // ==========================================
  if (pasoLogin === "seleccionar-perfil") {
    return (
      <div className="pagina-login">
        <div className="tarjeta-login">
          <h1>Hola, {nombreUsuario}</h1>
          <p className="subtitulo">Tienes varios perfiles. ¿Con cuál quieres ingresar?</p>

          {errorLogin && <div className="mensaje-error">{errorLogin}</div>}

          <div className="lista-seleccion-perfil">
            {perfilesDisponibles.map((perfil) => (
              <button
                key={perfil.id_perfil}
                className="opcion-seleccion-perfil"
                onClick={() => manejarSeleccionPerfil(perfil.id_perfil)}
                disabled={cargando}
              >
                {perfil.nombre}
              </button>
            ))}
          </div>

          <button
            className="boton-enlace"
            onClick={() => setPasoLogin("credenciales")}
            disabled={cargando}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA: LOGIN TRADICIONAL
  // ==========================================
  return (
    <div className="pagina-login">
      <div className="tarjeta-login">
        <h1>FlowDesk: Software ITSM</h1>
        <p className="subtitulo">Ingresa tus credenciales para continuar</p>

        {mensajeExitoLogin && (
          <div
            style={{
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#065f46",
              padding: "10px 14px",
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {mensajeExitoLogin}
          </div>
        )}

        {errorLogin && <div className="mensaje-error">{errorLogin}</div>}

        <form onSubmit={manejarEnvioCredenciales}>
          <div className="campo">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => {
                setCorreo(e.target.value);
                setErrorLogin(null);
              }}
              placeholder={`usuario${DOMINIO_CORPORATIVO}`}
              required
              autoFocus
            />
            {correo.length > 0 && (() => {
              const v = validarCorreo(correo, "El correo electrónico", true);
              if (!v.valido) {
                return <AlertaCampo error={v.mensaje} />;
              }
              return null;
            })()}
          </div>

          <div className="campo">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="clave" style={{ margin: 0 }}>
                Contraseña
              </label>
            </div>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              placeholder="Tu contraseña"
              required
            />
            <button
              type="button"
              className="link-olvide-clave"
              onClick={() => setMostrarModalOlvideClave(true)}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Campo de validación CAPTCHA Anti-Bots */}
          <div className="campo campo-captcha">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="captchaInput" style={{ margin: 0 }}>
                Código de seguridad (Anti-bot) *
              </label>
              <button
                type="button"
                className="boton-icono boton-sm"
                onClick={cargarNuevoCaptcha}
                disabled={cargandoCaptcha}
                title="Generar nuevo código de verificación"
                aria-label="Generar nuevo código de verificación"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  style={{ animation: cargandoCaptcha ? "spin 1s linear infinite" : "none" }}
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <div className="contenedor-captcha-box">
              <div
                className="captcha-svg-visual"
                dangerouslySetInnerHTML={{ __html: captchaSvg }}
                title="Código de seguridad visual"
              />
              <input
                id="captchaInput"
                type="text"
                className="input-captcha-texto"
                value={captchaRespuesta}
                onChange={(e) =>
                  setCaptchaRespuesta(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())
                }
                placeholder="CÓDIGO"
                maxLength={5}
                required
              />
            </div>
            {errorCaptcha && (
              <p role="alert" style={{ margin: "6px 0 0", color: "#b91c1c", fontSize: 12 }}>
                {errorCaptcha}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="boton-primario boton-ancho-completo"
            disabled={cargando || captchaRespuesta.trim().length === 0 || cuentaBloqueadaDefinitivo}
            style={{ marginTop: 18 }}
          >
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {/* Modal Emergente de Alerta de Seguridad (Segundo Intento Fallido) */}
        {mostrarModalAlertaBloqueo && (
          <div className="modal-overlay">
            <div className="modal-alerta-seguridad" style={{ position: "relative" }}>
              <button
                type="button"
                className="boton-icono"
                style={{ position: "absolute", top: 12, right: 12 }}
                onClick={() => setMostrarModalAlertaBloqueo(false)}
                title="Cerrar aviso"
                aria-label="Cerrar aviso"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="modal-alerta-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 style={{ fontSize: 17, color: "#991b1b", marginBottom: 8, fontWeight: 700 }}>
                Segundo intento fallido
              </h2>
              <p style={{ fontSize: 13.5, color: "#374151", lineHeight: 1.5, marginBottom: 14 }}>
                Has ingresado credenciales incorrectas por <strong>2da vez</strong>. Si fallas <strong>una vez más</strong> (3er intento), tu usuario será <strong>bloqueado permanentemente</strong>.
              </p>
              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 12.5,
                  color: "#991b1b",
                  marginBottom: 20,
                  textAlign: "left",
                }}
              >
                Si tu usuario se bloquea al 3er intento, <strong>deberás acudir presencialmente</strong> al área de soporte técnico para solicitar el desbloqueo.
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  type="button"
                  className="boton-primario"
                  style={{ width: "100%" }}
                  onClick={() => {
                    setMostrarModalAlertaBloqueo(false);
                    setMostrarModalOlvideClave(true);
                  }}
                >
                  Restablecer mi contraseña ahora
                </button>
                <button
                  type="button"
                  className="boton-secundario"
                  style={{ width: "100%" }}
                  onClick={() => setMostrarModalAlertaBloqueo(false)}
                >
                  Entendido, volver a intentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de información de restablecimiento institucional (N2/N6) */}
        {mostrarModalOlvideClave && (
          <div className="modal-bloqueo-fondo">
            <div className="modal-bloqueo-tarjeta" style={{ maxWidth: 440 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>
                Restablecimiento de Contraseña
              </h2>
              <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginBottom: 16 }}>
                Por políticas de seguridad del sistema ITSM, las contraseñas no se gestionan a través de correo electrónico externo.
              </p>
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  fontSize: 12.5,
                  color: "#1e40af",
                }}
              >
                Solicite al <strong>Administrador del Sistema</strong> o a la <strong>Mesa de Ayuda</strong> la emisión de una contraseña temporal de acceso. Deberá cambiarla al iniciar sesión.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="boton-primario"
                  onClick={() => setMostrarModalOlvideClave(false)}
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
