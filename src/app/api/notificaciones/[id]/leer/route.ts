import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { marcarNotificacionLeida } from "@/shared/lib/notificacionesService";

export const dynamic = "force-dynamic";

function obtenerSesionActual() {
  const token = cookies().get(COOKIE_SESION)?.value;
  return token ? verificarTokenSesion(token) : null;
}

interface Contexto {
  params: { id: string };
}

export async function PUT(_req: NextRequest, { params }: Contexto) {
  const sesion = obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });

  const idNotif = Number(params.id);
  if (!idNotif) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    await marcarNotificacionLeida(idNotif, sesion.id_usuario);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error al marcar notificación leída:", err);
    return NextResponse.json({ error: "Error al actualizar notificación" }, { status: 500 });
  }
}
