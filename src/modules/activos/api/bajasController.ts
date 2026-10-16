import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { listarBajas, resolverBaja, registrarDisposicion } from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarBajas());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar bajas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar las bajas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_solicitud) throw new ErrorDominio("Falta el identificador de la solicitud.");
    return NextResponse.json(await resolverBaja(sesion.id_usuario, Number(body.id_solicitud), body.decision, body.comentario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver la baja:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al resolver la baja");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PUT(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await registrarDisposicion(sesion.id_usuario, body));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al registrar la disposición:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al registrar la disposición");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
