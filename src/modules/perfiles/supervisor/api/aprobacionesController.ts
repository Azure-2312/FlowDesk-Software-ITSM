import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarAprobacionesTecnicas } from "@/modules/perfiles/supervisor/services/supervisionService";
import { resolverAprobacionTecnica } from "@/modules/cambios";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarAprobacionesTecnicas(sesion));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar aprobaciones técnicas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar aprobaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    const data = await resolverAprobacionTecnica(
      sesion.id_usuario,
      Number(body.id_cambio),
      body.decision,
      body.comentario
    );
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver aprobación técnica:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la decisión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
