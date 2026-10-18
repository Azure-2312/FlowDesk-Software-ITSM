import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarProgramacion, programarCambio } from "@/modules/cambios";
import { validarProgramacion } from "@/modules/cambios";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarProgramacion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar la programación:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar la programación");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    const conflictos = await validarProgramacion(Number(body.id_cambio), body.ventana_inicio, body.ventana_fin);
    const resultado = await programarCambio(Number(body.id_cambio), body);
    return NextResponse.json({ ...resultado, conflictos });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al programar el cambio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al programar el cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
