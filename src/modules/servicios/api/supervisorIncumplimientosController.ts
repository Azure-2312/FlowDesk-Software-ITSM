import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarIncumplimientos } from "@/modules/servicios/services/supervisionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.REPORTES_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarIncumplimientos(sesion));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar incumplimientos:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar incumplimientos");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
