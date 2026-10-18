import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import {
  crearCambioDesdeProblema,
  listarCambiosDerivados,
} from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarCambiosDerivados());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar cambios derivados:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los cambios derivados");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearCambioDesdeProblema(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear cambio desde problema:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la solicitud de cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
