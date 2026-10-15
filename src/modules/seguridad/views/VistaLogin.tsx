"use client";

import { useState, useEffect, useRef, FormEvent, ClipboardEvent } from "react";
import { useRouter } from "next/navigation";
import { PerfilBasico } from "@/types";
import { validarCorreo } from "@/shared/lib/validaciones";
import { AlertaCampo } from "@/shared/components/ui/AlertaCampo";

type Modo = "login" | "recuperar-correo" | "recuperar-codigo" | "recuperar-nueva-clave";
type PasoLogin = "credenciales" | "seleccionar-perfil";

export default function PaginaLogin() {
  const router = useRouter();

  // Estados de Login tradicional
  const [modo, setModo] = useState<Modo>("login");
  const [pasoLogin, setPasoLogin] = useState<PasoLogin>("credenciales");
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);
  const [mensajeExitoLogin, setMensajeExitoLogin] = useState<string | null>(null);

  // Datos para selección de múltiples perfiles
  const [tokenPreSesion, setTokenPreSesion] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [perfilesDisponibles, setPerfilesDisponibles] = useState<PerfilBasico[]>([]);

  // Estados de CAPTCHA Anti-Bots
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaRespuesta, setCaptchaRespuesta] = useState("");
  const [cargandoCaptcha, setCargandoCaptcha] = useState(false);
  const [errorCaptcha, setErrorCaptcha] = useState("");

  // Estados de Alerta de Bloqueo por Fuerza Bruta
  const [mostrarModalAlertaBloqueo, setMostrarModalAlertaBloqueo] = useState(false);
  const [cuentaBloqueadaDefinitivo, setCuentaBloqueadaDefinitivo] = useState(false);

  // Estados de Recuperación de Contraseña
  const [correoRecup, setCorreoRecup] = useState("");
  const [tokenSesionRecup, setTokenSesionRecup] = useState("");
  const [expiraCodigoMs, setExpiraCodigoMs] = useState<number | null>(null);
  const [expiraSesionMs, setExpiraSesionMs] = useState<number | null>(null);
  const [segundosCodigo, setSegundosCodigo] = useState(60);
  const [segundosSesion, setSegundosSesion] = useState(180);
  const [digitos, setDigitos] = useState<string[]>(["", "", "", "", "", ""]);
  const inputsOtpRef = useRef<(HTMLInputElement | null)[]>([]);

  // Nueva contraseña
  const [nuevaClave, setNuevaClave] = useState("");
  const [repetirClave, setRepetirClave] = useState("");
  const [enviandoRecup, setEnviandoRecup] = useState(false);
  const [errorRecup, setErrorRecup] = useState<string | null>(null);
  const [avisoReenvio, setAvisoReenvio] = useState<string | null>(null);

  // Validación de formato de correo corporativo o Gmail en tiempo real
  const regexCorreoRecup = /^[a-zA-Z0-9._%+-]+@(systemticket\.pe|gmail\.com)$/i;
  const esCorreoRecupValido = regexCorreoRecup.test(correoRecup.trim());

  // Validación de requisitos de nueva contraseña
  const tieneLongitud = nuevaClave.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(nuevaClave);
  const tieneMinuscula = /[a-z]/.test(nuevaClave);
  const tieneNumero = /\d/.test(nuevaClave);
  const tieneSimbolo = /[\W_]/.test(nuevaClave);
  const cumpleTodosRequisitos =
    tieneLongitud && tieneMayuscula && tieneMinuscula && tieneNumero && tieneSimbolo;
  const clavesCoinciden =
    nuevaClave.length > 0 && repetirClave.length > 0 && nuevaClave === repetirClave;

  // Temporizador regresivo sincronizado con el servidor (1 min código, 3 min sesión)
  useEffect(() => {
    if (modo === "login" || !expiraSesionMs) return;

    const actualizar = () => {
      const ahora = Date.now();

      // Temporizador global de sesión (máximo 3 minutos)
      const restanteSesion = Math.max(0, Math.ceil((expiraSesionMs - ahora) / 1000));
      setSegundosSesion(restanteSesion);

      if (restanteSesion <= 0) {
        alert(
          "El tiempo máximo de 3 minutos para restablecer tu contraseña ha expirado. Por motivos de seguridad, debes reiniciar el proceso."
        );
        resetearRecuperacion();
        return;
      }

      // Temporizador de validez del código (1 minuto)
      if (expiraCodigoMs) {
        const restanteCodigo = Math.max(0, Math.ceil((expiraCodigoMs - ahora) / 1000));
        setSegundosCodigo(restanteCodigo);
      }
    };

    actualizar();
    const intervalo = setInterval(actualizar, 1000);
    return () => clearInterval(intervalo);
  }, [modo, expiraSesionMs, expiraCodigoMs]);

  function resetearRecuperacion() {
    setModo("login");
    setCorreoRecup("");
    setTokenSesionRecup("");
    setExpiraCodigoMs(null);
    setExpiraSesionMs(null);
    setSegundosCodigo(60);
    setSegundosSesion(180);
    setDigitos(["", "", "", "", "", ""]);
    setNuevaClave("");
    setRepetirClave("");
    setErrorRecup(null);
    setAvisoReenvio(null);
  }

  function iniciarRecuperacion() {
    setErrorLogin(null);
    setMensajeExitoLogin(null);
    setErrorRecup(null);
    setCorreoRecup(correo.trim());
    setModo("recuperar-correo");
  }

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

  // ---------- Flujo Normal de Login ----------
  async function manejarEnvioCredenciales(e: FormEvent) {
    e.preventDefault();
    setErrorLogin(null);
    setMensajeExitoLogin(null);

    const valCorreo = validarCorreo(correo, "El correo electrónico", true);
    if (!valCorreo.valido) {
      setErrorLogin(valCorreo.mensaje!);
      return;
    }

    const correoNorm = correo.toLowerCase().trim();
    const esExcepcion = correoNorm === "apazamiguel88@gmail.com";
    const esDominioCorporativo = correoNorm.endsWith("@systemticket.pe");
    if (!esExcepcion && !esDominioCorporativo) {
      setErrorLogin("Solo está permitido iniciar sesión con el correo institucional de la empresa (@systemticket.pe), a excepción de apazamiguel88@gmail.com.");
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

      router.push("/plataforma/dashboard");
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

      router.push("/plataforma/dashboard");
      router.refresh();
    } catch {
      setErrorLogin("Error de conexión. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  // ---------- Flujo de Recuperación Paso 1: Enviar Código ----------
  async function manejarEnviarCodigo(e: FormEvent) {
    e.preventDefault();
    if (!esCorreoRecupValido) return;

    setErrorRecup(null);
    setAvisoReenvio(null);
    setEnviandoRecup(true);

    try {
      const res = await fetch("/api/auth/recuperar-clave/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoRecup }),
      });

      const datos = await res.json();

      if (!res.ok) {
        setErrorRecup(datos.error ?? "No se pudo enviar el código de recuperación");
        return;
      }

      setTokenSesionRecup(datos.token_sesion);
      setExpiraCodigoMs(datos.expira_codigo_ms || Date.now() + 60 * 1000);
      setExpiraSesionMs(datos.expira_sesion_ms || Date.now() + 180 * 1000);
      setSegundosCodigo(datos.segundos_codigo || 60);
      setSegundosSesion(datos.segundos_sesion || 180);
      setDigitos(["", "", "", "", "", ""]);
      setModo("recuperar-codigo");

      setTimeout(() => {
        inputsOtpRef.current[0]?.focus();
      }, 100);
    } catch {
      setErrorRecup("Error de conexión al enviar el código. Intenta de nuevo.");
    } finally {
      setEnviandoRecup(false);
    }
  }

  // Reenviar código (habilitado luego de 1 minuto)
  async function manejarReenviarCodigo() {
    if (segundosCodigo > 0 || enviandoRecup) return;

    setErrorRecup(null);
    setAvisoReenvio(null);
    setEnviandoRecup(true);

    try {
      const res = await fetch("/api/auth/recuperar-clave/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoRecup }),
      });

      const datos = await res.json();

      if (!res.ok) {
        setErrorRecup(datos.error ?? "No se pudo reenviar el código");
        return;
      }

      setTokenSesionRecup(datos.token_sesion);
      setExpiraCodigoMs(datos.expira_codigo_ms || Date.now() + 60 * 1000);
      setSegundosCodigo(datos.segundos_codigo || 60);
      setDigitos(["", "", "", "", "", ""]);
      setAvisoReenvio("Se ha enviado un nuevo código a tu correo");
      inputsOtpRef.current[0]?.focus();
    } catch {
      setErrorRecup("Error de conexión al reenviar código");
    } finally {
      setEnviandoRecup(false);
    }
  }

  // ---------- Manejo de los 6 rectángulos OTP ----------
  function manejarCambioDigito(index: number, valor: string) {
    const caracter = valor.replace(/[^a-zA-Z0-9]/g, "").slice(-1).toUpperCase();
    const nuevosDigitos = [...digitos];
    nuevosDigitos[index] = caracter;
    setDigitos(nuevosDigitos);
    setErrorRecup(null);

    // Si escribió un caracter, saltar automáticamente al siguiente recuadro
    if (caracter && index < 5) {
      inputsOtpRef.current[index + 1]?.focus();
    }
  }

  function manejarKeyDownDigito(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (!digitos[index] && index > 0) {
        inputsOtpRef.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsOtpRef.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputsOtpRef.current[index + 1]?.focus();
    }
  }

  function manejarPasteDigito(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const textoPegado = e.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, 6);

    if (!textoPegado) return;

    const nuevos = ["", "", "", "", "", ""];
    for (let i = 0; i < textoPegado.length; i++) {
      nuevos[i] = textoPegado[i];
    }
    setDigitos(nuevos);

    const proximoIndex = Math.min(textoPegado.length, 5);
    inputsOtpRef.current[proximoIndex]?.focus();
  }

  const codigoCompleto = digitos.join("");
  const codigoCompletoListo = digitos.every((d) => d.trim().length === 1);

  // ---------- Flujo de Recuperación Paso 2: Verificar Código ----------
  async function manejarVerificarCodigo(e: FormEvent) {
    e.preventDefault();
    if (!codigoCompletoListo) return;

    setErrorRecup(null);
    setEnviandoRecup(true);

    try {
      const res = await fetch("/api/auth/recuperar-clave/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_sesion: tokenSesionRecup,
          codigo: codigoCompleto,
        }),
      });

      const datos = await res.json();

      if (!res.ok) {
        setErrorRecup(datos.error ?? "Código inválido");
        if (datos.sesion_expirada) {
          setTimeout(resetearRecuperacion, 2500);
        }
        return;
      }

      setModo("recuperar-nueva-clave");
    } catch {
      setErrorRecup("Error al verificar el código");
    } finally {
      setEnviandoRecup(false);
    }
  }

  // ---------- Flujo de Recuperación Paso 3: Guardar Nueva Contraseña ----------
  async function manejarGuardarNuevaClave(e: FormEvent) {
    e.preventDefault();
    if (!cumpleTodosRequisitos || !clavesCoinciden) return;

    setErrorRecup(null);
    setEnviandoRecup(true);

    try {
      const res = await fetch("/api/auth/recuperar-clave/cambiar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token_sesion: tokenSesionRecup,
          codigo: codigoCompleto,
          clave_nueva: nuevaClave,
        }),
      });

      const datos = await res.json();

      if (!res.ok) {
        setErrorRecup(datos.error ?? "No se pudo actualizar la contraseña");
        if (datos.sesion_expirada) {
          setTimeout(resetearRecuperacion, 2500);
        }
        return;
      }

      // Éxito: volver directo al login con mensaje verde
      resetearRecuperacion();
      setCorreo(correoRecup);
      setClave("");
      setMensajeExitoLogin(
        "¡Tu contraseña ha sido actualizada con éxito! Ya puedes iniciar sesión."
      );
    } catch {
      setErrorRecup("Error de conexión al cambiar la contraseña");
    } finally {
      setEnviandoRecup(false);
    }
  }

  // Formato para temporizador de 3 minutos (MM:SS)
  const formatearMinutosSegundos = (totalSegundos: number) => {
    const mins = Math.floor(totalSegundos / 60);
    const segs = totalSegundos % 60;
    return `${mins.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
  };

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
            className="boton-texto"
            onClick={() => setPasoLogin("credenciales")}
            disabled={cargando}
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VISTA: RECUPERACIÓN - PASO 1 (INGRESAR CORREO GMAIL)
  // ========================================================
  if (modo === "recuperar-correo") {
    return (
      <div className="pagina-login">
        <div className="tarjeta-recuperacion">
          <h1>Recuperar contraseña</h1>
          <p className="subtitulo">
            Ingresa tu correo corporativo (@systemticket.pe) o Gmail para recibir un código de verificación de 6 dígitos.
          </p>

          {errorRecup && <div className="mensaje-error">{errorRecup}</div>}

          <form onSubmit={manejarEnviarCodigo}>
            <div className="campo">
              <label htmlFor="correoRecup">Correo electrónico *</label>
              <input
                id="correoRecup"
                type="email"
                placeholder="ejemplo@systemticket.pe o @gmail.com"
                value={correoRecup}
                onChange={(e) => {
                  setCorreoRecup(e.target.value);
                  setErrorRecup(null);
                }}
                required
                autoFocus
              />
              {correoRecup.trim().length > 0 && !esCorreoRecupValido && (
                <AlertaCampo error="El correo debe terminar en @systemticket.pe o @gmail.com" />
              )}
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="boton-primario"
                disabled={!esCorreoRecupValido || enviandoRecup}
                style={{
                  opacity: !esCorreoRecupValido || enviandoRecup ? 0.6 : 1,
                  cursor: !esCorreoRecupValido || enviandoRecup ? "not-allowed" : "pointer",
                }}
              >
                {enviandoRecup ? "Enviando código..." : "Enviar código"}
              </button>
            </div>
          </form>

          <button
            type="button"
            className="boton-texto"
            onClick={resetearRecuperacion}
            disabled={enviandoRecup}
            style={{ marginTop: 16, width: "100%", textAlign: "center" }}
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VISTA: RECUPERACIÓN - PASO 2 (6 RECTÁNGULOS DE CÓDIGO)
  // ========================================================
  if (modo === "recuperar-codigo") {
    return (
      <div className="pagina-login">
        <div className="tarjeta-recuperacion">
          {/* Temporizador Global en la esquina superior derecha */}
          <div className="temporizador-flotante" title="Tiempo total disponible para completar el cambio de clave">
            {formatearMinutosSegundos(segundosSesion)}
          </div>

          <h1>Verificación de código</h1>
          <p className="subtitulo" style={{ paddingRight: 60 }}>
            Hemos enviado un código a <strong>{correoRecup}</strong>. Ingresa los 6 caracteres.
          </p>

          {avisoReenvio && (
            <div
              style={{
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                padding: "8px 12px",
                borderRadius: 6,
                fontSize: 12,
                marginBottom: 12,
              }}
            >
              {avisoReenvio}
            </div>
          )}

          {errorRecup && <div className="mensaje-error">{errorRecup}</div>}

          <form onSubmit={manejarVerificarCodigo}>
            {/* 6 Rectángulos verticales de entrada */}
            <div className="grid-otp-6" onPaste={manejarPasteDigito}>
              {digitos.map((digito, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputsOtpRef.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  className="input-otp-box"
                  value={digito}
                  onChange={(e) => manejarCambioDigito(idx, e.target.value)}
                  onKeyDown={(e) => manejarKeyDownDigito(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                type="submit"
                className="boton-primario"
                disabled={!codigoCompletoListo || enviandoRecup}
                style={{
                  opacity: !codigoCompletoListo || enviandoRecup ? 0.6 : 1,
                  cursor: !codigoCompletoListo || enviandoRecup ? "not-allowed" : "pointer",
                }}
              >
                {enviandoRecup ? "Verificando..." : "Cambiar contraseña"}
              </button>

              {/* Botón de reenvío: solo se habilita tras 1 minuto */}
              <button
                type="button"
                className="boton-texto"
                onClick={manejarReenviarCodigo}
                disabled={segundosCodigo > 0 || enviandoRecup}
                style={{
                  fontSize: 12,
                  color: segundosCodigo > 0 ? "#9ca3af" : "#2563eb",
                  cursor: segundosCodigo > 0 ? "not-allowed" : "pointer",
                  textAlign: "center",
                }}
              >
                {segundosCodigo > 0
                  ? `Reenviar código en ${segundosCodigo}s`
                  : "Reenviar código nuevo"}
              </button>
            </div>
          </form>

          <button
            type="button"
            className="boton-texto"
            onClick={resetearRecuperacion}
            disabled={enviandoRecup}
            style={{ marginTop: 12, width: "100%", textAlign: "center", fontSize: 12 }}
          >
            Cancelar y volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // ========================================================
  // VISTA: RECUPERACIÓN - PASO 3 (NUEVA CONTRASEÑA)
  // ========================================================
  if (modo === "recuperar-nueva-clave") {
    return (
      <div className="pagina-login">
        <div className="tarjeta-recuperacion">
          {/* Temporizador Global en la esquina superior derecha */}
          <div className="temporizador-flotante" title="Tiempo total disponible">
            {formatearMinutosSegundos(segundosSesion)}
          </div>

          <h1>Nueva contraseña</h1>
          <p className="subtitulo" style={{ paddingRight: 60 }}>
            Crea una contraseña segura para tu usuario.
          </p>

          {errorRecup && <div className="mensaje-error">{errorRecup}</div>}

          <form onSubmit={manejarGuardarNuevaClave}>
            <div className="campo">
              <label htmlFor="nuevaClave">Nueva contraseña *</label>
              <input
                id="nuevaClave"
                type="password"
                value={nuevaClave}
                onChange={(e) => {
                  setNuevaClave(e.target.value);
                  setErrorRecup(null);
                }}
                placeholder="Ingresa tu nueva contraseña"
                required
                autoFocus
              />
            </div>

            <div className="campo">
              <label htmlFor="repetirClave">Repetir nueva contraseña *</label>
              <input
                id="repetirClave"
                type="password"
                value={repetirClave}
                onChange={(e) => {
                  setRepetirClave(e.target.value);
                  setErrorRecup(null);
                }}
                placeholder="Repite exactamente la contraseña"
                required
              />
              {repetirClave.length > 0 && (
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
            <div className="lista-requisitos-clave">
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
                <span className="requisito-punto" /> Al menos un signo o símbolo especial (!@#$%...)
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="boton-primario"
                disabled={!cumpleTodosRequisitos || !clavesCoinciden || enviandoRecup}
                style={{
                  opacity: !cumpleTodosRequisitos || !clavesCoinciden || enviandoRecup ? 0.6 : 1,
                  cursor: !cumpleTodosRequisitos || !clavesCoinciden || enviandoRecup ? "not-allowed" : "pointer",
                }}
              >
                {enviandoRecup ? "Guardando contraseña..." : "Guardar nueva contraseña"}
              </button>
            </div>
          </form>

          <button
            type="button"
            className="boton-texto"
            onClick={resetearRecuperacion}
            disabled={enviandoRecup}
            style={{ marginTop: 12, width: "100%", textAlign: "center", fontSize: 12 }}
          >
            Cancelar y volver al inicio
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
              placeholder="usuario@systemticket.pe"
              required
              autoFocus
            />
            {correo.length > 0 && (() => {
              const v = validarCorreo(correo, "El correo electrónico", true);
              if (!v.valido) {
                return <AlertaCampo error={v.mensaje} />;
              }
              const correoNorm = correo.toLowerCase().trim();
              const esExcepcion = correoNorm === "apazamiguel88@gmail.com";
              const esDominio = correoNorm.endsWith("@systemticket.pe");
              if (!esExcepcion && !esDominio) {
                return (
                  <AlertaCampo error="Solo se permite el dominio institucional @systemticket.pe (a excepción de apazamiguel88@gmail.com)." />
                );
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
              onClick={iniciarRecuperacion}
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
                className="boton-recargar-captcha"
                onClick={cargarNuevoCaptcha}
                disabled={cargandoCaptcha}
                title="Generar nuevo código de verificación"
                aria-label="Generar nuevo código de verificación"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "4px 8px" }}
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
            className="boton-primario"
            disabled={cargando || captchaRespuesta.trim().length === 0 || cuentaBloqueadaDefinitivo}
            style={{
              marginTop: 18,
              opacity: cargando || captchaRespuesta.trim().length === 0 || cuentaBloqueadaDefinitivo ? 0.6 : 1,
              cursor: cargando || captchaRespuesta.trim().length === 0 || cuentaBloqueadaDefinitivo ? "not-allowed" : "pointer",
            }}
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
                className="modal-cerrar-boton"
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
                  style={{ backgroundColor: "#2563eb", width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setMostrarModalAlertaBloqueo(false);
                    iniciarRecuperacion();
                  }}
                >
                  Restablecer mi contraseña ahora
                </button>
                <button
                  type="button"
                  className="boton-secundario"
                  style={{ width: "100%", padding: "8px 14px", textAlign: "center" }}
                  onClick={() => setMostrarModalAlertaBloqueo(false)}
                >
                  Entendido, volver a intentar
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="credenciales-prueba">
          Prueba con: apazamiguel88@gmail.com / Admin-01
          <br />
          (tiene 4 perfiles — para ver la pantalla de selección)
        </p>
      </div>
    </div>
  );
}
