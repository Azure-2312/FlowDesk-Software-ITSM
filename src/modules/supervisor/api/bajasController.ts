import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/supervisor/api/guardia";
import { listarBajasPendientes, resolverBaja } from "@/modules/supervisor/services/supervisionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarBajasPendientes(sesion));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar bajas:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar bajas");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_solicitud) throw new ErrorDominio("Falta el identificador de la solicitud.");
    const data = await resolverBaja(sesion, Number(body.id_solicitud), body.decision, body.comentario);
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al resolver baja:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al resolver la solicitud de baja");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
