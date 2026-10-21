import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { respuestaError } from "@/shared/lib/errores";
import { listarPlantillasKcs } from "@/modules/conocimiento/services/conocimientoService";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const plantillas = await listarPlantillasKcs();
    return NextResponse.json({ plantillas });
  } catch (error) {
    const { error: mensaje, status } = respuestaError(error, "Error al listar plantillas KCS");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
