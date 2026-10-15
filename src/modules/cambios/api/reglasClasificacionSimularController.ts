import { NextRequest, NextResponse } from "next/server";
import { respuestaError } from "@/shared/lib/errores";
import { simularReglasClasificacion } from "@/modules/cambios/services/reglasClasificacionSimularService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await simularReglasClasificacion(body);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error en POST /api/admin/cambios/reglas-clasificacion/simular:", error);
    const { error: mensaje, status } = respuestaError(error, error?.message || "Error al simular reglas de clasificación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
