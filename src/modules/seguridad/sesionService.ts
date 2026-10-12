import { cookies } from "next/headers";
import { SesionUsuario } from "@/types";
import { COOKIE_SESION, crearTokenSesion, verificarTokenSesion } from "./authService";

export function obtenerSesionActual(): SesionUsuario | null {
  const token = cookies().get(COOKIE_SESION)?.value;
  if (!token) return null;
  return verificarTokenSesion(token);
}

export function cerrarSesionActual(): void {
  cookies().delete(COOKIE_SESION);
}

export function establecerCookieSesion(sesion: SesionUsuario): string {
  const token = crearTokenSesion(sesion);
  cookies().set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return token;
}
