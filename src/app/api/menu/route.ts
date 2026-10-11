import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/lib/auth";
import { obtenerMenuDelUsuario } from "@/lib/menu";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No hay sesión activa" }, { status: 401 });
  }

  const menu = await obtenerMenuDelUsuario(sesion.id_usuario, sesion.perfilActivo?.id_perfil);
  return NextResponse.json({ menu, sesion });
}
