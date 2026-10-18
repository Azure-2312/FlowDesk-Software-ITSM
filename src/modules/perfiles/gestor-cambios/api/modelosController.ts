import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarModelos, proponerModelo, cambiarEstadoModelo } from "@/modules/perfiles/gestor-cambios/services/cambiosGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_CONFIG_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarModelos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar modelos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los modelos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_CONFIG_VER);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await proponerModelo(sesion.id_usuario, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al proponer el modelo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al proponer el modelo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_CONFIG_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_modelo) throw new ErrorDominio("Falta el identificador del modelo.");
    return NextResponse.json(await cambiarEstadoModelo(Number(body.id_modelo), body.estado));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al cambiar el estado del modelo:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el modelo");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
