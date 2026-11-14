// ============================================================================
// MIDDLEWARE DE PLATAFORMA: CONTROL DE ACCESO Y SEGURIDAD EN EL EDGE
// ============================================================================
// Intercepta peticiones HTTP en el Edge de Next.js antes de procesar páginas.
// Valida sesión activa, redirige accesos no autenticados y despacha directamente
// a las rutas literales reales sin intermediaciones ni atajos.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/constants";

export function middleware(req: NextRequest) {
  // --------------------------------------------------------------------------
  // 1. VALIDACIÓN DE SESIÓN: Comprueba existencia de la cookie segura de sesión
  // --------------------------------------------------------------------------
  const tieneSesion = req.cookies.has(COOKIE_SESION);

  // --------------------------------------------------------------------------
  // 2. CONTROL DE ACCESO: Redirige a /login si el usuario no está autenticado
  // --------------------------------------------------------------------------
  if (!tieneSesion) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// ----------------------------------------------------------------------------
// CONFIGURACIÓN DEL MATCHER: Protege todas las rutas privadas de la plataforma
// ----------------------------------------------------------------------------
export const config = {
  matcher: [
    "/plataforma/:path*",
  ],
};
