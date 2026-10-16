import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/problemas/api/guardiaGestor";
import { actualizarObjetivo, listarObjetivos } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarObjetivos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar objetivos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los objetivos de tiempo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_CONFIG_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await actualizarObjetivo(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar objetivo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el objetivo de tiempo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
