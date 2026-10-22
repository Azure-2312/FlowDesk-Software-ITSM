import { NextRequest, NextResponse } from "next/server";
import { COOKIE_SESION, verificarTokenSesion } from "@/shared/lib/auth";
import { obtenerContadoresTecnico } from "@/modules/operacion/services/contadoresService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const contadores = await obtenerContadoresTecnico(sesion.id_usuario);
    return NextResponse.json(contadores);
  } catch (error) {
    console.error("Error al calcular contadores del técnico:", error);
    return NextResponse.json({}, { status: 200 });
  }
}
