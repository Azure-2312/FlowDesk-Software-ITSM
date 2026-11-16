import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { actualizarConfigMayor } from "@/modules/problemas/services/flujoService";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const config = await actualizarConfigMayor(body);
    return NextResponse.json({ ok: true, config });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar configuración de problemas mayores:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al actualizar");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
