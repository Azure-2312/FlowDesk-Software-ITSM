import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { listarCumplimiento } from "@/modules/activos/services/licenciasCumplimientoService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.LICENCIAS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarCumplimiento());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al consultar cumplimiento de licencias:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el cumplimiento de licencias");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
