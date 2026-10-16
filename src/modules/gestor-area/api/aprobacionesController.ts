import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/gestor-area/api/guardia";
import {
  listarAprobacionesNegocio,
  resolverAprobacionNegocio,
} from "@/modules/gestor-area/services/areaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.SOLICITUDES_APROBAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarAprobacionesNegocio(sesion.id_usuario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar aprobaciones de negocio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar aprobaciones");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.SOLICITUDES_APROBAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    const data = await resolverAprobacionNegocio(
      sesion.id_usuario,
      Number(body.id_cambio),
      body.decision,
      body.comentario
    );
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar aprobación de negocio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la decisión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
