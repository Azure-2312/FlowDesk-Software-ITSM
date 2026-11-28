// ============================================================================
// MIDDLEWARE DE PLATAFORMA: CONTROL DE ACCESO Y SEGURIDAD EN EL EDGE
// ============================================================================
// Primera barrera: sin la cookie de sesión no se entra a las páginas privadas
// (redirige a /login) ni a la API interna (responde 401). En el Edge solo se
// comprueba que la cookie exista; la firma del token y el perfil los valida
// cada ruta (sesionConCapacidad / perfilPermitido).
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/constants";

/** Rutas de la API que se usan sin sesión: inicio de sesión y la API externa (credencial propia). */
const API_PUBLICAS = [
  "/api/auth/login",
  "/api/auth/captcha",
  "/api/auth/seleccionar-perfil",
  "/api/auth/logout",
  "/api/v1/",
];

export function middleware(req: NextRequest) {
  const tieneSesion = req.cookies.has(COOKIE_SESION);
  const ruta = req.nextUrl.pathname;

  if (ruta.startsWith("/api/")) {
    if (tieneSesion || API_PUBLICAS.some((p) => ruta === p || ruta.startsWith(p.endsWith("/") ? p : p + "/"))) {
      return NextResponse.next();
    }
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!tieneSesion) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DEL MATCHER: páginas privadas y toda la API interna
// ----------------------------------------------------------------------------
export const config = {
  matcher: ["/plataforma/:path*", "/api/:path*"],
};
