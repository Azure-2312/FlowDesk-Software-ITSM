import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { contarNotificacionesNoLeidas } from "@/shared/lib/notificacionesService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

export async function GET() {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  try {
    const noLeidas = await contarNotificacionesNoLeidas(sesion.id_usuario);
    return NextResponse.json({ noLeidas });
  } catch (err) {
    console.error("Error al contar notificaciones no leídas:", err);
    return NextResponse.json({ error: "Error al contar notificaciones" }, { status: 500 });
  }
}
