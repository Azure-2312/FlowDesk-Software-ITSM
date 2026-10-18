import { NextRequest, NextResponse } from "next/server";
import { CAPACIDADES } from "@/shared/lib/capacidades";
import { ErrorDominio, respuestaError } from "@/shared/lib/errores";
import { sesionConCapacidad } from "@/shared/lib/api-auth";
import { listarCambiosProgramables } from "@/modules/perfiles/supervisor/services/supervisionService";
import { reprogramarCambio } from "@/modules/cambios";

export const dynamic = "force-dynamic";

export async function GET() {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    return NextResponse.json(await listarCambiosProgramables(sesion));
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al listar cambios programables:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al consultar cambios");
    return NextResponse.json({ error: mensaje }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const { sesion, error } = sesionConCapacidad(CAPACIDADES.CAMBIOS_VER);
  if (error) return error;

  try {
    const body = await req.json();
    if (!body.id_cambio) throw new ErrorDominio("Falta el identificador del cambio.");
    const data = await reprogramarCambio(
      sesion.id_usuario,
      Number(body.id_cambio),
      body.ventana_inicio,
      body.ventana_fin
    );
    return NextResponse.json(data);
  } catch (err) {
    if (!(err instanceof ErrorDominio)) console.error("Error al reprogramar cambio:", err);
    const { error: mensaje, status } = respuestaError(err, "Error al reprogramar el cambio");
    return NextResponse.json({ error: mensaje }, { status });
  }
}
