import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/modules/gestor-area/api/guardia";
import { listarActivosArea } from "@/modules/gestor-area/services/areaService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.ACTIVOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarActivosArea(sesion.id_usuario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar activos del área:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los activos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
