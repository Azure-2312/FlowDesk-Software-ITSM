import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarHistorialDecisiones } from "@/modules/perfiles/aprobador/services/aprobacionesService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarHistorialDecisiones(sesion.id_usuario));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar el historial del aprobador:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el historial");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
