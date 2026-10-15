import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { listarHistorialActivo } from "@/modules/activos/services/activoHistorialService";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;

  if (!sesion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!sesionTieneCapacidad(sesion, CAPACIDADES.ACTIVOS_VER)) {
    return NextResponse.json({ error: "No autorizado para consultar el historial de activos" }, { status: 403 });
  }

  const idActivo = Number(params.id);
  if (!idActivo || isNaN(idActivo)) {
    return NextResponse.json({ error: "ID de activo inválido" }, { status: 400 });
  }

  try {
    const historial = await listarHistorialActivo(idActivo);
    return NextResponse.json({ historial });
  } catch (error) {
    console.error("Error al obtener historial de activo:", error);
    return NextResponse.json({ error: "Error al consultar historial del activo" }, { status: 500 });
  }
}
