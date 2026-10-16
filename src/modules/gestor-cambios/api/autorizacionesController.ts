import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/gestor-cambios/api/guardia";
import { listarAutorizaciones, registrarRecordatorio } from "@/modules/gestor-cambios/services/cambiosGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarAutorizaciones());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar autorizaciones:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las autorizaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    return NextResponse.json(await registrarRecordatorio(sesion.id_usuario, Number(body.id_cambio), body.tipo));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar el recordatorio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el recordatorio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
