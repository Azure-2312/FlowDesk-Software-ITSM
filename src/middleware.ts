import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/constants";

export function middleware(req: NextRequest) {
  const tieneSesion = req.cookies.has(COOKIE_SESION);

  if (!tieneSesion) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/plataforma/:path*",
    "/dashboard/:path*",
    "/tickets/:path*",
    "/admin/:path*",
    "/mi-cuenta/:path*",
    "/cambios/:path*",
    "/activos/:path*",
    "/incidentes/:path*",
    "/solicitudes/:path*",
  ],
};
