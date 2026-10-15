import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { SesionUsuario, PerfilBasico } from "@/types";
import { COOKIE_SESION } from "@/shared/lib/constants";

const DURACION_SESION = "8h";
const DURACION_PRE_SESION = "5m";

function obtenerSecretoJWT(): string {
  const secreto = process.env.JWT_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error("JWT_SECRET debe estar configurado con al menos 32 caracteres.");
  }
  return secreto;
}

export async function hashearClave(claveTextoPlano: string): Promise<string> {
  const SALT_ROUNDS = 10;
  return bcrypt.hash(claveTextoPlano, SALT_ROUNDS);
}

export async function compararClave(claveTextoPlano: string, claveHash: string): Promise<boolean> {
  return bcrypt.compare(claveTextoPlano, claveHash);
}

export function validarFortalezaClave(clave: string): string | null {
  if (!clave || clave.length < 8) {
    return "La contrasena debe tener un minimo de 8 caracteres";
  }
  if (!/[A-Z]/.test(clave)) {
    return "La contrasena debe contener al menos una letra mayuscula";
  }
  if (!/[a-z]/.test(clave)) {
    return "La contrasena debe contener al menos una letra minuscula";
  }
  if (!/\d/.test(clave)) {
    return "La contrasena debe contener al menos un numero";
  }
  if (!/[\W_]/.test(clave)) {
    return "La contrasena debe contener al menos un signo o caracter especial";
  }
  return null;
}

export function crearTokenSesion(sesion: SesionUsuario): string {
  return jwt.sign(sesion, obtenerSecretoJWT(), { expiresIn: DURACION_SESION });
}

export function verificarTokenSesion(token: string): SesionUsuario | null {
  try {
    return jwt.verify(token, obtenerSecretoJWT()) as SesionUsuario;
  } catch {
    return null;
  }
}

export interface DatosPreSesion {
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

export { COOKIE_SESION };
export const MAX_INTENTOS_FALLIDOS = 3;
