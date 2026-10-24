import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION } from "@/shared/lib/constants";

export function middleware(req: NextRequest) {
  const tieneSesion = req.cookies.has(COOKIE_SESION);
  const pathname = req.nextUrl.pathname;

  if (!tieneSesion) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirecciones directas de compatibilidad desde rutas por perfil a rutas canonicas por modulo
  const redireccionesCanonicas: Record<string, string> = {
    "/plataforma/tickets/mesa/incidente-mayor": "/plataforma/incidentes/sala-crisis",
    "/plataforma/problemas/tecnico/nuevo": "/plataforma/problemas/nuevo",
    "/plataforma/problemas/supervisor/asignar": "/plataforma/problemas/asignacion",
    "/plataforma/problemas/tecnico/candidatos": "/plataforma/problemas/candidatos",
    "/plataforma/problemas/tecnico/errores-conocidos": "/plataforma/problemas/kedb",
    "/plataforma/problemas/tecnico/asignados": "/plataforma/problemas/asignados",
    "/plataforma/problemas/tecnico/grupo": "/plataforma/problemas/grupo",
    "/plataforma/problemas/aprobador": "/plataforma/problemas/mayores",
    "/plataforma/cambios/tecnico/nuevo": "/plataforma/cambios/nuevo",
    "/plataforma/cambios/tecnico/calendario": "/plataforma/cambios/calendario",
    "/plataforma/cambios/tecnico/implementacion": "/plataforma/cambios/implementacion",
    "/plataforma/cambios/tecnico/historial": "/plataforma/cambios/historial",
    "/plataforma/cambios/tecnico/mis-cambios": "/plataforma/cambios/mis-cambios",
    "/plataforma/cambios/supervisor/aprobaciones": "/plataforma/cambios/aprobaciones/tecnicas",
    "/plataforma/cambios/supervisor/programar": "/plataforma/cambios/programacion",
    "/plataforma/cambios/supervisor/impacto": "/plataforma/cambios/impacto/equipo",
    "/plataforma/cambios/tecnico/impacto": "/plataforma/cambios/impacto/servicios",
    "/plataforma/cambios/gestor-area/impacto": "/plataforma/cambios/impacto/interrupciones",
    "/plataforma/cambios/gestor-area/aprobaciones": "/plataforma/cambios/aprobaciones/negocio",
    "/plataforma/cambios/aprobador": "/plataforma/cambios/aprobaciones",
    "/plataforma/cambios/aprobador/modelos": "/plataforma/cambios/modelos",
    "/plataforma/activos/gestor-area": "/plataforma/activos/area",
    "/plataforma/activos/tecnico/conteos": "/plataforma/activos/conteos",
    "/plataforma/activos/tecnico/inventario": "/plataforma/activos/inventario-tecnico",
    "/plataforma/activos/supervisor/bajas": "/plataforma/activos/bajas/aprobacion",
    "/plataforma/activos/auditor/bajas": "/plataforma/activos/bajas/consulta",
    "/plataforma/activos/aprobador": "/plataforma/activos/bajas/renovaciones",
    "/plataforma/activos/tecnico/mantenimiento": "/plataforma/activos/reparaciones",
    "/plataforma/activos/tecnico/licencias": "/plataforma/activos/licencias/consulta",
    "/plataforma/activos/cmdb/analisis": "/plataforma/cmdb/analisis",
    "/plataforma/activos/cmdb": "/plataforma/cmdb/topologia",
    "/plataforma/activos/cmdb/tipos": "/plataforma/cmdb/tipos",
    "/plataforma/cmdb/auditor/resultados": "/plataforma/cmdb/auditoria/resultados",
    "/plataforma/conocimiento/tecnico/base": "/plataforma/conocimiento/base",
    "/plataforma/conocimiento/tecnico/nuevo": "/plataforma/conocimiento/nuevo",
    "/plataforma/conocimiento/tecnico/mis-articulos": "/plataforma/conocimiento/mis-articulos",
    "/plataforma/conocimiento/supervisor/revisiones": "/plataforma/conocimiento/publicacion",
    "/plataforma/conocimiento/tecnico/revisiones": "/plataforma/conocimiento/revisiones",
    "/plataforma/servicios/sla/supervisor/escalamientos": "/plataforma/servicios/sla/escalamientos",
    "/plataforma/servicios/sla/supervisor/incumplimientos": "/plataforma/servicios/sla/incumplimientos",
    "/plataforma/servicios/sla/tecnico/objetivos": "/plataforma/servicios/sla/objetivos",
    "/plataforma/servicios/sla/tecnico/semaforo": "/plataforma/servicios/sla/semaforo-cola",
    "/plataforma/servicios/sla/supervisor/semaforo": "/plataforma/servicios/sla/semaforo-grupo",
    "/plataforma/seguridad/aprobador/delegaciones": "/plataforma/seguridad/delegaciones",
    "/plataforma/seguridad/aprobador/historial": "/plataforma/seguridad/historial-aprobaciones",
    "/plataforma/activos/panel": "/plataforma/operacion/paneles/gestor-activos",
    "/plataforma/problemas/gestion/panel": "/plataforma/operacion/paneles/gestor-problemas",
    "/plataforma/tickets/desempeno": "/plataforma/operacion/desempeno",
    "/plataforma/solicitudes/delegaciones": "/plataforma/operacion/aprobaciones/delegacion",
    "/plataforma/seguridad/delegaciones": "/plataforma/operacion/aprobaciones/delegaciones",
    "/plataforma/solicitudes/historial-area": "/plataforma/operacion/aprobaciones/historial-area",
    "/plataforma/seguridad/historial-aprobaciones": "/plataforma/operacion/aprobaciones/historial",
    "/plataforma/organizacion/equipo/ausencias": "/plataforma/operacion/equipo/ausencias",
    "/plataforma/organizacion/equipo/vistas": "/plataforma/operacion/equipo/vistas",
    "/plataforma/proveedores": "/plataforma/activos/proveedores",
    "/plataforma/avisos/mantenimientos": "/plataforma/tickets/gestion/avisos",
  };

  if (redireccionesCanonicas[pathname]) {
    return NextResponse.redirect(new URL(redireccionesCanonicas[pathname], req.url));
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
  if (pathname.startsWith("/reportes")) {
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
    "/reportes/:path*",
  ],
};
