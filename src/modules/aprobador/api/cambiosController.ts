import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarCambiosPendientes, resolverCambio } from "@/modules/aprobador/services/aprobacionesService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_APROBAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarCambiosPendientes(sesion.id_usuario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar cambios por aprobar:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los cambios");
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
      await resolverCambio(sesion.id_usuario, Number(body.id_cambio), body.decision, body.comentario)
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar la decisión del cambio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la decisión");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
