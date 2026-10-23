import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { obtenerReportesProblemas } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerReportesProblemas());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en reportes de problemas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los reportes de problemas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
