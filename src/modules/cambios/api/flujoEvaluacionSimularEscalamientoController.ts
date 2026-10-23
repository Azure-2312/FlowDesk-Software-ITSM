import { NextRequest, NextResponse } from "next/server";
import { respuestaError } from "@/shared/lib/errores";
import { simularEscalamiento } from "@/modules/cambios/services/flujoEvaluacionSimularEscalamientoService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await simularEscalamiento(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en /api/cambios/configuracion/flujo-evaluacion/simular-escalamiento:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al simular escalamiento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
