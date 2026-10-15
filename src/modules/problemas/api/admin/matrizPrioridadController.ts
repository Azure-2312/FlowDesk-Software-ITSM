import { NextRequest, NextResponse } from "next/server";
import { verificarTokenSesion, COOKIE_SESION } from "@/shared/lib/auth";
import { CAPACIDADES, sesionTieneCapacidad } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import {
  actualizarMatrizPrioridad,
  obtenerMatrizPrioridad,
} from "@/modules/problemas/services/matrizPrioridadService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  try {
    const data = await obtenerMatrizPrioridad();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error al consultar matriz de prioridad:", error);
    return NextResponse.json({ error: "Error interno al consultar matriz." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get(COOKIE_SESION)?.value;
  const sesion = token ? verificarTokenSesion(token) : null;
  if (!sesion) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  if (!sesionTieneCapacidad(sesion, CAPACIDADES.PROBLEMAS_CONFIGURAR)) {
    return NextResponse.json(
      { error: "Solo administradores pueden configurar la matriz de prioridad." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const resultado = await actualizarMatrizPrioridad(body, sesion.id_usuario);
    return NextResponse.json(resultado);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error al actualizar matriz de prioridad:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al actualizar matriz.");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
