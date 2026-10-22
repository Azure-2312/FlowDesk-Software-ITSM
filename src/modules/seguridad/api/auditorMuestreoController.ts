import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { contarMuestreo, generarMuestreo } from "@/modules/seguridad/services/auditoriaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    return NextResponse.json(await contarMuestreo());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al contar el universo de muestreo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el universo de muestreo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.AUDITORIA_VER);
  if (error) return error;

  try {
    const body = await req.json();
    const muestra = await generarMuestreo(body.tipo, Number(body.tamano));
    return NextResponse.json({ tipo: body.tipo, tamano: muestra.length, muestra });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al generar el muestreo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al generar el muestreo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
