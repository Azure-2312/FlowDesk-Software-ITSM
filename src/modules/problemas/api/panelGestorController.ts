import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/problemas/api/guardiaGestor";
import { obtenerPanelProblemas } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerPanelProblemas());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en el panel de problemas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el panel de problemas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
