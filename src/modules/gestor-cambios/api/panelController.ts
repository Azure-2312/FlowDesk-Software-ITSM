import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { obtenerPanelGestion } from "@/modules/gestor-cambios/services/cambiosGestionService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerPanelGestion());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en el panel de gestión de cambios:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el panel de cambios");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
