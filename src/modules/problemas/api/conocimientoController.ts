import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/problemas/api/guardiaGestor";
import {
  crearArticuloDesdeProblema,
  listarConocimiento,
} from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CONOCIMIENTO_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarConocimiento());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar conocimiento derivado:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el conocimiento derivado");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CONOCIMIENTO_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await crearArticuloDesdeProblema(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al crear artículo desde problema:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al generar el artículo de conocimiento");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
