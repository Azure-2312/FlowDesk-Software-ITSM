import { query } from "@/shared/lib/db";
import {
  compararClave,
  crearTokenPreSesion,
  crearTokenSesion,
  MAX_INTENTOS_FALLIDOS,
} from "./authService";
import { sanitizarCorreo, sanitizarTexto, verificarCaptcha } from "@/shared/lib/security";
import { validarCorreo } from "@/shared/lib/validaciones";
import { SesionUsuario } from "@/types";

interface FilaUsuarioLogin {
  id_usuario: number;
  nombres: string;
  correo_electronico: string;
  clave: string;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
  cuenta_bloqueada: boolean;
}

/** Datos ya extraidos de la peticion HTTP que necesita el inicio de sesion. */
export interface DatosLogin {
  correo_electronico: unknown;
  clave: unknown;
  captcha_token: unknown;
  captcha_respuesta: unknown;
  ip: string;
}

/**
 * Resultado del intento de login. `payload` es el cuerpo JSON exacto que debe
 * devolver el controlador y `tokenSesion` solo viene cuando corresponde emitir
 * la cookie de sesion.
 */
export interface ResultadoLogin {
  httpStatus: number;
  payload: Record<string, unknown>;
  tokenSesion?: string;
}

/** Registra cada intento de login (exitoso o no) para auditoría de accesos. */
async function registrarLogAcceso(idUsuario: number | null, correo: string, exitoso: boolean, ip: string) {
  await query(
    `INSERT INTO log_acceso (id_usuario, correo_intento, exitoso, ip) VALUES ($1, $2, $3, $4)`,
    [idUsuario, correo, exitoso, ip]
  );
}

export async function iniciarSesion(datos: DatosLogin): Promise<ResultadoLogin> {
  const correo_electronico = sanitizarCorreo(datos.correo_electronico);
  const clave = typeof datos.clave === "string" ? datos.clave : "";
  const captcha_token = sanitizarTexto(datos.captcha_token);
  const captcha_respuesta = sanitizarTexto(datos.captcha_respuesta);
  const ip = datos.ip;

  const valCorreo = validarCorreo(correo_electronico, "El correo electrónico", true);
  if (!valCorreo.valido || !clave) {
    return { httpStatus: 400, payload: { error: "Usuario o contraseña incorrectos" } };
  }

  // 1) Validación obligatoria de CAPTCHA anti-bots
  const validacionCaptcha = verificarCaptcha(captcha_token, captcha_respuesta);
  if (!validacionCaptcha.valido) {
    return {
      httpStatus: 400,
      payload: {
        error: validacionCaptcha.error ?? "Código de seguridad CAPTCHA incorrecto",
        captcha_invalido: true,
      },
    };
  }

  // 1.1) Restricción de dominio: solo dominio corporativo de la empresa (@systemticket.pe),
  // excepto el administrador único autorizado con dominio externo (apazamiguel88@gmail.com).
  const correoNormalizado = correo_electronico.toLowerCase().trim();
  const esExcepcionAutorizada = correoNormalizado === "apazamiguel88@gmail.com";
  const tieneDominioCorporativo = correoNormalizado.endsWith("@systemticket.pe");

  if (!esExcepcionAutorizada && !tieneDominioCorporativo) {
    await registrarLogAcceso(null, correo_electronico, false, ip);
    return {
      httpStatus: 403,
      payload: {
        error: "Acceso denegado: solo está permitido iniciar sesión con el correo institucional de la empresa (@systemticket.pe), a excepción del usuario administrador autorizado.",
      },
    };
  }

  // 2) Buscar al usuario por correo electrónico
  const usuarios = await query<FilaUsuarioLogin>(
    `SELECT id_usuario, nombres, correo_electronico, clave, intentos_fallidos, bloqueado_hasta, cuenta_bloqueada
     FROM usuario
     WHERE LOWER(correo_electronico) = $1 AND estado_registro = true`,
    [correo_electronico]
  );

  // Mensaje de error genérico estricto para no revelar si el correo existe o no
  if (usuarios.length === 0) {
    await registrarLogAcceso(null, correo_electronico, false, ip);
    return { httpStatus: 401, payload: { error: "Usuario o contraseña incorrectos" } };
  }

  const usuario = usuarios[0];

  // 3) Verificar si la cuenta se encuentra bloqueada por intentos fallidos
  if (usuario.cuenta_bloqueada || usuario.intentos_fallidos >= MAX_INTENTOS_FALLIDOS) {
    await registrarLogAcceso(usuario.id_usuario, correo_electronico, false, ip);
    return {
      httpStatus: 403,
      payload: {
        error:
          "Tu usuario ha sido bloqueado por superar el límite de 3 intentos fallidos. Debes asistir presencialmente al área de soporte técnico para solicitar el desbloqueo.",
        cuenta_bloqueada: true,
      },
    };
  }

  // 4) Verificar contraseña con hash bcrypt
  const claveValida = await compararClave(clave, usuario.clave);

  if (!claveValida) {
    const nuevosIntentos = usuario.intentos_fallidos + 1;
    const seBloqueaDefinitivo = nuevosIntentos >= MAX_INTENTOS_FALLIDOS;

    if (seBloqueaDefinitivo) {
      // Bloqueo definitivo al 3er fallo
      await query(
        `UPDATE usuario
         SET intentos_fallidos = $1,
             cuenta_bloqueada = true,
             bloqueado_hasta = now()
         WHERE id_usuario = $2`,
        [MAX_INTENTOS_FALLIDOS, usuario.id_usuario]
      );

      await registrarLogAcceso(usuario.id_usuario, correo_electronico, false, ip);

      await query(
        `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
         VALUES ($1, 'SEGURIDAD', 'BLOQUEO_AUTOMATICO_INTENTOS', 'Usuario bloqueado preventivamente tras 3 intentos fallidos de autenticación', $2, $3)`,
        [
          usuario.id_usuario,
          JSON.stringify({ correo: correo_electronico, max_intentos: MAX_INTENTOS_FALLIDOS }),
          ip,
        ]
      );

      return {
        httpStatus: 403,
        payload: {
          error:
            "Tu usuario ha sido bloqueado por superar el límite de 3 intentos fallidos. Debes asistir presencialmente al área de soporte técnico para solicitar el desbloqueo.",
          cuenta_bloqueada: true,
          intentos: MAX_INTENTOS_FALLIDOS,
          max_intentos: MAX_INTENTOS_FALLIDOS,
        },
      };
    }

    // Si es el 2do fallo, alertar al usuario con pop-up en el frontend
    await query(
      `UPDATE usuario
       SET intentos_fallidos = $1
       WHERE id_usuario = $2`,
      [nuevosIntentos, usuario.id_usuario]
    );

    await registrarLogAcceso(usuario.id_usuario, correo_electronico, false, ip);

    return {
      httpStatus: 401,
      payload: {
        error: "Usuario o contraseña incorrectos",
        alerta_bloqueo: nuevosIntentos === 2,
        intentos: nuevosIntentos,
        max_intentos: MAX_INTENTOS_FALLIDOS,
      },
    };
  }

  // 5) Login correcto: reiniciar contador de intentos a 0 y asegurar desbloqueo
  await query(
    `UPDATE usuario
     SET intentos_fallidos = 0,
         cuenta_bloqueada = false,
         bloqueado_hasta = NULL
     WHERE id_usuario = $1`,
    [usuario.id_usuario]
  );

  // 6) Consultar perfiles asignados al usuario
  const perfiles = await query<{ id_perfil: number; nombre: string }>(
    `SELECT p.id_perfil, p.nombre
     FROM perfiles p
     INNER JOIN usuario_perfiles up ON up.id_perfil = p.id_perfil
     WHERE up.id_usuario = $1 AND up.estado_registro = true AND p.estado_registro = true`,
    [usuario.id_usuario]
  );

  if (perfiles.length === 0) {
    await registrarLogAcceso(usuario.id_usuario, correo_electronico, false, ip);
    return {
      httpStatus: 403,
      payload: { error: "Tu usuario no tiene ningún perfil asignado. Contacta al administrador." },
    };
  }

  await registrarLogAcceso(usuario.id_usuario, correo_electronico, true, ip);

  // 6a) Si tiene más de un perfil, solicita selección antes de emitir sesión
  if (perfiles.length > 1) {
    const tokenPreSesion = crearTokenPreSesion({
      id_usuario: usuario.id_usuario,
      nombres: usuario.nombres,
      correo_electronico: usuario.correo_electronico,
      perfiles,
    });

    return {
      httpStatus: 200,
      payload: {
        ok: true,
        requiereSeleccionPerfil: true,
        tokenPreSesion,
        nombres: usuario.nombres,
        perfiles,
      },
    };
  }

  // 6b) Si tiene un solo perfil, emite sesión directa
  const sesion: SesionUsuario = {
    id_usuario: usuario.id_usuario,
    nombres: usuario.nombres,
    correo_electronico: usuario.correo_electronico,
    perfiles,
    perfilActivo: perfiles[0],
  };

  const token = crearTokenSesion(sesion);
  return { httpStatus: 200, payload: { ok: true, sesion }, tokenSesion: token };
}
