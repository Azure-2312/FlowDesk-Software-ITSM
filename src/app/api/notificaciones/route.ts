import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import {
  obtenerNotificacionesUsuario,
  marcarTodasNotificacionesLeidas,
} from "@/shared/lib/notificacionesService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET(req: NextRequest) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  const url = new URL(req.url);
  const soloSinLeer = url.searchParams.get("sinLeer") === "1" || url.searchParams.get("sinLeer") === "true";
  const limite = Number(url.searchParams.get("limite") || 10);
  const pagina = Number(url.searchParams.get("pagina") || 1);

  try {
    const data = await obtenerNotificacionesUsuario(sesion.id_usuario, { soloSinLeer, limite, pagina });
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al obtener notificaciones:", err);
    return NextResponse.json({ error: "Error al cargar notificaciones" }, { status: 500 });
  }
}

export async function PUT() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  try {
    await marcarTodasNotificacionesLeidas(sesion.id_usuario);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al marcar todas las notificaciones como leídas:", err);
    return NextResponse.json({ error: "Error al actualizar notificaciones" }, { status: 500 });
  }
}
