import { NextRequest, NextResponse } from "next/server";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { simularConflictosCalendario } from "@/modules/cambios/services/notificacionesCalendarioSimularConflictosService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await simularConflictosCalendario(body);
    return NextResponse.json(data);
  } catch (error: any) {
    if (!(error instanceof ErrorDominio)) console.error("Error en POST /api/cambios/configuracion/notificaciones-calendario/simular-conflictos:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al simular conflictos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
