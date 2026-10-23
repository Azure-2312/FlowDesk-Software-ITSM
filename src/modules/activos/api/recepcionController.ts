import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarRecepciones, crearRecepcion } from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarRecepciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar recepciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las recepciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearRecepcion(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar recepción:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la recepción");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
