import { NextRequest, NextResponse } from "next/server";
import { respuestaError } from "@/shared/lib/errores";
import { simularQuorum } from "@/modules/cambios/services/flujoEvaluacionSimularQuorumService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await simularQuorum(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en /api/admin/cambios/flujo-evaluacion/simular-quorum:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al simular quórum");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
