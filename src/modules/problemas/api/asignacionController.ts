import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/problemas/api/guardiaGestor";
import { asignarProblema, listarAsignacion } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarAsignacion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar asignación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la bandeja de problemas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await asignarProblema(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al asignar problema:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al asignar el problema");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
