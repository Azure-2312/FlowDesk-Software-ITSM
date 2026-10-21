import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { respuestaError } from "@/shared/lib/errores";
import { obtenerMetricasKcsDashboard } from "@/modules/conocimiento/services/conocimientoService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const metricas = await obtenerMetricasKcsDashboard();
    return NextResponse.json(metricas);
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al obtener métricas KCS");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
