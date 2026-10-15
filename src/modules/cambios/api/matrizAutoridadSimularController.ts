import { NextRequest, NextResponse } from "next/server";
import { respuestaError } from "@/shared/lib/errores";
import { simularMatrizAutoridad } from "@/modules/cambios/services/matrizAutoridadSimularService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await simularMatrizAutoridad(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en POST /api/admin/cambios/matriz-autoridad/simular:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al simular matriz de autoridad");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
