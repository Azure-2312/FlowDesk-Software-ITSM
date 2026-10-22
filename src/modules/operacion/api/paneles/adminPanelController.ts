import { NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { obtenerPanelAdministrador } from "@/modules/operacion/services/adminPanelService";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = sesionConCapacidad(CAPACIDADES.ADMIN_USUARIOS);
  if (error) return error;

  try {
    return NextResponse.json(await obtenerPanelAdministrador());
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error en el panel del administrador:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar el panel del administrador");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
