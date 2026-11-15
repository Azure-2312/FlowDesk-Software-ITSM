import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { listarAprobadoresEmergencia } from "@/modules/cambios/services/cambiosService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const aprobadores = await listarAprobadoresEmergencia();
    return NextResponse.json({ aprobadores });
  } catch (error) {
    console.error("Error al listar aprobadores de emergencia:", error);
    return NextResponse.json({ error: "Error al consultar aprobadores de emergencia" }, { status: 500 });
  }
}
