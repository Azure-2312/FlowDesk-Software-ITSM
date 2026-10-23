import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { obtenerPanelActivos } from "@/modules/activos/services/gestorActivosService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerPanelActivos());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en el panel de activos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el panel de activos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
