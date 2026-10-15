import crypto from "crypto";
import { query, transaccion } from "@/shared/lib/db";
import { compararClave, hashearClave } from "./authService";
import { enviarCorreoCodigoRecuperacion } from "@/shared/lib/email";

/** Resultado uniforme para los endpoints de recuperación de contraseña. */
export interface ResultadoRecuperacion {
  httpStatus: number;
  payload: Record<string, unknown>;
}

function generarCodigo(): string {
  const caracteres = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let codigo = "";
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
}

export async function solicitarRecuperacionClave(body: { correo?: unknown }): Promise<ResultadoRecuperacion> {
  const { correo } = body;

  if (!correo || typeof correo !== "string") {
    return { httpStatus: 400, payload: { error: "El correo es obligatorio" } };
  }

  const correoLimpio = correo.trim().toLowerCase();

  // Validar formato de correo permitido (corporativo @systemticket.pe o @gmail.com)
  const regexCorreo = /^[a-zA-Z0-9._%+-]+@(systemticket\.pe|gmail\.com)$/i;
  if (!regexCorreo.test(correoLimpio)) {
    return {
      httpStatus: 400,
      payload: { error: "El correo debe ser corporativo (@systemticket.pe) o Gmail (@gmail.com)" },
    };
  }

  // Verificar si el correo existe en la base de datos
  const usuarios = await query<{
    id_usuario: number;
    nombres: string;
    correo_electronico: string;
    estado_registro: boolean;
  }>(
    `SELECT id_usuario, nombres, correo_electronico, estado_registro
     FROM usuario
     WHERE LOWER(correo_electronico) = $1`,
    [correoLimpio]
  );

  if (usuarios.length === 0) {
    return {
      httpStatus: 404,
      payload: { error: "No existe ningún usuario registrado con este correo en el sistema" },
    };
  }

  const usuario = usuarios[0];
  if (!usuario.estado_registro) {
    return {
      httpStatus: 403,
      payload: { error: "Este usuario se encuentra inactivo. Contacta al administrador." },
    };
  }

  // Generar código de 6 caracteres y token de sesión único
  const codigo = generarCodigo();
  const tokenSesion = crypto.randomUUID();

  // Insertar en la base de datos con expiraciones estrictas del servidor:
  // expira_codigo: 75 segundos desde el envío (60s efectivos + 15s margen de entrega SMTP)
  // expira_sesion: 3 minutos para todo el flujo
  const insertado = await query<{
    fecha_envio: string;
    expira_codigo: string;
    expira_sesion: string;
  }>(
    `INSERT INTO codigo_recuperacion
       (id_usuario, correo, codigo, token_sesion, fecha_envio, expira_codigo, expira_sesion, utilizado)
     VALUES
       ($1, $2, $3, $4, now(), now() + interval '75 seconds', now() + interval '180 seconds', false)
     RETURNING fecha_envio, expira_codigo, expira_sesion`,
    [usuario.id_usuario, usuario.correo_electronico, codigo, tokenSesion]
  );

  const { fecha_envio, expira_codigo, expira_sesion } = insertado[0];

  // Enviar correo mediante Gmail SMTP
  await enviarCorreoCodigoRecuperacion(usuario.correo_electronico, codigo, usuario.nombres);

  const ahoraMs = Date.now();
  return {
    httpStatus: 200,
    payload: {
      ok: true,
      mensaje: "Código enviado exitosamente a tu correo electrónico",
      token_sesion: tokenSesion,
      fecha_envio,
      expira_codigo,
      expira_sesion,
      expira_codigo_ms: ahoraMs + 60 * 1000,
      expira_sesion_ms: ahoraMs + 180 * 1000,
      segundos_codigo: 60,
      segundos_sesion: 180,
    },
  };
}

export async function verificarCodigoRecuperacion(body: {
  token_sesion?: unknown;
  codigo?: unknown;
}): Promise<ResultadoRecuperacion> {
  const { token_sesion, codigo } = body;

  if (!token_sesion || !codigo) {
    return {
      httpStatus: 400,
      payload: { error: "El token de sesión y el código son requeridos" },
    };
  }

  const codigoLimpio = String(codigo).trim().toUpperCase();
  if (codigoLimpio.length !== 6) {
    return {
      httpStatus: 400,
      payload: { error: "El código debe contener exactamente 6 caracteres" },
    };
  }

  const registros = await query<{
    id_recuperacion: number;
    id_usuario: number;
    codigo: string;
    expira_codigo: string;
    expira_sesion: string;
    utilizado: boolean;
    sesion_expirada: boolean;
    codigo_expirado: boolean;
  }>(
    `SELECT id_recuperacion, id_usuario, codigo, expira_codigo, expira_sesion, utilizado,
            (now() > expira_sesion) as sesion_expirada,
            (now() > expira_codigo) as codigo_expirado
     FROM codigo_recuperacion
     WHERE token_sesion = $1`,
    [token_sesion]
  );

  if (registros.length === 0) {
    return {
      httpStatus: 404,
      payload: { error: "Sesión de recuperación no encontrada. Por favor inicia nuevamente." },
    };
  }

  const reg = registros[0];

  if (reg.sesion_expirada) {
    return {
      httpStatus: 410,
      payload: {
        error: "El tiempo máximo de la sesión (3 minutos) ha expirado.",
        sesion_expirada: true,
      },
    };
  }

  if (reg.utilizado) {
    return {
      httpStatus: 400,
      payload: { error: "Este código ya fue utilizado para cambiar una contraseña." },
    };
  }

  if (reg.codigo.toUpperCase() !== codigoLimpio) {
    return {
      httpStatus: 400,
      payload: { error: "El código de verificación es incorrecto. Verifica tu bandeja de correo." },
    };
  }

  if (reg.codigo_expirado) {
    return {
      httpStatus: 400,
      payload: {
        error: "El código ha vencido (validez de 1 minuto). Pulsa 'Reenviar código' para generar uno nuevo.",
        codigo_expirado: true,
      },
    };
  }

  return {
    httpStatus: 200,
    payload: {
      ok: true,
      mensaje: "Código verificado con éxito",
    },
  };
}

export interface DatosCambiarClaveRecuperacion {
  token_sesion?: unknown;
  codigo?: unknown;
  clave_nueva?: string;
  ip: string;
}

export async function cambiarClaveRecuperacion(
  datos: DatosCambiarClaveRecuperacion
): Promise<ResultadoRecuperacion> {
  const { token_sesion, codigo, clave_nueva, ip } = datos;

  if (!token_sesion || !codigo || !clave_nueva) {
    return {
      httpStatus: 400,
      payload: { error: "Faltan datos obligatorios para cambiar la contraseña" },
    };
  }

  const codigoLimpio = String(codigo).trim().toUpperCase();

  // 1. Validar requisitos de seguridad de la nueva contraseña
  if (clave_nueva.length < 8) {
    return {
      httpStatus: 400,
      payload: { error: "La contraseña debe tener un mínimo de 8 caracteres" },
    };
  }
  if (!/[A-Z]/.test(clave_nueva)) {
    return {
      httpStatus: 400,
      payload: { error: "La contraseña debe contener al menos una letra mayúscula" },
    };
  }
  if (!/[a-z]/.test(clave_nueva)) {
    return {
      httpStatus: 400,
      payload: { error: "La contraseña debe contener al menos una letra minúscula" },
    };
  }
  if (!/\d/.test(clave_nueva)) {
    return {
      httpStatus: 400,
      payload: { error: "La contraseña debe contener al menos un número" },
    };
  }
  if (!/[\W_]/.test(clave_nueva)) {
    return {
      httpStatus: 400,
      payload: { error: "La contraseña debe contener al menos un signo o carácter especial (ej. !@#$%^&*)" },
    };
  }

  // 2. Buscar registro de recuperación
  const registros = await query<{
    id_recuperacion: number;
    id_usuario: number;
    codigo: string;
    utilizado: boolean;
    sesion_expirada: boolean;
    codigo_expirado: boolean;
  }>(
    `SELECT id_recuperacion, id_usuario, codigo, utilizado,
            (now() > expira_sesion) as sesion_expirada,
            (now() > expira_codigo) as codigo_expirado
     FROM codigo_recuperacion
     WHERE token_sesion = $1`,
    [token_sesion]
  );

  if (registros.length === 0) {
    return { httpStatus: 404, payload: { error: "Sesión de recuperación no encontrada" } };
  }

  const reg = registros[0];

  if (reg.sesion_expirada) {
    return {
      httpStatus: 410,
      payload: {
        error: "El tiempo total de la sesión (3 minutos) ha expirado.",
        sesion_expirada: true,
      },
    };
  }

  if (reg.utilizado) {
    return {
      httpStatus: 400,
      payload: { error: "Este código ya fue utilizado. Solicita un nuevo proceso." },
    };
  }

  if (reg.codigo.toUpperCase() !== codigoLimpio) {
    return {
      httpStatus: 400,
      payload: { error: "El código de verificación no coincide" },
    };
  }

  // 3. Obtener la contraseña actual del usuario para validar que no sea idéntica
  const usuarios = await query<{ id_usuario: number; clave: string }>(
    `SELECT id_usuario, clave FROM usuario WHERE id_usuario = $1`,
    [reg.id_usuario]
  );

  if (usuarios.length === 0) {
    return { httpStatus: 404, payload: { error: "Usuario no encontrado" } };
  }

  const claveActualHash = usuarios[0].clave;
  const esMismaClave = await compararClave(clave_nueva, claveActualHash);

  if (esMismaClave) {
    return {
      httpStatus: 400,
      payload: { error: "La nueva contraseña no puede ser idéntica a la anterior. Por favor, elige una contraseña diferente." },
    };
  }

  // 4. Hashear la nueva contraseña y actualizar en la base de datos
  const nuevaClaveHash = await hashearClave(clave_nueva);

  await transaccion(async (client) => {
    await client.query(
      `UPDATE usuario
       SET clave = $1, fecha_modificacion = now(), cuenta_bloqueada = false, intentos_fallidos = 0
       WHERE id_usuario = $2`,
      [nuevaClaveHash, reg.id_usuario]
    );

    await client.query(
      `UPDATE codigo_recuperacion
       SET utilizado = true
       WHERE id_recuperacion = $1`,
      [reg.id_recuperacion]
    );

    await client.query(
      `INSERT INTO log_auditoria_sistema (id_usuario, modulo, accion, descripcion, detalles, direccion_ip)
       VALUES ($1, 'SEGURIDAD', 'RESTABLECER_CONTRASENA', 'El usuario restableció satisfactoriamente su contraseña mediante código de seguridad verificado', $2, $3)`,
      [
        reg.id_usuario,
        JSON.stringify({ metodo: "CODIGO_EMAIL", id_recuperacion: reg.id_recuperacion }),
        ip,
      ]
    );
  });

  return {
    httpStatus: 200,
    payload: {
      ok: true,
      mensaje: "Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.",
    },
  };
}
