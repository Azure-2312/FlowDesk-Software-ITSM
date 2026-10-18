import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { obtenerReportesArea } from "@/modules/perfiles/gestor-area/services/areaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.REPORTES_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerReportesArea(sesion.id_usuario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al obtener reportes del área:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los reportes");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
