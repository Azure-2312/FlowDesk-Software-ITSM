import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarEscalamientos } from "@/modules/perfiles/supervisor/services/supervisionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.TICKETS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarEscalamientos(sesion));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar escalamientos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar escalamientos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
