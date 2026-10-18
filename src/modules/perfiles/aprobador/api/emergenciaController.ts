import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarEmergencias, resolverEmergencia } from "@/modules/cambios";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_APROBAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarEmergencias());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar el ECAB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el comité de emergencia");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_APROBAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    return NextResponse.json(
      await resolverEmergencia(sesion.id_usuario, Number(body.id_cambio), body.decision, body.condiciones, Number(body.plazo_horas) || undefined)
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver el ECAB:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar el dictamen");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
