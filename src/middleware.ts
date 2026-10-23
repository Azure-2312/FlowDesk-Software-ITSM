import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/constants";

export function middleware(req: NextRequest) {
  const tieneSesion = req.cookies.has(COOKIE_SESION);
  const pathname = req.nextUrl.pathname;

  if (!tieneSesion) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecciones de compatibilidad retroactiva hacia el espacio unificado /plataforma/
  if (pathname.startsWith("/tickets/")) {
    return NextResponse.redirect(new URL(pathname.replace("/tickets/", "/plataforma/tickets/"), req.url));
  }
  if (pathname === "/tickets") {
    return NextResponse.redirect(new URL("/plataforma/tickets", req.url));
  }
  if (pathname.startsWith("/cambios")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname.startsWith("/activos")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname.startsWith("/incidentes")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname.startsWith("/solicitudes")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname.startsWith("/conocimiento")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname.startsWith("/problemas")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/plataforma/dashboard", req.url));
  }
  if (pathname.startsWith("/mi-cuenta")) {
    return NextResponse.redirect(new URL(`/plataforma${pathname}`, req.url));
  }
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/plataforma/operacion/administracion", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/plataforma/:path*",
    "/dashboard/:path*",
    "/reportes",
    "/tickets/:path*",
    "/admin/:path*",
    "/mi-cuenta/:path*",
    "/cambios/:path*",
    "/activos/:path*",
    "/incidentes/:path*",
    "/solicitudes/:path*",
    "/gestor-activos/:path*",
    "/gestor-problemas/:path*",
    "/avisos/:path*",
    "/conocimiento/:path*",
  ],
};
