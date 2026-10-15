import { NextRequest, NextResponse } from "next/server";
import { respuestaError } from "@/shared/lib/errores";
import { simularEtapasFlujo } from "@/modules/cambios/services/flujoEvaluacionSimularEtapasService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await simularEtapasFlujo(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en /api/admin/cambios/flujo-evaluacion/simular-etapas:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al simular etapas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
