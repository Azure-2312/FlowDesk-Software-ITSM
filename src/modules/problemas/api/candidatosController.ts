import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/problemas/api/guardiaGestor";
import { convertirCandidato, listarCandidatos } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarCandidatos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar candidatos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los candidatos a problema");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await convertirCandidato(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al convertir candidato:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el problema desde el candidato");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
