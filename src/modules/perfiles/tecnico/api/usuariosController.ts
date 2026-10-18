import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { buscarUsuariosTecnicos } from "@/modules/perfiles/tecnico/services/usuariosService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  try {
    const usuarios = await buscarUsuariosTecnicos(searchParams.get("q")?.trim() || "");
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error("Error al buscar usuarios para registro técnico:", error);
    return NextResponse.json({ error: "Error al buscar usuarios." }, { status: 500 });
  }
}
