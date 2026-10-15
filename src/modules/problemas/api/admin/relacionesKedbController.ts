import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { probarCoincidenciaKedb } from "@/modules/problemas/services/relacionesKedbService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const body = await req.json();
    const { accion, prueba } = body;

    if (accion === "probar_coincidencia") {
      const resultado = await probarCoincidenciaKedb(prueba);
      return NextResponse.json(resultado);
    }

    return NextResponse.json({ error: "Acción no soportada" }, { status: 400 });
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al probar coincidencia KEDB:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message);
    return NextResponse.json({ error: mensaje }, { status });
  }
}
