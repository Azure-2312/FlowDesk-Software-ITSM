import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion } from "@/shared/lib/auth";
import { COOKIE_SESION } from "@/shared/lib/constants";
import { evaluarCuestionarioRiesgo } from "@/modules/cambios/services/cuestionarioRiesgoService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = await evaluarCuestionarioRiesgo(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al evaluar cuestionario de riesgo:", error);
    return NextResponse.json({ error: "Error al evaluar riesgo" }, { status: 500 });
  }
}
