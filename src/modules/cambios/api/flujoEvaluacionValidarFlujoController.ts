import { NextRequest, NextResponse } from "next/server";
import { respuestaError } from "@/shared/lib/errores";
import { validarFlujoCambios } from "@/modules/cambios/services/flujoEvaluacionValidarFlujoService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = await validarFlujoCambios(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en /api/admin/cambios/flujo-evaluacion/validar-flujo:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al validar el flujo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
