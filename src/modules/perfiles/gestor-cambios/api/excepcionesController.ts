import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarExcepciones, crearExcepcion } from "@/modules/perfiles/gestor-cambios/services/cambiosGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarExcepciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar excepciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las excepciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearExcepcion(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear la excepción:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la excepción");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
