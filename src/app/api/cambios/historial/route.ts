export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarHistorialDecisiones } from "@/modules/cambios/services/aprobacionesService";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const historial = await listarHistorialDecisiones(sesion.id_usuario);
    return NextResponse.json(historial);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar historial de cambios:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar historial de decisiones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
