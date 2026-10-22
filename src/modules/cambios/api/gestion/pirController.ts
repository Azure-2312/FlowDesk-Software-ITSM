import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarPir, registrarPir } from "@/modules/cambios";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarPir());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar la PIR:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la PIR");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    return NextResponse.json(await registrarPir(Number(body.id_cambio), body.resultado, Number(body.incidentes_inducidos)));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar la PIR:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la PIR");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
