import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarProblemasSinAsignar, asignarProblema } from "@/modules/servicios/services/supervisionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarProblemasSinAsignar(sesion));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar problemas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar problemas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_problema) throw new ErrorDominio("Falta el identificador del problema.");
    const data = await asignarProblema(sesion, Number(body.id_problema), Number(body.id_usuario_asignado));
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al asignar problema:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al asignar el problema");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
