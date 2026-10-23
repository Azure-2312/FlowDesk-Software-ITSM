import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import {
  listarIncidentesMayores,
  declararIncidenteMayor,
  actualizarIncidenteMayor,
} from "@/modules/incidentes/services/incidentesMayoresService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.INCIDENTES_GESTIONAR);
  if (error) return error;

  try {
    return NextResponse.json(await listarIncidentesMayores());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar incidentes mayores:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar incidentes mayores");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function POST(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.INCIDENTES_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    return NextResponse.json(await declararIncidenteMayor(sesion, body), { status: 201 });
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al declarar incidente mayor:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al declarar el incidente mayor");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.INCIDENTES_GESTIONAR);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_incidente_mayor) throw new ErrorDominio("Falta el identificador del incidente mayor.");
    return NextResponse.json(
      await actualizarIncidenteMayor(sesion, Number(body.id_incidente_mayor), body)
    );
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al actualizar incidente mayor:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al actualizar el incidente mayor");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
