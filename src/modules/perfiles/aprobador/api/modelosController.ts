import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarModelosCambio } from "@/modules/perfiles/aprobador/services/aprobacionesService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarModelosCambio());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar modelos de cambio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar los modelos de cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
