import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/activos/api/guardiaGestor";
import { obtenerReportesActivos } from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerReportesActivos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener reportes de activos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los reportes de activos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
