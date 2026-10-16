import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/problemas/api/guardiaGestor";
import { listarRecurrentes } from "@/modules/problemas/services/gestorProblemasService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { error } = sesionConCapacidad(CAPACIDADES.PROBLEMAS_GESTIONAR);
  if (error) return error;

  try {
    const dimension = req.nextUrl.searchParams.get("dimension") ?? "servicio";
    return NextResponse.json(await listarRecurrentes(dimension));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar recurrentes:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los incidentes recurrentes");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
