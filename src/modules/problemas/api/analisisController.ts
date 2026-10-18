import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { guardarAnalisis, listarAnalisis } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const idProblema = Number(req.nextUrl.searchParams.get("id_problema")) || null;
    return NextResponse.json(await listarAnalisis(idProblema));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar análisis:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el análisis de causa raíz");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await guardarAnalisis(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al guardar análisis:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al guardar el análisis");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
