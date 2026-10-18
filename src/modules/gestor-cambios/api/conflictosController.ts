import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { detectarConflictos } from "@/modules/gestor-cambios/services/conflictosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await detectarConflictos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al detectar conflictos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al detectar conflictos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
