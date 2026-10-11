import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SesionUsuario, PerfilBasico } from "@/types";
import { COOKIE_SESION } from "@/lib/constants";

const DURACION_SESION = "8h";
const DURACION_PRE_SESION = "5m";

function obtenerSecretoJWT(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error("JWT_SECRET debe estar configurado con al menos 32 caracteres.");
  }
  return secreto;
}

// ---------- Contraseñas ----------

/** Convierte una contraseña en texto plano a su hash. Se usa al registrar un usuario. */
export async function hashearClave(claveTextoPlano: string): Promise<string> {
  const SALT_ROUNDS = 10;
  return bcrypt.hash(claveTextoPlano, SALT_ROUNDS);
}

/** Compara la contraseña ingresada contra el hash guardado en la base de datos. */
export async function compararClave(claveTextoPlano: string, claveHash: string): Promise<boolean> {
  return bcrypt.compare(claveTextoPlano, claveHash);
}

/** Valida los 5 requisitos de seguridad: min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo */
export function validarFortalezaClave(clave: string): string | null {
  if (!clave || clave.length < 8) {
    return "La contraseña debe tener un mínimo de 8 caracteres";
  }
  if (!/[A-Z]/.test(clave)) {
    return "La contraseña debe contener al menos una letra mayúscula";
  }
  if (!/[a-z]/.test(clave)) {
    return "La contraseña debe contener al menos una letra minúscula";
  }
  if (!/\d/.test(clave)) {
    return "La contraseña debe contener al menos un número";
  }
  if (!/[\W_]/.test(clave)) {
    return "La contraseña debe contener al menos un signo o carácter especial (ej. !@#$%^&*)";
  }
  return null;
}

// ---------- Sesión (JWT) ----------

/** Genera el token de sesión que se guarda en la cookie tras un login exitoso. */
export function crearTokenSesion(sesion: SesionUsuario): string {
  return jwt.sign(sesion, obtenerSecretoJWT(), { expiresIn: DURACION_SESION });
}

/** Verifica y decodifica el token. Devuelve null si es inválido o expiró. */
export function verificarTokenSesion(token: string): SesionUsuario | null {
  try {
    return jwt.verify(token, obtenerSecretoJWT()) as SesionUsuario;
  } catch {
    return null;
  }
}

export { COOKIE_SESION };

// ---------- Pre-sesión (paso intermedio: "elige tu perfil") ----------
//
// Cuando el usuario tiene MÁS DE UN perfil, no abrimos la sesión completa
// apenas valida la contraseña. Primero le mostramos sus perfiles para que
// elija con cuál entrar. Mientras elige, usamos este token de corta
// duración (5 minutos) para no tener que pedirle la contraseña otra vez,
// sin dejar todavía una sesión (cookie) abierta.

interface DatosPreSesion {
  tipo: "pre-sesion";
  id_usuario: number;
  nombres: string;
  correo_electronico: string;
  perfiles: PerfilBasico[];
}

export function crearTokenPreSesion(datos: Omit<DatosPreSesion, "tipo">): string {
  const payload: DatosPreSesion = { tipo: "pre-sesion", ...datos };
  return jwt.sign(payload, obtenerSecretoJWT(), { expiresIn: DURACION_PRE_SESION });
}

export function verificarTokenPreSesion(token: string): DatosPreSesion | null {
  try {
    const datos = jwt.verify(token, obtenerSecretoJWT()) as DatosPreSesion;
    return datos.tipo === "pre-sesion" ? datos : null;
  } catch {
    return null;
  }
}

// ---------- Bloqueo por intentos fallidos ----------

export const MAX_INTENTOS_FALLIDOS = 3;
